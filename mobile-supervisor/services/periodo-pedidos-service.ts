/**
 * SERVIÇO DE CONTROLE DE PERÍODO DE PEDIDOS
 * 
 * Regras:
 * - Supervisores podem fazer pedidos apenas entre os dias 15 e 23 de cada mês
 * - Antes do dia 15 ou após o dia 23: BLOQUEADO
 * - Notificações são enviadas quando está próximo do fim do período
 */

import { supabase } from './supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'

// Notificações DESABILITADAS no Expo Go (SDK 53+)
// Para usar notificações, gere um development build ou production build (APK)
// Em Expo Go, apenas o banner visual de período funciona
let Notifications: any = null

// IMPORTANTE: expo-notifications causa erro no Expo Go, então mantemos null
// Descomente as linhas abaixo apenas em builds (APK):
// try {
//   if (Platform.OS !== 'web') {
//     Notifications = require('expo-notifications')
//   }
// } catch (error) {
//   console.log('⚠️ Notificações não disponíveis.')
//   Notifications = null
// }

// =====================================================
// CONFIGURAÇÃO DINÂMICA DO BANCO DE DADOS
// =====================================================

type ConfiguracaoPeriodo = {
  id: string
  nome: string
  ativo: boolean
  dia_inicio?: number
  dia_fim?: number
  dias_semana_permitidos: number[]
  horario_inicio?: string
  horario_fim?: string
  max_pedidos_por_periodo?: number
  requer_autorizacao_apos: number
  permitir_urgentes: boolean
  mensagem_bloqueio: string
}

let configuracaoCache: ConfiguracaoPeriodo | null = null
let ultimaBuscaConfig: number = 0
const CACHE_DURACAO = 5 * 60 * 1000 // 5 minutos

/**
 * Busca configuração ativa do banco de dados
 */
async function buscarConfiguracaoAtiva(): Promise<ConfiguracaoPeriodo | null> {
  try {
    // Verificar cache
    const agora = Date.now()
    if (configuracaoCache && (agora - ultimaBuscaConfig) < CACHE_DURACAO) {
      return configuracaoCache
    }

    // Buscar do banco
    const { data, error } = await supabase
      .from('configuracoes_periodo_pedidos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhuma configuração encontrada
        console.log('ℹ️ Nenhuma configuração de período ativa')
        return null
      }
      throw error
    }

    configuracaoCache = data
    ultimaBuscaConfig = agora
    console.log('✅ Configuração de período carregada:', data.nome)
    return data
  } catch (error) {
    console.error('Erro ao buscar configuração de período:', error)
    return null
  }
}

// Configurações padrão (fallback se não houver configuração no banco)
export const PERIODO_CONFIG_PADRAO = {
  DIA_INICIO: 15,
  DIA_FIM: 23,
  DIAS_ALERTA: 2,
}

// =====================================================
// MODO DE TESTE - Para simular diferentes datas
// =====================================================
// Descomente a linha abaixo para testar com uma data específica
// export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 18) // 18 de outubro de 2024
// export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 10) // 10 de outubro (BLOQUEADO)
// export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 21) // 21 de outubro (ALERTA)
export const DATA_TESTE_OVERRIDE: Date | null = null // null = usar data real do sistema

/**
 * Resultado da verificação do período
 */
export type StatusPeriodo = {
  dentrooPeriodo: boolean
  diaAtual: number
  mesAtual: number
  anoAtual: number
  diasRestantes: number
  mensagem: string
  alertaProximo: boolean // true se estiver a 2 dias ou menos do fim
}

/**
 * Verifica se está no período permitido para fazer pedidos
 * NOVA VERSÃO: Busca configuração dinâmica do banco de dados
 */
export async function verificarPeriodoPedidos(): Promise<StatusPeriodo> {
  // Buscar configuração do banco
  const config = await buscarConfiguracaoAtiva()
  
  // Usar data de teste se configurada, senão usar data real
  const agora = DATA_TESTE_OVERRIDE || new Date()
  const diaAtual = agora.getDate()
  const mesAtual = agora.getMonth() + 1 // 0-11 -> 1-12
  const anoAtual = agora.getFullYear()
  const diaSemanaAtual = agora.getDay() // 0=Domingo, 1=Segunda, etc
  const horaAtual = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
  
  // Log para debug
  if (DATA_TESTE_OVERRIDE) {
    console.log('🧪 MODO DE TESTE ATIVADO - Simulando:', agora.toLocaleDateString('pt-BR'))
  }

  // Se não há configuração, usar valores padrão
  if (!config) {
    console.log('ℹ️ Usando configuração padrão (nenhuma configuração ativa no banco)')
    const dentrooPeriodo = diaAtual >= PERIODO_CONFIG_PADRAO.DIA_INICIO && diaAtual <= PERIODO_CONFIG_PADRAO.DIA_FIM
    const diasRestantes = dentrooPeriodo ? PERIODO_CONFIG_PADRAO.DIA_FIM - diaAtual : 0
    const alertaProximo = dentrooPeriodo && diasRestantes <= PERIODO_CONFIG_PADRAO.DIAS_ALERTA

    return {
      dentrooPeriodo,
      diaAtual,
      mesAtual,
      anoAtual,
      diasRestantes,
      mensagem: dentrooPeriodo ? 
        `✅ Período aberto até dia ${PERIODO_CONFIG_PADRAO.DIA_FIM}` : 
        `🔒 Período de pedidos: dia ${PERIODO_CONFIG_PADRAO.DIA_INICIO} ao ${PERIODO_CONFIG_PADRAO.DIA_FIM}`,
      alertaProximo,
    }
  }

  // ========================================
  // VALIDAÇÕES COM CONFIGURAÇÃO DO BANCO
  // ========================================

  let dentrooPeriodo = true
  let mensagem = ''

  // 1. Verificar dia do mês
  if (config.dia_inicio && config.dia_fim) {
    if (diaAtual < config.dia_inicio || diaAtual > config.dia_fim) {
      dentrooPeriodo = false
      if (diaAtual < config.dia_inicio) {
        const diasAteAbrir = config.dia_inicio - diaAtual
        mensagem = `⏳ Período abre em ${diasAteAbrir} ${diasAteAbrir === 1 ? 'dia' : 'dias'} (dia ${config.dia_inicio})`
      } else {
        mensagem = config.mensagem_bloqueio || '🔒 Período de pedidos encerrado'
      }
    }
  }

  // 2. Verificar dia da semana
  if (dentrooPeriodo && config.dias_semana_permitidos && config.dias_semana_permitidos.length > 0) {
    if (!config.dias_semana_permitidos.includes(diaSemanaAtual)) {
      dentrooPeriodo = false
      const diasNomes = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
      mensagem = `🚫 Pedidos não permitidos aos ${diasNomes[diaSemanaAtual]}s`
    }
  }

  // 3. Verificar horário
  if (dentrooPeriodo && config.horario_inicio && config.horario_fim) {
    const horarioInicio = config.horario_inicio.slice(0, 5)
    const horarioFim = config.horario_fim.slice(0, 5)
    
    if (horaAtual < horarioInicio || horaAtual > horarioFim) {
      dentrooPeriodo = false
      mensagem = `🕐 Pedidos permitidos entre ${horarioInicio} e ${horarioFim}`
    }
  }

  // Calcular dias restantes e alerta
  const diasRestantes = (dentrooPeriodo && config.dia_fim) ? config.dia_fim - diaAtual : 0
  const alertaProximo = dentrooPeriodo && diasRestantes <= 2

  // Mensagem de sucesso se dentro do período
  if (dentrooPeriodo) {
    if (alertaProximo) {
      mensagem = `⚠️ ATENÇÃO: Restam ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} para fazer pedidos!`
    } else {
      mensagem = `✅ Período aberto até dia ${config.dia_fim} (${diasRestantes} dias restantes)`
    }
  }

  return {
    dentrooPeriodo,
    diaAtual,
    mesAtual,
    anoAtual,
    diasRestantes,
    mensagem,
    alertaProximo,
  }
}

/**
 * Versão síncrona para compatibilidade (usa cache)
 * DEPRECATED: Use verificarPeriodoPedidos() assíncrona
 */
export function verificarPeriodoPedidosSync(): StatusPeriodo {
  const agora = DATA_TESTE_OVERRIDE || new Date()
  const diaAtual = agora.getDate()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()
  
  // Usar configuração em cache se disponível
  const config = configuracaoCache
  
  if (!config) {
    // Fallback para configuração padrão
    const dentrooPeriodo = diaAtual >= PERIODO_CONFIG_PADRAO.DIA_INICIO && diaAtual <= PERIODO_CONFIG_PADRAO.DIA_FIM
    const diasRestantes = dentrooPeriodo ? PERIODO_CONFIG_PADRAO.DIA_FIM - diaAtual : 0
    
    return {
      dentrooPeriodo,
      diaAtual,
      mesAtual,
      anoAtual,
      diasRestantes,
      mensagem: dentrooPeriodo ? '✅ Período aberto' : '🔒 Período encerrado',
      alertaProximo: false,
    }
  }

  const dentrooPeriodo = (config.dia_inicio && config.dia_fim) ? 
    (diaAtual >= config.dia_inicio && diaAtual <= config.dia_fim) : true
  const diasRestantes = (dentrooPeriodo && config.dia_fim) ? config.dia_fim - diaAtual : 0

  return {
    dentrooPeriodo,
    diaAtual,
    mesAtual,
    anoAtual,
    diasRestantes,
    mensagem: dentrooPeriodo ? '✅ Período aberto' : (config.mensagem_bloqueio || '🔒 Período encerrado'),
    alertaProximo: diasRestantes <= 2,
  }
}

/**
 * Salva última verificação de notificação
 */
const STORAGE_KEY_ULTIMA_NOTIFICACAO = 'ultima_notificacao_periodo'

async function salvarUltimaNotificacao(data: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_ULTIMA_NOTIFICACAO, data)
}

async function obterUltimaNotificacao(): Promise<string | null> {
  return await AsyncStorage.getItem(STORAGE_KEY_ULTIMA_NOTIFICACAO)
}

/**
 * Verifica se deve enviar notificação e envia se necessário
 */
export async function verificarEEnviarNotificacao(): Promise<void> {
  try {
    const status = verificarPeriodoPedidos()
    const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const ultimaNotificacao = await obterUltimaNotificacao()

    // Se já enviou notificação hoje, não envia novamente
    if (ultimaNotificacao === hoje) {
      return
    }

    // Cenário 1: Período está para acabar (2 dias ou menos)
    if (status.alertaProximo) {
      await enviarNotificacao(
        '⚠️ Período de Pedidos Encerrando!',
        `Restam apenas ${status.diasRestantes} ${status.diasRestantes === 1 ? 'dia' : 'dias'} para fazer seus pedidos. Não perca o prazo!`
      )
      await salvarUltimaNotificacao(hoje)
      return
    }

    // Cenário 2: Último dia do período
    if (status.dentrooPeriodo && status.diasRestantes === 0) {
      await enviarNotificacao(
        '🚨 ÚLTIMO DIA para Pedidos!',
        'Hoje é o último dia do período de pedidos. Faça seus pedidos até o final do dia!'
      )
      await salvarUltimaNotificacao(hoje)
      return
    }

    // Cenário 3: Primeiro dia do período (dia 15)
    if (status.diaAtual === PERIODO_CONFIG.DIA_INICIO) {
      await enviarNotificacao(
        '🎉 Período de Pedidos Aberto!',
        `O período de pedidos está aberto até o dia ${PERIODO_CONFIG.DIA_FIM}. Faça seus pedidos agora!`
      )
      await salvarUltimaNotificacao(hoje)
      return
    }

  } catch (error) {
    console.error('Erro ao verificar/enviar notificação:', error)
  }
}

/**
 * Envia uma notificação local
 */
async function enviarNotificacao(titulo: string, corpo: string): Promise<void> {
  // Verificar se notificações estão disponíveis
  if (!Notifications) {
    console.log('ℹ️ Notificações não disponíveis (Expo Go). Banner visual funcionará normalmente.')
    return
  }

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: corpo,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { tipo: 'periodo_pedidos' },
      },
      trigger: null, // Imediato
    })
    console.log('✅ Notificação enviada:', titulo)
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
  }
}

/**
 * Configura as notificações do app
 */
export async function configurarNotificacoes(): Promise<boolean> {
  // Verificar se notificações estão disponíveis
  if (!Notifications) {
    console.log('ℹ️ Notificações não disponíveis (Expo Go). Funcionalidade de período funcionará sem notificações.')
    return false
  }

  try {
    // Configurar comportamento das notificações
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })

    // Solicitar permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('❌ Permissão de notificações negada')
      return false
    }

    console.log('✅ Notificações configuradas com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao configurar notificações:', error)
    return false
  }
}

/**
 * Registra histórico de verificação de período no Supabase
 * Para auditoria e relatórios
 */
export async function registrarVerificacaoPeriodo(
  supervisorId: string,
  tentouCriarPedido: boolean,
  foiBloqueado: boolean
): Promise<void> {
  try {
    const status = verificarPeriodoPedidos()
    
    await supabase.from('log_periodo_pedidos').insert({
      supervisor_id: supervisorId,
      data_verificacao: new Date().toISOString(),
      dia_verificacao: status.diaAtual,
      mes_verificacao: status.mesAtual,
      ano_verificacao: status.anoAtual,
      dentro_periodo: status.dentrooPeriodo,
      dias_restantes: status.diasRestantes,
      tentou_criar_pedido: tentouCriarPedido,
      foi_bloqueado: foiBloqueado,
    })
  } catch (error) {
    // Não falha se não conseguir registrar log
    console.warn('Aviso: Não foi possível registrar log de período:', error)
  }
}

/**
 * Obtém datas importantes do mês atual
 */
export function obterDatasImportantes() {
  const agora = new Date()
  const ano = agora.getFullYear()
  const mes = agora.getMonth() // 0-11

  const dataInicio = new Date(ano, mes, PERIODO_CONFIG.DIA_INICIO)
  const dataFim = new Date(ano, mes, PERIODO_CONFIG.DIA_FIM, 23, 59, 59)

  return {
    dataInicio,
    dataFim,
    dataAtual: agora,
  }
}

/**
 * Formata mensagem amigável sobre o período
 */
export function obterMensagemPeriodo(): string {
  const status = verificarPeriodoPedidos()
  return status.mensagem
}

/**
 * Verifica período e retorna erro se estiver bloqueado
 */
export function validarPeriodoOuErro(): { ok: boolean; erro?: string } {
  const status = verificarPeriodoPedidos()
  
  if (!status.dentrooPeriodo) {
    return {
      ok: false,
      erro: status.mensagem,
    }
  }

  return { ok: true }
}


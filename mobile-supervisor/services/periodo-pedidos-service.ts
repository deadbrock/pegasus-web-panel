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

// Importar notificações apenas se não estiver no Expo Go
let Notifications: any = null
try {
  // expo-notifications não funciona no Expo Go (SDK 53+)
  // Funciona apenas em development builds ou production builds
  if (Platform.OS === 'web' || !__DEV__) {
    Notifications = require('expo-notifications')
  }
} catch (error) {
  console.log('⚠️ Notificações não disponíveis no Expo Go. Use development build para notificações.')
}

// Configurações do período
export const PERIODO_CONFIG = {
  DIA_INICIO: 15,
  DIA_FIM: 23,
  DIAS_ALERTA: 2, // Avisar 2 dias antes do fim (dia 21)
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
 */
export function verificarPeriodoPedidos(): StatusPeriodo {
  // Usar data de teste se configurada, senão usar data real
  const agora = DATA_TESTE_OVERRIDE || new Date()
  const diaAtual = agora.getDate()
  const mesAtual = agora.getMonth() + 1 // 0-11 -> 1-12
  const anoAtual = agora.getFullYear()
  
  // Log para debug (ajuda a ver qual data está sendo usada)
  if (DATA_TESTE_OVERRIDE) {
    console.log('🧪 MODO DE TESTE ATIVADO - Simulando:', agora.toLocaleDateString('pt-BR'))
  }

  const dentrooPeriodo = diaAtual >= PERIODO_CONFIG.DIA_INICIO && diaAtual <= PERIODO_CONFIG.DIA_FIM
  const diasRestantes = dentrooPeriodo ? PERIODO_CONFIG.DIA_FIM - diaAtual : 0
  const alertaProximo = dentrooPeriodo && diasRestantes <= PERIODO_CONFIG.DIAS_ALERTA

  let mensagem = ''
  if (!dentrooPeriodo) {
    if (diaAtual < PERIODO_CONFIG.DIA_INICIO) {
      const diasAteAbrir = PERIODO_CONFIG.DIA_INICIO - diaAtual
      mensagem = `⏳ Período de pedidos abre em ${diasAteAbrir} ${diasAteAbrir === 1 ? 'dia' : 'dias'} (dia ${PERIODO_CONFIG.DIA_INICIO})`
    } else {
      mensagem = `🔒 Período de pedidos encerrado. Próximo período: dia ${PERIODO_CONFIG.DIA_INICIO} do próximo mês`
    }
  } else {
    if (alertaProximo) {
      mensagem = `⚠️ ATENÇÃO: Restam apenas ${diasRestantes} ${diasRestantes === 1 ? 'dia' : 'dias'} para fazer pedidos!`
    } else {
      mensagem = `✅ Período aberto. Você tem até o dia ${PERIODO_CONFIG.DIA_FIM} para fazer pedidos (${diasRestantes} dias restantes)`
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


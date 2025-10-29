import { supabase } from './supabase'
import { validarPeriodoOuErro, registrarVerificacaoPeriodo } from './periodo-pedidos-service'

export type ItemPedido = {
  id?: string
  pedido_id?: string
  produto_id?: string | null
  produto_codigo: string
  produto_nome: string
  quantidade: number
  unidade: string
  observacoes?: string | null
}

export type PedidoMobile = {
  id: string
  numero_pedido: string
  supervisor_id: string
  supervisor_nome: string
  supervisor_email: string
  contrato_id?: string
  contrato_nome?: string
  contrato_endereco?: string
  urgencia: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
  observacoes?: string
  status: 'Pendente' | 'Aprovado' | 'Em Separação' | 'Saiu para Entrega' | 'Entregue' | 'Cancelado' | 'Rejeitado'
  requer_autorizacao: boolean
  autorizacao_status?: 'Pendente' | 'Aprovada' | 'Rejeitada'
  autorizacao_justificativa?: string
  data_solicitacao: string
  data_atualizacao: string
  created_at: string
  updated_at: string
  itens?: ItemPedido[]
}

export type VerificacaoMensal = {
  pode_fazer: boolean
  total_pedidos_mes: number
  requer_autorizacao: boolean
}

/**
 * Verifica se o supervisor pode fazer pedido no mês atual
 * 
 * REGRA:
 * - Primeiro pedido do mês: NÃO precisa autorização
 * - Segundo pedido do mesmo mês: PRECISA autorização
 * - Quando o mês vira: Contador reseta
 */
export async function verificarPodeFazerPedido(supervisorId: string): Promise<VerificacaoMensal> {
  try {
    // Pegar mês e ano atuais
    const agora = new Date()
    const mesAtual = agora.getMonth() + 1 // 0-11 -> 1-12
    const anoAtual = agora.getFullYear()

    // Buscar pedidos do supervisor no mês/ano atual
    const { data: pedidos, error } = await supabase
      .from('pedidos_supervisores')
      .select('id, numero_pedido, created_at')
      .eq('supervisor_id', supervisorId)
      .gte('created_at', `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`) // Início do mês
      .lt('created_at', `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-01`) // Início do próximo mês
      
    if (error) {
      console.error('Erro ao buscar pedidos do mês:', error)
      // Em caso de erro, permitir sem autorização
      return {
        pode_fazer: true,
        total_pedidos_mes: 0,
        requer_autorizacao: false
      }
    }

    const totalPedidosMes = pedidos?.length || 0

    // LÓGICA:
    // - 0 pedidos: pode fazer sem autorização (primeiro do mês)
    // - 1+ pedidos: pode fazer mas precisa de autorização (segundo ou mais)
    const requerAutorizacao = totalPedidosMes >= 1

    console.log(`📊 Pedidos do supervisor no mês ${mesAtual}/${anoAtual}: ${totalPedidosMes}`)
    console.log(`${requerAutorizacao ? '⚠️ Requer autorização (2º pedido ou mais)' : '✅ Não requer autorização (1º pedido do mês)'}`)

    return {
      pode_fazer: true,
      total_pedidos_mes: totalPedidosMes,
      requer_autorizacao: requerAutorizacao
    }
  } catch (error) {
    console.error('Erro ao verificar pedidos do mês:', error)
    return {
      pode_fazer: true,
      total_pedidos_mes: 0,
      requer_autorizacao: false
    }
  }
}

/**
 * Busca todos os pedidos do supervisor com seus itens
 */
export async function fetchMeusPedidos(supervisorId: string): Promise<PedidoMobile[]> {
  try {
    const { data, error } = await supabase
      .from('pedidos_supervisores')
      .select(`
        *,
        itens:itens_pedido_supervisor(
          id,
          pedido_id,
          produto_id,
          produto_codigo,
          produto_nome,
          quantidade,
          unidade,
          observacoes
        )
      `)
      .eq('supervisor_id', supervisorId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return []
  }
}

/**
 * Cria um novo pedido com múltiplos produtos
 */
export async function criarPedido(pedido: {
  supervisor_id: string
  supervisor_nome: string
  supervisor_email: string
  contrato_id?: string
  contrato_nome?: string
  contrato_endereco?: string
  itens: ItemPedido[]
  urgencia: string
  observacoes?: string
  requer_autorizacao: boolean
  autorizacao_justificativa?: string
}): Promise<PedidoMobile | null> {
  try {
    // ==========================================
    // VALIDAR PERÍODO DE PEDIDOS (DIA 15-23)
    // ==========================================
    const validacaoPeriodo = validarPeriodoOuErro()
    if (!validacaoPeriodo.ok) {
      // Registrar tentativa bloqueada para auditoria
      await registrarVerificacaoPeriodo(pedido.supervisor_id, true, true)
      throw new Error(validacaoPeriodo.erro)
    }
    
    // Registrar criação permitida para auditoria
    await registrarVerificacaoPeriodo(pedido.supervisor_id, true, false)

    // Gerar número do pedido
    const { count } = await supabase
      .from('pedidos_supervisores')
      .select('*', { count: 'exact', head: true })

    const ano = new Date().getFullYear()
    const numeroPedido = `PED-${ano}-${String((count || 0) + 1).padStart(4, '0')}`

    // 1. Criar o pedido principal
    const dataAtual = new Date().toISOString()
    const { data: pedidoCriado, error: pedidoError } = await supabase
      .from('pedidos_supervisores')
      .insert({
        numero_pedido: numeroPedido,
        supervisor_id: pedido.supervisor_id,
        supervisor_nome: pedido.supervisor_nome,
        supervisor_email: pedido.supervisor_email,
        contrato_id: pedido.contrato_id || null,
        contrato_nome: pedido.contrato_nome || null,
        contrato_endereco: pedido.contrato_endereco || null,
        urgencia: pedido.urgencia,
        observacoes: pedido.observacoes,
        requer_autorizacao: pedido.requer_autorizacao,
        autorizacao_status: pedido.requer_autorizacao ? 'Pendente' : null,
        autorizacao_justificativa: pedido.autorizacao_justificativa,
        status: 'Pendente',
        data_solicitacao: dataAtual,
        data_atualizacao: dataAtual
      })
      .select()
      .single()

    if (pedidoError) throw pedidoError

    // 2. Criar os itens do pedido
    const itensParaInserir = pedido.itens.map(item => ({
      pedido_id: pedidoCriado.id,
      produto_id: item.produto_id || null,
      produto_codigo: item.produto_codigo,
      produto_nome: item.produto_nome,
      quantidade: item.quantidade,
      unidade: item.unidade,
      observacoes: item.observacoes || null
    }))

    const { error: itensError } = await supabase
      .from('itens_pedido_supervisor')
      .insert(itensParaInserir)

    if (itensError) {
      // Se falhar ao criar itens, deletar o pedido criado
      await supabase
        .from('pedidos_supervisores')
        .delete()
        .eq('id', pedidoCriado.id)
      
      throw itensError
    }

    // 3. Retornar pedido com itens
    return {
      ...pedidoCriado,
      itens: pedido.itens
    }
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    throw error
  }
}

/**
 * Cancela um pedido (apenas se estiver Pendente)
 */
export async function cancelarPedido(pedidoId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Primeiro, verificar se o pedido existe e está Pendente
    const { data: pedidoAtual, error: fetchError } = await supabase
      .from('pedidos_supervisores')
      .select('id, status, numero_pedido')
      .eq('id', pedidoId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar pedido:', fetchError)
      return { success: false, message: 'Pedido não encontrado' }
    }

    // Verificar se o pedido pode ser cancelado
    if (pedidoAtual.status !== 'Pendente') {
      return {
        success: false,
        message: `Não é possível cancelar um pedido com status "${pedidoAtual.status}". Apenas pedidos "Pendente" podem ser cancelados.`
      }
    }

    // Atualizar o status para Cancelado
    const { error: updateError } = await supabase
      .from('pedidos_supervisores')
      .update({
        status: 'Cancelado',
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', pedidoId)

    if (updateError) {
      console.error('Erro ao cancelar pedido:', updateError)
      return { success: false, message: 'Erro ao cancelar pedido. Tente novamente.' }
    }

    return {
      success: true,
      message: `Pedido ${pedidoAtual.numero_pedido} cancelado com sucesso!`
    }
  } catch (error: any) {
    console.error('Erro ao cancelar pedido:', error)
    return {
      success: false,
      message: error.message || 'Erro inesperado ao cancelar pedido'
    }
  }
}

/**
 * Subscribe para mudanças nos pedidos (realtime)
 */
export function subscribePedidosRealtime(
  supervisorId: string,
  callback: (pedidos: PedidoMobile[]) => void
) {
  const channel = supabase
    .channel('pedidos-supervisores-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pedidos_supervisores',
        filter: `supervisor_id=eq.${supervisorId}`
      },
      async () => {
        // Recarregar pedidos quando houver mudança
        const pedidos = await fetchMeusPedidos(supervisorId)
        callback(pedidos)
      }
    )
    .subscribe()

  return channel
}


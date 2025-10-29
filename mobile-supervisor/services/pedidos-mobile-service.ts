import { supabase } from './supabase'

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
 * Retorna se pode fazer e se precisa de autorização
 */
export async function verificarPodeFazerPedido(supervisorId: string): Promise<VerificacaoMensal> {
  try {
    const { data, error } = await supabase
      .rpc('pode_fazer_pedido_no_mes', {
        p_supervisor_id: supervisorId
      })
      .single()

    if (error) throw error

    return data || {
      pode_fazer: true,
      total_pedidos_mes: 0,
      requer_autorizacao: false
    }
  } catch (error) {
    console.error('Erro ao verificar pedidos do mês:', error)
    // Em caso de erro, permitir mas avisar
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
  itens: ItemPedido[]
  urgencia: string
  observacoes?: string
  requer_autorizacao: boolean
  autorizacao_justificativa?: string
}): Promise<PedidoMobile | null> {
  try {
    // Gerar número do pedido
    const { count } = await supabase
      .from('pedidos_supervisores')
      .select('*', { count: 'exact', head: true })

    const ano = new Date().getFullYear()
    const numeroPedido = `PED-${ano}-${String((count || 0) + 1).padStart(4, '0')}`

    // 1. Criar o pedido principal
    const { data: pedidoCriado, error: pedidoError } = await supabase
      .from('pedidos_supervisores')
      .insert({
        numero_pedido: numeroPedido,
        supervisor_id: pedido.supervisor_id,
        supervisor_nome: pedido.supervisor_nome,
        supervisor_email: pedido.supervisor_email,
        urgencia: pedido.urgencia,
        observacoes: pedido.observacoes,
        requer_autorizacao: pedido.requer_autorizacao,
        autorizacao_status: pedido.requer_autorizacao ? 'Pendente' : null,
        autorizacao_justificativa: pedido.autorizacao_justificativa,
        status: 'Pendente'
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


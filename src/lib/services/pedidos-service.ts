import { supabase } from '../supabase'

export type Pedido = {
  id?: string
  numero_pedido: string
  cliente: string
  origem: string
  destino: string
  data_coleta?: string
  data_entrega?: string
  data_entrega_prevista?: string
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelado' | 'Atrasado'
  veiculo_id?: string
  motorista_id?: string
  valor?: number
  peso?: number
  volume?: number
  observacoes?: string
  prioridade?: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
  tipo_carga?: string
  codigo_rastreio?: string
  created_at?: string
  updated_at?: string
}

export type PedidoStats = {
  total: number
  pendentes: number
  em_transito: number
  entregues: number
  cancelados: number
  atrasados: number
  valor_total: number
  peso_total: number
  taxa_entrega: number // Porcentagem de pedidos entregues no prazo
}

/**
 * Busca todos os pedidos
 */
export async function fetchPedidos(): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar pedidos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um pedido por ID
 */
export async function fetchPedidoById(id: string): Promise<Pedido | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar pedido:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo pedido
 */
export async function createPedido(pedido: Omit<Pedido, 'id' | 'created_at' | 'updated_at'>): Promise<Pedido | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .insert(pedido)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar pedido:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um pedido existente
 */
export async function updatePedido(id: string, updates: Partial<Pedido>): Promise<Pedido | null> {
  const { data, error } = await supabase
    .from('pedidos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar pedido:', error)
    throw error
  }
  return data
}

/**
 * Deleta um pedido
 */
export async function deletePedido(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar pedido:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de pedidos
 */
export async function fetchPedidosStats(): Promise<PedidoStats> {
  try {
    // Tenta selecionar com data_entrega_prevista
    let { data, error } = await supabase
      .from('pedidos')
      .select('status, valor, data_entrega, data_entrega_prevista')

    // Se falhar (coluna inexistente — código 42703 ou 400), tenta sem ela
    if (error) {
      const fallback = await supabase
        .from('pedidos')
        .select('status, valor, data_entrega')
      if (fallback.error) {
        console.error('Erro ao buscar estatísticas:', fallback.error)
        return { total: 0, pendentes: 0, em_transito: 0, entregues: 0, cancelados: 0, atrasados: 0, valor_total: 0, peso_total: 0, taxa_entrega: 0 }
      }
      data = fallback.data
    }

    const total = data?.length || 0
    const pendentes = data?.filter((p: any) => p.status === 'Pendente').length || 0
    const em_transito = data?.filter((p: any) => p.status === 'Em Trânsito').length || 0
    const entregues = data?.filter((p: any) => p.status === 'Entregue').length || 0
    const cancelados = data?.filter((p: any) => p.status === 'Cancelado').length || 0
    const atrasados = data?.filter((p: any) => p.status === 'Atrasado').length || 0
    const valor_total = data?.reduce((sum: number, p: any) => sum + (p.valor || 0), 0) || 0

    // Calcular taxa de entrega no prazo (somente se data_entrega_prevista existir nos dados)
    const entreguesData = (data || []).filter((p: any) =>
      p.status === 'Entregue' && p.data_entrega && p.data_entrega_prevista
    )
    const entreguesNoPrazo = entreguesData.filter((p: any) => {
      return new Date(p.data_entrega) <= new Date(p.data_entrega_prevista)
    }).length
    const taxa_entrega = entregues > 0
      ? (entreguesData.length > 0 ? (entreguesNoPrazo / entreguesData.length) * 100 : 100)
      : 0

    return {
      total,
      pendentes,
      em_transito,
      entregues,
      cancelados,
      atrasados,
      valor_total,
      peso_total: 0,
      taxa_entrega
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas de pedidos:', error)
    return { total: 0, pendentes: 0, em_transito: 0, entregues: 0, cancelados: 0, atrasados: 0, valor_total: 0, peso_total: 0, taxa_entrega: 0 }
  }
}

/**
 * Busca pedidos por status
 */
export async function fetchPedidosByStatus(status: Pedido['status']): Promise<Pedido[]> {
  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar pedidos por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca pedidos atrasados
 */
export async function fetchPedidosAtrasados(): Promise<Pedido[]> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pedidos')
    .select('*')
    .in('status', ['Pendente', 'Em Trânsito'])
    .lt('data_entrega_prevista', hoje)
    .order('data_entrega_prevista', { ascending: true })

  if (error) {
    console.error('Erro ao buscar pedidos atrasados:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza status de um pedido
 */
export async function updatePedidoStatus(id: string, status: Pedido['status']): Promise<Pedido | null> {
  return updatePedido(id, { status })
}

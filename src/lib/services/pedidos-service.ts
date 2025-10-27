import { supabase } from '../supabase'

export type Pedido = {
  id: string
  numero: string
  cliente_nome: string
  cliente_cpf_cnpj?: string
  origem: string
  destino: string
  data_pedido: string
  data_entrega_prevista?: string
  data_entrega_realizada?: string
  valor: number
  status: 'Pendente' | 'Em Trânsito' | 'Entregue' | 'Cancelado'
  motorista_id?: string
  veiculo_id?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export type CreatePedidoInput = Omit<Pedido, 'id' | 'created_at' | 'updated_at'>

export async function fetchPedidos(): Promise<Pedido[]> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return []
  }
}

export async function fetchPedidoById(id: string): Promise<Pedido | null> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar pedido:', error)
    return null
  }
}

export async function createPedido(input: Partial<CreatePedidoInput>): Promise<Pedido | null> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar pedido:', error)
    return null
  }
}

export async function updatePedido(id: string, updates: Partial<Pedido>): Promise<Pedido | null> {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return null
  }
}

export async function deletePedido(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar pedido:', error)
    return false
  }
}

export async function fetchPedidosStats() {
  try {
    const pedidos = await fetchPedidos()
    
    const total = pedidos.length
    const pendentes = pedidos.filter(p => p.status === 'Pendente').length
    const em_transito = pedidos.filter(p => p.status === 'Em Trânsito').length
    const entregues = pedidos.filter(p => p.status === 'Entregue').length
    const cancelados = pedidos.filter(p => p.status === 'Cancelado').length
    
    const valor_total = pedidos.reduce((acc, p) => acc + Number(p.valor), 0)
    const taxa_entrega = total > 0 ? Math.round((entregues / total) * 100) : 0

    return {
      total,
      pendentes,
      em_transito,
      entregues,
      cancelados,
      valor_total,
      taxa_entrega
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      pendentes: 0,
      em_transito: 0,
      entregues: 0,
      cancelados: 0,
      valor_total: 0,
      taxa_entrega: 0
    }
  }
}


import { supabase } from '../supabase'

export type Custo = {
  id: string
  data: string
  categoria: string
  descricao: string
  valor: number
  veiculo_id?: string
  responsavel: string
  observacoes?: string
  status?: 'Pago' | 'Pendente' | 'Vencido'
  centro_custo?: string
  created_at: string
  updated_at: string
}

export type CreateCustoInput = Omit<Custo, 'id' | 'created_at' | 'updated_at'>

export async function fetchCustos(): Promise<Custo[]> {
  try {
    const { data, error } = await supabase
      .from('custos')
      .select('*')
      .order('data', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar custos:', error)
    return []
  }
}

export async function fetchCustoById(id: string): Promise<Custo | null> {
  try {
    const { data, error } = await supabase
      .from('custos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar custo:', error)
    return null
  }
}

export async function createCusto(input: Partial<CreateCustoInput>): Promise<Custo | null> {
  try {
    const { data, error } = await supabase
      .from('custos')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar custo:', error)
    return null
  }
}

export async function updateCusto(id: string, updates: Partial<Custo>): Promise<Custo | null> {
  try {
    const { data, error } = await supabase
      .from('custos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar custo:', error)
    return null
  }
}

export async function deleteCusto(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('custos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar custo:', error)
    return false
  }
}

export async function fetchCustosStats() {
  try {
    const custos = await fetchCustos()
    
    const total = custos.length
    const pago = custos.filter(c => c.status === 'Pago').length
    const pendente = custos.filter(c => c.status === 'Pendente').length
    const vencido = custos.filter(c => c.status === 'Vencido').length
    
    const valor_total = custos.reduce((acc, c) => acc + Number(c.valor), 0)
    const valor_pago = custos
      .filter(c => c.status === 'Pago')
      .reduce((acc, c) => acc + Number(c.valor), 0)
    const valor_pendente = custos
      .filter(c => c.status === 'Pendente')
      .reduce((acc, c) => acc + Number(c.valor), 0)

    // Custos por categoria
    const por_categoria = custos.reduce((acc, c) => {
      acc[c.categoria] = (acc[c.categoria] || 0) + Number(c.valor)
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      pago,
      pendente,
      vencido,
      valor_total,
      valor_pago,
      valor_pendente,
      por_categoria
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      pago: 0,
      pendente: 0,
      vencido: 0,
      valor_total: 0,
      valor_pago: 0,
      valor_pendente: 0,
      por_categoria: {}
    }
  }
}


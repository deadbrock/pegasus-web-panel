import { supabase } from '../supabase'

export type Contrato = {
  id: string
  numero: string
  cliente: string
  tipo: string
  valor: number
  data_inicio: string
  data_fim: string
  status: 'Ativo' | 'Suspenso' | 'Encerrado' | 'Vencido'
  observacoes?: string
  created_at: string
  updated_at: string
}

export type CreateContratoInput = Omit<Contrato, 'id' | 'created_at' | 'updated_at'>

export async function fetchContratos(): Promise<Contrato[]> {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select('*')
      .order('data_inicio', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
    return []
  }
}

export async function fetchContratoById(id: string): Promise<Contrato | null> {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar contrato:', error)
    return null
  }
}

export async function createContrato(input: Partial<CreateContratoInput>): Promise<Contrato | null> {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar contrato:', error)
    return null
  }
}

export async function updateContrato(id: string, updates: Partial<Contrato>): Promise<Contrato | null> {
  try {
    const { data, error } = await supabase
      .from('contratos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error)
    return null
  }
}

export async function deleteContrato(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('contratos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar contrato:', error)
    return false
  }
}

export async function fetchContratosStats() {
  try {
    const contratos = await fetchContratos()
    
    const total = contratos.length
    const ativos = contratos.filter(c => c.status === 'Ativo').length
    const suspensos = contratos.filter(c => c.status === 'Suspenso').length
    const encerrados = contratos.filter(c => c.status === 'Encerrado').length
    const vencidos = contratos.filter(c => c.status === 'Vencido').length
    
    const valor_total = contratos.reduce((acc, c) => acc + Number(c.valor), 0)
    const valor_ativos = contratos
      .filter(c => c.status === 'Ativo')
      .reduce((acc, c) => acc + Number(c.valor), 0)

    // Contratos vencendo em 30 dias
    const hoje = new Date()
    const proximos30dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)
    const vencendo_30_dias = contratos.filter(c => {
      const dataFim = new Date(c.data_fim)
      return dataFim >= hoje && dataFim <= proximos30dias && c.status === 'Ativo'
    }).length

    return {
      total,
      ativos,
      suspensos,
      encerrados,
      vencidos,
      valor_total,
      valor_ativos,
      vencendo_30_dias
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      ativos: 0,
      suspensos: 0,
      encerrados: 0,
      vencidos: 0,
      valor_total: 0,
      valor_ativos: 0,
      vencendo_30_dias: 0
    }
  }
}


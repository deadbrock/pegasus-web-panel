import { supabase } from '../supabase'

export type Manutencao = {
  id: string
  veiculo_id: string
  tipo: 'Preventiva' | 'Corretiva' | 'Revisão'
  descricao: string
  data_inicio: string
  data_fim?: string
  km_atual?: number
  custo: number
  oficina?: string
  responsavel?: string
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada'
  observacoes?: string
  created_at: string
  updated_at: string
}

export type CreateManutencaoInput = Omit<Manutencao, 'id' | 'created_at' | 'updated_at'>

export async function fetchManutencoes(): Promise<Manutencao[]> {
  try {
    const { data, error } = await supabase
      .from('manutencoes')
      .select('*')
      .order('data_inicio', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar manutenções:', error)
    return []
  }
}

export async function fetchManutencaoById(id: string): Promise<Manutencao | null> {
  try {
    const { data, error } = await supabase
      .from('manutencoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar manutenção:', error)
    return null
  }
}

export async function createManutencao(input: Partial<CreateManutencaoInput>): Promise<Manutencao | null> {
  try {
    const { data, error } = await supabase
      .from('manutencoes')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar manutenção:', error)
    return null
  }
}

export async function updateManutencao(id: string, updates: Partial<Manutencao>): Promise<Manutencao | null> {
  try {
    const { data, error} = await supabase
      .from('manutencoes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar manutenção:', error)
    return null
  }
}

export async function deleteManutencao(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('manutencoes')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar manutenção:', error)
    return false
  }
}

export async function fetchManutencoesStats() {
  try {
    const manutencoes = await fetchManutencoes()
    
    const total = manutencoes.length
    const agendadas = manutencoes.filter(m => m.status === 'Agendada').length
    const em_andamento = manutencoes.filter(m => m.status === 'Em Andamento').length
    const concluidas = manutencoes.filter(m => m.status === 'Concluída').length
    const canceladas = manutencoes.filter(m => m.status === 'Cancelada').length
    
    const custo_total = manutencoes.reduce((acc, m) => acc + Number(m.custo), 0)
    const custo_medio = total > 0 ? custo_total / total : 0

    const por_tipo = {
      preventiva: manutencoes.filter(m => m.tipo === 'Preventiva').length,
      corretiva: manutencoes.filter(m => m.tipo === 'Corretiva').length,
      revisao: manutencoes.filter(m => m.tipo === 'Revisão').length
    }

    return {
      total,
      agendadas,
      em_andamento,
      concluidas,
      canceladas,
      custo_total,
      custo_medio,
      por_tipo
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      agendadas: 0,
      em_andamento: 0,
      concluidas: 0,
      canceladas: 0,
      custo_total: 0,
      custo_medio: 0,
      por_tipo: { preventiva: 0, corretiva: 0, revisao: 0 }
    }
  }
}


import { supabase } from '../supabase'

export type Manutencao = {
  id?: string
  veiculo_id: string
  tipo: 'Preventiva' | 'Corretiva' | 'Preditiva'
  descricao: string
  data_programada?: string
  data_realizada?: string
  km_veiculo?: number
  custo?: number
  status: 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada'
  oficina?: string
  mecanico?: string
  pecas_trocadas?: string
  proxima_manutencao_km?: number
  proxima_manutencao_data?: string
  prioridade?: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
  observacoes?: string
  anexos_url?: string
  created_at?: string
  updated_at?: string
}

export type ManutencaoStats = {
  total: number
  agendadas: number
  em_andamento: number
  concluidas: number
  canceladas: number
  custo_total: number
  custo_medio: number
  por_tipo: Record<string, number>
  proximas_30_dias: number
}

/**
 * Busca todas as manutenções
 */
export async function fetchManutencoes(): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .order('data_programada', { ascending: false })

  if (error) {
    console.error('Erro ao buscar manutenções:', error)
    throw error
  }
  return data || []
}

/**
 * Busca uma manutenção por ID
 */
export async function fetchManutencaoById(id: string): Promise<Manutencao | null> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar manutenção:', error)
    throw error
  }
  return data
}

/**
 * Cria uma nova manutenção
 */
export async function createManutencao(manutencao: Omit<Manutencao, 'id' | 'created_at' | 'updated_at'>): Promise<Manutencao | null> {
  const { data, error } = await supabase
    .from('manutencoes')
    .insert(manutencao)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar manutenção:', error)
    throw error
  }
  return data
}

/**
 * Atualiza uma manutenção existente
 */
export async function updateManutencao(id: string, updates: Partial<Manutencao>): Promise<Manutencao | null> {
  const { data, error } = await supabase
    .from('manutencoes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar manutenção:', error)
    throw error
  }
  return data
}

/**
 * Deleta uma manutenção
 */
export async function deleteManutencao(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('manutencoes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar manutenção:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de manutenções
 */
export async function fetchManutencoesStats(): Promise<ManutencaoStats> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const agendadas = data?.filter(m => m.status === 'Agendada').length || 0
  const em_andamento = data?.filter(m => m.status === 'Em Andamento').length || 0
  const concluidas = data?.filter(m => m.status === 'Concluída').length || 0
  const canceladas = data?.filter(m => m.status === 'Cancelada').length || 0

  const custo_total = data?.reduce((sum, m) => sum + (m.custo || 0), 0) || 0
  const custo_medio = concluidas > 0 ? custo_total / concluidas : 0

  // Agrupar por tipo
  const por_tipo: Record<string, number> = {}
  data?.forEach(m => {
    por_tipo[m.tipo] = (por_tipo[m.tipo] || 0) + 1
  })

  // Manutenções programadas nos próximos 30 dias
  const hoje = new Date()
  const daquiA30Dias = new Date()
  daquiA30Dias.setDate(hoje.getDate() + 30)

  const proximas_30_dias = data?.filter(m => {
    if (!m.data_programada || m.status === 'Concluída' || m.status === 'Cancelada') return false
    const dataProgramada = new Date(m.data_programada)
    return dataProgramada >= hoje && dataProgramada <= daquiA30Dias
  }).length || 0

  return {
    total,
    agendadas,
    em_andamento,
    concluidas,
    canceladas,
    custo_total,
    custo_medio,
    por_tipo,
    proximas_30_dias
  }
}

/**
 * Busca manutenções por veículo
 */
export async function fetchManutencoesByVeiculo(veiculoId: string): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .eq('veiculo_id', veiculoId)
    .order('data_programada', { ascending: false })

  if (error) {
    console.error('Erro ao buscar manutenções por veículo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca manutenções por tipo
 */
export async function fetchManutencoesByTipo(tipo: Manutencao['tipo']): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .eq('tipo', tipo)
    .order('data_programada', { ascending: false })

  if (error) {
    console.error('Erro ao buscar manutenções por tipo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca manutenções por status
 */
export async function fetchManutencoesByStatus(status: Manutencao['status']): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .eq('status', status)
    .order('data_programada', { ascending: false })

  if (error) {
    console.error('Erro ao buscar manutenções por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca manutenções agendadas (próximas)
 */
export async function fetchManutencoesAgendadas(dias: number = 30): Promise<Manutencao[]> {
  const hoje = new Date()
  const dataLimite = new Date()
  dataLimite.setDate(hoje.getDate() + dias)

  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .eq('status', 'Agendada')
    .gte('data_programada', hoje.toISOString().split('T')[0])
    .lte('data_programada', dataLimite.toISOString().split('T')[0])
    .order('data_programada', { ascending: true })

  if (error) {
    console.error('Erro ao buscar manutenções agendadas:', error)
    throw error
  }
  return data || []
}

/**
 * Busca manutenções atrasadas
 */
export async function fetchManutencoesAtrasadas(): Promise<Manutencao[]> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('manutencoes')
    .select('*')
    .in('status', ['Agendada', 'Em Andamento'])
    .lt('data_programada', hoje)
    .order('data_programada', { ascending: true })

  if (error) {
    console.error('Erro ao buscar manutenções atrasadas:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza status de uma manutenção
 */
export async function updateManutencaoStatus(id: string, status: Manutencao['status'], dataRealizada?: string): Promise<Manutencao | null> {
  const updates: Partial<Manutencao> = { status }
  if (dataRealizada && status === 'Concluída') {
    updates.data_realizada = dataRealizada
  }
  return updateManutencao(id, updates)
}

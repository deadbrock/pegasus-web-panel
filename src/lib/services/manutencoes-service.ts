import { supabase } from '@/lib/supabaseClient'

export type ManutencaoStatus = 'Agendada' | 'Em Andamento' | 'Pendente' | 'Concluída' | 'Atrasada' | 'Cancelada'
export type ManutencaoTipo = 'Preventiva' | 'Corretiva' | 'Revisão' | 'Troca de Óleo' | 'Pneus' | 'Inspeção' | 'Outros'

export interface Manutencao {
  id: string
  veiculo_id: string
  veiculo_placa?: string
  tipo: ManutencaoTipo
  descricao: string
  data_agendada: string // ISO
  data_inicio?: string | null // ISO
  data_conclusao?: string | null // ISO
  quilometragem: number
  status: ManutencaoStatus
  custo?: number | null
  responsavel?: string | null
  oficina?: string | null
  observacoes?: string | null
  pecas_trocadas?: string | null
  created_at?: string
  updated_at?: string
}

export interface ManutencaoCreate extends Omit<Manutencao, 'id' | 'created_at' | 'updated_at'> {}

export interface ManutencaoUpdate extends Partial<Omit<Manutencao, 'id' | 'created_at' | 'updated_at'>> {}

/**
 * Busca todas as manutenções do banco
 */
export async function fetchManutencoes(): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select(`
      *,
      veiculos (placa)
    `)
    .order('data_agendada', { ascending: false })

  if (error) {
    console.error('[fetchManutencoes] Erro:', error.message)
    return []
  }

  return (data || []).map(m => ({
    ...m,
    veiculo_placa: m.veiculos?.placa || 'N/A'
  }))
}

/**
 * Busca uma manutenção específica por ID
 */
export async function fetchManutencaoById(id: string): Promise<Manutencao | null> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select(`
      *,
      veiculos (placa)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[fetchManutencaoById] Erro:', error.message)
    return null
  }

  return {
    ...data,
    veiculo_placa: data.veiculos?.placa || 'N/A'
  }
}

/**
 * Busca manutenções de um veículo específico
 */
export async function fetchManutencoesByVeiculo(veiculoId: string): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select(`
      *,
      veiculos (placa)
    `)
    .eq('veiculo_id', veiculoId)
    .order('data_agendada', { ascending: false })

  if (error) {
    console.error('[fetchManutencoesByVeiculo] Erro:', error.message)
    return []
  }

  return (data || []).map(m => ({
    ...m,
    veiculo_placa: m.veiculos?.placa || 'N/A'
  }))
}

/**
 * Cria uma nova manutenção
 */
export async function createManutencao(manutencao: ManutencaoCreate): Promise<Manutencao | null> {
  const payload = {
    ...manutencao,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('manutencoes')
    .insert(payload)
    .select(`
      *,
      veiculos (placa)
    `)
    .single()

  if (error) {
    console.error('[createManutencao] Erro:', error.message)
    return null
  }

  return {
    ...data,
    veiculo_placa: data.veiculos?.placa || 'N/A'
  }
}

/**
 * Atualiza uma manutenção existente
 */
export async function updateManutencao(id: string, updates: ManutencaoUpdate): Promise<boolean> {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('manutencoes')
    .update(payload)
    .eq('id', id)

  if (error) {
    console.error('[updateManutencao] Erro:', error.message)
    return false
  }

  return true
}

/**
 * Exclui uma manutenção
 */
export async function deleteManutencao(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('manutencoes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteManutencao] Erro:', error.message)
    return false
  }

  return true
}

/**
 * Calcula estatísticas de manutenções
 */
export async function calcularEstatisticasManutencoes() {
  const manutencoes = await fetchManutencoes()

  const total = manutencoes.length
  const pendentes = manutencoes.filter(m => m.status === 'Pendente' || m.status === 'Atrasada').length
  const emAndamento = manutencoes.filter(m => m.status === 'Em Andamento').length
  const concluidas = manutencoes.filter(m => m.status === 'Concluída').length

  const custoTotal = manutencoes
    .filter(m => m.custo)
    .reduce((acc, m) => acc + (m.custo || 0), 0)

  const custoMedio = total > 0 ? custoTotal / total : 0

  return {
    total,
    pendentes,
    emAndamento,
    concluidas,
    custoTotal,
    custoMedio,
  }
}

/**
 * Busca manutenções por período
 */
export async function fetchManutencoesByPeriodo(dataInicio: string, dataFim: string): Promise<Manutencao[]> {
  const { data, error } = await supabase
    .from('manutencoes')
    .select(`
      *,
      veiculos (placa)
    `)
    .gte('data_agendada', dataInicio)
    .lte('data_agendada', dataFim)
    .order('data_agendada', { ascending: false })

  if (error) {
    console.error('[fetchManutencoesByPeriodo] Erro:', error.message)
    return []
  }

  return (data || []).map(m => ({
    ...m,
    veiculo_placa: m.veiculos?.placa || 'N/A'
  }))
}

/**
 * Subscreve mudanças em tempo real
 */
export function subscribeManutencoes(onChange: () => void) {
  const channel = supabase
    .channel('manutencoes-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'manutencoes' }, () => onChange())
    .subscribe()

  return () => supabase.removeChannel(channel)
}

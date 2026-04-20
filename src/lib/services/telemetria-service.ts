import { supabase } from '../supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Viagem {
  id: string
  supervisor_id?: string
  veiculo_id?: string
  veiculo_info?: string
  motorista_nome?: string
  data_inicio: string
  data_fim?: string
  km_percorrido: number
  status: 'ativa' | 'finalizada' | 'cancelada'
  observacoes?: string
  created_at: string
}

export interface Abastecimento {
  id: string
  supervisor_id?: string
  veiculo_id?: string
  veiculo_info?: string
  motorista_nome?: string
  data: string
  litros: number
  valor_total?: number
  valor_litro?: number
  km_atual?: number
  tipo_combustivel?: string
  posto?: string
  observacoes?: string
  created_at: string
}

export type NovoAbastecimento = Omit<Abastecimento, 'id' | 'valor_litro' | 'created_at'>

export interface TelemetriaStats {
  km_total: number
  km_mes: number
  litros_total: number
  litros_mes: number
  custo_total: number
  custo_mes: number
  custo_por_km: number
  total_viagens: number
  viagens_mes: number
  media_km_viagem: number
}

// ─── Viagens ──────────────────────────────────────────────────────────────────

export async function fetchViagens(params?: {
  veiculo_id?: string
  data_inicio?: string
  data_fim?: string
  status?: string
}): Promise<Viagem[]> {
  let query = supabase
    .from('viagens')
    .select('*')
    .order('data_inicio', { ascending: false })

  if (params?.veiculo_id) query = query.eq('veiculo_id', params.veiculo_id)
  if (params?.status)     query = query.eq('status', params.status)
  if (params?.data_inicio) query = query.gte('data_inicio', params.data_inicio)
  if (params?.data_fim)    query = query.lte('data_inicio', params.data_fim)

  const { data, error } = await query
  if (error) { console.warn('fetchViagens:', error.message); return [] }
  return (data as Viagem[]) || []
}

// ─── Abastecimentos ───────────────────────────────────────────────────────────

export async function fetchAbastecimentos(params?: {
  veiculo_id?: string
  data_inicio?: string
  data_fim?: string
}): Promise<Abastecimento[]> {
  let query = supabase
    .from('abastecimentos')
    .select('*')
    .order('data', { ascending: false })

  if (params?.veiculo_id)  query = query.eq('veiculo_id', params.veiculo_id)
  if (params?.data_inicio) query = query.gte('data', params.data_inicio)
  if (params?.data_fim)    query = query.lte('data', params.data_fim)

  const { data, error } = await query
  if (error) { console.warn('fetchAbastecimentos:', error.message); return [] }
  return (data as Abastecimento[]) || []
}

export async function createAbastecimento(input: NovoAbastecimento): Promise<Abastecimento | null> {
  const { data, error } = await supabase
    .from('abastecimentos')
    .insert(input)
    .select()
    .single()
  if (error) { console.error('createAbastecimento:', error.message); return null }
  return data as Abastecimento
}

export async function deleteAbastecimento(id: string): Promise<boolean> {
  const { error } = await supabase.from('abastecimentos').delete().eq('id', id)
  if (error) { console.error('deleteAbastecimento:', error.message); return false }
  return true
}

// ─── Estatísticas ─────────────────────────────────────────────────────────────

export async function fetchTelemetriaStats(params?: {
  veiculo_id?: string
}): Promise<TelemetriaStats> {
  const now = new Date()
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [viagens, viagens_mes, abastec, abastec_mes] = await Promise.all([
    fetchViagens({ veiculo_id: params?.veiculo_id, status: 'finalizada' }),
    fetchViagens({ veiculo_id: params?.veiculo_id, status: 'finalizada', data_inicio: inicioMes }),
    fetchAbastecimentos({ veiculo_id: params?.veiculo_id }),
    fetchAbastecimentos({ veiculo_id: params?.veiculo_id, data_inicio: inicioMes }),
  ])

  const km_total   = viagens.reduce((s, v) => s + (v.km_percorrido ?? 0), 0)
  const km_mes     = viagens_mes.reduce((s, v) => s + (v.km_percorrido ?? 0), 0)
  const litros_total = abastec.reduce((s, a) => s + (a.litros ?? 0), 0)
  const litros_mes   = abastec_mes.reduce((s, a) => s + (a.litros ?? 0), 0)
  const custo_total  = abastec.reduce((s, a) => s + (a.valor_total ?? 0), 0)
  const custo_mes    = abastec_mes.reduce((s, a) => s + (a.valor_total ?? 0), 0)

  return {
    km_total: Math.round(km_total * 10) / 10,
    km_mes:   Math.round(km_mes * 10) / 10,
    litros_total: Math.round(litros_total * 10) / 10,
    litros_mes:   Math.round(litros_mes * 10) / 10,
    custo_total:  Math.round(custo_total * 100) / 100,
    custo_mes:    Math.round(custo_mes * 100) / 100,
    custo_por_km: km_total > 0 ? Math.round((custo_total / km_total) * 100) / 100 : 0,
    total_viagens: viagens.length,
    viagens_mes:   viagens_mes.length,
    media_km_viagem: viagens.length > 0 ? Math.round((km_total / viagens.length) * 10) / 10 : 0,
  }
}

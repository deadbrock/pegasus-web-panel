import { supabase } from '@/lib/supabaseClient'

export interface CostRecord {
  id?: string
  data: string | Date
  categoria: string
  descricao: string
  valor: number
  veiculo_id?: string | null
  responsavel: string
  observacoes?: string | null
  status?: 'Pago' | 'Pendente' | 'Vencido' | string
  created_at?: string
}

export interface FetchCostsParams {
  from?: Date
  to?: Date
  search?: string
  categoria?: string
  status?: string
  veiculo_id?: string
  limit?: number
}

export async function fetchCosts(params: FetchCostsParams = {}): Promise<CostRecord[]> {
  let query = supabase.from('custos').select('*').order('data', { ascending: false })

  if (params.from) {
    query = query.gte('data', params.from.toISOString().slice(0, 10))
  }
  if (params.to) {
    query = query.lte('data', params.to.toISOString().slice(0, 10))
  }
  if (params.categoria) {
    query = query.eq('categoria', params.categoria)
  }
  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.veiculo_id) {
    query = query.eq('veiculo_id', params.veiculo_id)
  }
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`
    query = query.or(
      `descricao.ilike.${s},responsavel.ilike.${s},observacoes.ilike.${s},categoria.ilike.${s}`
    )
  }

  if (params.limit) {
    query = query.limit(params.limit)
  }

  const { data, error } = await query
  if (error) {
    console.error('fetchCosts error:', error.message)
    return []
  }
  return (data as unknown as CostRecord[]) || []
}

export async function createCost(cost: CostRecord): Promise<CostRecord | null> {
  const payload = {
    ...cost,
    data: (cost.data instanceof Date ? cost.data : new Date(cost.data)).toISOString().slice(0, 10),
  }
  const { data, error } = await supabase.from('custos').insert(payload).select('*').single()
  if (error) {
    console.error('createCost error:', error.message)
    return null
  }
  return data as unknown as CostRecord
}

export async function updateCost(id: string, updates: Partial<CostRecord>): Promise<CostRecord | null> {
  const payload: any = { ...updates }
  if (payload.data) {
    payload.data = (payload.data instanceof Date ? payload.data : new Date(payload.data)).toISOString().slice(0, 10)
  }
  const { data, error } = await supabase.from('custos').update(payload).eq('id', id).select('*').single()
  if (error) {
    console.error('updateCost error:', error.message)
    return null
  }
  return data as unknown as CostRecord
}

export async function deleteCost(id: string): Promise<boolean> {
  const { error } = await supabase.from('custos').delete().eq('id', id)
  if (error) {
    console.error('deleteCost error:', error.message)
    return false
  }
  return true
}

export async function upsertCostsBulk(rows: CostRecord[]): Promise<number> {
  if (!rows.length) return 0
  const payload = rows.map(r => ({
    ...r,
    data: (r.data instanceof Date ? r.data : new Date(r.data)).toISOString().slice(0, 10),
  }))
  const { data, error } = await supabase.from('custos').upsert(payload, { onConflict: 'id' }).select('id')
  if (error) {
    console.error('upsertCostsBulk error:', error.message)
    return 0
  }
  return (data || []).length
}

export interface CostsSummaryByCategory {
  categoria: string
  total: number
}

export async function getCostsByCategory(params: FetchCostsParams = {}): Promise<CostsSummaryByCategory[]> {
  const rows = await fetchCosts(params)
  const map = new Map<string, number>()
  for (const r of rows) {
    const key = r.categoria || 'Outros'
    map.set(key, (map.get(key) || 0) + (r.valor || 0))
  }
  return Array.from(map.entries()).map(([categoria, total]) => ({ categoria, total }))
}

export interface MonthlyCostsPoint {
  mes: string
  total: number
}

export async function getMonthlyCosts(params: FetchCostsParams = {}): Promise<MonthlyCostsPoint[]> {
  const rows = await fetchCosts(params)
  const map = new Map<string, number>()
  for (const r of rows) {
    const d = new Date(r.data)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + (r.valor || 0))
  }
  const ordered = Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1))
  return ordered.map(([key, total]) => ({ mes: key, total }))
}



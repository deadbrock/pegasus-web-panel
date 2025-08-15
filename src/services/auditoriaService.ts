import { supabase } from '@/lib/supabaseClient'

export type AuditSeverity = 'Crítica' | 'Alta' | 'Média' | 'Baixa'
export type AuditStatus = 'Pendente' | 'Em Análise' | 'Resolvido'

export interface AuditFindingRecord {
  id?: string
  area: string
  descricao: string
  severidade: AuditSeverity
  status: AuditStatus
  data_criacao: string // ISO
  data_ultima_ocorrencia: string // ISO
  dados_referencia?: any | null
  created_at?: string
  updated_at?: string
}

export interface FetchFindingsParams {
  search?: string
  status?: AuditStatus
  severidade?: AuditSeverity
  from?: Date
  to?: Date
  limit?: number
}

export async function fetchFindings(params: FetchFindingsParams = {}): Promise<AuditFindingRecord[]> {
  let query = supabase.from('audit_findings').select('*').order('data_ultima_ocorrencia', { ascending: false })
  if (params.status) query = query.eq('status', params.status)
  if (params.severidade) query = query.eq('severidade', params.severidade)
  if (params.from) query = query.gte('data_criacao', params.from.toISOString())
  if (params.to) query = query.lte('data_ultima_ocorrencia', params.to.toISOString())
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`
    query = query.or(`area.ilike.${s},descricao.ilike.${s}`)
  }
  if (params.limit) query = query.limit(params.limit)
  const { data, error } = await query
  if (error) {
    console.warn('fetchFindings error:', error.message)
    return []
  }
  return (data as AuditFindingRecord[]) || []
}

export async function createFinding(row: Omit<AuditFindingRecord, 'id' | 'created_at' | 'updated_at'>): Promise<AuditFindingRecord | null> {
  const { data, error } = await supabase.from('audit_findings').insert(row).select('*').single()
  if (error) {
    console.error('createFinding error:', error.message)
    return null
  }
  return data as AuditFindingRecord
}

export async function updateFinding(id: string, updates: Partial<AuditFindingRecord>): Promise<boolean> {
  const { error } = await supabase.from('audit_findings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) {
    console.error('updateFinding error:', error.message)
    return false
  }
  return true
}

export async function deleteFinding(id: string): Promise<boolean> {
  const { error } = await supabase.from('audit_findings').delete().eq('id', id)
  if (error) {
    console.error('deleteFinding error:', error.message)
    return false
  }
  return true
}



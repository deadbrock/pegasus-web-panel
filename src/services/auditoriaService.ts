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
  area?: string
  from?: Date
  to?: Date
  limit?: number
}

export async function fetchFindings(params: FetchFindingsParams = {}): Promise<AuditFindingRecord[]> {
  let query = supabase.from('audit_findings').select('*').order('data_ultima_ocorrencia', { ascending: false })
  if (params.status) query = query.eq('status', params.status)
  if (params.severidade) query = query.eq('severidade', params.severidade)
  if (params.area) query = query.eq('area', params.area)
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

export async function upsertFindingsBulk(rows: AuditFindingRecord[]): Promise<number> {
  if (!rows.length) return 0
  const sanitized = rows.map((r) => ({
    id: r.id,
    area: r.area,
    descricao: r.descricao,
    severidade: r.severidade,
    status: r.status,
    data_criacao: r.data_criacao || new Date().toISOString(),
    data_ultima_ocorrencia: r.data_ultima_ocorrencia || new Date().toISOString(),
    dados_referencia: r.dados_referencia ?? null,
  }))
  const { data, error } = await supabase.from('audit_findings').upsert(sanitized, { onConflict: 'id' }).select('id')
  if (error) {
    console.error('upsertFindingsBulk error:', error.message)
    return 0
  }
  return data?.length || 0
}

export function subscribeFindings(onChange: () => void) {
  try {
    const channel = (supabase as any).channel('audit_findings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_findings' }, () => onChange())
      .subscribe()
    return () => (supabase as any).removeChannel(channel)
  } catch {
    return () => {}
  }
}

export async function runQuickAudit(): Promise<number> {
  // Insere alguns apontamentos padrões de verificação rápida
  const now = new Date().toISOString()
  const inserts: AuditFindingRecord[] = [
    {
      area: 'Manutenção',
      descricao: 'Veículos com preventiva vencida identificados na última varredura',
      severidade: 'Crítica',
      status: 'Pendente',
      data_criacao: now,
      data_ultima_ocorrencia: now,
      dados_referencia: { origem: 'quick_audit', tipo: 'preventiva_vencida' }
    },
    {
      area: 'Documentos',
      descricao: 'Motoristas com CNH próxima do vencimento',
      severidade: 'Alta',
      status: 'Em Análise',
      data_criacao: now,
      data_ultima_ocorrencia: now,
      dados_referencia: { origem: 'quick_audit', tipo: 'documentos' }
    },
    {
      area: 'Combustível',
      descricao: 'Veículos com consumo acima da meta',
      severidade: 'Média',
      status: 'Pendente',
      data_criacao: now,
      data_ultima_ocorrencia: now,
      dados_referencia: { origem: 'quick_audit', tipo: 'consumo' }
    }
  ]
  const { data, error } = await supabase.from('audit_findings').insert(inserts).select('id')
  if (error) {
    console.error('runQuickAudit error:', error.message)
    return 0
  }
  return data?.length || 0
}




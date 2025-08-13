import { supabase } from '@/lib/supabaseClient'

export type DriverStatus = 'Ativo' | 'Inativo'

export interface DriverRecord {
  id?: string
  nome: string
  cpf: string
  cnh: string
  telefone?: string | null
  email?: string | null
  endereco?: string | null
  status?: DriverStatus
  // Campos apenas de UI (não garantidos no schema):
  categoria?: string | null
  validadeCnh?: string | null // ISO
  ultimaViagem?: string | null // ISO
  totalViagens?: number | null
  pontuacao?: number | null
  created_at?: string
  updated_at?: string
}

function mapRowFromDb(row: any): DriverRecord {
  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    cnh: row.cnh,
    telefone: row.telefone ?? null,
    email: row.email ?? null,
    endereco: row.endereco ?? null,
    status: (row.status as DriverStatus) ?? 'Ativo',
    // UI-only fallbacks (mock/undefined until schema includes):
    categoria: row.categoria ?? null,
    validadeCnh: row.validade_cnh ?? null,
    ultimaViagem: null,
    totalViagens: null,
    pontuacao: null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapToDbPayload(d: Partial<DriverRecord>): any {
  return {
    nome: d.nome,
    cpf: d.cpf,
    cnh: d.cnh,
    telefone: d.telefone ?? null,
    email: d.email ?? null,
    endereco: d.endereco ?? null,
    status: d.status ?? 'Ativo',
    // se campos extras existirem no schema, serão aplicados
    categoria: (d as any).categoria ?? undefined,
    validade_cnh: (d as any).validadeCnh ?? undefined,
    updated_at: new Date().toISOString(),
  }
}

export async function fetchDrivers(): Promise<DriverRecord[]> {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('fetchDrivers error:', error.message)
    return []
  }
  return (data || []).map(mapRowFromDb)
}

export async function createDriver(d: DriverRecord): Promise<DriverRecord | null> {
  const payload = {
    ...mapToDbPayload(d),
    created_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('motoristas')
    .insert(payload)
    .select('*')
    .single()
  if (error) {
    console.error('createDriver error:', error.message)
    return null
  }
  return mapRowFromDb(data)
}

export async function updateDriver(id: string, updates: Partial<DriverRecord>): Promise<boolean> {
  const { error } = await supabase
    .from('motoristas')
    .update(mapToDbPayload(updates))
    .eq('id', id)
  if (error) {
    console.error('updateDriver error:', error.message)
    return false
  }
  return true
}

export async function deleteDriver(id: string): Promise<boolean> {
  const { error } = await supabase.from('motoristas').delete().eq('id', id)
  if (error) {
    console.error('deleteDriver error:', error.message)
    return false
  }
  return true
}

export function subscribeDrivers(onChange: () => void) {
  const channel = supabase
    .channel('drivers-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'motoristas' }, () => onChange())
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export async function upsertDriversBulk(rows: DriverRecord[]): Promise<{ ok: number; fail: number }> {
  if (!rows.length) return { ok: 0, fail: 0 }
  // upsert por CPF, se houver unique no schema. Caso não tenha, irá inserir duplicado.
  const { error } = await supabase
    .from('motoristas')
    .upsert(rows.map(mapToDbPayload) as any, { onConflict: 'cpf' })
  if (error) {
    console.error('upsertDriversBulk error:', error.message)
    return { ok: 0, fail: rows.length }
  }
  return { ok: rows.length, fail: 0 }
}



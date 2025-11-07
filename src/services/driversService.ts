import { supabase } from '@/lib/supabaseClient'
import { fetchDriverPerformance, type DriverPerformanceData } from './driversPerformanceService'

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
  // Campos do banco de dados:
  categoria_cnh?: string | null
  validade_cnh?: string | null // ISO
  validade_exame_medico?: string | null // ISO
  validade_certidao_antecedentes?: string | null // ISO
  validade_curso_defensiva?: string | null // ISO
  data_admissao?: string | null // ISO
  data_nascimento?: string | null // ISO
  observacoes?: string | null
  // Campos calculados dinamicamente de rotas_entrega:
  ultimaViagem?: string | null // ISO
  totalViagens?: number
  pontuacao?: number
  pontualidade?: number
  seguranca?: number
  eficiencia?: number
  satisfacao?: number
  created_at?: string
  updated_at?: string
}

function mapRowFromDb(row: any, performance?: DriverPerformanceData): DriverRecord {
  return {
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    cnh: row.cnh,
    telefone: row.telefone ?? null,
    email: row.email ?? null,
    endereco: row.endereco ?? null,
    status: (row.status as DriverStatus) ?? 'Ativo',
    // Campos do banco de dados:
    categoria_cnh: row.categoria_cnh ?? null,
    validade_cnh: row.validade_cnh ?? null,
    validade_exame_medico: row.validade_exame_medico ?? null,
    validade_certidao_antecedentes: row.validade_certidao_antecedentes ?? null,
    validade_curso_defensiva: row.validade_curso_defensiva ?? null,
    data_admissao: row.data_admissao ?? null,
    data_nascimento: row.data_nascimento ?? null,
    observacoes: row.observacoes ?? null,
    // Dados de performance (calculados de rotas_entrega):
    ultimaViagem: performance?.ultimaViagem ?? null,
    totalViagens: performance?.totalViagens ?? 0,
    pontuacao: performance?.pontuacao ?? 0,
    pontualidade: performance?.pontualidade ?? 0,
    seguranca: performance?.seguranca ?? 0,
    eficiencia: performance?.eficiencia ?? 0,
    satisfacao: performance?.satisfacao ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapToDbPayload(d: Partial<DriverRecord>): any {
  const payload: any = {
    nome: d.nome,
    cpf: d.cpf,
    cnh: d.cnh,
    telefone: d.telefone ?? null,
    email: d.email ?? null,
    endereco: d.endereco ?? null,
    status: d.status ?? 'Ativo',
    updated_at: new Date().toISOString(),
  }
  
  // Campos adicionais do banco (se virem do payload direto do dialog)
  if ((d as any).categoria_cnh) {
    payload.categoria_cnh = (d as any).categoria_cnh
  }
  if ((d as any).validade_cnh) {
    payload.validade_cnh = (d as any).validade_cnh
  }
  if ((d as any).data_admissao) {
    payload.data_admissao = (d as any).data_admissao
  }
  if ((d as any).data_nascimento !== undefined) {
    payload.data_nascimento = (d as any).data_nascimento
  }
  if ((d as any).observacoes !== undefined) {
    payload.observacoes = (d as any).observacoes
  }
  
  return payload
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
  
  // Buscar performance de cada motorista
  const driversWithPerformance = await Promise.all(
    (data || []).map(async (row) => {
      const performance = row.id ? await fetchDriverPerformance(row.id) : null
      return mapRowFromDb(row, performance || undefined)
    })
  )
  
  return driversWithPerformance
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



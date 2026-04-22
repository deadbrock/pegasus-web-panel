import { supabase } from '@/lib/supabaseClient'
import type {
  AdmContrato,
  AdmContratoInsert,
  AdmContratoUpdate,
  AdmContratoFinanceiro,
  AdmContratoFinanceiroInsert,
  AdmContratoFinanceiroUpdate,
  AdmContratoStats,
} from '@/types/adm-contratos'

// ─── Contratos ───────────────────────────────────────────────────────────────

export async function fetchAdmContratos(): Promise<AdmContrato[]> {
  const { data, error } = await supabase
    .from('adm_contratos')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.warn('[admContratosService] fetchAdmContratos error:', error.message)
    return []
  }
  return (data as AdmContrato[]) ?? []
}

export interface FetchAdmContratosParams {
  search?: string
  status?: AdmContrato['status']
}

export async function fetchAdmContratosQuery(
  params: FetchAdmContratosParams = {}
): Promise<AdmContrato[]> {
  let query = supabase
    .from('adm_contratos')
    .select('*')
    .order('nome', { ascending: true })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.search?.trim()) {
    const s = `%${params.search.trim()}%`
    query = query.or(
      `nome.ilike.${s},codigo.ilike.${s},cliente_nome.ilike.${s},responsavel.ilike.${s}`
    )
  }

  const { data, error } = await query
  if (error) {
    console.warn('[admContratosService] fetchAdmContratosQuery error:', error.message)
    return []
  }
  return (data as AdmContrato[]) ?? []
}

export async function fetchAdmContratoById(id: string): Promise<AdmContrato | null> {
  const { data, error } = await supabase
    .from('adm_contratos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.warn('[admContratosService] fetchAdmContratoById error:', error.message)
    return null
  }
  return data as AdmContrato
}

export async function createAdmContrato(
  contrato: AdmContratoInsert
): Promise<AdmContrato | null> {
  const { data, error } = await supabase
    .from('adm_contratos')
    .insert(contrato)
    .select('*')
    .single()

  if (error) {
    console.error('[admContratosService] createAdmContrato error:', error.message)
    return null
  }
  return data as AdmContrato
}

export async function updateAdmContrato(
  id: string,
  updates: AdmContratoUpdate
): Promise<boolean> {
  const { error } = await supabase
    .from('adm_contratos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[admContratosService] updateAdmContrato error:', error.message)
    return false
  }
  return true
}

export async function deleteAdmContrato(id: string): Promise<{ ok: boolean; message?: string }> {
  const { error, count } = await supabase
    .from('adm_contratos')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) {
    console.error('[admContratosService] deleteAdmContrato error:', error.message)
    return { ok: false, message: error.message }
  }
  if (!count || count === 0) {
    console.warn('[admContratosService] deleteAdmContrato: 0 linhas removidas — possível bloqueio de RLS')
    return { ok: false, message: 'Sem permissão para excluir este contrato.' }
  }
  return { ok: true }
}

// ─── Financeiro por contrato ──────────────────────────────────────────────────

export async function fetchAdmContratoFinanceiro(
  contratoId: string
): Promise<AdmContratoFinanceiro[]> {
  const { data, error } = await supabase
    .from('adm_contrato_financeiro')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('periodo_referencia', { ascending: false })

  if (error) {
    console.warn('[admContratosService] fetchAdmContratoFinanceiro error:', error.message)
    return []
  }
  return (data as AdmContratoFinanceiro[]) ?? []
}

export async function upsertAdmContratoFinanceiro(
  entry: AdmContratoFinanceiroInsert
): Promise<AdmContratoFinanceiro | null> {
  // lucro e margem_percentual são GENERATED ALWAYS AS STORED no banco
  const payload = {
    contrato_id: entry.contrato_id,
    periodo_referencia: entry.periodo_referencia,
    receita: entry.receita,
    custo: entry.custo,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('adm_contrato_financeiro')
    .upsert(payload, { onConflict: 'contrato_id,periodo_referencia' })
    .select('*')
    .single()

  if (error) {
    console.error('[admContratosService] upsertAdmContratoFinanceiro error:', error.message)
    return null
  }
  return data as AdmContratoFinanceiro
}

export async function updateAdmContratoFinanceiro(
  id: string,
  updates: AdmContratoFinanceiroUpdate
): Promise<boolean> {
  // lucro e margem_percentual são GENERATED ALWAYS AS STORED — não devem ser enviados
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.receita !== undefined) patch.receita = updates.receita
  if (updates.custo !== undefined) patch.custo = updates.custo
  if (updates.periodo_referencia !== undefined) patch.periodo_referencia = updates.periodo_referencia
  if (updates.contrato_id !== undefined) patch.contrato_id = updates.contrato_id

  const { error } = await supabase
    .from('adm_contrato_financeiro')
    .update(patch)
    .eq('id', id)

  if (error) {
    console.error('[admContratosService] updateAdmContratoFinanceiro error:', error.message)
    return false
  }
  return true
}

export async function deleteAdmContratoFinanceiro(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('adm_contrato_financeiro')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admContratosService] deleteAdmContratoFinanceiro error:', error.message)
    return false
  }
  return true
}

// ─── Todos os dados financeiros (para Analytics) ─────────────────────────────

export async function fetchAdmAllFinanceiro(): Promise<AdmContratoFinanceiro[]> {
  const { data, error } = await supabase
    .from('adm_contrato_financeiro')
    .select('*')
    .order('periodo_referencia', { ascending: false })

  if (error) {
    console.warn('[admContratosService] fetchAdmAllFinanceiro error:', error.message)
    return []
  }
  return (data as AdmContratoFinanceiro[]) ?? []
}

// ─── Stats por contrato ───────────────────────────────────────────────────────

export async function fetchAdmContratoStats(
  contratoId: string
): Promise<AdmContratoStats> {
  const financeiro = await fetchAdmContratoFinanceiro(contratoId)

  if (!financeiro.length) {
    return { totalReceita: 0, totalCusto: 0, totalLucro: 0, margemMedia: 0, periodos: 0 }
  }

  const totalReceita = financeiro.reduce((s, f) => s + f.receita, 0)
  const totalCusto = financeiro.reduce((s, f) => s + f.custo, 0)
  const totalLucro = financeiro.reduce((s, f) => s + f.lucro, 0)
  const margemMedia =
    totalReceita > 0 ? Math.round((totalLucro / totalReceita) * 10000) / 100 : 0

  return {
    totalReceita,
    totalCusto,
    totalLucro,
    margemMedia,
    periodos: financeiro.length,
  }
}

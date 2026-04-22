import { supabase } from '@/lib/supabaseClient'
import type { AdmReajuste, AdmReajusteInsert, AdmReajusteUpdate } from '@/types/adm-contratos'
import { logHistoricoEvent, buildHistoricoReajuste } from './admHistoricoService'
import { updateAdmContrato } from './admContratosService'

export async function fetchReajustes(contratoId: string): Promise<AdmReajuste[]> {
  const { data, error } = await supabase
    .from('adm_reajustes')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('data_aplicacao', { ascending: false })

  if (error) {
    console.warn('[admReajustesService] fetchReajustes error:', error.message)
    return []
  }
  return (data as AdmReajuste[]) ?? []
}

export async function fetchUltimoReajuste(contratoId: string): Promise<AdmReajuste | null> {
  const { data, error } = await supabase
    .from('adm_reajustes')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('data_aplicacao', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('[admReajustesService] fetchUltimoReajuste error:', error.message)
    return null
  }
  return data as AdmReajuste | null
}

/**
 * Aplica um reajuste ao contrato.
 * 1. Insere o reajuste na tabela adm_reajustes
 * 2. Atualiza o valor_mensal em adm_contratos
 * 3. Registra evento no histórico
 */
export async function aplicarReajuste(
  entry: AdmReajusteInsert
): Promise<AdmReajuste | null> {
  const { data: { user } } = await supabase.auth.getUser()

  const payload: AdmReajusteInsert = {
    ...entry,
    created_by: user?.id ?? null,
  }

  // 1. Insere o reajuste
  const { data, error } = await supabase
    .from('adm_reajustes')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('[admReajustesService] aplicarReajuste error:', error.message)
    return null
  }

  const reajuste = data as AdmReajuste

  // 2. Atualiza o valor_mensal do contrato
  await updateAdmContrato(entry.contrato_id, { valor_mensal: entry.valor_novo })

  // 3. Registra no histórico (não bloqueia)
  await logHistoricoEvent(
    buildHistoricoReajuste(
      entry.contrato_id,
      entry.percentual,
      entry.valor_anterior,
      entry.valor_novo,
      user?.id
    )
  )

  return reajuste
}

export async function updateReajuste(
  id: string,
  updates: AdmReajusteUpdate
): Promise<boolean> {
  const { error } = await supabase
    .from('adm_reajustes')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[admReajustesService] updateReajuste error:', error.message)
    return false
  }
  return true
}

export async function deleteReajuste(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('adm_reajustes')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admReajustesService] deleteReajuste error:', error.message)
    return false
  }
  return true
}

/** Calcula o valor simulado após reajuste sem persistir */
export function simularReajuste(valorAtual: number, percentual: number): number {
  return Math.round(valorAtual * (1 + percentual / 100) * 100) / 100
}

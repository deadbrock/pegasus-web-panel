import { supabase } from '@/lib/supabaseClient'
import type {
  AdmAditivo,
  AdmAditivoInsert,
  AdmAditivoUpdate,
} from '@/types/adm-contratos'

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchAditivos(contratoId: string): Promise<AdmAditivo[]> {
  const { data, error } = await supabase
    .from('adm_contrato_aditivos')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('numero_aditivo', { ascending: true })

  if (error) {
    console.warn('[admAditivosService] fetchAditivos error:', error.message)
    return []
  }
  return (data as AdmAditivo[]) ?? []
}

// ─── Próximo número de aditivo ────────────────────────────────────────────────

export async function fetchProximoNumeroAditivo(contratoId: string): Promise<number> {
  const { data, error } = await supabase
    .from('adm_contrato_aditivos')
    .select('numero_aditivo')
    .eq('contrato_id', contratoId)
    .order('numero_aditivo', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.warn('[admAditivosService] fetchProximoNumeroAditivo error:', error.message)
    return 1
  }
  return data ? (data.numero_aditivo as number) + 1 : 1
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createAditivo(
  payload: AdmAditivoInsert
): Promise<AdmAditivo | null> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('adm_contrato_aditivos')
    .insert({ ...payload, created_by: user?.id ?? null })
    .select('*')
    .single()

  if (error) {
    console.error('[admAditivosService] createAditivo error:', error.message)
    return null
  }
  return data as AdmAditivo
}

// ─── Update ───────────────────────────────────────────────────────────────────

export async function updateAditivo(
  id: string,
  updates: AdmAditivoUpdate
): Promise<boolean> {
  const { error } = await supabase
    .from('adm_contrato_aditivos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[admAditivosService] updateAditivo error:', error.message)
    return false
  }
  return true
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteAditivo(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('adm_contrato_aditivos')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) {
    console.error('[admAditivosService] deleteAditivo error:', error.message)
    return false
  }
  return (count ?? 0) > 0
}

// ─── Toggle status ────────────────────────────────────────────────────────────

export async function toggleAditivoStatus(
  id: string,
  status: 'ativo' | 'cancelado'
): Promise<boolean> {
  return updateAditivo(id, { status })
}

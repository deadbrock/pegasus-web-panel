import { supabase } from '@/lib/supabaseClient'
import type {
  AdmContratoCusto,
  AdmContratoCustoInsert,
  AdmContratoCustoUpdate,
} from '@/types/adm-contratos'

export async function fetchCustos(contratoId: string): Promise<AdmContratoCusto[]> {
  const { data, error } = await supabase
    .from('adm_contrato_custos')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: true })

  if (error) {
    console.warn('[admCustosService] fetchCustos error:', error.message)
    return []
  }
  return (data as AdmContratoCusto[]) ?? []
}

export async function createCusto(
  custo: AdmContratoCustoInsert
): Promise<AdmContratoCusto | null> {
  const { data, error } = await supabase
    .from('adm_contrato_custos')
    .insert({ ...custo, ativo: custo.ativo ?? true })
    .select('*')
    .single()

  if (error) {
    console.error('[admCustosService] createCusto error:', error.message)
    return null
  }
  return data as AdmContratoCusto
}

export async function updateCusto(
  id: string,
  updates: AdmContratoCustoUpdate
): Promise<boolean> {
  const { error } = await supabase
    .from('adm_contrato_custos')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[admCustosService] updateCusto error:', error.message)
    return false
  }
  return true
}

export async function deleteCusto(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('adm_contrato_custos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admCustosService] deleteCusto error:', error.message)
    return false
  }
  return true
}

export async function toggleCustoAtivo(id: string, ativo: boolean): Promise<boolean> {
  return updateCusto(id, { ativo })
}

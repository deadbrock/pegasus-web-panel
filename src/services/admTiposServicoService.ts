import { supabase } from '@/lib/supabaseClient'
import type { AdmTipoServico, AdmTipoServicoInsert } from '@/types/adm-contratos'

export async function fetchTiposServico(): Promise<AdmTipoServico[]> {
  const { data, error } = await supabase
    .from('adm_tipos_servico')
    .select('*')
    .eq('ativo', true)
    .order('nome', { ascending: true })

  if (error) {
    console.warn('[admTiposServicoService] fetchTiposServico error:', error.message)
    return []
  }
  return (data as AdmTipoServico[]) ?? []
}

export async function createTipoServico(
  nome: string,
  descricao?: string
): Promise<AdmTipoServico | null> {
  const { data: { user } } = await supabase.auth.getUser()

  const payload: AdmTipoServicoInsert = {
    nome: nome.trim().toUpperCase(),
    descricao: descricao?.trim() || null,
    ativo: true,
    created_by: user?.id ?? null,
  }

  const { data, error } = await supabase
    .from('adm_tipos_servico')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('[admTiposServicoService] createTipoServico error:', error.message)
    return null
  }
  return data as AdmTipoServico
}

export async function updateTipoServico(
  id: string,
  nome: string,
  descricao?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('adm_tipos_servico')
    .update({ nome: nome.trim().toUpperCase(), descricao: descricao?.trim() || null })
    .eq('id', id)

  if (error) {
    console.error('[admTiposServicoService] updateTipoServico error:', error.message)
    return false
  }
  return true
}

export async function deleteTipoServico(id: string): Promise<boolean> {
  // Soft delete
  const { error } = await supabase
    .from('adm_tipos_servico')
    .update({ ativo: false })
    .eq('id', id)

  if (error) {
    console.error('[admTiposServicoService] deleteTipoServico error:', error.message)
    return false
  }
  return true
}

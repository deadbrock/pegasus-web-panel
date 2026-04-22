import { supabase } from '@/lib/supabaseClient'
import type {
  AdmManutencaoContrato,
  AdmManutencaoInsert,
  AdmManutencaoUpdate,
  AdmManutencaoStatus,
} from '@/types/adm-contratos'
import { logHistoricoEvent, buildHistoricoManutencao } from './admHistoricoService'

export async function fetchManutencoes(
  contratoId: string
): Promise<AdmManutencaoContrato[]> {
  const { data, error } = await supabase
    .from('adm_manutencao_contrato')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[admManutencaoService] fetchManutencoes error:', error.message)
    return []
  }
  return (data as AdmManutencaoContrato[]) ?? []
}

export async function createManutencao(
  entry: AdmManutencaoInsert
): Promise<AdmManutencaoContrato | null> {
  const { data: { user } } = await supabase.auth.getUser()

  const payload: AdmManutencaoInsert = {
    ...entry,
    created_by: user?.id ?? null,
    data_registro: entry.data_registro || new Date().toISOString().split('T')[0],
  }

  const { data, error } = await supabase
    .from('adm_manutencao_contrato')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    console.error('[admManutencaoService] createManutencao error:', error.message)
    return null
  }

  const manutencao = data as AdmManutencaoContrato

  // Registra no histórico
  await logHistoricoEvent(
    buildHistoricoManutencao(
      entry.contrato_id,
      'manutencao_criada',
      `Ocorrência registrada: ${entry.titulo}`,
      `Tipo: ${entry.tipo} | Prioridade: ${entry.prioridade}`,
      user?.id
    )
  )

  return manutencao
}

export async function updateManutencao(
  id: string,
  updates: AdmManutencaoUpdate,
  contratoId?: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('adm_manutencao_contrato')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[admManutencaoService] updateManutencao error:', error.message)
    return false
  }

  // Registra conclusão no histórico se status mudou para concluída
  if (updates.status === 'concluida' && contratoId) {
    await logHistoricoEvent(
      buildHistoricoManutencao(
        contratoId,
        'manutencao_concluida',
        'Ocorrência concluída',
        updates.titulo ? `"${updates.titulo}" foi concluída.` : 'Uma ocorrência foi marcada como concluída.',
        user?.id
      )
    )
  } else if (contratoId) {
    await logHistoricoEvent(
      buildHistoricoManutencao(
        contratoId,
        'manutencao_editada',
        'Ocorrência atualizada',
        updates.titulo ? `"${updates.titulo}" foi atualizada.` : 'Uma ocorrência foi atualizada.',
        user?.id
      )
    )
  }

  return true
}

export async function concluirManutencao(
  id: string,
  contratoId: string
): Promise<boolean> {
  return updateManutencao(
    id,
    {
      status: 'concluida' as AdmManutencaoStatus,
      data_conclusao: new Date().toISOString().split('T')[0],
    },
    contratoId
  )
}

export async function deleteManutencao(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('adm_manutencao_contrato')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[admManutencaoService] deleteManutencao error:', error.message)
    return false
  }
  return true
}

import { supabase } from '@/lib/supabaseClient'
import type {
  AdmHistoricoContrato,
  AdmHistoricoInsert,
  AdmHistoricoTipoEvento,
} from '@/types/adm-contratos'

export async function fetchHistorico(contratoId: string): Promise<AdmHistoricoContrato[]> {
  const { data, error } = await supabase
    .from('adm_historico_contrato')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[admHistoricoService] fetchHistorico error:', error.message)
    return []
  }
  return (data as AdmHistoricoContrato[]) ?? []
}

export async function logHistoricoEvent(event: AdmHistoricoInsert): Promise<void> {
  // Obtém o usuário atual de forma não bloqueante
  const { data: { user } } = await supabase.auth.getUser()

  const payload: AdmHistoricoInsert = {
    ...event,
    usuario_id: event.usuario_id ?? user?.id ?? null,
  }

  const { error } = await supabase
    .from('adm_historico_contrato')
    .insert(payload)

  if (error) {
    // História nunca deve bloquear a ação principal — apenas loga o erro
    console.warn('[admHistoricoService] logHistoricoEvent error:', error.message)
  }
}

// Helpers para cada tipo de evento

export function buildHistoricoContratoCriado(
  contratoId: string,
  contratoNome: string,
  userId?: string
): AdmHistoricoInsert {
  return {
    contrato_id: contratoId,
    tipo_evento: 'contrato_criado',
    titulo: 'Contrato criado',
    descricao: `Contrato "${contratoNome}" foi cadastrado no sistema.`,
    usuario_id: userId ?? null,
  }
}

export function buildHistoricoContratoEditado(
  contratoId: string,
  userId?: string,
  changes?: Record<string, unknown>
): AdmHistoricoInsert {
  return {
    contrato_id: contratoId,
    tipo_evento: 'contrato_editado',
    titulo: 'Contrato atualizado',
    descricao: 'Informações do contrato foram atualizadas.',
    metadata_json: changes ?? null,
    usuario_id: userId ?? null,
  }
}

export function buildHistoricoStatusAlterado(
  contratoId: string,
  statusAnterior: string,
  statusNovo: string,
  userId?: string
): AdmHistoricoInsert {
  return {
    contrato_id: contratoId,
    tipo_evento: 'status_alterado',
    titulo: 'Status alterado',
    descricao: `Status alterado de "${statusAnterior}" para "${statusNovo}".`,
    metadata_json: { status_anterior: statusAnterior, status_novo: statusNovo },
    usuario_id: userId ?? null,
  }
}

export function buildHistoricoReajuste(
  contratoId: string,
  percentual: number,
  valorAnterior: number,
  valorNovo: number,
  userId?: string
): AdmHistoricoInsert {
  return {
    contrato_id: contratoId,
    tipo_evento: 'reajuste_aplicado',
    titulo: `Reajuste de ${percentual >= 0 ? '+' : ''}${percentual.toFixed(2)}% aplicado`,
    descricao: `Valor mensal atualizado de ${valorAnterior.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${valorNovo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`,
    metadata_json: { percentual, valor_anterior: valorAnterior, valor_novo: valorNovo },
    usuario_id: userId ?? null,
  }
}

export function buildHistoricoFinanceiro(
  contratoId: string,
  periodo: string,
  userId?: string
): AdmHistoricoInsert {
  return {
    contrato_id: contratoId,
    tipo_evento: 'financeiro_atualizado',
    titulo: 'Financeiro registrado',
    descricao: `Dados financeiros do período ${periodo} foram registrados.`,
    metadata_json: { periodo },
    usuario_id: userId ?? null,
  }
}

export function buildHistoricoManutencao(
  contratoId: string,
  tipo_evento: AdmHistoricoTipoEvento,
  titulo: string,
  descricao: string,
  userId?: string
): AdmHistoricoInsert {
  return {
    contrato_id: contratoId,
    tipo_evento,
    titulo,
    descricao,
    usuario_id: userId ?? null,
  }
}

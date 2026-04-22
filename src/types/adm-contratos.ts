// Tipos do módulo Gestão ADM — Fase 1

export type AdmContratoStatus = 'ativo' | 'suspenso' | 'encerrado' | 'em_negociacao'

export interface AdmContrato {
  id: string
  codigo: string
  nome: string
  cliente_nome: string
  cliente_documento?: string | null
  responsavel?: string | null
  valor_mensal?: number | null
  data_inicio?: string | null
  data_fim?: string | null
  status: AdmContratoStatus
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export type AdmContratoInsert = Omit<AdmContrato, 'id' | 'created_at' | 'updated_at'>
export type AdmContratoUpdate = Partial<AdmContratoInsert>

export interface AdmContratoFinanceiro {
  id: string
  contrato_id: string
  periodo_referencia: string // formato: 'YYYY-MM'
  receita: number
  custo: number
  lucro: number
  margem_percentual: number
  created_at: string
  updated_at: string
}

export type AdmContratoFinanceiroInsert = Omit<
  AdmContratoFinanceiro,
  'id' | 'created_at' | 'updated_at' | 'lucro' | 'margem_percentual'
>

export type AdmContratoFinanceiroUpdate = Partial<AdmContratoFinanceiroInsert>

export interface AdmUserContract {
  id: string
  user_id: string
  contrato_id: string
  created_at: string
}

export interface AdmContratoStats {
  totalReceita: number
  totalCusto: number
  totalLucro: number
  margemMedia: number
  periodos: number
}

export interface AdmContratoWithStats extends AdmContrato {
  stats?: AdmContratoStats
}

export const ADM_STATUS_LABELS: Record<AdmContratoStatus, string> = {
  ativo: 'Ativo',
  suspenso: 'Suspenso',
  encerrado: 'Encerrado',
  em_negociacao: 'Em Negociação',
}

export const ADM_STATUS_COLORS: Record<AdmContratoStatus, { bg: string; text: string; dot: string }> = {
  ativo: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  suspenso: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  encerrado: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  em_negociacao: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
}

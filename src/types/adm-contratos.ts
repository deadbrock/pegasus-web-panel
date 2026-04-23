// Tipos do módulo Gestão ADM — Fase 1 + Fase 2 + Fase 3 + Fase 4

export type AdmContratoStatus = 'ativo' | 'suspenso' | 'encerrado' | 'em_negociacao'

export interface AdmContrato {
  id: string
  codigo: string
  nome: string
  // ── Cliente básico ──────────────────────────────────────────────────────────
  cliente_nome: string
  cliente_documento?: string | null
  // ── Cliente detalhado (Fase 4) ──────────────────────────────────────────────
  cliente_email?: string | null
  cliente_telefone?: string | null
  cliente_contato?: string | null      // nome do contato/interlocutor
  // ── Endereço (Fase 4) ───────────────────────────────────────────────────────
  cliente_cep?: string | null
  cliente_endereco?: string | null
  cliente_numero?: string | null
  cliente_complemento?: string | null
  cliente_bairro?: string | null
  cliente_cidade?: string | null
  cliente_uf?: string | null
  // ── Aprovação (Fase 4) ──────────────────────────────────────────────────────
  aprovado_por?: string | null
  data_aprovacao?: string | null
  // ── Contrato ────────────────────────────────────────────────────────────────
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

// ─── FASE 4: Custos do contrato ───────────────────────────────────────────────

export type AdmCustoTipo =
  | 'mao_de_obra' | 'materiais' | 'terceiros' | 'equipamentos'
  | 'administrativo' | 'tecnologia' | 'licencas' | 'logistica' | 'outro'

export type AdmCustoPeriodicidade = 'mensal' | 'trimestral' | 'semestral' | 'anual' | 'unico'

export interface AdmContratoCusto {
  id: string
  contrato_id: string
  tipo_custo: AdmCustoTipo
  descricao: string
  valor: number
  periodicidade: AdmCustoPeriodicidade
  observacoes?: string | null
  ativo: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
}

export type AdmContratoCustoInsert = Omit<AdmContratoCusto, 'id' | 'created_at' | 'updated_at'>
export type AdmContratoCustoUpdate = Partial<AdmContratoCustoInsert>

export const ADM_CUSTO_TIPO_LABELS: Record<AdmCustoTipo, string> = {
  mao_de_obra:    'Mão de Obra',
  materiais:      'Materiais',
  terceiros:      'Terceiros / Subcontratados',
  equipamentos:   'Equipamentos',
  administrativo: 'Administrativo',
  tecnologia:     'Tecnologia / TI',
  licencas:       'Licenças / Software',
  logistica:      'Logística',
  outro:          'Outro',
}

export const ADM_CUSTO_PERIODICIDADE_LABELS: Record<AdmCustoPeriodicidade, string> = {
  mensal:      'Mensal',
  trimestral:  'Trimestral',
  semestral:   'Semestral',
  anual:       'Anual',
  unico:       'Único (one-time)',
}

/** Converte custo para valor mensal equivalente */
export function custoToMensal(valor: number, periodicidade: AdmCustoPeriodicidade): number {
  switch (periodicidade) {
    case 'mensal':     return valor
    case 'trimestral': return valor / 3
    case 'semestral':  return valor / 6
    case 'anual':      return valor / 12
    case 'unico':      return 0  // não recorrente
  }
}

export const ADM_CUSTO_TIPO_COLORS: Record<AdmCustoTipo, { bg: string; text: string }> = {
  mao_de_obra:    { bg: 'bg-blue-50',    text: 'text-blue-700' },
  materiais:      { bg: 'bg-amber-50',   text: 'text-amber-700' },
  terceiros:      { bg: 'bg-purple-50',  text: 'text-purple-700' },
  equipamentos:   { bg: 'bg-slate-100',  text: 'text-slate-700' },
  administrativo: { bg: 'bg-orange-50',  text: 'text-orange-700' },
  tecnologia:     { bg: 'bg-cyan-50',    text: 'text-cyan-700' },
  licencas:       { bg: 'bg-indigo-50',  text: 'text-indigo-700' },
  logistica:      { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  outro:          { bg: 'bg-slate-100',  text: 'text-slate-600' },
}

// ─── FASE 4: Anexos do contrato ───────────────────────────────────────────────

export interface AdmContratoAnexo {
  id: string
  contrato_id: string
  nome_arquivo: string
  tipo_arquivo?: string | null
  tamanho_bytes?: number | null
  storage_path: string
  url_publica?: string | null
  descricao?: string | null
  created_by?: string | null
  created_at: string
}

export type AdmContratoAnexoInsert = Omit<AdmContratoAnexo, 'id' | 'created_at'>

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

// ─── FASE 2: Reajustes ────────────────────────────────────────────────────────

export type AdmReajusteTipo = 'manual' | 'indice' | 'anual' | 'extraordinario'

export interface AdmReajuste {
  id: string
  contrato_id: string
  tipo_reajuste: AdmReajusteTipo
  indice_referencia?: string | null
  percentual: number
  valor_anterior: number
  valor_novo: number
  data_aplicacao: string
  observacoes?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export type AdmReajusteInsert = Omit<AdmReajuste, 'id' | 'created_at' | 'updated_at'>
export type AdmReajusteUpdate = Partial<AdmReajusteInsert>

export const ADM_REAJUSTE_TIPO_LABELS: Record<AdmReajusteTipo, string> = {
  manual: 'Manual',
  indice: 'Por Índice',
  anual: 'Reajuste Anual',
  extraordinario: 'Extraordinário',
}

export const ADM_REAJUSTE_INDICES = ['IPCA', 'IGP-M', 'INPC', 'IGPM', 'CDI', 'Outro']

// ─── FASE 2: Histórico / Timeline ────────────────────────────────────────────

export type AdmHistoricoTipoEvento =
  | 'contrato_criado'
  | 'contrato_editado'
  | 'status_alterado'
  | 'reajuste_aplicado'
  | 'financeiro_atualizado'
  | 'manutencao_criada'
  | 'manutencao_concluida'
  | 'manutencao_editada'

export interface AdmHistoricoContrato {
  id: string
  contrato_id: string
  tipo_evento: AdmHistoricoTipoEvento
  titulo: string
  descricao?: string | null
  metadata_json?: Record<string, unknown> | null
  usuario_id?: string | null
  created_at: string
}

export type AdmHistoricoInsert = Omit<AdmHistoricoContrato, 'id' | 'created_at'>

export const ADM_HISTORICO_LABELS: Record<AdmHistoricoTipoEvento, string> = {
  contrato_criado: 'Contrato criado',
  contrato_editado: 'Contrato editado',
  status_alterado: 'Status alterado',
  reajuste_aplicado: 'Reajuste aplicado',
  financeiro_atualizado: 'Financeiro atualizado',
  manutencao_criada: 'Ocorrência registrada',
  manutencao_concluida: 'Ocorrência concluída',
  manutencao_editada: 'Ocorrência editada',
}

export const ADM_HISTORICO_COLORS: Record<AdmHistoricoTipoEvento, { icon: string; ring: string }> = {
  contrato_criado:       { icon: 'text-violet-600', ring: 'ring-violet-200 bg-violet-50' },
  contrato_editado:      { icon: 'text-slate-500',  ring: 'ring-slate-200 bg-slate-50' },
  status_alterado:       { icon: 'text-blue-600',   ring: 'ring-blue-200 bg-blue-50' },
  reajuste_aplicado:     { icon: 'text-amber-600',  ring: 'ring-amber-200 bg-amber-50' },
  financeiro_atualizado: { icon: 'text-emerald-600',ring: 'ring-emerald-200 bg-emerald-50' },
  manutencao_criada:     { icon: 'text-rose-600',   ring: 'ring-rose-200 bg-rose-50' },
  manutencao_concluida:  { icon: 'text-emerald-600',ring: 'ring-emerald-200 bg-emerald-50' },
  manutencao_editada:    { icon: 'text-slate-500',  ring: 'ring-slate-200 bg-slate-50' },
}

// ─── FASE 2: Manutenção / Ocorrências ────────────────────────────────────────

export type AdmManutencaoTipo =
  | 'ocorrencia'
  | 'manutencao'
  | 'revisao'
  | 'reclamacao'
  | 'solicitacao'

export type AdmManutencaoPrioridade = 'baixa' | 'media' | 'alta' | 'critica'
export type AdmManutencaoStatus = 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'

export interface AdmManutencaoContrato {
  id: string
  contrato_id: string
  tipo: AdmManutencaoTipo
  titulo: string
  descricao?: string | null
  prioridade: AdmManutencaoPrioridade
  status: AdmManutencaoStatus
  data_registro: string
  data_conclusao?: string | null
  responsavel?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

export type AdmManutencaoInsert = Omit<AdmManutencaoContrato, 'id' | 'created_at' | 'updated_at'>
export type AdmManutencaoUpdate = Partial<AdmManutencaoInsert>

export const ADM_MANUTENCAO_TIPO_LABELS: Record<AdmManutencaoTipo, string> = {
  ocorrencia:   'Ocorrência',
  manutencao:   'Manutenção',
  revisao:      'Revisão',
  reclamacao:   'Reclamação',
  solicitacao:  'Solicitação',
}

export const ADM_MANUTENCAO_PRIORIDADE_LABELS: Record<AdmManutencaoPrioridade, string> = {
  baixa:   'Baixa',
  media:   'Média',
  alta:    'Alta',
  critica: 'Crítica',
}

export const ADM_MANUTENCAO_STATUS_LABELS: Record<AdmManutencaoStatus, string> = {
  aberta:       'Aberta',
  em_andamento: 'Em Andamento',
  concluida:    'Concluída',
  cancelada:    'Cancelada',
}

export const ADM_MANUTENCAO_PRIORIDADE_COLORS: Record<
  AdmManutencaoPrioridade,
  { bg: string; text: string }
> = {
  baixa:   { bg: 'bg-slate-100',  text: 'text-slate-600' },
  media:   { bg: 'bg-amber-50',   text: 'text-amber-700' },
  alta:    { bg: 'bg-orange-50',  text: 'text-orange-700' },
  critica: { bg: 'bg-rose-50',    text: 'text-rose-700' },
}

export const ADM_MANUTENCAO_STATUS_COLORS: Record<
  AdmManutencaoStatus,
  { bg: string; text: string; dot: string }
> = {
  aberta:       { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  em_andamento: { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  concluida:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelada:    { bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
}

// ─── FASE 3: Saúde, Alertas e Insights ───────────────────────────────────────

export type AdmSaudeStatus = 'saudavel' | 'atencao' | 'critico'

export interface AdmSaudeContrato {
  status: AdmSaudeStatus
  score: number          // 0–100
  totalAlertas: number
  alertasCriticos: number
  alertasAltos: number
}

export type AdmAlertaTipo =
  | 'vencimento_critico'
  | 'vencimento_proximo'
  | 'contrato_vencido'
  | 'prejuizo'
  | 'margem_baixa'
  | 'custo_crescente'
  | 'sem_dados_financeiros'
  | 'sem_movimentacao'
  | 'alta_incidencia_ocorrencias'
  | 'reajuste_pendente'

export type AdmAlertaSeveridade = 'info' | 'media' | 'alta' | 'critica'

export interface AdmAlerta {
  tipo: AdmAlertaTipo
  severidade: AdmAlertaSeveridade
  titulo: string
  descricao: string
  acao?: string
}

export type AdmInsightTipo = 'positivo' | 'negativo' | 'atencao' | 'oportunidade'

export interface AdmInsight {
  tipo: AdmInsightTipo
  titulo: string
  descricao: string
}

export interface AdmContratoAnalise {
  saude: AdmSaudeContrato
  alertas: AdmAlerta[]
  insights: AdmInsight[]
}

// Contrato com análise completa (usado na listagem enriquecida)
export interface AdmContratoComSaude extends AdmContrato {
  saude: AdmSaudeContrato
  alertasResumo: AdmAlerta[]
}

export const ADM_SAUDE_CONFIG: Record<
  AdmSaudeStatus,
  { label: string; bg: string; text: string; border: string; dot: string; icon: string }
> = {
  saudavel: {
    label: 'Saudável',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'text-emerald-500',
  },
  atencao: {
    label: 'Atenção',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: 'text-amber-500',
  },
  critico: {
    label: 'Crítico',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: 'text-rose-500',
  },
}

export const ADM_ALERTA_SEVERIDADE_CONFIG: Record<
  AdmAlertaSeveridade,
  { bg: string; text: string; border: string; label: string }
> = {
  info:    { bg: 'bg-slate-50',  text: 'text-slate-600',  border: 'border-slate-200', label: 'Info' },
  media:   { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200', label: 'Média' },
  alta:    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',label: 'Alta' },
  critica: { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',  label: 'Crítica' },
}

export const ADM_INSIGHT_CONFIG: Record<
  AdmInsightTipo,
  { bg: string; text: string; border: string; iconColor: string }
> = {
  positivo:    { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', iconColor: 'text-emerald-500' },
  negativo:    { bg: 'bg-rose-50',    text: 'text-rose-800',    border: 'border-rose-200',    iconColor: 'text-rose-500' },
  atencao:     { bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200',   iconColor: 'text-amber-500' },
  oportunidade:{ bg: 'bg-blue-50',    text: 'text-blue-800',    border: 'border-blue-200',    iconColor: 'text-blue-500' },
}

// ─── ADITIVOS DE CONTRATO ─────────────────────────────────────────────────────

export type AdmAditivoTipo =
  | 'valor'     // Alteração de valor mensal
  | 'prazo'     // Prorrogação / alteração de prazo
  | 'escopo'    // Alteração de escopo / objeto
  | 'rescisao'  // Rescisão amigável
  | 'outros'

export type AdmAditivoStatus = 'ativo' | 'cancelado'

export interface AdmAditivo {
  id: string
  contrato_id: string
  numero_aditivo: number
  tipo: AdmAditivoTipo
  data_assinatura: string
  data_vigencia?: string | null
  // Alteração de valor
  valor_anterior?: number | null
  valor_novo?: number | null
  // Alteração de prazo
  data_fim_anterior?: string | null
  data_fim_nova?: string | null
  // Conteúdo
  objeto: string
  descricao?: string | null
  // Aprovação
  aprovado_por?: string | null
  status: AdmAditivoStatus
  created_by?: string | null
  created_at: string
  updated_at: string
}

export type AdmAditivoInsert = Omit<AdmAditivo, 'id' | 'created_at' | 'updated_at'>
export type AdmAditivoUpdate = Partial<AdmAditivoInsert>

export const ADM_ADITIVO_TIPO_LABELS: Record<AdmAditivoTipo, string> = {
  valor:    'Alteração de Valor',
  prazo:    'Prorrogação de Prazo',
  escopo:   'Alteração de Escopo',
  rescisao: 'Rescisão Amigável',
  outros:   'Outros',
}

export const ADM_ADITIVO_TIPO_COLORS: Record<AdmAditivoTipo, { bg: string; text: string; border: string }> = {
  valor:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  prazo:    { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  escopo:   { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  rescisao: { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
  outros:   { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200' },
}

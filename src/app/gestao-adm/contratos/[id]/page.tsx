'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Edit, Trash2, Plus, ChevronRight, Calendar, User, Building2,
  FileText, TrendingUp, TrendingDown, DollarSign, Loader2,
  AlertCircle, CheckCircle2, RotateCcw, Wrench, History,
  ShieldCheck, ShieldAlert, ShieldX, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContractFormDialog } from '@/components/gestao-adm/contract-form-dialog'
import { FinancialEntryDialog } from '@/components/gestao-adm/financial-entry-dialog'
import { ContractStatusBadge } from '@/components/gestao-adm/contract-status-badge'
import { ContractHealthBadge } from '@/components/gestao-adm/contract-health-badge'
import { AlertsPanel } from '@/components/gestao-adm/alerts-panel'
import { InsightsPanel } from '@/components/gestao-adm/insights-panel'
import { ReajusteDialog } from '@/components/gestao-adm/reajuste-dialog'
import { ManutencaoDialog } from '@/components/gestao-adm/manutencao-dialog'
import { HistoricoTimeline } from '@/components/gestao-adm/historico-timeline'
import {
  fetchAdmContratoById, fetchAdmContratoFinanceiro,
  fetchAdmContratoStats, deleteAdmContrato, deleteAdmContratoFinanceiro,
} from '@/services/admContratosService'
import { fetchReajustes, deleteReajuste, fetchUltimoReajuste } from '@/services/admReajustesService'
import { fetchManutencoes, deleteManutencao, concluirManutencao } from '@/services/admManutencaoService'
import { fetchHistorico } from '@/services/admHistoricoService'
import { computeAnaliseCompleta } from '@/services/admAlertsService'
import type {
  AdmContrato, AdmContratoFinanceiro, AdmContratoStats,
  AdmReajuste, AdmManutencaoContrato, AdmHistoricoContrato,
  AdmContratoAnalise,
} from '@/types/adm-contratos'
import {
  ADM_REAJUSTE_TIPO_LABELS,
  ADM_MANUTENCAO_PRIORIDADE_LABELS, ADM_MANUTENCAO_PRIORIDADE_COLORS,
  ADM_MANUTENCAO_STATUS_LABELS, ADM_MANUTENCAO_STATUS_COLORS,
  ADM_MANUTENCAO_TIPO_LABELS, ADM_SAUDE_CONFIG,
} from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmt(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}
function fmtPeriod(p: string) {
  const [y, m] = p.split('-')
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[parseInt(m, 10) - 1]}/${y}`
}
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`rounded animate-pulse bg-slate-100 ${className ?? 'h-4 w-32'}`} />
}

// ─── Tab System ────────────────────────────────────────────────────────────────
type TabId = 'geral' | 'financeiro' | 'reajustes' | 'manutencao' | 'historico'
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'geral',      label: 'Visão Geral',  icon: FileText },
  { id: 'financeiro', label: 'Financeiro',    icon: TrendingUp },
  { id: 'reajustes',  label: 'Reajustes',     icon: RotateCcw },
  { id: 'manutencao', label: 'Manutenção',    icon: Wrench },
  { id: 'historico',  label: 'Histórico',     icon: History },
]

// ─── Health Score Bar ──────────────────────────────────────────────────────────
function HealthScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all duration-700', color)}
        style={{ width: `${score}%` }}
      />
    </div>
  )
}

const SAUDE_ICONS = { saudavel: ShieldCheck, atencao: ShieldAlert, critico: ShieldX }

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdmContratoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('geral')

  const [contrato, setContrato] = useState<AdmContrato | null>(null)
  const [financeiro, setFinanceiro] = useState<AdmContratoFinanceiro[]>([])
  const [stats, setStats] = useState<AdmContratoStats | null>(null)
  const [reajustes, setReajustes] = useState<AdmReajuste[]>([])
  const [ultimoReajuste, setUltimoReajuste] = useState<AdmReajuste | null>(null)
  const [manutencoes, setManutencoes] = useState<AdmManutencaoContrato[]>([])
  const [historico, setHistorico] = useState<AdmHistoricoContrato[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [finEntryOpen, setFinEntryOpen] = useState(false)
  const [selectedFin, setSelectedFin] = useState<AdmContratoFinanceiro | null>(null)
  const [reajusteOpen, setReajusteOpen] = useState(false)
  const [manutencaoOpen, setManutencaoOpen] = useState(false)
  const [selectedManutencao, setSelectedManutencao] = useState<AdmManutencaoContrato | null>(null)
  const [deleteContractConfirm, setDeleteContractConfirm] = useState(false)
  const [deletingFinId, setDeletingFinId] = useState<string | null>(null)
  const [deletingReajId, setDeletingReajId] = useState<string | null>(null)
  const [deletingManId, setDeletingManId] = useState<string | null>(null)
  const [concludingManId, setConcludingManId] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [c, fin, st, reaj, ultReaj, man, hist] = await Promise.all([
        fetchAdmContratoById(id),
        fetchAdmContratoFinanceiro(id),
        fetchAdmContratoStats(id),
        fetchReajustes(id),
        fetchUltimoReajuste(id),
        fetchManutencoes(id),
        fetchHistorico(id),
      ])
      if (!c) { setNotFound(true); return }
      setContrato(c)
      setFinanceiro(fin)
      setStats(st)
      setReajustes(reaj)
      setUltimoReajuste(ultReaj)
      setManutencoes(man)
      setHistorico(hist)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])

  // ── Análise Fase 3 ──────────────────────────────────────────────────────────
  const analise: AdmContratoAnalise | null = useMemo(() => {
    if (!contrato) return null
    return computeAnaliseCompleta({ contrato, financeiro, reajustes, manutencoes })
  }, [contrato, financeiro, reajustes, manutencoes])

  const handleDeleteContract = async () => {
    if (!contrato?.id) return
    const ok = await deleteAdmContrato(contrato.id)
    if (ok) router.push('/gestao-adm/contratos')
  }
  const handleDeleteFin = async (finId: string) => {
    setDeletingFinId(finId)
    const ok = await deleteAdmContratoFinanceiro(finId)
    setDeletingFinId(null)
    if (ok) setFinanceiro((prev) => prev.filter((f) => f.id !== finId))
  }
  const handleDeleteReaj = async (reajId: string) => {
    setDeletingReajId(reajId)
    const ok = await deleteReajuste(reajId)
    setDeletingReajId(null)
    if (ok) setReajustes((prev) => prev.filter((r) => r.id !== reajId))
  }
  const handleDeleteMan = async (manId: string) => {
    setDeletingManId(manId)
    const ok = await deleteManutencao(manId)
    setDeletingManId(null)
    if (ok) setManutencoes((prev) => prev.filter((m) => m.id !== manId))
  }
  const handleConcluirMan = async (m: AdmManutencaoContrato) => {
    setConcludingManId(m.id)
    const ok = await concluirManutencao(m.id, id)
    setConcludingManId(null)
    if (ok) loadAll()
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Contrato não encontrado</p>
        <Link href="/gestao-adm/contratos"><Button variant="outline" size="sm">Voltar</Button></Link>
      </div>
    )
  }

  const abertasCount = manutencoes.filter(m => m.status === 'aberta' || m.status === 'em_andamento').length
  const saudeConfig  = analise ? ADM_SAUDE_CONFIG[analise.saude.status] : null
  const SaudeIcon    = analise ? SAUDE_ICONS[analise.saude.status] : Activity

  return (
    <div className="space-y-5 max-w-[1300px]">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/gestao-adm/contratos" className="hover:text-violet-600 transition-colors">Contratos</Link>
            <ChevronRight className="w-3 h-3" />
            {loading ? <SkeletonBlock className="h-3 w-24 rounded" /> :
              <span className="text-slate-600 font-medium">{contrato?.codigo}</span>}
          </div>
          {loading ? <SkeletonBlock className="h-7 w-64 rounded" /> :
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{contrato?.nome}</h1>}
          {!loading && contrato && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <ContractStatusBadge status={contrato.status} />
              {analise && <ContractHealthBadge saude={analise.saude} showScore />}
              <span className="text-sm text-slate-500">{contrato.cliente_nome}</span>
              {contrato.responsavel && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <User className="w-3 h-3" />{contrato.responsavel}
                </span>
              )}
            </div>
          )}
        </div>
        {!loading && contrato && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
              <Edit className="w-3.5 h-3.5" />Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDeleteContractConfirm(true)}
              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200">
              <Trash2 className="w-3.5 h-3.5" />Excluir
            </Button>
          </div>
        )}
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Valor Mensal',  value: fmt(contrato?.valor_mensal), icon: DollarSign,  color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Receita Total', value: fmt(stats?.totalReceita),    icon: TrendingUp,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Custo Total',   value: fmt(stats?.totalCusto),      icon: TrendingDown,color: 'text-amber-600',   bg: 'bg-amber-50' },
          { label: 'Lucro Total', value: fmt(stats?.totalLucro),
            sub: `Margem: ${stats?.margemMedia?.toFixed(1) ?? 0}%`, icon: TrendingUp,
            color: (stats?.totalLucro ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
            bg:    (stats?.totalLucro ?? 0) >= 0 ? 'bg-emerald-50' : 'bg-rose-50' },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              {loading ? <SkeletonBlock className="h-6 w-28 rounded" /> : (
                <div>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  {'sub' in card && card.sub && <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.id
            const badge = t.id === 'manutencao' && abertasCount > 0 ? abertasCount
                        : t.id === 'reajustes' && reajustes.length > 0 ? reajustes.length
                        : null
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150',
                  isActive
                    ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-violet-600' : 'text-slate-400')} />
                {t.label}
                {badge !== null && (
                  <span className={cn(
                    'text-xs font-semibold px-1.5 py-0.5 rounded-full ml-0.5',
                    t.id === 'manutencao' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  )}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ─── Aba: Visão Geral ──────────────────────────────────────────────── */}
        {tab === 'geral' && (
          <div className="p-6 space-y-6">

            {/* ── Painel de Saúde ─────────────────────────────────────────── */}
            {!loading && analise && saudeConfig && (
              <div className={cn(
                'rounded-xl border p-5',
                saudeConfig.bg, saudeConfig.border
              )}>
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                    saudeConfig.bg
                  )}>
                    <SaudeIcon className={cn('w-6 h-6', saudeConfig.icon)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className={cn('text-sm font-bold', saudeConfig.text)}>
                        Saúde Contratual: {saudeConfig.label}
                      </h3>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full border',
                        saudeConfig.bg, saudeConfig.text, saudeConfig.border
                      )}>
                        Score {analise.saude.score}/100
                      </span>
                    </div>
                    <HealthScoreBar score={analise.saude.score} />
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      {analise.saude.alertasCriticos > 0 && (
                        <span className="text-xs flex items-center gap-1.5 text-rose-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                          {analise.saude.alertasCriticos} crítico{analise.saude.alertasCriticos > 1 ? 's' : ''}
                        </span>
                      )}
                      {analise.saude.alertasAltos > 0 && (
                        <span className="text-xs flex items-center gap-1.5 text-orange-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
                          {analise.saude.alertasAltos} alto{analise.saude.alertasAltos > 1 ? 's' : ''}
                        </span>
                      )}
                      {analise.saude.totalAlertas === 0 ? (
                        <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Nenhum alerta ativo
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {analise.saude.totalAlertas} alerta{analise.saude.totalAlertas > 1 ? 's' : ''} no total
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loading && <SkeletonBlock className="h-28 w-full rounded-xl" />}

            {/* ── Grid: Dados + Observações ──────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dados gerais */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />Informações do Contrato
                </h3>
                {loading ? (
                  <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonBlock key={i} className="h-4 w-full rounded" />)}</div>
                ) : contrato ? (
                  <div className="space-y-1 text-sm">
                    {[
                      { label: 'Código', value: <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{contrato.codigo}</span> },
                      { label: 'Cliente', value: contrato.cliente_nome },
                      contrato.cliente_documento ? { label: 'CNPJ/CPF', value: <span className="font-mono text-xs">{contrato.cliente_documento}</span> } : null,
                      { label: 'Responsável', value: contrato.responsavel || '—' },
                      { label: 'Início', value: fmtDate(contrato.data_inicio) },
                      { label: 'Término', value: fmtDate(contrato.data_fim) },
                      { label: 'Valor Mensal', value: <span className="font-semibold">{fmt(contrato.valor_mensal)}</span> },
                    ].filter(Boolean).map((row, i) => (
                      <div key={i} className="flex justify-between gap-2 py-2 border-b border-slate-50 last:border-0">
                        <span className="text-slate-400 shrink-0">{(row as any).label}</span>
                        <span className="text-slate-700 text-right">{(row as any).value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Observações + Último reajuste */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />Observações
                  </h3>
                  {loading ? <SkeletonBlock className="h-16 w-full rounded" /> : (
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {contrato?.observacoes || <span className="italic text-slate-300">Sem observações.</span>}
                    </p>
                  )}
                </div>

                {!loading && ultimoReajuste && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5" />Último Reajuste
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Data</p>
                        <p className="font-medium text-slate-700">{fmtDate(ultimoReajuste.data_aplicacao)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Percentual</p>
                        <p className={cn('font-semibold', ultimoReajuste.percentual >= 0 ? 'text-amber-700' : 'text-blue-700')}>
                          {ultimoReajuste.percentual >= 0 ? '+' : ''}{ultimoReajuste.percentual.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Tipo</p>
                        <p className="font-medium text-slate-700">{ADM_REAJUSTE_TIPO_LABELS[ultimoReajuste.tipo_reajuste]}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Alertas ─────────────────────────────────────────────────── */}
            {!loading && analise && analise.alertas.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  Alertas Ativos
                  <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {analise.alertas.length}
                  </span>
                </h3>
                <AlertsPanel alertas={analise.alertas} />
              </div>
            )}

            {/* ── Insights ────────────────────────────────────────────────── */}
            {!loading && analise && analise.insights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  Insights Executivos
                </h3>
                <InsightsPanel insights={analise.insights} />
              </div>
            )}

          </div>
        )}

        {/* ─── Aba: Financeiro ────────────────────────────────────────────────── */}
        {tab === 'financeiro' && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold text-slate-900">
                  Histórico Financeiro
                  {!loading && <span className="ml-2 text-xs text-slate-400 font-normal">({stats?.periodos ?? 0} período{(stats?.periodos ?? 0) !== 1 ? 's' : ''})</span>}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setSelectedFin(null); setFinEntryOpen(true) }} className="gap-1.5 h-8">
                <Plus className="w-3.5 h-3.5" />Registrar Período
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Período','Receita','Custo','Lucro','Margem',''].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${h === 'Período' ? 'text-left' : 'text-right'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><SkeletonBlock className="h-4 rounded" /></td>
                      ))}
                    </tr>
                  )) : financeiro.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                        <p className="text-sm font-medium">Nenhum dado financeiro</p>
                        <button onClick={() => { setSelectedFin(null); setFinEntryOpen(true) }} className="text-xs text-violet-600 hover:underline font-medium">Registrar primeiro período</button>
                      </div>
                    </td></tr>
                  ) : financeiro.map((f) => (
                    <tr key={f.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-700">{fmtPeriod(f.periodo_referencia)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">{fmt(f.receita)}</td>
                      <td className="px-4 py-3 text-right text-slate-600 tabular-nums">{fmt(f.custo)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={f.lucro >= 0 ? 'text-emerald-600 font-medium' : 'text-rose-600 font-medium'}>
                          {f.lucro >= 0 ? '+' : ''}{fmt(f.lucro)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.margem_percentual >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {f.margem_percentual.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700" onClick={() => { setSelectedFin(f); setFinEntryOpen(true) }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600" onClick={() => handleDeleteFin(f.id)} disabled={deletingFinId === f.id}>
                            {deletingFinId === f.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {!loading && financeiro.length > 0 && stats && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Total</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">{fmt(stats.totalReceita)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">{fmt(stats.totalCusto)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={stats.totalLucro >= 0 ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>
                          {stats.totalLucro >= 0 ? '+' : ''}{fmt(stats.totalLucro)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stats.margemMedia >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {stats.margemMedia.toFixed(1)}%
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* ─── Aba: Reajustes ─────────────────────────────────────────────────── */}
        {tab === 'reajustes' && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-900">
                  Reajustes Contratuais
                  {!loading && <span className="ml-2 text-xs text-slate-400 font-normal">({reajustes.length} registro{reajustes.length !== 1 ? 's' : ''})</span>}
                </span>
              </div>
              <Button size="sm" onClick={() => setReajusteOpen(true)} disabled={!contrato}
                className="gap-1.5 h-8 bg-amber-600 hover:bg-amber-700 text-white border-0">
                <Plus className="w-3.5 h-3.5" />Novo Reajuste
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Data','Tipo','Índice','% Reajuste','Valor Anterior','Novo Valor',''].map((h) => (
                      <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${['Valor Anterior','Novo Valor','% Reajuste'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><SkeletonBlock className="h-4 rounded" /></td>)}
                    </tr>
                  )) : reajustes.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center"><RotateCcw className="w-5 h-5 text-amber-400" /></div>
                        <p className="text-sm font-medium">Nenhum reajuste registrado</p>
                        <button onClick={() => setReajusteOpen(true)} className="text-xs text-amber-600 hover:underline font-medium">Registrar primeiro reajuste</button>
                      </div>
                    </td></tr>
                  ) : reajustes.map((r) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600">{fmtDate(r.data_aplicacao)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          {ADM_REAJUSTE_TIPO_LABELS[r.tipo_reajuste]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{r.indice_referencia || '—'}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span className={cn('font-semibold', r.percentual >= 0 ? 'text-amber-700' : 'text-blue-700')}>
                          {r.percentual >= 0 ? '+' : ''}{r.percentual.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 tabular-nums">{fmt(r.valor_anterior)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800 tabular-nums">{fmt(r.valor_novo)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                          onClick={() => handleDeleteReaj(r.id)} disabled={deletingReajId === r.id} title="Remover reajuste">
                          {deletingReajId === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reajustes.length > 0 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Remover um reajuste não reverte o valor do contrato automaticamente. Para corrigir, aplique um novo reajuste compensatório.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Aba: Manutenção ────────────────────────────────────────────────── */}
        {tab === 'manutencao' && (
          <div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-900">
                  Manutenção & Ocorrências
                  {!loading && <span className="ml-2 text-xs text-slate-400 font-normal">({manutencoes.length} total)</span>}
                </span>
                {abertasCount > 0 && (
                  <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">
                    {abertasCount} abertas
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => { setSelectedManutencao(null); setManutencaoOpen(true) }} className="gap-1.5 h-8">
                <Plus className="w-3.5 h-3.5" />Nova Ocorrência
              </Button>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} className="h-20 w-full rounded-lg" />)}
              </div>
            ) : manutencoes.length === 0 ? (
              <div className="py-12 text-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center"><Wrench className="w-5 h-5" /></div>
                  <p className="text-sm font-medium">Nenhuma ocorrência registrada</p>
                  <button onClick={() => { setSelectedManutencao(null); setManutencaoOpen(true) }} className="text-xs text-violet-600 hover:underline font-medium">Registrar primeira ocorrência</button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-3">
                {manutencoes.map((m) => {
                  const prioColors = ADM_MANUTENCAO_PRIORIDADE_COLORS[m.prioridade]
                  const stColors   = ADM_MANUTENCAO_STATUS_COLORS[m.status]
                  const isConcluded = m.status === 'concluida' || m.status === 'cancelada'
                  return (
                    <div key={m.id} className={cn(
                      'rounded-xl border p-4 transition-colors',
                      isConcluded ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 hover:border-slate-300'
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', stColors.bg, stColors.text)}>
                              <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1', stColors.dot)} />
                              {ADM_MANUTENCAO_STATUS_LABELS[m.status]}
                            </span>
                            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', prioColors.bg, prioColors.text)}>
                              {ADM_MANUTENCAO_PRIORIDADE_LABELS[m.prioridade]}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              {ADM_MANUTENCAO_TIPO_LABELS[m.tipo]}
                            </span>
                          </div>
                          <p className={cn('text-sm font-semibold', isConcluded ? 'text-slate-500' : 'text-slate-800')}>{m.titulo}</p>
                          {m.descricao && <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{m.descricao}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(m.data_registro)}</span>
                            {m.responsavel && <span className="flex items-center gap-1"><User className="w-3 h-3" />{m.responsavel}</span>}
                            {m.data_conclusao && <span className="flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-3 h-3" />Concluída {fmtDate(m.data_conclusao)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!isConcluded && (
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50 gap-1"
                              onClick={() => handleConcluirMan(m)} disabled={concludingManId === m.id}>
                              {concludingManId === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                              Concluir
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                            onClick={() => { setSelectedManutencao(m); setManutencaoOpen(true) }}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
                            onClick={() => handleDeleteMan(m.id)} disabled={deletingManId === m.id}>
                            {deletingManId === m.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Aba: Histórico ─────────────────────────────────────────────────── */}
        {tab === 'historico' && (
          <div>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
              <History className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold text-slate-900">
                Histórico do Contrato
                {!loading && <span className="ml-2 text-xs text-slate-400 font-normal">({historico.length} evento{historico.length !== 1 ? 's' : ''})</span>}
              </span>
            </div>
            <div className="p-6 max-w-2xl">
              <HistoricoTimeline items={historico} loading={loading} />
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm delete ────────────────────────────────────────────────────── */}
      {deleteContractConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Excluir contrato?</h3>
              <p className="text-sm text-slate-500">
                O contrato <strong className="text-slate-700">{contrato?.nome}</strong> e todos os dados vinculados serão removidos permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteContractConfirm(false)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDeleteContract}>Excluir</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────────────────────────────── */}
      {contrato && (
        <ContractFormDialog open={editOpen} onClose={() => setEditOpen(false)} contrato={contrato} onSaved={loadAll} />
      )}
      <FinancialEntryDialog open={finEntryOpen} onClose={() => setFinEntryOpen(false)} contratoId={id} entry={selectedFin} onSaved={loadAll} />
      {contrato && (
        <ReajusteDialog open={reajusteOpen} onClose={() => setReajusteOpen(false)}
          contratoId={id} valorAtual={contrato.valor_mensal ?? 0} onSaved={loadAll} />
      )}
      <ManutencaoDialog open={manutencaoOpen} onClose={() => setManutencaoOpen(false)}
        contratoId={id} manutencao={selectedManutencao} onSaved={loadAll} />
    </div>
  )
}

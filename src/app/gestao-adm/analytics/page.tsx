'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight, TrendingUp, TrendingDown, DollarSign, BarChart3,
  ArrowUpDown, ArrowUp, ArrowDown, Eye, RefreshCw,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ContractHealthBadge } from '@/components/gestao-adm/contract-health-badge'
import { ContractStatusBadge } from '@/components/gestao-adm/contract-status-badge'
import { fetchAdmContratos, fetchAdmAllFinanceiro } from '@/services/admContratosService'
import { computeSaudeSimplificada, computeAnaliseCompleta } from '@/services/admAlertsService'
import type {
  AdmContrato, AdmContratoFinanceiro, AdmContratoStats, AdmSaudeContrato,
} from '@/types/adm-contratos'
import { ADM_SAUDE_CONFIG } from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtK(v: number) {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`
  return fmt(v)
}
function abbrev(name: string, maxLen = 16) {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name
}

// ─── Tipos internos ───────────────────────────────────────────────────────────
interface ContratoRow {
  contrato: AdmContrato
  stats: AdmContratoStats
  saude: AdmSaudeContrato
}

type SortKey = 'receita' | 'custo' | 'lucro' | 'margem' | 'nome'
type SortDir = 'asc' | 'desc'

// ─── Tooltip customizado ──────────────────────────────────────────────────────
function CustomTooltipCurrency({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[140px]">
      <p className="font-semibold text-slate-700 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-slate-500">{p.name}</span>
          </span>
          <span className="font-medium text-slate-800">{fmtK(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function CustomTooltipMargem({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[120px]">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className={cn('font-bold text-sm', v >= 10 ? 'text-emerald-600' : v >= 0 ? 'text-amber-600' : 'text-rose-600')}>
        {v.toFixed(1)}%
      </p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdmAnalyticsPage() {
  const [contratos, setContratos] = useState<AdmContrato[]>([])
  const [allFin, setAllFin] = useState<AdmContratoFinanceiro[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'suspenso' | 'encerrado'>('todos')
  const [sortKey, setSortKey] = useState<SortKey>('lucro')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const load = async () => {
    setLoading(true)
    try {
      const [cs, fins] = await Promise.all([
        fetchAdmContratos(),
        fetchAdmAllFinanceiro(),
      ])
      setContratos(cs)
      setAllFin(fins)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Agregar financeiro por contrato ──────────────────────────────────────────
  const finMap = useMemo(() => {
    const m = new Map<string, AdmContratoFinanceiro[]>()
    for (const f of allFin) {
      if (!m.has(f.contrato_id)) m.set(f.contrato_id, [])
      m.get(f.contrato_id)!.push(f)
    }
    return m
  }, [allFin])

  const rows: ContratoRow[] = useMemo(() => {
    return contratos
      .filter((c) => statusFilter === 'todos' || c.status === statusFilter)
      .map((c) => {
        const fins = finMap.get(c.id) ?? []
        const totalReceita = fins.reduce((s, f) => s + f.receita, 0)
        const totalCusto   = fins.reduce((s, f) => s + f.custo, 0)
        const totalLucro   = fins.reduce((s, f) => s + f.lucro, 0)
        const margemMedia  = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0
        const stats: AdmContratoStats = { totalReceita, totalCusto, totalLucro, margemMedia, periodos: fins.length }

        // saúde completa se tiver financeiro, simplificada se não tiver
        const saude = fins.length > 0
          ? computeAnaliseCompleta({ contrato: c, financeiro: fins, reajustes: [], manutencoes: [] }).saude
          : computeSaudeSimplificada(c)

        return { contrato: c, stats, saude }
      })
  }, [contratos, finMap, statusFilter])

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      let va = 0, vb = 0
      if (sortKey === 'receita') { va = a.stats.totalReceita; vb = b.stats.totalReceita }
      if (sortKey === 'custo')   { va = a.stats.totalCusto;   vb = b.stats.totalCusto }
      if (sortKey === 'lucro')   { va = a.stats.totalLucro;   vb = b.stats.totalLucro }
      if (sortKey === 'margem')  { va = a.stats.margemMedia;  vb = b.stats.margemMedia }
      if (sortKey === 'nome')    return sortDir === 'asc'
        ? a.contrato.nome.localeCompare(b.contrato.nome)
        : b.contrato.nome.localeCompare(a.contrato.nome)
      return sortDir === 'asc' ? va - vb : vb - va
    })
  }, [rows, sortKey, sortDir])

  // ── KPIs globais ─────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const comDados = rows.filter(r => r.stats.periodos > 0)
    // Acumulado real: soma dos registros em adm_contrato_financeiro
    const totalReceita  = comDados.reduce((s, r) => s + r.stats.totalReceita, 0)
    const totalCusto    = comDados.reduce((s, r) => s + r.stats.totalCusto, 0)
    const totalLucro    = comDados.reduce((s, r) => s + r.stats.totalLucro, 0)
    const margemGlobal  = totalReceita > 0 ? (totalLucro / totalReceita) * 100 : 0
    const totalPeriodos = comDados.reduce((s, r) => s + r.stats.periodos, 0)
    // Projeção mensal: soma de valor_mensal dos contratos ativos
    const receitaMensalProjetada = rows
      .filter(r => r.contrato.status === 'ativo')
      .reduce((s, r) => s + (r.contrato.valor_mensal ?? 0), 0)
    const saudaveis     = rows.filter(r => r.saude.status === 'saudavel').length
    const atencao       = rows.filter(r => r.saude.status === 'atencao').length
    const criticos      = rows.filter(r => r.saude.status === 'critico').length
    return {
      totalReceita, totalCusto, totalLucro, margemGlobal,
      receitaMensalProjetada, totalPeriodos,
      comDados: comDados.length, saudaveis, atencao, criticos,
    }
  }, [rows])

  // ── Dados para gráficos ───────────────────────────────────────────────────────
  const chartReceitaCusto = useMemo(() =>
    sorted
      .filter(r => r.stats.periodos > 0)
      .slice(0, 10)
      .map(r => ({
        name: abbrev(r.contrato.nome),
        Receita: r.stats.totalReceita,
        Custo: r.stats.totalCusto,
      })),
  [sorted])

  const chartMargem = useMemo(() =>
    [...rows]
      .filter(r => r.stats.periodos > 0)
      .sort((a, b) => b.stats.margemMedia - a.stats.margemMedia)
      .slice(0, 10)
      .map(r => ({
        name: abbrev(r.contrato.nome),
        Margem: parseFloat(r.stats.margemMedia.toFixed(1)),
      })),
  [rows])

  const chartSaude = useMemo(() => [
    { name: 'Saudável', value: kpis.saudaveis, fill: '#10b981' },
    { name: 'Atenção',  value: kpis.atencao,   fill: '#f59e0b' },
    { name: 'Crítico',  value: kpis.criticos,   fill: '#f43f5e' },
  ].filter(d => d.value > 0), [kpis])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 text-slate-300" />
    return sortDir === 'desc'
      ? <ArrowDown className="w-3 h-3 text-violet-500" />
      : <ArrowUp className="w-3 h-3 text-violet-500" />
  }

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Gestão ADM</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Contratual</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão comparativa de receitas, custos, margens e saúde da carteira.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-8 text-sm w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="suspenso">Suspensos</SelectItem>
              <SelectItem value="encerrado">Encerrados</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} className="h-8 gap-1.5">
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      {/* Nota: "Acumulado" = soma dos lançamentos em adm_contrato_financeiro    */}
      {/*       "Projetado" = soma de valor_mensal dos contratos ativos           */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Receita projetada mensal */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 leading-tight">Receita Mensal<br /><span className="text-[10px] font-normal text-slate-400">Projetada</span></p>
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
            </div>
          </div>
          {loading ? <div className="h-6 bg-slate-100 rounded animate-pulse" /> : (
            <div>
              <p className="text-base font-bold text-violet-600">{fmtK(kpis.receitaMensalProjetada)}</p>
              <p className="text-[10px] text-slate-400">Soma de valor_mensal (ativos)</p>
            </div>
          )}
        </div>

        {/* Receita acumulada */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 leading-tight">Receita<br /><span className="text-[10px] font-normal text-slate-400">Acumulada</span></p>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
          {loading ? <div className="h-6 bg-slate-100 rounded animate-pulse" /> : (
            <div>
              <p className="text-base font-bold text-blue-600">{fmtK(kpis.totalReceita)}</p>
              <p className="text-[10px] text-slate-400">{kpis.totalPeriodos} período{kpis.totalPeriodos !== 1 ? 's' : ''} lançado{kpis.totalPeriodos !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {/* Custo acumulado */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 leading-tight">Custo<br /><span className="text-[10px] font-normal text-slate-400">Acumulado</span></p>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
            </div>
          </div>
          {loading ? <div className="h-6 bg-slate-100 rounded animate-pulse" /> : (
            <div>
              <p className="text-base font-bold text-amber-600">{fmtK(kpis.totalCusto)}</p>
              <p className="text-[10px] text-slate-400">Registrado nos períodos</p>
            </div>
          )}
        </div>

        {/* Lucro acumulado */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 leading-tight">Lucro<br /><span className="text-[10px] font-normal text-slate-400">Acumulado</span></p>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${kpis.totalLucro >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              <DollarSign className={`w-3.5 h-3.5 ${kpis.totalLucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </div>
          </div>
          {loading ? <div className="h-6 bg-slate-100 rounded animate-pulse" /> : (
            <div>
              <p className={`text-base font-bold ${kpis.totalLucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {kpis.totalLucro >= 0 ? '+' : ''}{fmtK(kpis.totalLucro)}
              </p>
              <p className="text-[10px] text-slate-400">Receita − Custo</p>
            </div>
          )}
        </div>

        {/* Margem global */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 leading-tight">Margem<br /><span className="text-[10px] font-normal text-slate-400">Global</span></p>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${kpis.margemGlobal >= 10 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              <BarChart3 className={`w-3.5 h-3.5 ${kpis.margemGlobal >= 10 ? 'text-emerald-600' : kpis.margemGlobal >= 0 ? 'text-amber-600' : 'text-rose-600'}`} />
            </div>
          </div>
          {loading ? <div className="h-6 bg-slate-100 rounded animate-pulse" /> : (
            <div>
              <p className={`text-base font-bold ${kpis.margemGlobal >= 10 ? 'text-emerald-600' : kpis.margemGlobal >= 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                {kpis.margemGlobal.toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">Lucro ÷ Receita</p>
            </div>
          )}
        </div>

        {/* Contratos */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 leading-tight">Contratos<br /><span className="text-[10px] font-normal text-slate-400">Analisados</span></p>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
          {loading ? <div className="h-6 bg-slate-100 rounded animate-pulse" /> : (
            <div>
              <p className="text-base font-bold text-slate-800">{rows.length}</p>
              <p className="text-[10px] text-slate-400">{kpis.comDados} com dados financeiros</p>
            </div>
          )}
        </div>
      </div>

      {/* Legenda das métricas */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5">
        <p className="text-[11px] text-slate-500 font-medium w-full">Como interpretar os números:</p>
        <span className="text-[11px] text-slate-500">
          <span className="font-semibold text-violet-600">Receita Mensal Projetada</span>
          {' '}= soma de <code className="bg-slate-200 px-1 rounded text-[10px]">valor_mensal</code> de contratos ativos — o que você tem contratado por mês
        </span>
        <span className="text-[11px] text-slate-500">
          <span className="font-semibold text-blue-600">Receita/Custo/Lucro Acumulado</span>
          {' '}= soma dos registros lançados na aba Financeiro de cada contrato — o que foi efetivamente registrado
        </span>
      </div>

      {/* ── Gráficos ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Receita vs Custo */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Receita vs Custo por Contrato</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top 10 por resultado acumulado</p>
          </div>
          {loading ? (
            <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
          ) : chartReceitaCusto.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-300 text-sm">
              Sem dados financeiros registrados
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartReceitaCusto} margin={{ top: 4, right: 0, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} width={60} />
                <Tooltip content={<CustomTooltipCurrency />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => <span className="text-slate-600">{v}</span>}
                />
                <Bar dataKey="Receita" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Custo"   fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribuição de Saúde */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Distribuição de Saúde</h3>
            <p className="text-xs text-slate-400 mt-0.5">Por status da carteira</p>
          </div>
          {loading ? (
            <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
          ) : chartSaude.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-300 text-sm">
              Sem contratos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={chartSaude}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartSaude.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} contratos`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {(['saudavel', 'atencao', 'critico'] as const).map((s) => {
                  const cfg = ADM_SAUDE_CONFIG[s]
                  const count = s === 'saudavel' ? kpis.saudaveis : s === 'atencao' ? kpis.atencao : kpis.criticos
                  const pct = rows.length > 0 ? Math.round((count / rows.length) * 100) : 0
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
                      <span className="text-xs text-slate-600 flex-1">{cfg.label}</span>
                      <span className="text-xs font-semibold text-slate-800">{count}</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5">
                        <div className={cn('h-full rounded-full', cfg.dot)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Margem por contrato */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Margem por Contrato</h3>
          <p className="text-xs text-slate-400 mt-0.5">Top 10 ordenado por margem — linha tracejada = 10% (ideal)</p>
        </div>
        {loading ? (
          <div className="h-52 bg-slate-50 rounded-lg animate-pulse" />
        ) : chartMargem.length === 0 ? (
          <div className="h-52 flex items-center justify-center text-slate-300 text-sm">
            Sem dados financeiros
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartMargem} margin={{ top: 4, right: 0, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} width={42} />
              <Tooltip content={<CustomTooltipMargem />} />
              <Bar dataKey="Margem" radius={[3, 3, 0, 0]} maxBarSize={32}>
                {chartMargem.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.Margem >= 10 ? '#10b981' : entry.Margem >= 0 ? '#f59e0b' : '#f43f5e'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Ranking Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-slate-800">
              Ranking de Performance
              {!loading && (
                <span className="ml-2 text-xs text-slate-400 font-normal">({sorted.length} contratos)</span>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-400">Clique nos cabeçalhos para ordenar</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-slate-800 transition-colors" onClick={() => toggleSort('nome')}>
                    Contrato <SortIcon k="nome" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('receita')}>
                    <SortIcon k="receita" /> Receita
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('custo')}>
                    <SortIcon k="custo" /> Custo
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('lucro')}>
                    <SortIcon k="lucro" /> Lucro
                  </button>
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('margem')}>
                    <SortIcon k="margem" /> Margem
                  </button>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Períodos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Saúde</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + (j * 17) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 text-sm">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              ) : (
                sorted.map((row, idx) => {
                  const { contrato, stats, saude } = row
                  const hasDados = stats.periodos > 0
                  return (
                    <tr
                      key={contrato.id}
                      className={cn(
                        'border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                        saude.status === 'critico' && hasDados && 'bg-rose-50/20'
                      )}
                    >
                      {/* Rank + nome */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className={cn(
                            'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                            idx === 0 ? 'bg-amber-100 text-amber-700' :
                            idx === 1 ? 'bg-slate-200 text-slate-600' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-400'
                          )}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium text-slate-900 text-sm leading-tight">{contrato.nome}</p>
                            <p className="text-xs text-slate-400">{contrato.cliente_nome}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <ContractStatusBadge status={contrato.status} size="sm" />
                      </td>

                      {/* Receita */}
                      <td className="px-4 py-3 text-right tabular-nums">
                        {hasDados ? (
                          <span className="text-slate-700 font-medium text-sm">{fmtK(stats.totalReceita)}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Custo */}
                      <td className="px-4 py-3 text-right tabular-nums">
                        {hasDados ? (
                          <span className="text-slate-600 text-sm">{fmtK(stats.totalCusto)}</span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Lucro */}
                      <td className="px-4 py-3 text-right tabular-nums">
                        {hasDados ? (
                          <span className={cn(
                            'font-semibold text-sm',
                            stats.totalLucro >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          )}>
                            {stats.totalLucro >= 0 ? '+' : ''}{fmtK(stats.totalLucro)}
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Margem */}
                      <td className="px-4 py-3 text-right tabular-nums">
                        {hasDados ? (
                          <span className={cn(
                            'text-xs font-semibold px-2 py-0.5 rounded-full',
                            stats.margemMedia >= 10 ? 'bg-emerald-50 text-emerald-700' :
                            stats.margemMedia >= 0  ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          )}>
                            {stats.margemMedia.toFixed(1)}%
                          </span>
                        ) : <span className="text-slate-300 text-xs">—</span>}
                      </td>

                      {/* Períodos */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-slate-500">{stats.periodos}</span>
                      </td>

                      {/* Saúde */}
                      <td className="px-4 py-3">
                        <ContractHealthBadge saude={saude} size="sm" />
                      </td>

                      {/* Ação */}
                      <td className="px-4 py-3 text-right">
                        <Link href={`/gestao-adm/contratos/${contrato.id}`}>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com totais */}
        {!loading && sorted.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-slate-400">
              {sorted.filter(r => r.stats.periodos > 0).length} de {sorted.length} contratos com dados financeiros registrados
            </p>
            <div className="flex items-center gap-6 text-xs font-medium">
              <span className="text-slate-500">
                Total receita: <span className="text-blue-600">{fmt(kpis.totalReceita)}</span>
              </span>
              <span className="text-slate-500">
                Total lucro: <span className={kpis.totalLucro >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {kpis.totalLucro >= 0 ? '+' : ''}{fmt(kpis.totalLucro)}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronRight, TrendingUp, TrendingDown, DollarSign, BarChart3,
  ArrowUpDown, ArrowUp, ArrowDown, Eye, RefreshCw,
  Users, Package, Briefcase, Activity,
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
import { fetchAdmContratos } from '@/services/admContratosService'
import { computeSaudeSimplificada } from '@/services/admAlertsService'
import type { AdmContrato, AdmSaudeContrato } from '@/types/adm-contratos'
import { ADM_SAUDE_CONFIG, quadroItemTotal } from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtK = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`
  if (Math.abs(v) >= 1_000)     return `R$ ${(v / 1_000).toFixed(0)}K`
  return fmt(v)
}
const abbrev = (name: string, maxLen = 16) =>
  name.length > maxLen ? name.slice(0, maxLen - 1) + '…' : name

// ─── Linha computada por contrato ─────────────────────────────────────────────
interface ContratoRow {
  contrato: AdmContrato
  saude: AdmSaudeContrato
  // financeiro do escopo
  receitaMensal:  number   // valor_mensal
  custoEscopo:    number   // valor_mensal_escopo (MO + materiais)
  custoMaterial:  number   // valor_materiais
  lucroMensal:    number   // receita - custoEscopo
  margem:         number   // lucro / receita * 100
  totalFunc:      number   // soma de quadro_funcionarios[].quantidade
  perCapita:      number   // per_capita
}

function computeRow(c: AdmContrato): ContratoRow {
  const receitaMensal = c.valor_mensal ?? 0
  const custoEscopo   = c.valor_mensal_escopo ?? 0
  const custoMaterial = c.valor_materiais ?? 0
  const lucroMensal   = receitaMensal - custoEscopo
  const margem        = receitaMensal > 0 ? (lucroMensal / receitaMensal) * 100 : 0
  const totalFunc     = (c.quadro_funcionarios ?? []).reduce((s, r) => s + (r.quantidade ?? 0), 0)
  const perCapita     = c.per_capita ?? 0
  return {
    contrato: c,
    saude: computeSaudeSimplificada(c),
    receitaMensal, custoEscopo, custoMaterial,
    lucroMensal, margem, totalFunc, perCapita,
  }
}

// ─── Sort ─────────────────────────────────────────────────────────────────────
type SortKey = 'nome' | 'receita' | 'custo' | 'lucro' | 'margem' | 'funcionarios' | 'per_capita'
type SortDir = 'asc' | 'desc'

// ─── Tooltips ─────────────────────────────────────────────────────────────────
function TooltipCurrency({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs space-y-1 min-w-[160px]">
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

function TooltipMargem({ active, payload, label }: any) {
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

function TooltipServico({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[140px]">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-violet-700 font-bold">{payload[0].value} contrato(s)</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AdmAnalyticsPage() {
  const [contratos, setContratos]   = useState<AdmContrato[]>([])
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'suspenso' | 'encerrado'>('todos')
  const [sortKey, setSortKey]       = useState<SortKey>('receita')
  const [sortDir, setSortDir]       = useState<SortDir>('desc')

  const load = async () => {
    setLoading(true)
    try {
      setContratos(await fetchAdmContratos())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Linhas computadas ─────────────────────────────────────────────────────────
  const rows: ContratoRow[] = useMemo(() =>
    contratos
      .filter((c) => statusFilter === 'todos' || c.status === statusFilter)
      .map(computeRow),
  [contratos, statusFilter])

  // ── Ordenação ─────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1
    if (sortKey === 'nome')        return dir * a.contrato.nome.localeCompare(b.contrato.nome)
    if (sortKey === 'receita')     return dir * (a.receitaMensal  - b.receitaMensal)
    if (sortKey === 'custo')       return dir * (a.custoEscopo    - b.custoEscopo)
    if (sortKey === 'lucro')       return dir * (a.lucroMensal    - b.lucroMensal)
    if (sortKey === 'margem')      return dir * (a.margem         - b.margem)
    if (sortKey === 'funcionarios')return dir * (a.totalFunc      - b.totalFunc)
    if (sortKey === 'per_capita')  return dir * (a.perCapita      - b.perCapita)
    return 0
  }), [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  // ── KPIs globais ──────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const ativos = rows.filter(r => r.contrato.status === 'ativo')
    const receitaMensalTotal = ativos.reduce((s, r) => s + r.receitaMensal, 0)
    const custoMensalTotal   = ativos.reduce((s, r) => s + r.custoEscopo,   0)
    const custoMaterialTotal = ativos.reduce((s, r) => s + r.custoMaterial, 0)
    const lucroMensalTotal   = receitaMensalTotal - custoMensalTotal
    const margemGlobal       = receitaMensalTotal > 0 ? (lucroMensalTotal / receitaMensalTotal) * 100 : 0
    const totalFuncionarios  = ativos.reduce((s, r) => s + r.totalFunc, 0)
    const comPerCapita       = ativos.filter(r => r.perCapita > 0)
    const perCapitaMedio     = comPerCapita.length > 0
      ? comPerCapita.reduce((s, r) => s + r.perCapita, 0) / comPerCapita.length
      : 0
    const saudaveis = rows.filter(r => r.saude.status === 'saudavel').length
    const atencao   = rows.filter(r => r.saude.status === 'atencao').length
    const criticos  = rows.filter(r => r.saude.status === 'critico').length
    return {
      receitaMensalTotal, custoMensalTotal, custoMaterialTotal,
      lucroMensalTotal, margemGlobal,
      totalFuncionarios, perCapitaMedio,
      saudaveis, atencao, criticos,
      ativos: ativos.length, total: rows.length,
    }
  }, [rows])

  // ── Dados para gráficos ───────────────────────────────────────────────────────

  // 1. Tipos de serviço mais prestados
  const chartTiposServico = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of rows) {
      for (const nome of (r.contrato.tipos_servico_nomes ?? [])) {
        map.set(nome, (map.get(nome) ?? 0) + 1)
      }
    }
    return Array.from(map.entries())
      .map(([nome, total]) => ({ nome, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [rows])

  // 2. Receita vs Custo por contrato (top 10 por receita)
  const chartReceitaCusto = useMemo(() =>
    [...sorted]
      .filter(r => r.receitaMensal > 0 || r.custoEscopo > 0)
      .slice(0, 10)
      .map(r => ({
        name:    abbrev(r.contrato.nome),
        Receita: r.receitaMensal,
        Custo:   r.custoEscopo,
      })),
  [sorted])

  // 3. Margem por contrato (top 10 com receita)
  const chartMargem = useMemo(() =>
    [...rows]
      .filter(r => r.receitaMensal > 0)
      .sort((a, b) => b.margem - a.margem)
      .slice(0, 10)
      .map(r => ({
        name:   abbrev(r.contrato.nome),
        Margem: parseFloat(r.margem.toFixed(1)),
      })),
  [rows])

  // 4. Distribuição de saúde
  const chartSaude = useMemo(() => [
    { name: 'Saudável', value: kpis.saudaveis, fill: '#10b981' },
    { name: 'Atenção',  value: kpis.atencao,   fill: '#f59e0b' },
    { name: 'Crítico',  value: kpis.criticos,  fill: '#f43f5e' },
  ].filter(d => d.value > 0), [kpis])

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown className="w-3 h-3 text-slate-300" />
    return sortDir === 'desc'
      ? <ArrowDown className="w-3 h-3 text-violet-500" />
      : <ArrowUp   className="w-3 h-3 text-violet-500" />
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Gestão ADM</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Contratual</h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão consolidada por contrato — receita, custo, margem, quadro e tipos de serviço.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-8 text-sm w-36"><SelectValue /></SelectTrigger>
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

      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            label: 'Receita Mensal', sub: 'Contratos ativos',
            value: fmtK(kpis.receitaMensalTotal),
            icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50',
          },
          {
            label: 'Custo de Escopo', sub: 'MO + Materiais',
            value: fmtK(kpis.custoMensalTotal),
            icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50',
          },
          {
            label: 'Lucro Mensal', sub: 'Receita − Custo',
            value: (kpis.lucroMensalTotal >= 0 ? '+' : '') + fmtK(kpis.lucroMensalTotal),
            icon: DollarSign,
            color: kpis.lucroMensalTotal >= 0 ? 'text-emerald-600' : 'text-rose-600',
            bg:    kpis.lucroMensalTotal >= 0 ? 'bg-emerald-50'   : 'bg-rose-50',
          },
          {
            label: 'Margem Global', sub: 'Lucro ÷ Receita',
            value: kpis.margemGlobal.toFixed(1) + '%',
            icon: BarChart3,
            color: kpis.margemGlobal >= 10 ? 'text-emerald-600' : kpis.margemGlobal >= 0 ? 'text-amber-600' : 'text-rose-600',
            bg:    kpis.margemGlobal >= 10 ? 'bg-emerald-50'    : kpis.margemGlobal >= 0 ? 'bg-amber-50'    : 'bg-rose-50',
          },
          {
            label: 'Funcionários', sub: `${kpis.ativos} contratos ativos`,
            value: String(kpis.totalFuncionarios),
            icon: Users, color: 'text-blue-600', bg: 'bg-blue-50',
          },
          {
            label: 'Per Capita Médio', sub: 'Média entre contratos',
            value: kpis.perCapitaMedio > 0 ? fmtK(kpis.perCapitaMedio) : '—',
            icon: Package, color: 'text-slate-600', bg: 'bg-slate-100',
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500 leading-tight">{card.label}</p>
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              {loading
                ? <div className="h-6 bg-slate-100 rounded animate-pulse" />
                : (
                  <div>
                    <p className={`text-base font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-[10px] text-slate-400">{card.sub}</p>
                  </div>
                )}
            </div>
          )
        })}
      </div>

      {/* ── Gráficos linha 1 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tipos de serviço mais prestados */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-500" />
              Tipos de Serviço mais Prestados
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Número de contratos por tipo de serviço</p>
          </div>
          {loading ? (
            <div className="h-56 bg-slate-50 rounded-lg animate-pulse" />
          ) : chartTiposServico.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center gap-2 text-slate-300">
              <Briefcase className="w-8 h-8" />
              <span className="text-sm">Nenhum tipo de serviço cadastrado nos contratos</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartTiposServico} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="nome" tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} width={76} />
                <Tooltip content={<TooltipServico />} />
                <Bar dataKey="total" name="Contratos" radius={[0, 4, 4, 0]} maxBarSize={24}>
                  {chartTiposServico.map((_, i) => (
                    <Cell key={i} fill={
                      i === 0 ? '#7c3aed' : i === 1 ? '#6d28d9' : i === 2 ? '#8b5cf6' :
                      i === 3 ? '#a78bfa' : '#c4b5fd'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Distribuição de Saúde */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" />
              Saúde da Carteira
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{kpis.total} contratos</p>
          </div>
          {loading ? (
            <div className="h-56 bg-slate-50 rounded-lg animate-pulse" />
          ) : chartSaude.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">Sem contratos</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={chartSaude} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                    paddingAngle={3} dataKey="value">
                    {chartSaude.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} contratos`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {(['saudavel', 'atencao', 'critico'] as const).map((s) => {
                  const cfg   = ADM_SAUDE_CONFIG[s]
                  const count = s === 'saudavel' ? kpis.saudaveis : s === 'atencao' ? kpis.atencao : kpis.criticos
                  const pct   = kpis.total > 0 ? Math.round((count / kpis.total) * 100) : 0
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

      {/* ── Gráficos linha 2 ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Receita vs Custo por Contrato */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Receita vs Custo Mensal</h3>
            <p className="text-xs text-slate-400 mt-0.5">Valor mensal do contrato vs custo de escopo (top 10)</p>
          </div>
          {loading ? (
            <div className="h-56 bg-slate-50 rounded-lg animate-pulse" />
          ) : chartReceitaCusto.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">
              Sem contratos com valor mensal
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartReceitaCusto} margin={{ top: 4, right: 0, left: 0, bottom: 44 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} width={58} />
                <Tooltip content={<TooltipCurrency />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) => <span className="text-slate-600">{v}</span>} />
                <Bar dataKey="Receita" fill="#7c3aed" radius={[3, 3, 0, 0]} maxBarSize={26} />
                <Bar dataKey="Custo"   fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Margem por Contrato */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Margem por Contrato</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top 10 — verde ≥ 10%, amarelo ≥ 0%, vermelho negativo</p>
          </div>
          {loading ? (
            <div className="h-56 bg-slate-50 rounded-lg animate-pulse" />
          ) : chartMargem.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-300 text-sm">
              Sem contratos com valor mensal
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartMargem} margin={{ top: 4, right: 0, left: 0, bottom: 44 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} width={40} />
                <Tooltip content={<TooltipMargem />} />
                <Bar dataKey="Margem" radius={[3, 3, 0, 0]} maxBarSize={32}>
                  {chartMargem.map((entry, i) => (
                    <Cell key={i} fill={entry.Margem >= 10 ? '#10b981' : entry.Margem >= 0 ? '#f59e0b' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Tabela de contratos ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-slate-800">
              Carteira de Contratos
              {!loading && <span className="ml-2 text-xs text-slate-400 font-normal">({sorted.length})</span>}
            </span>
          </div>
          <p className="text-xs text-slate-400">Clique nos cabeçalhos para ordenar</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {/* Nome */}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-slate-800 transition-colors" onClick={() => toggleSort('nome')}>
                    Contrato <SortIcon k="nome" />
                  </button>
                </th>
                {/* Tipos serviço */}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tipo de Serviço
                </th>
                {/* Receita */}
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('receita')}>
                    <SortIcon k="receita" /> Receita/Mês
                  </button>
                </th>
                {/* Custo escopo */}
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('custo')}>
                    <SortIcon k="custo" /> Custo Escopo
                  </button>
                </th>
                {/* Lucro */}
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('lucro')}>
                    <SortIcon k="lucro" /> Lucro
                  </button>
                </th>
                {/* Margem */}
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('margem')}>
                    <SortIcon k="margem" /> Margem
                  </button>
                </th>
                {/* Material */}
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Material
                </th>
                {/* Funcionários */}
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 mx-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('funcionarios')}>
                    <SortIcon k="funcionarios" /> Func.
                  </button>
                </th>
                {/* Per capita */}
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 ml-auto hover:text-slate-800 transition-colors" onClick={() => toggleSort('per_capita')}>
                    <SortIcon k="per_capita" /> Per Capita
                  </button>
                </th>
                {/* Saúde */}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Saúde</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${40 + (j * 13) % 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr><td colSpan={11} className="py-16 text-center text-slate-400 text-sm">Nenhum contrato encontrado</td></tr>
              ) : sorted.map((row, idx) => {
                const { contrato, saude, receitaMensal, custoEscopo, custoMaterial, lucroMensal, margem, totalFunc, perCapita } = row
                return (
                  <tr key={contrato.id}
                    className={cn(
                      'border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                      saude.status === 'critico' && 'bg-rose-50/20'
                    )}>
                    {/* Rank + nome */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
                          idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-slate-200 text-slate-600' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-400'
                        )}>{idx + 1}</span>
                        <div>
                          <p className="font-medium text-slate-900 text-sm leading-tight">{contrato.nome}</p>
                          <p className="text-xs text-slate-400">{contrato.cliente_nome}</p>
                        </div>
                      </div>
                    </td>
                    {/* Tipos de serviço */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(contrato.tipos_servico_nomes ?? []).length > 0
                          ? (contrato.tipos_servico_nomes ?? []).map((nome) => (
                            <span key={nome} className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                              {nome}
                            </span>
                          ))
                          : <span className="text-slate-300 text-xs">—</span>
                        }
                      </div>
                    </td>
                    {/* Receita */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {receitaMensal > 0
                        ? <span className="font-semibold text-violet-700">{fmtK(receitaMensal)}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Custo escopo */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {custoEscopo > 0
                        ? <span className="text-amber-700">{fmtK(custoEscopo)}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Lucro */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {receitaMensal > 0
                        ? <span className={cn('font-semibold', lucroMensal >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                            {lucroMensal >= 0 ? '+' : ''}{fmtK(lucroMensal)}
                          </span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Margem */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {receitaMensal > 0
                        ? <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                            margem >= 10 ? 'bg-emerald-50 text-emerald-700' :
                            margem >= 0  ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          )}>{margem.toFixed(1)}%</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Material */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {custoMaterial > 0
                        ? <span className="text-slate-600 text-xs">{fmtK(custoMaterial)}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Funcionários */}
                    <td className="px-4 py-3 text-center">
                      {totalFunc > 0
                        ? <span className="font-bold text-blue-600">{totalFunc}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Per capita */}
                    <td className="px-4 py-3 text-right tabular-nums">
                      {perCapita > 0
                        ? <span className="text-slate-700 text-xs">{fmtK(perCapita)}</span>
                        : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    {/* Saúde */}
                    <td className="px-4 py-3">
                      <ContractHealthBadge saude={saude} size="sm" />
                    </td>
                    {/* Ação */}
                    <td className="px-4 py-3 text-right">
                      <Link href={`/gestao-adm/contratos/${contrato.id}`}>
                        <Button variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                          title="Ver detalhes">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Rodapé totais */}
        {!loading && sorted.length > 0 && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-slate-400">
              {sorted.filter(r => r.receitaMensal > 0).length} de {sorted.length} contratos com valor mensal definido
            </p>
            <div className="flex items-center gap-6 text-xs font-medium">
              <span className="text-slate-500">
                Receita total: <span className="text-violet-600">{fmt(kpis.receitaMensalTotal)}</span>
              </span>
              <span className="text-slate-500">
                Lucro total: <span className={kpis.lucroMensalTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {kpis.lucroMensalTotal >= 0 ? '+' : ''}{fmt(kpis.lucroMensalTotal)}
                </span>
              </span>
              <span className="text-slate-500">
                Funcionários: <span className="text-blue-600">{kpis.totalFuncionarios}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

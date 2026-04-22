'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus, Search, X, Loader2, FileX, FileCheck2, Edit, Trash2, Eye,
  ChevronRight, DollarSign, LayoutGrid, Users, ShieldAlert, ShieldX,
  Clock, AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ContractFormDialog } from '@/components/gestao-adm/contract-form-dialog'
import { ContractStatusBadge } from '@/components/gestao-adm/contract-status-badge'
import { ContractHealthBadge } from '@/components/gestao-adm/contract-health-badge'
import { fetchAdmContratos, deleteAdmContrato } from '@/services/admContratosService'
import {
  computeAnaliseListagem,
  computeResumoGlobal,
  gerarAlertasSimplificados,
} from '@/services/admAlertsService'
import type { AdmContrato, AdmContratoStatus, AdmSaudeStatus, AdmSaudeContrato } from '@/types/adm-contratos'
import { ADM_STATUS_LABELS, ADM_SAUDE_CONFIG } from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

function fmt(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtDate(d: string | null | undefined) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${55 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

type StatusFilter  = 'todos' | AdmContratoStatus
type SaudeFilter   = 'todas' | AdmSaudeStatus
type VencFilter    = 'todos' | 'proximo' | 'vencido'

const SAUDE_FILTER_LABELS: Record<SaudeFilter, string> = {
  todas:    'Toda saúde',
  saudavel: 'Saudável',
  atencao:  'Atenção',
  critico:  'Crítico',
}

export default function AdmContratosPage() {
  const [contratos, setContratos] = useState<AdmContrato[]>([])
  const [saudeMap, setSaudeMap] = useState<Map<string, AdmSaudeContrato>>(new Map())
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<AdmContrato | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [saudeFilter, setSaudeFilter] = useState<SaudeFilter>('todas')
  const [vencFilter, setVencFilter] = useState<VencFilter>('todos')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdmContrato | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAdmContratos()
      setContratos(data)
      setSaudeMap(computeAnaliseListagem(data))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const resumo = useMemo(() => computeResumoGlobal(contratos, saudeMap), [contratos, saudeMap])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return contratos.filter((c) => {
      if (statusFilter !== 'todos' && c.status !== statusFilter) return false
      if (saudeFilter !== 'todas') {
        const s = saudeMap.get(c.id)
        if (!s || s.status !== saudeFilter) return false
      }
      if (vencFilter !== 'todos') {
        if (!c.data_fim) return false
        const dias = Math.floor((new Date(c.data_fim).getTime() - Date.now()) / 86400000)
        if (vencFilter === 'vencido'  && dias >= 0)   return false
        if (vencFilter === 'proximo'  && (dias < 0 || dias > 30)) return false
      }
      if (term) {
        return (
          c.codigo?.toLowerCase().includes(term) ||
          c.nome?.toLowerCase().includes(term) ||
          c.cliente_nome?.toLowerCase().includes(term) ||
          c.responsavel?.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [contratos, saudeMap, search, statusFilter, saudeFilter, vencFilter])

  const kpis = useMemo(() => ({
    total: contratos.length,
    ativos: contratos.filter((c) => c.status === 'ativo').length,
    totalMensal: contratos.filter((c) => c.status === 'ativo').reduce((s, c) => s + (c.valor_mensal ?? 0), 0),
  }), [contratos])

  const hasFilter = search.trim() !== '' || statusFilter !== 'todos' || saudeFilter !== 'todas' || vencFilter !== 'todos'
  const clearFilters = () => { setSearch(''); setStatusFilter('todos'); setSaudeFilter('todas'); setVencFilter('todos') }
  const openNew  = () => { setSelected(null); setDialogOpen(true) }
  const openEdit = (c: AdmContrato) => { setSelected(c); setDialogOpen(true) }

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return
    setDeletingId(deleteConfirm.id)
    setDeleteConfirm(null)
    const ok = await deleteAdmContrato(deleteConfirm.id)
    setDeletingId(null)
    if (ok) setContratos((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
  }

  return (
    <div className="space-y-5 max-w-[1400px]">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>Gestão ADM</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">Contratos</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestão de Contratos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visão executiva da carteira de contratos, saúde e alertas.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />Novo Contrato
        </Button>
      </div>

      {/* ── Banner de riscos ────────────────────────────────────────────── */}
      {!loading && (resumo.criticos > 0 || resumo.atencao > 0 || resumo.vencendoEm30 > 0) && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-800">Resumo de Riscos</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {resumo.criticos > 0 && (
              <button
                onClick={() => setSaudeFilter('critico')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <ShieldX className="w-3.5 h-3.5" />
                {resumo.criticos} contrato{resumo.criticos > 1 ? 's' : ''} crítico{resumo.criticos > 1 ? 's' : ''}
              </button>
            )}
            {resumo.atencao > 0 && (
              <button
                onClick={() => setSaudeFilter('atencao')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {resumo.atencao} em atenção
              </button>
            )}
            {resumo.vencendoEm30 > 0 && (
              <button
                onClick={() => setVencFilter('proximo')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors"
              >
                <Clock className="w-3.5 h-3.5" />
                {resumo.vencendoEm30} vencendo em 30 dias
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : kpis.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Ativos</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : kpis.ativos}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
            <ShieldX className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Críticos</p>
            <p className={cn('text-2xl font-bold', resumo.criticos > 0 ? 'text-rose-600' : 'text-slate-900')}>
              {loading ? '—' : resumo.criticos}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Receita Mensal</p>
            <p className="text-lg font-bold text-slate-900">{loading ? '—' : fmt(kpis.totalMensal)}</p>
          </div>
        </div>
      </div>

      {/* ── Tabela ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-semibold text-slate-800">
              Contratos
              {!loading && (
                <span className="ml-2 text-slate-400 font-normal text-xs">
                  ({filtered.length}{hasFilter ? ` de ${contratos.length}` : ''})
                </span>
              )}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Código, nome, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm w-full sm:w-52"
              />
            </div>

            {/* Filtro status */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="h-8 text-sm w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos status</SelectItem>
                {(Object.entries(ADM_STATUS_LABELS) as [AdmContratoStatus, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro saúde */}
            <Select value={saudeFilter} onValueChange={(v) => setSaudeFilter(v as SaudeFilter)}>
              <SelectTrigger className="h-8 text-sm w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SAUDE_FILTER_LABELS) as [SaudeFilter, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro vencimento */}
            <Select value={vencFilter} onValueChange={(v) => setVencFilter(v as VencFilter)}>
              <SelectTrigger className="h-8 text-sm w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Qualquer prazo</SelectItem>
                <SelectItem value="proximo">Vence em 30 dias</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
              </SelectContent>
            </Select>

            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-slate-500">
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {[
                  { label: 'Código',          align: 'left' },
                  { label: 'Contrato / Cliente', align: 'left' },
                  { label: 'Responsável',     align: 'left' },
                  { label: 'Valor Mensal',    align: 'right' },
                  { label: 'Período',         align: 'left' },
                  { label: 'Status',          align: 'left' },
                  { label: 'Saúde',           align: 'left' },
                  { label: '',                align: 'right' },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-${h.align}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileX className="w-6 h-6" />
                      </div>
                      {hasFilter ? (
                        <>
                          <p className="text-sm font-medium">Nenhum contrato encontrado</p>
                          <button onClick={clearFilters} className="text-xs text-violet-600 hover:underline">
                            Limpar filtros
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Nenhum contrato cadastrado</p>
                          <button onClick={openNew} className="text-xs text-violet-600 hover:underline font-medium">
                            Criar primeiro contrato
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const saude   = saudeMap.get(c.id)
                  const alertas = gerarAlertasSimplificados(c)
                  const maxSev  = alertas[0]?.severidade

                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        'border-b border-slate-50 hover:bg-slate-50/60 transition-colors',
                        saude?.status === 'critico' && 'bg-rose-50/20',
                      )}
                    >
                      {/* Código */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {c.codigo}
                        </span>
                      </td>

                      {/* Nome + cliente */}
                      <td className="px-4 py-3">
                        <Link href={`/gestao-adm/contratos/${c.id}`} className="hover:text-violet-700 transition-colors">
                          <p className="font-medium text-slate-900 leading-tight hover:text-violet-700">{c.nome}</p>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">{c.cliente_nome}</p>
                      </td>

                      {/* Responsável */}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {c.responsavel || <span className="text-slate-300">—</span>}
                      </td>

                      {/* Valor mensal */}
                      <td className="px-4 py-3 text-right">
                        <span className={cn('font-medium tabular-nums', c.valor_mensal ? 'text-slate-900' : 'text-slate-300')}>
                          {fmt(c.valor_mensal)}
                        </span>
                      </td>

                      {/* Período */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-500 space-y-0.5">
                          {c.data_inicio ? <div className="text-slate-600">{fmtDate(c.data_inicio)}</div> : <div className="text-slate-300">Sem início</div>}
                          {c.data_fim && (
                            <div className={cn(
                              'text-xs',
                              (() => {
                                const d = Math.floor((new Date(c.data_fim).getTime() - Date.now()) / 86400000)
                                return d < 0 ? 'text-rose-500 font-medium' : d <= 30 ? 'text-amber-600 font-medium' : 'text-slate-400'
                              })()
                            )}>
                              até {fmtDate(c.data_fim)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <ContractStatusBadge status={c.status} size="sm" />
                      </td>

                      {/* Saúde */}
                      <td className="px-4 py-3">
                        {saude ? (
                          <ContractHealthBadge saude={saude} size="sm" />
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/gestao-adm/contratos/${c.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-50" title="Ver detalhes">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100" onClick={() => openEdit(c)} title="Editar">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50" onClick={() => setDeleteConfirm(c)} disabled={deletingId === c.id} title="Excluir">
                            {deletingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Excluir contrato?</h3>
              <p className="text-sm text-slate-500">
                O contrato <strong className="text-slate-700">{deleteConfirm.nome}</strong> será removido permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>Excluir</Button>
            </div>
          </div>
        </div>
      )}

      <ContractFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} contrato={selected} onSaved={load} />
    </div>
  )
}

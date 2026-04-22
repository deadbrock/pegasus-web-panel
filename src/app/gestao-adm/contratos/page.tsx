'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Plus,
  Search,
  X,
  Loader2,
  FileX,
  FileCheck2,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  TrendingUp,
  Users,
  DollarSign,
  LayoutGrid,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ContractFormDialog } from '@/components/gestao-adm/contract-form-dialog'
import { ContractStatusBadge } from '@/components/gestao-adm/contract-status-badge'
import { fetchAdmContratos, deleteAdmContrato } from '@/services/admContratosService'
import type { AdmContrato, AdmContratoStatus } from '@/types/adm-contratos'
import { ADM_STATUS_LABELS } from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

function formatCurrency(value: number | null | undefined) {
  if (value == null) return '—'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(date: string | null | undefined) {
  if (!date) return '—'
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i * 11) % 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

type StatusFilter = 'todos' | AdmContratoStatus

export default function AdmContratosPage() {
  const [contratos, setContratos] = useState<AdmContrato[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selected, setSelected] = useState<AdmContrato | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<AdmContrato | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await fetchAdmContratos()
      setContratos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return contratos.filter((c) => {
      const matchSearch =
        !term ||
        c.codigo?.toLowerCase().includes(term) ||
        c.nome?.toLowerCase().includes(term) ||
        c.cliente_nome?.toLowerCase().includes(term) ||
        c.responsavel?.toLowerCase().includes(term)
      const matchStatus = statusFilter === 'todos' || c.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [contratos, search, statusFilter])

  const stats = useMemo(() => ({
    total: contratos.length,
    ativos: contratos.filter((c) => c.status === 'ativo').length,
    totalMensal: contratos
      .filter((c) => c.status === 'ativo')
      .reduce((s, c) => s + (c.valor_mensal ?? 0), 0),
  }), [contratos])

  const hasFilter = search.trim() !== '' || statusFilter !== 'todos'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('todos')
  }

  const openNew = () => { setSelected(null); setDialogOpen(true) }
  const openEdit = (c: AdmContrato) => { setSelected(c); setDialogOpen(true) }

  const confirmDelete = (c: AdmContrato) => setDeleteConfirm(c)

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return
    setDeletingId(deleteConfirm.id)
    setDeleteConfirm(null)
    const ok = await deleteAdmContrato(deleteConfirm.id)
    setDeletingId(null)
    if (ok) {
      setContratos((prev) => prev.filter((c) => c.id !== deleteConfirm.id))
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
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
            Cadastro, acompanhamento e visão financeira dos contratos ADM.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
            <LayoutGrid className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de Contratos</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Contratos Ativos</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '—' : stats.ativos}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Receita Mensal (ativos)</p>
            <p className="text-xl font-bold text-slate-900">
              {loading ? '—' : formatCurrency(stats.totalMensal)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabela */}
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                placeholder="Buscar por código, nome, cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 text-sm w-full sm:w-64"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="h-8 text-sm w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {(Object.entries(ADM_STATUS_LABELS) as [AdmContratoStatus, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {hasFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-slate-500 hover:text-slate-700"
              >
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Contrato / Cliente
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Responsável
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Valor Mensal
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-400">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileX className="w-6 h-6" />
                      </div>
                      {hasFilter ? (
                        <>
                          <p className="text-sm font-medium">Nenhum contrato encontrado</p>
                          <button
                            onClick={clearFilters}
                            className="text-xs text-violet-600 hover:underline"
                          >
                            Limpar filtros
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium">Nenhum contrato cadastrado</p>
                          <p className="text-xs">
                            Clique em{' '}
                            <button
                              onClick={openNew}
                              className="text-violet-600 hover:underline font-medium"
                            >
                              Novo Contrato
                            </button>{' '}
                            para começar.
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {c.codigo}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 leading-tight">{c.nome}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{c.cliente_nome}</p>
                    </td>

                    <td className="px-4 py-3">
                      <span className="text-slate-600 text-sm">
                        {c.responsavel || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'font-medium tabular-nums',
                          c.valor_mensal ? 'text-slate-900' : 'text-slate-300'
                        )}
                      >
                        {formatCurrency(c.valor_mensal)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div>
                          {c.data_inicio ? (
                            <span className="text-slate-600">{formatDate(c.data_inicio)}</span>
                          ) : (
                            <span className="text-slate-300">Sem início</span>
                          )}
                        </div>
                        {c.data_fim && (
                          <div className="text-slate-400">até {formatDate(c.data_fim)}</div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <ContractStatusBadge status={c.status} size="sm" />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/gestao-adm/contratos/${c.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                            title="Ver detalhes"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          onClick={() => openEdit(c)}
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => confirmDelete(c)}
                          disabled={deletingId === c.id}
                          title="Excluir"
                        >
                          {deletingId === c.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm delete modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Excluir contrato?</h3>
              <p className="text-sm text-slate-500">
                O contrato <strong className="text-slate-700">{deleteConfirm.nome}</strong> será
                removido permanentemente. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      <ContractFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        contrato={selected}
        onSaved={load}
      />
    </div>
  )
}

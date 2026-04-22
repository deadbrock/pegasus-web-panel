'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  Calendar,
  User,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContractFormDialog } from '@/components/gestao-adm/contract-form-dialog'
import { FinancialEntryDialog } from '@/components/gestao-adm/financial-entry-dialog'
import { ContractStatusBadge } from '@/components/gestao-adm/contract-status-badge'
import {
  fetchAdmContratoById,
  fetchAdmContratoFinanceiro,
  fetchAdmContratoStats,
  deleteAdmContrato,
  deleteAdmContratoFinanceiro,
} from '@/services/admContratosService'
import type { AdmContrato, AdmContratoFinanceiro, AdmContratoStats } from '@/types/adm-contratos'

function formatCurrency(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function formatPeriod(p: string) {
  const [y, m] = p.split('-')
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[parseInt(m, 10) - 1]}/${y}`
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`rounded animate-pulse bg-slate-100 ${className ?? 'h-4 w-32'}`} />
}

export default function AdmContratoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [contrato, setContrato] = useState<AdmContrato | null>(null)
  const [financeiro, setFinanceiro] = useState<AdmContratoFinanceiro[]>([])
  const [stats, setStats] = useState<AdmContratoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [editOpen, setEditOpen] = useState(false)
  const [finEntryOpen, setFinEntryOpen] = useState(false)
  const [selectedFin, setSelectedFin] = useState<AdmContratoFinanceiro | null>(null)
  const [deleteContractConfirm, setDeleteContractConfirm] = useState(false)
  const [deletingFinId, setDeletingFinId] = useState<string | null>(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [c, fin, st] = await Promise.all([
        fetchAdmContratoById(id),
        fetchAdmContratoFinanceiro(id),
        fetchAdmContratoStats(id),
      ])
      if (!c) { setNotFound(true); return }
      setContrato(c)
      setFinanceiro(fin)
      setStats(st)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [id])

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

  const openEditFin = (entry: AdmContratoFinanceiro) => {
    setSelectedFin(entry)
    setFinEntryOpen(true)
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Contrato não encontrado</p>
        <Link href="/gestao-adm/contratos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/gestao-adm/contratos" className="hover:text-violet-600 transition-colors">
              Contratos
            </Link>
            <ChevronRight className="w-3 h-3" />
            {loading ? (
              <SkeletonBlock className="h-3 w-24 rounded" />
            ) : (
              <span className="text-slate-600 font-medium">{contrato?.codigo}</span>
            )}
          </div>
          {loading ? (
            <SkeletonBlock className="h-7 w-64 rounded" />
          ) : (
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {contrato?.nome}
            </h1>
          )}
          {!loading && contrato && (
            <div className="flex items-center gap-3 mt-2">
              <ContractStatusBadge status={contrato.status} />
              <span className="text-sm text-slate-500">{contrato.cliente_nome}</span>
            </div>
          )}
        </div>

        {!loading && contrato && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteContractConfirm(true)}
              className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 hover:border-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir
            </Button>
          </div>
        )}
      </div>

      {/* KPI cards financeiros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Valor Mensal',
            value: loading ? null : formatCurrency(contrato?.valor_mensal),
            icon: DollarSign,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Receita Total',
            value: loading ? null : formatCurrency(stats?.totalReceita),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Custo Total',
            value: loading ? null : formatCurrency(stats?.totalCusto),
            icon: TrendingDown,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
          },
          {
            label: 'Lucro Total',
            value: loading ? null : formatCurrency(stats?.totalLucro),
            subValue: loading ? null : `Margem: ${stats?.margemMedia?.toFixed(1) ?? 0}%`,
            icon: TrendingUp,
            color: (stats?.totalLucro ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600',
            bg: (stats?.totalLucro ?? 0) >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
          },
        ].map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              {loading ? (
                <SkeletonBlock className="h-6 w-28 rounded" />
              ) : (
                <div>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  {card.subValue && (
                    <p className="text-xs text-slate-400 mt-0.5">{card.subValue}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do contrato */}
        <div className="lg:col-span-1 space-y-4">
          {/* Dados gerais */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              Informações Gerais
            </h2>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBlock key={i} className="h-4 w-full rounded" />
                ))}
              </div>
            ) : contrato ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">Código</span>
                  <span className="font-mono text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {contrato.codigo}
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-slate-400 shrink-0">Cliente</span>
                  <span className="text-slate-700 text-right">{contrato.cliente_nome}</span>
                </div>

                {contrato.cliente_documento && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400 shrink-0">CNPJ/CPF</span>
                    <span className="text-slate-700 font-mono text-xs">
                      {contrato.cliente_documento}
                    </span>
                  </div>
                )}

                <div className="flex justify-between gap-2 items-center">
                  <span className="text-slate-400 shrink-0 flex items-center gap-1">
                    <User className="w-3 h-3" /> Responsável
                  </span>
                  <span className="text-slate-700 text-right">
                    {contrato.responsavel || '—'}
                  </span>
                </div>

                <div className="flex justify-between gap-2 items-center">
                  <span className="text-slate-400 shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Início
                  </span>
                  <span className="text-slate-700">{formatDate(contrato.data_inicio)}</span>
                </div>

                <div className="flex justify-between gap-2 items-center">
                  <span className="text-slate-400 shrink-0 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Término
                  </span>
                  <span className="text-slate-700">{formatDate(contrato.data_fim)}</span>
                </div>

                <div className="flex justify-between gap-2 items-center">
                  <span className="text-slate-400 shrink-0 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Valor Mensal
                  </span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(contrato.valor_mensal)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Observações */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              Observações
            </h2>
            {loading ? (
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-full rounded" />
                <SkeletonBlock className="h-4 w-4/5 rounded" />
              </div>
            ) : (
              <p className="text-sm text-slate-500 leading-relaxed">
                {contrato?.observacoes || (
                  <span className="italic text-slate-300">Sem observações.</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Histórico financeiro */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Histórico Financeiro
                  {!loading && (
                    <span className="ml-2 text-xs text-slate-400 font-normal">
                      ({stats?.periodos ?? 0} período{(stats?.periodos ?? 0) !== 1 ? 's' : ''})
                    </span>
                  )}
                </h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setSelectedFin(null); setFinEntryOpen(true) }}
                className="gap-1.5 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Período
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['Período', 'Receita', 'Custo', 'Lucro', 'Margem', ''].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider ${
                          h === 'Período' ? 'text-left' : h === '' ? 'text-right' : 'text-right'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <SkeletonBlock className="h-4 rounded" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : financeiro.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-medium">Nenhum dado financeiro</p>
                          <p className="text-xs">
                            Clique em{' '}
                            <button
                              onClick={() => { setSelectedFin(null); setFinEntryOpen(true) }}
                              className="text-violet-600 hover:underline font-medium"
                            >
                              Registrar Período
                            </button>{' '}
                            para iniciar o controle financeiro.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    financeiro.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {formatPeriod(f.periodo_referencia)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                          {formatCurrency(f.receita)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                          {formatCurrency(f.custo)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span
                            className={
                              f.lucro >= 0
                                ? 'text-emerald-600 font-medium'
                                : 'text-rose-600 font-medium'
                            }
                          >
                            {f.lucro >= 0 ? '+' : ''}
                            {formatCurrency(f.lucro)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              f.margem_percentual >= 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {f.margem_percentual.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              onClick={() => openEditFin(f)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              onClick={() => handleDeleteFin(f.id)}
                              disabled={deletingFinId === f.id}
                            >
                              {deletingFinId === f.id ? (
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
                {!loading && financeiro.length > 0 && stats && (
                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">
                        {formatCurrency(stats.totalReceita)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">
                        {formatCurrency(stats.totalCusto)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span
                          className={
                            stats.totalLucro >= 0
                              ? 'font-bold text-emerald-600'
                              : 'font-bold text-rose-600'
                          }
                        >
                          {stats.totalLucro >= 0 ? '+' : ''}
                          {formatCurrency(stats.totalLucro)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            stats.margemMedia >= 0
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
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
        </div>
      </div>

      {/* Confirm delete contract */}
      {deleteContractConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-semibold text-slate-900">Excluir contrato?</h3>
              <p className="text-sm text-slate-500">
                O contrato <strong className="text-slate-700">{contrato?.nome}</strong> e todos
                os dados financeiros vinculados serão removidos permanentemente.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteContractConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteContract}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      {contrato && (
        <ContractFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          contrato={contrato}
          onSaved={loadAll}
        />
      )}

      <FinancialEntryDialog
        open={finEntryOpen}
        onClose={() => setFinEntryOpen(false)}
        contratoId={id}
        entry={selectedFin}
        onSaved={loadAll}
      />
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus, Building2, MapPin, Search, Edit, Trash2, Loader2,
  FileX, X, Lock, Package, Calendar, BadgeCheck,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, ChevronDown, ChevronUp,
} from 'lucide-react'
import { fetchContracts, deleteContract, type ContractRecord } from '@/services/contractsService'
import { fetchAdmContratos } from '@/services/admContratosService'
import type { AdmContrato } from '@/types/adm-contratos'
import { ContractsImportExport } from '@/components/contratos/contracts-import-export'
import { ContractDialog } from '@/components/contratos/contract-dialog'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabaseClient'
import { cn } from '@/lib/utils'

// ─── helpers ─────────────────────────────────────────────────────────────────

type StatusFilter = 'Todos' | 'Ativo' | 'Suspenso' | 'Encerrado'

function fmt(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDate(d: string | null | undefined) {
  if (!d) return null
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

// ─── Vista ADM para logistica ─────────────────────────────────────────────────

function AdmContratoCard({ c }: { c: AdmContrato }) {
  const statusColor =
    c.status === 'ativo'          ? 'bg-emerald-100 text-emerald-700' :
    c.status === 'suspenso'       ? 'bg-amber-100 text-amber-700'     :
    c.status === 'em_negociacao'  ? 'bg-blue-100 text-blue-700'       :
                                    'bg-slate-100 text-slate-500'

  const statusLabel =
    c.status === 'ativo'          ? 'Ativo'          :
    c.status === 'suspenso'       ? 'Suspenso'       :
    c.status === 'em_negociacao'  ? 'Em Negociação'  :
                                    'Encerrado'

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-sm transition-shadow space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-slate-900 truncate">{c.nome}</p>
            <p className="text-xs text-slate-500 truncate">{c.cliente_nome}</p>
          </div>
        </div>
        <span className={cn('shrink-0 text-xs px-2 py-0.5 rounded-full font-medium', statusColor)}>
          {statusLabel}
        </span>
      </div>

      {c.codigo && (
        <div className="flex items-center gap-1.5">
          <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-mono text-slate-500">{c.codigo}</span>
        </div>
      )}

      {(c.data_inicio || c.data_fim) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>
            {fmtDate(c.data_inicio) ?? 'Sem início'}
            {c.data_fim && <> → {fmtDate(c.data_fim)}</>}
          </span>
        </div>
      )}

      {c.responsavel && (
        <p className="text-xs text-slate-500">Resp.: {c.responsavel}</p>
      )}

      <div className="mt-1 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-xs font-medium text-orange-700">Custo de Materiais</span>
        </div>
        <span className="text-sm font-bold text-orange-800">
          {fmt(c.valor_materiais)}
        </span>
      </div>
    </div>
  )
}

// ─── Tipos para Controle ──────────────────────────────────────────────────────

interface SupervisorLink {
  id: string
  nome: string
  adm_contrato_id: string | null
}

interface PedidoItem {
  quantidade: number
  produto: { preco_unitario: number | null } | null
}

interface PedidoRaw {
  id: string
  portal_supervisor_id: string | null
  itens: PedidoItem[]
}

interface ControleContrato {
  contrato: AdmContrato
  orcamento: number
  gasto: number
  pedidosCount: number
  supervisoresVinculados: string[]
}

// ─── Componente: Aba Controle ─────────────────────────────────────────────────

function ControleGastosTab({ contratos }: { contratos: AdmContrato[] }) {
  const [mes, setMes] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [supervisores, setSupervisores] = useState<SupervisorLink[]>([])
  const [pedidos, setPedidos] = useState<PedidoRaw[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Buscar supervisores vinculados a contratos e pedidos do mês
  const fetchControle = async (mesSel: string) => {
    setLoading(true)
    try {
      // 1. Supervisores com contrato vinculado
      const { data: sups } = await supabase
        .from('portal_supervisores')
        .select('id, nome, adm_contrato_id')
        .not('adm_contrato_id', 'is', null)

      setSupervisores((sups ?? []) as SupervisorLink[])

      if (!sups || sups.length === 0) {
        setPedidos([])
        return
      }

      // 2. Pedidos do mês selecionado com itens e preços
      const [ano, mNum] = mesSel.split('-').map(Number)
      const startDate = new Date(ano, mNum - 1, 1).toISOString()
      const endDate   = new Date(ano, mNum, 1).toISOString()

      const supIds = sups.map((s) => s.id)

      const { data: pedidosData } = await supabase
        .from('pedidos_materiais')
        .select(`
          id, portal_supervisor_id,
          itens:itens_pedido_material(
            quantidade,
            produto:produtos(preco_unitario)
          )
        `)
        .gte('created_at', startDate)
        .lt('created_at', endDate)
        .in('status', ['Pendente', 'Em Análise', 'Aprovado', 'Em Separação', 'Separado', 'Entregue'])
        .in('portal_supervisor_id', supIds)

      setPedidos((pedidosData ?? []) as unknown as PedidoRaw[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchControle(mes) }, [mes]) // eslint-disable-line

  // Calcular gastos por contrato
  const controleData = useMemo((): ControleContrato[] => {
    // mapa: supId → adm_contrato_id
    const supToContrato = new Map<string, string>()
    const supNome = new Map<string, string>()
    supervisores.forEach((s) => {
      if (s.adm_contrato_id) {
        supToContrato.set(s.id, s.adm_contrato_id)
        supNome.set(s.id, s.nome)
      }
    })

    // gastos e contagem por contrato
    const gastoMap = new Map<string, number>()
    const countMap = new Map<string, number>()

    pedidos.forEach((p) => {
      const contratoId = supToContrato.get(p.portal_supervisor_id ?? '')
      if (!contratoId) return

      const total = (p.itens ?? []).reduce((sum, item) => {
        const preco = item.produto?.preco_unitario ?? 0
        return sum + item.quantidade * preco
      }, 0)

      gastoMap.set(contratoId, (gastoMap.get(contratoId) ?? 0) + total)
      countMap.set(contratoId, (countMap.get(contratoId) ?? 0) + 1)
    })

    // supervisores por contrato
    const supsByContrato = new Map<string, string[]>()
    supervisores.forEach((s) => {
      if (!s.adm_contrato_id) return
      const arr = supsByContrato.get(s.adm_contrato_id) ?? []
      arr.push(s.nome)
      supsByContrato.set(s.adm_contrato_id, arr)
    })

    // só contratos que têm supervisores vinculados
    const contratoIds = new Set(supervisores.map((s) => s.adm_contrato_id).filter(Boolean))
    return contratos
      .filter((c) => c.id && contratoIds.has(c.id))
      .map((c) => ({
        contrato: c,
        orcamento: c.valor_materiais ?? 0,
        gasto: gastoMap.get(c.id!) ?? 0,
        pedidosCount: countMap.get(c.id!) ?? 0,
        supervisoresVinculados: supsByContrato.get(c.id!) ?? [],
      }))
      .sort((a, b) => {
        // déficits primeiro
        const aDeficit = a.gasto > a.orcamento
        const bDeficit = b.gasto > b.orcamento
        if (aDeficit && !bDeficit) return -1
        if (!aDeficit && bDeficit) return 1
        return b.gasto - a.gasto
      })
  }, [supervisores, pedidos, contratos])

  // Totais
  const totalOrcamento  = controleData.reduce((s, c) => s + c.orcamento, 0)
  const totalGasto      = controleData.reduce((s, c) => s + c.gasto, 0)
  const emDeficit       = controleData.filter((c) => c.gasto > c.orcamento && c.orcamento > 0)
  const dentroOrcamento = controleData.filter((c) => c.gasto <= c.orcamento && c.orcamento > 0)
  const semOrcamento    = controleData.filter((c) => c.orcamento === 0)

  // Meses disponíveis (últimos 6)
  const mesesDisponiveis = useMemo(() => {
    const arr: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      arr.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) })
    }
    return arr
  }, [])

  return (
    <div className="space-y-5">

      {/* Seletor de mês */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Controle de Gastos por Contrato</h2>
        </div>
        <select
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        >
          {mesesDisponiveis.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-blue-100 bg-blue-50">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-blue-600 font-medium mb-1">Orçamento Total</p>
            <p className="text-xl font-bold text-blue-800">{fmt(totalOrcamento)}</p>
          </CardContent>
        </Card>
        <Card className={cn('border', totalGasto > totalOrcamento ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50')}>
          <CardContent className="pt-4 pb-3 px-4">
            <p className={cn('text-xs font-medium mb-1', totalGasto > totalOrcamento ? 'text-red-600' : 'text-emerald-600')}>Gasto no Mês</p>
            <p className={cn('text-xl font-bold', totalGasto > totalOrcamento ? 'text-red-800' : 'text-emerald-800')}>{fmt(totalGasto)}</p>
          </CardContent>
        </Card>
        <Card className="border-red-100 bg-red-50">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              <p className="text-xs text-red-600 font-medium">Em Déficit</p>
            </div>
            <p className="text-xl font-bold text-red-800">{emDeficit.length}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-100 bg-emerald-50">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs text-emerald-600 font-medium">Dentro do Orçamento</p>
            </div>
            <p className="text-xl font-bold text-emerald-800">{dentroOrcamento.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de contratos */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Calculando gastos...</span>
        </div>
      ) : controleData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
          <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-medium text-sm">Nenhum contrato com supervisor vinculado</p>
          <p className="text-xs mt-1 text-center max-w-xs">
            Para usar o Controle de Gastos, vincule supervisores aos contratos no módulo Supervisores.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {controleData.map((item) => {
            const { contrato, orcamento, gasto, pedidosCount, supervisoresVinculados } = item
            const percentual = orcamento > 0 ? Math.min((gasto / orcamento) * 100, 100) : 0
            const isDeficit  = gasto > orcamento && orcamento > 0
            const saldo      = orcamento - gasto
            const semOrc     = orcamento === 0
            const isExpanded = expandedId === contrato.id

            return (
              <div
                key={contrato.id}
                className={cn(
                  'border rounded-xl bg-white overflow-hidden transition-shadow hover:shadow-sm',
                  isDeficit ? 'border-red-200' : semOrc ? 'border-amber-200' : 'border-slate-200'
                )}
              >
                {/* Linha principal */}
                <button
                  className="w-full text-left px-5 py-4"
                  onClick={() => setExpandedId(isExpanded ? null : contrato.id!)}
                >
                  <div className="flex items-center gap-4">
                    {/* Ícone status */}
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      isDeficit ? 'bg-red-100' : semOrc ? 'bg-amber-100' : 'bg-emerald-100'
                    )}>
                      {isDeficit
                        ? <AlertTriangle className="w-4 h-4 text-red-600" />
                        : semOrc
                          ? <Package className="w-4 h-4 text-amber-600" />
                          : <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      }
                    </div>

                    {/* Info contrato */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-slate-900 truncate">{contrato.nome}</p>
                        <span className="text-xs text-slate-400 truncate">{contrato.cliente_nome}</span>
                        {isDeficit && (
                          <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                            DÉFICIT
                          </span>
                        )}
                        {semOrc && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                            SEM ORÇAMENTO
                          </span>
                        )}
                      </div>

                      {/* Barra de progresso */}
                      {!semOrc && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all', isDeficit ? 'bg-red-500' : 'bg-emerald-500')}
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-slate-500 w-10 text-right">
                            {percentual.toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Valores */}
                    <div className="hidden sm:flex items-center gap-8 text-right shrink-0">
                      <div>
                        <p className="text-xs text-slate-400">Orçamento</p>
                        <p className="text-sm font-semibold text-slate-700">{fmt(orcamento)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Gasto</p>
                        <p className={cn('text-sm font-semibold', isDeficit ? 'text-red-600' : 'text-emerald-600')}>
                          {fmt(gasto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Saldo</p>
                        <p className={cn('text-sm font-bold', saldo < 0 ? 'text-red-700' : 'text-emerald-700')}>
                          {fmt(Math.abs(saldo))} {saldo < 0 ? '▲' : '▼'}
                        </p>
                      </div>
                    </div>

                    {/* Expand */}
                    <div className="shrink-0 text-slate-400 ml-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Detalhe expandido */}
                {isExpanded && (
                  <div className="border-t border-slate-100 px-5 py-4 bg-slate-50 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Pedidos no mês</p>
                      <p className="text-lg font-bold text-slate-800">{pedidosCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Orçamento mensal</p>
                      <p className="text-lg font-bold text-blue-700">{fmt(orcamento)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Total gasto</p>
                      <p className={cn('text-lg font-bold', isDeficit ? 'text-red-700' : 'text-emerald-700')}>{fmt(gasto)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">Supervisores</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {supervisoresVinculados.map((s) => (
                          <span key={s} className="text-xs bg-white border border-slate-200 rounded px-1.5 py-0.5 text-slate-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Aviso de valores sem preço */}
                    {pedidosCount > 0 && gasto === 0 && (
                      <div className="col-span-2 md:col-span-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                          Existem pedidos neste mês, mas os produtos não têm preço unitário cadastrado. Cadastre o preço dos produtos no módulo de Estoque para calcular os gastos.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {semOrcamento.length > 0 && (
            <p className="text-xs text-slate-400 text-center pt-1">
              {semOrcamento.length} contrato(s) sem orçamento de materiais definido.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ContratosPage() {
  const { user } = useAuth()
  const isLogistica = user?.role === 'logistica'

  // ── Estado: contratos normais (não-logistica) ────────────────────────────
  const [allContracts, setAllContracts]     = useState<ContractRecord[]>([])
  const [open, setOpen]                     = useState(false)
  const [selected, setSelected]             = useState<ContractRecord | null>(null)
  const [deletingId, setDeletingId]         = useState<string | null>(null)

  // ── Estado: contratos ADM (logistica) ────────────────────────────────────
  const [admContratos, setAdmContratos]     = useState<AdmContrato[]>([])

  // ── Estado compartilhado ─────────────────────────────────────────────────
  const [search, setSearch]                 = useState('')
  const [statusFilter, setStatusFilter]     = useState<StatusFilter>('Todos')
  const [loading, setLoading]               = useState(true)

  const loadAll = async () => {
    setLoading(true)
    try {
      if (isLogistica) {
        const data = await fetchAdmContratos()
        setAdmContratos(data)
      } else {
        const data = await fetchContracts()
        setAllContracts(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadAll()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // ─── Filtragem ─────────────────────────────────────────────────────────────

  const admFiltrados = admContratos.filter((c) => {
    const term = search.trim().toLowerCase()
    const matchSearch =
      !term ||
      c.nome?.toLowerCase().includes(term) ||
      c.cliente_nome?.toLowerCase().includes(term) ||
      c.codigo?.toLowerCase().includes(term) ||
      c.responsavel?.toLowerCase().includes(term)
    const admStatus =
      c.status === 'ativo'    ? 'Ativo'    :
      c.status === 'suspenso' ? 'Suspenso' :
      c.status === 'encerrado'? 'Encerrado': 'Todos'
    const matchStatus = statusFilter === 'Todos' || admStatus === statusFilter
    return matchSearch && matchStatus
  })

  const contractsFiltrados = allContracts.filter((c) => {
    const term = search.trim().toLowerCase()
    const matchSearch =
      !term ||
      c.nome?.toLowerCase().includes(term) ||
      c.cidade?.toLowerCase().includes(term) ||
      c.estado?.toLowerCase().includes(term) ||
      c.cnpj?.toLowerCase().includes(term) ||
      c.responsavel?.toLowerCase().includes(term)
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const filtered    = isLogistica ? admFiltrados    : contractsFiltrados
  const totalSource = isLogistica ? admContratos.length : allContracts.length

  const hasActiveFilter = search.trim() !== '' || statusFilter !== 'Todos'
  const clearFilters    = () => { setSearch(''); setStatusFilter('Todos') }

  const handleDelete = async (c: ContractRecord) => {
    if (!c.id) return
    if (!confirm(`Excluir o contrato "${c.nome}"?`)) return
    setDeletingId(String(c.id))
    const ok = await deleteContract(String(c.id))
    setDeletingId(null)
    if (ok) setAllContracts((prev) => prev.filter((x) => x.id !== c.id))
    else alert('Erro ao excluir contrato.')
  }

  // ─── Render logistica ──────────────────────────────────────────────────────

  if (isLogistica) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Contratos</h1>
            <p className="text-gray-600 mt-1">Contratos ativos — controle de custo de materiais</p>
          </div>
        </div>

        {/* Banner */}
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
          <Lock className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-sm text-blue-800">
            Modo <strong>visualização</strong> — apenas o <strong>custo de materiais</strong> e o
            <strong> controle de gastos</strong> de cada contrato estão disponíveis.
          </p>
        </div>

        <Tabs defaultValue="contratos">
          <TabsList className="mb-2">
            <TabsTrigger value="contratos">Contratos</TabsTrigger>
            <TabsTrigger value="controle">Controle de Gastos</TabsTrigger>
          </TabsList>

          {/* ── Aba Contratos ── */}
          <TabsContent value="contratos">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Contratos{' '}
                    {!loading && (
                      <span className="text-sm font-normal text-gray-500">
                        ({filtered.length}{hasActiveFilter ? ` de ${totalSource}` : ''})
                      </span>
                    )}
                  </span>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        className="border rounded pl-7 pr-3 py-1 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        placeholder="Nome, cliente, código…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                      <option value="Todos">Todos os status</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Suspenso">Suspenso</option>
                      <option value="Encerrado">Encerrado</option>
                    </select>
                    {hasActiveFilter && (
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                        <X className="w-3.5 h-3.5 mr-1" />Limpar
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Carregando contratos...</span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <FileX className="w-12 h-12 mb-3" />
                    {hasActiveFilter ? (
                      <>
                        <p className="text-sm font-medium">Nenhum contrato corresponde ao filtro</p>
                        <button className="text-xs mt-2 text-blue-500 underline" onClick={clearFilters}>Limpar filtros</button>
                      </>
                    ) : (
                      <p className="text-sm font-medium">Nenhum contrato ADM cadastrado</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(filtered as AdmContrato[]).map((c) => (
                      <AdmContratoCard key={c.id} c={c} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Aba Controle ── */}
          <TabsContent value="controle">
            <Card>
              <CardContent className="pt-6">
                <ControleGastosTab contratos={admContratos} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // ─── Render padrão (não-logistica) ────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Contratos</h1>
          <p className="text-gray-600 mt-1">Relação e análise de contratos ativos</p>
        </div>
        <div className="flex gap-3">
          <ContractsImportExport onImported={loadAll} rowsForExport={allContracts} />
          <Button onClick={() => { setSelected(null); setOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" />Novo Contrato
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Contratos{' '}
              {!loading && (
                <span className="text-sm font-normal text-gray-500">
                  ({filtered.length}{hasActiveFilter ? ` de ${totalSource}` : ''})
                </span>
              )}
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  className="border rounded pl-7 pr-3 py-1 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Nome, cidade, CNPJ…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              >
                <option value="Todos">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Suspenso">Suspenso</option>
                <option value="Encerrado">Encerrado</option>
              </select>
              {hasActiveFilter && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500">
                  <X className="w-3.5 h-3.5 mr-1" />Limpar
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Carregando contratos...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileX className="w-12 h-12 mb-3" />
              {hasActiveFilter ? (
                <>
                  <p className="text-sm font-medium">Nenhum contrato corresponde ao filtro</p>
                  <button className="text-xs mt-2 text-blue-500 underline" onClick={clearFilters}>Limpar filtros</button>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">Nenhum contrato cadastrado</p>
                  <p className="text-xs mt-1">Clique em "Novo Contrato" para cadastrar o primeiro.</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(filtered as ContractRecord[]).map((c) => (
                <div key={c.id ?? c.nome} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-medium text-sm">{c.nome}</span>
                    </div>
                    {c.status && (
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                        c.status === 'Ativo'    ? 'bg-green-100 text-green-700'   :
                        c.status === 'Suspenso' ? 'bg-yellow-100 text-yellow-700' :
                                                  'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status}
                      </span>
                    )}
                  </div>
                  {(c.cidade || c.estado) && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{[c.cidade, c.estado].filter(Boolean).join(' / ')}</span>
                    </div>
                  )}
                  {c.responsavel && (
                    <p className="text-xs text-gray-500 mt-1">Resp.: {c.responsavel}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => { setSelected(c); setOpen(true) }}>
                      <Edit className="w-3 h-3 mr-1" />Editar
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={deletingId === String(c.id)}
                      onClick={() => handleDelete(c)}
                    >
                      {deletingId === String(c.id)
                        ? <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        : <Trash2 className="w-3 h-3 mr-1" />}
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ContractDialog open={open} onClose={() => setOpen(false)} contract={selected} onSaved={loadAll} />
    </div>
  )
}

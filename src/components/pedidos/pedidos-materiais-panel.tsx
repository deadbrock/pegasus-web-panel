'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  ExternalLink,
  Filter,
  Loader2,
  Package,
  PackageCheck,
  PackageSearch,
  Route,
  Search,
  ShieldAlert,
  Trash2,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import { CriarRotaDialog } from '@/components/rastreamento/criar-rota-dialog'
import { criarRotaMinima } from '@/lib/services/rotas-service'
import {
  aprovarPedidoMaterial,
  calcularStatsPedidos,
  cancelarPedidoMaterial,
  fetchPedidosMateriais,
  rejeitarPedidoMaterial,
  SUPERVISOR_ROLES,
  STATUS_COLORS,
  STATUS_LABELS,
  URGENCIA_COLORS,
  updateStatusPedidoMaterial,
  type PedidoMaterial,
  type PedidoMaterialStatus,
} from '@/services/pedidosMateriaisService'

// ─── Status options para o filtro ────────────────────────────────────────────
const STATUS_ALL = 'todos' as const
const STATUS_OPTIONS: (PedidoMaterialStatus | typeof STATUS_ALL)[] = [
  STATUS_ALL,
  'Aguardando Validação',
  'Pendente',
  'Em Análise',
  'Aprovado',
  'Rejeitado',
  'Em Separação',
  'Separado',
  'Entregue',
  'Cancelado',
]

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PedidoMaterialStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Card de Pedido ───────────────────────────────────────────────────────────
function PedidoCard({
  pedido, canManage, onAction, onExpand, expanded, actionLoading,
}: {
  pedido: PedidoMaterial
  canManage: boolean
  onAction: (p: PedidoMaterial, acao: string) => void
  onExpand: (id: string) => void
  expanded: boolean
  actionLoading: boolean
}) {
  const itens = pedido.itens?.length ?? 0
  const isPortalOrder = !!pedido.portal_supervisor_id

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-opacity', actionLoading && 'opacity-60 pointer-events-none')}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
        onClick={() => onExpand(pedido.id)}
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-900">{pedido.numero_pedido}</p>
              {isPortalOrder && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-1.5 py-0.5">
                  <ExternalLink className="w-2.5 h-2.5" />Portal
                </span>
              )}
            </div>
            <StatusBadge status={pedido.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{pedido.solicitante_nome}</p>
          {pedido.solicitante_setor && <p className="text-xs text-slate-400 truncate">{pedido.solicitante_setor}</p>}
          {pedido.supervisor_nome && (
            <p className="text-xs text-slate-400 truncate">Supervisor: {pedido.supervisor_nome}</p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', URGENCIA_COLORS[pedido.urgencia])}>
              {pedido.urgencia}
            </span>
            <span className="text-xs text-slate-400">{itens} item{itens !== 1 ? 's' : ''}</span>
            <span className="text-xs text-slate-400">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-1', expanded && 'rotate-180')} />
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {(pedido.itens?.length ?? 0) > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens solicitados</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {pedido.itens!.map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-center justify-between px-3 py-2.5 bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.produto_nome}</p>
                      <p className="text-xs text-slate-400">{item.produto_codigo} · {item.unidade}</p>
                      {item.observacoes && <p className="text-xs text-slate-400 italic">{item.observacoes}</p>}
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-bold text-slate-900">{item.quantidade}</p>
                      <p className="text-[10px] text-slate-400">{item.unidade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pedido.observacoes && (
            <div className="px-4 pb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observações</p>
              <p className="text-sm text-slate-600">{pedido.observacoes}</p>
            </div>
          )}

          {pedido.motivo_rejeicao && (
            <div className="mx-4 mb-3 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Motivo da rejeição</p>
                <p className="text-xs text-rose-600">{pedido.motivo_rejeicao}</p>
              </div>
            </div>
          )}

          {pedido.aprovado_por && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-400">
                {pedido.status === 'Rejeitado' ? 'Rejeitado' : 'Aprovado'} por:{' '}
                <span className="font-medium text-slate-600">{pedido.aprovado_por}</span>
              </p>
            </div>
          )}

          {/* Ações — fluxo completo no sistema principal */}
          <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
            {pedido.status === 'Aguardando Validação' && (
              <div className="w-full flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <p className="text-xs text-yellow-800">Aguardando validação do supervisor no Portal Operacional</p>
              </div>
            )}
            {canManage && pedido.status === 'Pendente' && (
              <>
                <button onClick={() => onAction(pedido, 'em-analise')}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  <ShieldAlert className="w-3.5 h-3.5" />Em Análise
                </button>
                <button onClick={() => onAction(pedido, 'cancelar')}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />Cancelar
                </button>
              </>
            )}
            {canManage && pedido.status === 'Em Análise' && (
              <>
                <button onClick={() => onAction(pedido, 'aprovar')}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />Aprovar
                </button>
                <button onClick={() => onAction(pedido, 'rejeitar')}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />Rejeitar
                </button>
              </>
            )}
            {canManage && pedido.status === 'Aprovado' && (
              <button onClick={() => onAction(pedido, 'separacao')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors">
                <Package className="w-3.5 h-3.5" />Iniciar Separação
              </button>
            )}
            {canManage && pedido.status === 'Em Separação' && (
              <button onClick={() => onAction(pedido, 'separado')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                <PackageCheck className="w-3.5 h-3.5" />Marcar Separado
                <Route className="w-3 h-3 opacity-70" />
              </button>
            )}
            {canManage && pedido.status === 'Separado' && (
              <div className="w-full flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                <Route className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <p className="text-xs text-indigo-800">
                  Pedido separado. Acesse <span className="font-semibold">Rastreamento → Rotas</span> para criar a rota de entrega e vincular motorista/veículo.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dialog: Rejeitar ─────────────────────────────────────────────────────────
function RejeitarDialog({ pedido, userName, onClose, onRejeitado }: {
  pedido: PedidoMaterial | null
  userName: string
  onClose: () => void
  onRejeitado: () => void
}) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleRejeitar() {
    if (!pedido) return
    setSaving(true)
    await rejeitarPedidoMaterial(pedido.id, motivo, userName)
    setSaving(false)
    onRejeitado()
    onClose()
  }

  return (
    <Dialog open={!!pedido} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-700">
            <XCircle className="w-5 h-5" />Rejeitar Pedido
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            Informe o motivo para <span className="font-semibold">{pedido?.numero_pedido}</span>.
          </p>
          <div className="space-y-1">
            <Label>Motivo</Label>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Explique o motivo..." />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleRejeitar} disabled={saving} className="bg-rose-600 hover:bg-rose-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Rejeitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Painel Principal ─────────────────────────────────────────────────────────
export function PedidosMateriaisPanel() {
  const { user } = useAuth()
  const canManage = SUPERVISOR_ROLES.includes(user?.role ?? '')

  const [pedidos, setPedidos] = useState<PedidoMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<PedidoMaterialStatus | typeof STATUS_ALL>(STATUS_ALL)
  const [search, setSearch] = useState('')
  const [apenasUrgentes, setApenasUrgentes] = useState(false)
  const [pedidoParaRejeitar, setPedidoParaRejeitar] = useState<PedidoMaterial | null>(null)
  const [pedidoParaRota, setPedidoParaRota] = useState<PedidoMaterial | null>(null)
  const [rotaIdParaEditar, setRotaIdParaEditar] = useState<string | undefined>(undefined)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await fetchPedidosMateriais()
      setPedidos(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setFetchError(msg)
      console.error('[PedidosMateriaisPanel] load error:', msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => calcularStatsPedidos(pedidos), [pedidos])

  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos
    if (filterStatus !== STATUS_ALL) lista = lista.filter((p) => p.status === filterStatus)
    if (apenasUrgentes) lista = lista.filter((p) => p.urgencia === 'Alta' || p.urgencia === 'Urgente')
    if (search.trim()) {
      const q = search.toLowerCase()
      lista = lista.filter((p) =>
        p.numero_pedido.toLowerCase().includes(q) ||
        p.solicitante_nome.toLowerCase().includes(q) ||
        p.solicitante_setor?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [pedidos, filterStatus, apenasUrgentes, search])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleAction(pedido: PedidoMaterial, acao: string) {
    if (acao === 'rejeitar') { setPedidoParaRejeitar(pedido); return }

    // Quando marcar como Separado: atualiza status, cria rota mínima e abre dialog
    if (acao === 'separado') {
      setActionLoading(pedido.id)
      try {
        await updateStatusPedidoMaterial(pedido.id, 'Separado')
        // Cria placeholder em rotas_entrega — pedido já aparece em Rastreamento
        const prioridadeRota =
          pedido.urgencia === 'Urgente' ? 'Urgente' :
          pedido.urgencia === 'Alta'    ? 'Alta'    : 'Normal'
        const rota = await criarRotaMinima(pedido.id, prioridadeRota)
        await load()
        setRotaIdParaEditar(rota.id)
        setPedidoParaRota(pedido)
      } catch (err) {
        console.error('[PedidosMateriaisPanel] erro ao separar pedido:', err)
        // Mesmo com erro na rota, a separação foi feita — recarrega
        await load()
      } finally {
        setActionLoading(null)
      }
      return
    }

    setActionLoading(pedido.id)
    const map: Record<string, () => Promise<boolean>> = {
      'em-analise': () => updateStatusPedidoMaterial(pedido.id, 'Em Análise'),
      'aprovar':    () => aprovarPedidoMaterial(pedido.id, user?.name ?? 'Sistema'),
      'separacao':  () => updateStatusPedidoMaterial(pedido.id, 'Em Separação'),
      'cancelar':   () => cancelarPedidoMaterial(pedido.id),
    }
    const fn = map[acao]
    if (fn) { await fn(); await load() }
    setActionLoading(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <PackageSearch className="w-5 h-5 text-blue-600" />
            Pedidos de Materiais — Portal Operacional
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Pedidos criados pelos encarregados via portal e validados pelos supervisores.
            Gerencie o fluxo completo aqui.
          </p>
        </div>
        <a href="/operacional" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs whitespace-nowrap">
            <ExternalLink className="w-3.5 h-3.5" />Abrir Portal
          </Button>
        </a>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total',         value: stats.total,      color: 'text-slate-700' },
          { label: 'Ag. Validação', value: pedidos.filter((p) => p.status === 'Aguardando Validação').length, color: 'text-yellow-700' },
          { label: 'Pendentes',     value: stats.pendentes,  color: 'text-amber-600' },
          { label: 'Em Análise',    value: stats.emAnalise,  color: 'text-blue-600' },
          { label: 'Entregues',     value: stats.entregues,  color: 'text-green-600' },
          { label: 'Rejeitados',    value: stats.rejeitados, color: 'text-rose-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm">
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Banner de erro de carregamento */}
      {fetchError && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-rose-800">Erro ao carregar pedidos</p>
            <p className="text-xs text-rose-700 mt-0.5 break-all">{fetchError}</p>
            <p className="text-xs text-rose-600 mt-1">
              Verifique se o script <code className="bg-rose-100 px-1 rounded">portal_operacional.sql</code> foi executado no Supabase.
            </p>
          </div>
          <button onClick={load} className="text-xs text-rose-700 underline whitespace-nowrap">Tentar novamente</button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input className="pl-9" placeholder="Buscar por número, solicitante ou setor..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as PedidoMaterialStatus | typeof STATUS_ALL)}>
            <SelectTrigger className="sm:w-52">
              <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === STATUS_ALL ? 'Todos os status' : STATUS_LABELS[s as PedidoMaterialStatus]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="urg-pm" checked={apenasUrgentes} onCheckedChange={setApenasUrgentes} />
          <Label htmlFor="urg-pm" className="text-sm cursor-pointer">Apenas Alta prioridade / Urgentes</Label>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
          <p className="text-slate-500">Carregando pedidos...</p>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <ClipboardList className="w-7 h-7 text-blue-300" />
          </div>
          <p className="text-slate-800 font-semibold">Nenhum pedido encontrado</p>
          <p className="text-slate-400 text-sm mt-1">
            {search || filterStatus !== STATUS_ALL || apenasUrgentes
              ? 'Tente ajustar os filtros.'
              : 'Os pedidos feitos no Portal Operacional aparecerão aqui após a validação do supervisor.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidosFiltrados.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              canManage={canManage}
              onAction={handleAction}
              onExpand={toggleExpand}
              expanded={expandedIds.has(pedido.id)}
              actionLoading={actionLoading === pedido.id}
            />
          ))}
          <p className="text-xs text-center text-slate-400 pb-4">
            {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} exibido{pedidosFiltrados.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <RejeitarDialog
        pedido={pedidoParaRejeitar}
        userName={user?.name ?? 'Sistema'}
        onClose={() => setPedidoParaRejeitar(null)}
        onRejeitado={load}
      />

      {/* Dialog de rota — abre após marcar como Separado */}
      <CriarRotaDialog
        open={!!pedidoParaRota}
        onClose={() => { setPedidoParaRota(null); setRotaIdParaEditar(undefined) }}
        rotaExistenteId={rotaIdParaEditar}
        pedido={pedidoParaRota ? {
          id: pedidoParaRota.id,
          numero_pedido: pedidoParaRota.numero_pedido,
          supervisor_nome: pedidoParaRota.supervisor_nome ?? pedidoParaRota.solicitante_nome,
          contrato_nome: pedidoParaRota.solicitante_setor ?? undefined,
          urgencia: pedidoParaRota.urgencia,
          tipo: 'materiais',
        } : null}
        onSuccess={() => { setPedidoParaRota(null); setRotaIdParaEditar(undefined) }}
      />
    </div>
  )
}

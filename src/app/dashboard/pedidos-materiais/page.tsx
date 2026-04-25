'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Filter,
  Loader2,
  Package,
  PackageCheck,
  PackageSearch,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'
import {
  aprovarPedidoMaterial,
  calcularStatsPedidos,
  cancelarPedidoMaterial,
  createPedidoMaterial,
  fetchPedidosMateriais,
  rejeitarPedidoMaterial,
  SUPERVISOR_ROLES,
  STATUS_COLORS,
  STATUS_LABELS,
  URGENCIA_COLORS,
  updateStatusPedidoMaterial,
  type ItemPedidoMaterial,
  type PedidoMaterial,
  type PedidoMaterialStatus,
  type PedidoMaterialUrgencia,
} from '@/services/pedidosMateriaisService'
import { fetchProdutos, type Produto } from '@/lib/services/produtos-service'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface CarrinhoItem extends Omit<ItemPedidoMaterial, 'id' | 'pedido_id'> {
  _key: string
}

interface FormState {
  solicitante_nome: string
  solicitante_email: string
  solicitante_setor: string
  urgencia: PedidoMaterialUrgencia
  observacoes: string
}

const STATUS_ALL = 'todos' as const
const STATUS_OPTIONS: (PedidoMaterialStatus | typeof STATUS_ALL)[] = [
  STATUS_ALL,
  'Pendente',
  'Em Análise',
  'Aprovado',
  'Rejeitado',
  'Em Separação',
  'Separado',
  'Entregue',
  'Cancelado',
]

// ─── Componente Badge de Status ───────────────────────────────────────────────
function StatusBadge({ status }: { status: PedidoMaterialStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Componente Card de Pedido (mobile-first) ─────────────────────────────────
function PedidoCard({
  pedido,
  isSupervisor,
  onAction,
  onExpand,
  expanded,
}: {
  pedido: PedidoMaterial
  isSupervisor: boolean
  onAction: (pedido: PedidoMaterial, acao: string) => void
  onExpand: (id: string) => void
  expanded: boolean
}) {
  const itensCount = pedido.itens?.length ?? 0

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header do card */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => onExpand(pedido.id)}
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">
              {pedido.numero_pedido}
            </p>
            <StatusBadge status={pedido.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{pedido.solicitante_nome}</p>
          {pedido.solicitante_setor && (
            <p className="text-xs text-slate-400 truncate">{pedido.solicitante_setor}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold',
                URGENCIA_COLORS[pedido.urgencia]
              )}
            >
              {pedido.urgencia}
            </span>
            <span className="text-xs text-slate-400">
              {itensCount} item{itensCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(pedido.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-1',
            expanded && 'rotate-180'
          )}
        />
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* Itens */}
          {(pedido.itens?.length ?? 0) > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens solicitados</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {pedido.itens!.map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-center justify-between px-3 py-2.5 bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.produto_nome}</p>
                      <p className="text-xs text-slate-400">{item.produto_codigo} · {item.unidade}</p>
                      {item.observacoes && (
                        <p className="text-xs text-slate-400 italic">{item.observacoes}</p>
                      )}
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

          {/* Observações */}
          {pedido.observacoes && (
            <div className="px-4 pb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observações</p>
              <p className="text-sm text-slate-600">{pedido.observacoes}</p>
            </div>
          )}

          {/* Motivo rejeição */}
          {pedido.motivo_rejeicao && (
            <div className="mx-4 mb-3 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Motivo da rejeição</p>
                <p className="text-xs text-rose-600">{pedido.motivo_rejeicao}</p>
              </div>
            </div>
          )}

          {/* Aprovador */}
          {pedido.aprovado_por && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-400">
                {pedido.status === 'Rejeitado' ? 'Rejeitado' : 'Aprovado'} por:{' '}
                <span className="font-medium text-slate-600">{pedido.aprovado_por}</span>
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
            {isSupervisor && pedido.status === 'Pendente' && (
              <>
                <button
                  onClick={() => onAction(pedido, 'em-analise')}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Em Análise
                </button>
              </>
            )}
            {isSupervisor && pedido.status === 'Em Análise' && (
              <>
                <button
                  onClick={() => onAction(pedido, 'aprovar')}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Aprovar
                </button>
                <button
                  onClick={() => onAction(pedido, 'rejeitar')}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Rejeitar
                </button>
              </>
            )}
            {isSupervisor && pedido.status === 'Aprovado' && (
              <button
                onClick={() => onAction(pedido, 'separacao')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                <Package className="w-3.5 h-3.5" />
                Iniciar Separação
              </button>
            )}
            {isSupervisor && pedido.status === 'Em Separação' && (
              <button
                onClick={() => onAction(pedido, 'separado')}
                className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Marcar Separado
              </button>
            )}
            {isSupervisor && pedido.status === 'Separado' && (
              <button
                onClick={() => onAction(pedido, 'entregar')}
                className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                Entregar
              </button>
            )}
            {['Pendente', 'Em Análise'].includes(pedido.status) && (
              <button
                onClick={() => onAction(pedido, 'cancelar')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Diálogo Novo Pedido ──────────────────────────────────────────────────────
function NovoPedidoDialog({
  open,
  onClose,
  onSaved,
  user,
}: {
  open: boolean
  onClose: () => void
  onSaved: (pedido: PedidoMaterial) => void
  user: { name?: string; email?: string; role?: string } | null
}) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [searchProduto, setSearchProduto] = useState('')
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>({
    solicitante_nome: user?.name ?? '',
    solicitante_email: user?.email ?? '',
    solicitante_setor: '',
    urgencia: 'Baixa',
    observacoes: '',
  })

  useEffect(() => {
    if (!open) return
    setLoadingProdutos(true)
    fetchProdutos()
      .then((data) => setProdutos(data.filter((p) => p.status === 'Ativo')))
      .catch(() => setProdutos([]))
      .finally(() => setLoadingProdutos(false))
  }, [open])

  const produtosFiltrados = useMemo(() => {
    const q = searchProduto.toLowerCase().trim()
    if (!q) return produtos
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q)
    )
  }, [produtos, searchProduto])

  function adicionarProduto(produto: Produto) {
    const key = `${produto.id}-${Date.now()}`
    setCarrinho((prev) => [
      ...prev,
      {
        _key: key,
        produto_id: produto.id ?? null,
        produto_codigo: produto.codigo,
        produto_nome: produto.nome,
        unidade: produto.unidade,
        quantidade: 1,
        observacoes: '',
      },
    ])
  }

  function removerItem(key: string) {
    setCarrinho((prev) => prev.filter((i) => i._key !== key))
  }

  function updateItem(key: string, field: keyof CarrinhoItem, value: unknown) {
    setCarrinho((prev) =>
      prev.map((item) => (item._key === key ? { ...item, [field]: value } : item))
    )
  }

  async function handleSubmit() {
    if (!form.solicitante_nome.trim()) {
      setError('Informe o nome do solicitante.')
      return
    }
    if (carrinho.length === 0) {
      setError('Adicione pelo menos um item ao pedido.')
      return
    }
    if (carrinho.some((i) => !i.quantidade || i.quantidade <= 0)) {
      setError('Quantidade deve ser maior que zero para todos os itens.')
      return
    }

    setSaving(true)
    setError(null)

    const resultado = await createPedidoMaterial(
      {
        solicitante_nome: form.solicitante_nome.trim(),
        solicitante_email: form.solicitante_email.trim() || null,
        solicitante_setor: form.solicitante_setor.trim() || null,
        urgencia: form.urgencia,
        status: 'Pendente',
        observacoes: form.observacoes.trim() || null,
      },
      carrinho.map(({ _key: _k, ...item }) => item)
    )

    setSaving(false)

    if (!resultado) {
      setError('Não foi possível criar o pedido. Tente novamente.')
      return
    }

    onSaved(resultado)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <PackageSearch className="w-5 h-5 text-blue-600" />
            Novo Pedido de Material
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          {/* Dados do solicitante */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dados do Solicitante</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={form.solicitante_nome}
                  onChange={(e) => setForm((p) => ({ ...p, solicitante_nome: e.target.value }))}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.solicitante_email}
                  onChange={(e) => setForm((p) => ({ ...p, solicitante_email: e.target.value }))}
                  placeholder="seuemail@empresa.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="setor">Setor / Contrato</Label>
                <Input
                  id="setor"
                  value={form.solicitante_setor}
                  onChange={(e) => setForm((p) => ({ ...p, solicitante_setor: e.target.value }))}
                  placeholder="Ex.: Limpeza — Contrato XYZ"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="urgencia">Urgência</Label>
                <Select
                  value={form.urgencia}
                  onValueChange={(v) => setForm((p) => ({ ...p, urgencia: v as PedidoMaterialUrgencia }))}
                >
                  <SelectTrigger id="urgencia">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['Baixa', 'Média', 'Alta', 'Urgente'] as PedidoMaterialUrgencia[]).map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="obs">Observações</Label>
              <textarea
                id="obs"
                value={form.observacoes}
                onChange={(e) => setForm((p) => ({ ...p, observacoes: e.target.value }))}
                className="w-full min-h-[72px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Informações adicionais sobre o pedido..."
              />
            </div>
          </div>

          {/* Catálogo de produtos */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecionar Produtos</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, código ou categoria..."
                value={searchProduto}
                onChange={(e) => setSearchProduto(e.target.value)}
              />
            </div>

            {loadingProdutos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                <p className="text-sm text-slate-500">Carregando produtos...</p>
              </div>
            ) : produtosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <PackageSearch className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Nenhum produto encontrado</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-slate-100 p-2 bg-slate-50">
                {produtosFiltrados.map((produto) => {
                  const semEstoque = produto.estoque_atual <= 0
                  const estoquesBaixo = produto.estoque_atual <= produto.estoque_minimo
                  return (
                    <div
                      key={produto.id}
                      className={cn(
                        'flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white border transition-all',
                        semEstoque
                          ? 'border-rose-100 opacity-70'
                          : 'border-slate-200 hover:border-blue-300 hover:shadow-sm'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{produto.nome}</p>
                        <p className="text-xs text-slate-400">
                          {produto.codigo} · {produto.categoria}
                        </p>
                        <p className={cn('text-xs font-medium', semEstoque ? 'text-rose-500' : estoquesBaixo ? 'text-amber-600' : 'text-emerald-600')}>
                          Estoque: {produto.estoque_atual} {produto.unidade}
                          {semEstoque ? ' · Sem estoque' : estoquesBaixo ? ' · Estoque baixo' : ''}
                        </p>
                      </div>
                      <button
                        disabled={semEstoque}
                        onClick={() => adicionarProduto(produto)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Carrinho */}
          {carrinho.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Itens do Pedido ({carrinho.length})
              </p>
              <div className="space-y-2">
                {carrinho.map((item) => (
                  <div
                    key={item._key}
                    className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.produto_nome}</p>
                      <p className="text-xs text-slate-400">{item.produto_codigo}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) =>
                          updateItem(item._key, 'quantidade', Math.max(1, Number(e.target.value)))
                        }
                        className="w-16 text-center text-sm rounded-lg border border-slate-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-400 w-8 truncate">{item.unidade}</span>
                      <button
                        onClick={() => removerItem(item._key)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 px-5 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={saving || carrinho.length === 0}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {saving ? 'Enviando...' : 'Enviar Pedido'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Diálogo de Rejeição ──────────────────────────────────────────────────────
function RejeitarDialog({
  pedido,
  onClose,
  onRejeitado,
  user,
}: {
  pedido: PedidoMaterial | null
  onClose: () => void
  onRejeitado: () => void
  user: { name?: string } | null
}) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleRejeitar() {
    if (!pedido) return
    setSaving(true)
    await rejeitarPedidoMaterial(pedido.id, motivo, user?.name ?? 'Supervisor')
    setSaving(false)
    onRejeitado()
    onClose()
  }

  return (
    <Dialog open={!!pedido} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-700">
            <XCircle className="w-5 h-5" />
            Rejeitar Pedido
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">
            Informe o motivo da rejeição do pedido{' '}
            <span className="font-semibold">{pedido?.numero_pedido}</span>.
          </p>
          <div className="space-y-1">
            <Label htmlFor="motivo">Motivo *</Label>
            <textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Explique o motivo da rejeição..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleRejeitar}
            disabled={saving || !motivo.trim()}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Rejeitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function PedidosMateriaisPage() {
  const { user } = useAuth()
  const isSupervisor = SUPERVISOR_ROLES.includes(user?.role ?? '')

  const [pedidos, setPedidos] = useState<PedidoMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [novoPedidoOpen, setNovoPedidoOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<PedidoMaterialStatus | typeof STATUS_ALL>(STATUS_ALL)
  const [search, setSearch] = useState('')
  const [apenasUrgentes, setApenasUrgentes] = useState(false)
  const [pedidoParaRejeitar, setPedidoParaRejeitar] = useState<PedidoMaterial | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchPedidosMateriais()
    setPedidos(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const stats = useMemo(() => calcularStatsPedidos(pedidos), [pedidos])

  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos
    if (filterStatus !== STATUS_ALL) lista = lista.filter((p) => p.status === filterStatus)
    if (apenasUrgentes) lista = lista.filter((p) => p.urgencia === 'Alta' || p.urgencia === 'Urgente')
    if (search.trim()) {
      const q = search.toLowerCase()
      lista = lista.filter(
        (p) =>
          p.numero_pedido.toLowerCase().includes(q) ||
          p.solicitante_nome.toLowerCase().includes(q) ||
          p.solicitante_setor?.toLowerCase().includes(q)
      )
    }
    return lista
  }, [pedidos, filterStatus, apenasUrgentes, search])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleAction(pedido: PedidoMaterial, acao: string) {
    setActionLoading(pedido.id)

    if (acao === 'rejeitar') {
      setActionLoading(null)
      setPedidoParaRejeitar(pedido)
      return
    }

    const map: Record<string, () => Promise<boolean>> = {
      'em-analise': () => updateStatusPedidoMaterial(pedido.id, 'Em Análise'),
      'aprovar':    () => aprovarPedidoMaterial(pedido.id, user?.name ?? 'Supervisor'),
      'separacao':  () => updateStatusPedidoMaterial(pedido.id, 'Em Separação'),
      'separado':   () => updateStatusPedidoMaterial(pedido.id, 'Separado'),
      'entregar':   () => updateStatusPedidoMaterial(pedido.id, 'Entregue'),
      'cancelar':   () => cancelarPedidoMaterial(pedido.id),
    }

    const fn = map[acao]
    if (fn) {
      await fn()
      await load()
    }
    setActionLoading(null)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-100 mb-3">
              <PackageSearch className="w-3.5 h-3.5" />
              Operações
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Pedidos de Materiais</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isSupervisor
                ? 'Visualize e valide pedidos de materiais da equipe.'
                : 'Solicite materiais do estoque para o seu contrato.'}
            </p>
          </div>
          <Button
            onClick={() => setNovoPedidoOpen(true)}
            className="sm:w-auto w-full flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Pedido
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total',       value: stats.total,      color: 'text-slate-700' },
            { label: 'Pendentes',   value: stats.pendentes,   color: 'text-amber-600' },
            { label: 'Em Análise',  value: stats.emAnalise,  color: 'text-blue-600' },
            { label: 'Aprovados',   value: stats.aprovados,   color: 'text-emerald-600' },
            { label: 'Entregues',   value: stats.entregues,   color: 'text-green-600' },
            { label: 'Rejeitados',  value: stats.rejeitados,  color: 'text-rose-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
              <p className={cn('text-2xl font-bold', color)}>{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por número, solicitante ou setor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(v) => setFilterStatus(v as PedidoMaterialStatus | typeof STATUS_ALL)}
            >
              <SelectTrigger className="sm:w-48 w-full">
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
            <Switch
              id="urgentes"
              checked={apenasUrgentes}
              onCheckedChange={setApenasUrgentes}
            />
            <Label htmlFor="urgentes" className="text-sm cursor-pointer">
              Apenas Alta prioridade / Urgentes
            </Label>
          </div>
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
            <p className="text-slate-500">Carregando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-blue-300" />
            </div>
            <p className="text-slate-800 font-semibold text-lg">Nenhum pedido encontrado</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterStatus !== STATUS_ALL || apenasUrgentes
                ? 'Tente ajustar os filtros.'
                : 'Crie o primeiro pedido de material clicando em "Novo Pedido".'}
            </p>
            {!search && filterStatus === STATUS_ALL && !apenasUrgentes && (
              <Button className="mt-5" onClick={() => setNovoPedidoOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados.map((pedido) => (
              <div key={pedido.id} className={cn(actionLoading === pedido.id && 'opacity-60 pointer-events-none')}>
                <PedidoCard
                  pedido={pedido}
                  isSupervisor={isSupervisor}
                  onAction={handleAction}
                  onExpand={toggleExpand}
                  expanded={expandedIds.has(pedido.id)}
                />
              </div>
            ))}
            <p className="text-xs text-center text-slate-400 py-2">
              {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} exibido{pedidosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NovoPedidoDialog
        open={novoPedidoOpen}
        onClose={() => setNovoPedidoOpen(false)}
        onSaved={(novo) => {
          setPedidos((prev) => [novo, ...prev])
          setExpandedIds((prev) => new Set([...prev, novo.id]))
        }}
        user={user}
      />

      <RejeitarDialog
        pedido={pedidoParaRejeitar}
        onClose={() => setPedidoParaRejeitar(null)}
        onRejeitado={load}
        user={user}
      />
    </div>
  )
}

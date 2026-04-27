'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ExternalLink,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Plus,
  RefreshCw,
  Route,
  Truck as TruckIcon,
  User,
  UserPlus,
  X,
} from 'lucide-react'
import { fetchPedidosMobile, type PedidoMobile } from '@/services/pedidosMobileService'
import { type RotaEntrega } from '@/lib/services/rotas-service'
import { AtribuirRotaDialog } from './atribuir-rota-dialog'
import { CriarRotaDialog } from './criar-rota-dialog'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface RouteHistoryProps {
  selectedVehicle?: any
  /** Rotas já carregadas pela page pai */
  rotas: RotaEntrega[]
  onReload: () => void
}

// ─── Badge de status ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Aguardando Atribuição': 'bg-slate-100 text-slate-700 border-slate-200',
    'Atribuída':             'bg-blue-100 text-blue-800 border-blue-200',
    'Em Rota':               'bg-indigo-500 text-white border-indigo-500',
    'Entregue':              'bg-green-500 text-white border-green-500',
    'Cancelada':             'bg-red-100 text-red-700 border-red-200',
    'Atrasada':              'bg-orange-100 text-orange-700 border-orange-200',
  }
  return (
    <Badge className={cn('text-[11px] font-semibold border', map[status] ?? 'bg-slate-100 text-slate-600')}>
      {status}
    </Badge>
  )
}

// ─── Badge de prioridade ──────────────────────────────────────────────────────

function PrioridadeBadge({ prioridade }: { prioridade: string }) {
  const map: Record<string, string> = {
    'Urgente': 'bg-red-100 text-red-700',
    'Alta':    'bg-orange-100 text-orange-700',
    'Normal':  'bg-blue-50 text-blue-600',
    'Baixa':   'bg-slate-100 text-slate-500',
  }
  return (
    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', map[prioridade] ?? map['Normal'])}>
      {prioridade}
    </span>
  )
}

// ─── Card de rota ──────────────────────────────────────────────────────────────

function RotaCard({
  rota,
  onAtribuir,
}: {
  rota: RotaEntrega
  onAtribuir: (r: RotaEntrega) => void
}) {
  const pedidoRef = (rota as any).pedido ?? (rota as any).pedido_material
  const numeroPedido = pedidoRef?.numero_pedido ?? '—'
  const motoristaLabel = (rota as any).motorista?.nome ?? (rota.motorista_id ? 'Atribuído' : null)
  const veiculoLabel   = (rota as any).veiculo?.placa  ?? (rota.veiculo_id  ? 'Atribuído' : null)
  const paradas: any[] = Array.isArray(rota.paradas) ? rota.paradas : []

  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Route className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="font-semibold text-sm text-slate-800">{rota.numero_rota}</span>
            {numeroPedido !== '—' && (
              <span className="text-xs text-slate-400">· {numeroPedido}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <PrioridadeBadge prioridade={rota.prioridade} />
            <StatusBadge status={rota.status} />
          </div>
        </div>

        {/* Data */}
        <p className="text-xs text-slate-400">
          {new Date(rota.created_at).toLocaleDateString('pt-BR')} às {new Date(rota.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>

        {/* Rota: partida → paradas → entrega */}
        <div className="space-y-1.5">
          {rota.ponto_partida && (
            <div className="flex items-start gap-2">
              <Navigation className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Partida</p>
                <p className="text-sm font-medium text-slate-700">{rota.ponto_partida}</p>
              </div>
            </div>
          )}

          {paradas.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="w-3.5 flex-shrink-0 mt-1 flex flex-col items-center gap-0.5">
                {paradas.map((_: any, i: number) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 block" />
                ))}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                  {paradas.length} parada{paradas.length > 1 ? 's' : ''}
                </p>
                {paradas.map((p: any, i: number) => (
                  <p key={i} className="text-xs text-slate-500">{p.endereco}</p>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Entrega</p>
              {rota.endereco_completo ? (
                <>
                  <p className="text-sm font-medium text-slate-700 truncate">{rota.endereco_completo}</p>
                  {(rota.endereco_cidade || rota.endereco_estado) && (
                    <p className="text-xs text-slate-400">{rota.endereco_cidade}{rota.endereco_estado ? ` — ${rota.endereco_estado}` : ''}</p>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rota.endereco_completo)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-blue-500 hover:underline mt-0.5"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />Ver no mapa
                  </a>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic">Endereço não configurado</p>
              )}
            </div>
          </div>
        </div>

        {/* Destinatário */}
        {rota.destinatario_nome && (
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-slate-700 truncate">{rota.destinatario_nome}</p>
              {rota.destinatario_tel && <p className="text-xs text-slate-500">{rota.destinatario_tel}</p>}
            </div>
          </div>
        )}

        {/* Motorista / Veículo */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <User className="w-3 h-3" />
            <span>{motoristaLabel ?? <span className="italic text-slate-400">Sem motorista</span>}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <TruckIcon className="w-3 h-3" />
            <span>{veiculoLabel ?? <span className="italic text-slate-400">Sem veículo</span>}</span>
          </div>
          {rota.distancia_est_km && (
            <div className="text-slate-400">{rota.distancia_est_km} km estimado</div>
          )}
          {rota.tempo_est_min && (
            <div className="text-slate-400">{rota.tempo_est_min} min estimado</div>
          )}
        </div>

        {/* Data prevista */}
        {rota.data_prevista_entrega && (
          <p className="text-xs text-slate-400">
            Previsão: {new Date(rota.data_prevista_entrega).toLocaleDateString('pt-BR')}
          </p>
        )}

        {/* Ação: atribuir motorista/veículo */}
        {rota.status === 'Aguardando Atribuição' && (
          <Button
            onClick={() => onAtribuir(rota)}
            className="w-full bg-blue-600 hover:bg-blue-700 gap-1.5 text-xs h-8"
            size="sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Atribuir Motorista e Veículo
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Painel Principal ─────────────────────────────────────────────────────────

export function RouteHistory({ selectedVehicle, rotas, onReload }: RouteHistoryProps) {
  const [filterStatus, setFilterStatus] = useState('')
  const [filterData, setFilterData]     = useState('')
  const [search, setSearch]             = useState('')
  const [atribuirOpen, setAtribuirOpen] = useState(false)
  const [rotaSel, setRotaSel]           = useState<RotaEntrega | null>(null)
  const [criarRotaOpen, setCriarRotaOpen]   = useState(false)
  const [pedidoParaRota, setPedidoParaRota] = useState<PedidoMobile | null>(null)
  const [pedidosSep, setPedidosSep]         = useState<PedidoMobile[]>([])
  const [loadingPedidos, setLoadingPedidos] = useState(false)

  // Carregar pedidos separados sem rota (apenas uma vez)
  const loadPedidosSeparados = async () => {
    setLoadingPedidos(true)
    try {
      const todos = await fetchPedidosMobile()
      const comRota = new Set(rotas.map((r) => r.pedido_id).filter(Boolean))
      const comRotaMat = new Set(rotas.map((r) => (r as any).pedido_material_id).filter(Boolean))
      setPedidosSep(
        todos.filter(
          (p) =>
            (p.status === 'Separado' || p.status === 'Em Separação') &&
            !comRota.has(p.id) &&
            !comRotaMat.has(p.id)
        )
      )
    } catch (e) {
      console.error('[RouteHistory] pedidos:', e)
    } finally {
      setLoadingPedidos(false)
    }
  }

  // Filtros
  const filtradas = rotas.filter((r) => {
    if (selectedVehicle && r.veiculo_id !== selectedVehicle?.id) return false
    if (filterStatus && filterStatus !== 'todos' && r.status !== filterStatus) return false
    if (filterData) {
      const d = new Date(r.created_at).toISOString().split('T')[0]
      if (d !== filterData) return false
    }
    if (search) {
      const q = search.toLowerCase()
      const num = r.numero_rota.toLowerCase()
      const end = r.endereco_completo.toLowerCase()
      const mot = (r as any).motorista?.nome?.toLowerCase() ?? ''
      if (!num.includes(q) && !end.includes(q) && !mot.includes(q)) return false
    }
    return true
  })

  // Resumo por status
  const resumo = {
    aguardando: rotas.filter((r) => r.status === 'Aguardando Atribuição').length,
    ativas:     rotas.filter((r) => r.status === 'Atribuída' || r.status === 'Em Rota').length,
    entregues:  rotas.filter((r) => r.status === 'Entregue').length,
    canceladas: rotas.filter((r) => r.status === 'Cancelada').length,
  }

  return (
    <div className="space-y-4">

      {/* Sumário */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Aguardando',  val: resumo.aguardando, cls: 'text-slate-600',  bg: 'bg-slate-50'  },
          { label: 'Em Andamento',val: resumo.ativas,     cls: 'text-blue-700',   bg: 'bg-blue-50'   },
          { label: 'Entregues',   val: resumo.entregues,  cls: 'text-green-700',  bg: 'bg-green-50'  },
          { label: 'Canceladas',  val: resumo.canceladas, cls: 'text-red-600',    bg: 'bg-red-50'    },
        ].map(({ label, val, cls, bg }) => (
          <div key={label} className={cn('rounded-xl border border-slate-200 p-3 text-center', bg)}>
            <p className={cn('text-2xl font-bold', cls)}>{val}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Pedidos separados sem rota */}
      {pedidosSep.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm text-amber-800">
                  {pedidosSep.length} pedido{pedidosSep.length !== 1 ? 's' : ''} separado{pedidosSep.length !== 1 ? 's' : ''} sem rota
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {pedidosSep.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.numero_pedido}</p>
                    <p className="text-xs text-slate-500 truncate">{p.supervisor_nome}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => { setPedidoParaRota(p); setCriarRotaOpen(true) }}
                    className="ml-3 flex-shrink-0 bg-blue-600 hover:bg-blue-700 gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />Criar Rota
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Busca */}
            <div className="relative">
              <Input
                placeholder="Buscar rota, endereço, motorista..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-3"
              />
            </div>

            {/* Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Aguardando Atribuição">Aguardando Atribuição</SelectItem>
                <SelectItem value="Atribuída">Atribuída</SelectItem>
                <SelectItem value="Em Rota">Em Rota</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Atrasada">Atrasada</SelectItem>
              </SelectContent>
            </Select>

            {/* Data — input nativo (sem calendar component, sem erros de layout) */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="sr-only">Data</Label>
                <Input
                  type="date"
                  value={filterData}
                  onChange={(e) => setFilterData(e.target.value)}
                  className="text-sm"
                />
              </div>
              {(filterStatus || filterData || search) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 text-slate-400 hover:text-slate-600"
                  onClick={() => { setFilterStatus(''); setFilterData(''); setSearch('') }}
                  title="Limpar filtros"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de rotas */}
      {filtradas.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <Route className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">
              {rotas.length === 0
                ? 'Nenhuma rota criada ainda'
                : 'Nenhuma rota corresponde aos filtros'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {rotas.length === 0
                ? 'Ao marcar um pedido como "Separado" no módulo Pedidos, uma rota será criada automaticamente aqui.'
                : 'Ajuste os filtros para encontrar o que procura.'}
            </p>
            <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={onReload}>
              <RefreshCw className="w-3.5 h-3.5" />Recarregar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtradas.map((rota) => (
            <RotaCard
              key={rota.id}
              rota={rota}
              onAtribuir={(r) => { setRotaSel(r); setAtribuirOpen(true) }}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AtribuirRotaDialog
        open={atribuirOpen}
        onClose={() => setAtribuirOpen(false)}
        rota={rotaSel}
        onSuccess={() => { setAtribuirOpen(false); onReload() }}
      />

      <CriarRotaDialog
        open={criarRotaOpen}
        onClose={() => { setCriarRotaOpen(false); setPedidoParaRota(null) }}
        pedido={pedidoParaRota ? {
          id: pedidoParaRota.id,
          numero_pedido: pedidoParaRota.numero_pedido,
          supervisor_nome: pedidoParaRota.supervisor_nome,
          contrato_nome: pedidoParaRota.contrato_nome,
          contrato_endereco: pedidoParaRota.contrato_endereco,
          urgencia: pedidoParaRota.urgencia,
          tipo: 'supervisores',
        } : null}
        onSuccess={() => { setCriarRotaOpen(false); setPedidoParaRota(null); onReload() }}
      />
    </div>
  )
}

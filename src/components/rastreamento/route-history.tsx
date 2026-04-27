'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, MapPin, Clock, Route, Navigation, Filter, Loader2, User, Truck as TruckIcon, UserPlus, Plus, ExternalLink, Package } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fetchRotas, type RotaEntrega } from '@/lib/services/rotas-service'
import { AtribuirRotaDialog } from './atribuir-rota-dialog'
import { CriarRotaDialog } from './criar-rota-dialog'
import { fetchPedidosMobile, type PedidoMobile } from '@/services/pedidosMobileService'

interface RouteHistoryProps {
  selectedVehicle?: any
}


export function RouteHistory({ selectedVehicle }: RouteHistoryProps) {
  const [filterDate, setFilterDate] = useState<Date>()
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [rotas, setRotas] = useState<RotaEntrega[]>([])
  const [loading, setLoading] = useState(true)
  const [atribuirDialogOpen, setAtribuirDialogOpen] = useState(false)
  const [rotaSelecionada, setRotaSelecionada] = useState<RotaEntrega | null>(null)
  const [criarRotaOpen, setCriarRotaOpen] = useState(false)
  const [pedidoParaRota, setPedidoParaRota] = useState<PedidoMobile | null>(null)
  const [pedidosSeparados, setPedidosSeparados] = useState<PedidoMobile[]>([])

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [rotasData, pedidosData] = await Promise.all([
        fetchRotas(),
        fetchPedidosMobile(),
      ])
      setRotas(rotasData)
      // Pedidos em Separado ou Em Separação que ainda não têm rota
      const pedidosComRota = new Set(rotasData.map((r) => r.pedido_id))
      setPedidosSeparados(
        pedidosData.filter(
          (p) => (p.status === 'Separado' || p.status === 'Em Separação') && !pedidosComRota.has(p.id)
        )
      )
    } catch (error) {
      console.error('[RouteHistory] Erro ao carregar:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAtribuir = (rota: RotaEntrega) => {
    setRotaSelecionada(rota)
    setAtribuirDialogOpen(true)
  }

  const handleAtribuicaoSuccess = () => { loadAll() }

  const handleCriarRota = (pedido: PedidoMobile) => {
    setPedidoParaRota(pedido)
    setCriarRotaOpen(true)
  }

  const filteredRoutes = rotas.filter(rota => {
    if (selectedVehicle && rota.veiculo_id !== selectedVehicle.id) return false
    if (filterVehicle && rota.veiculo_id !== filterVehicle) return false
    if (filterStatus && rota.status !== filterStatus) return false
    if (filterDate) {
      const rotaDate = new Date(rota.data_criacao)
      if (rotaDate.toDateString() !== filterDate.toDateString()) return false
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Aguardando Atribuição': { variant: 'outline', color: 'bg-gray-100 text-gray-800' },
      'Atribuída': { variant: 'default', color: 'bg-blue-100 text-blue-800' },
      'Em Rota': { variant: 'default', color: 'bg-blue-500 text-white' },
      'Entregue': { variant: 'default', color: 'bg-green-500 text-white' },
      'Cancelada': { variant: 'destructive', color: 'bg-red-500 text-white' },
      'Atrasada': { variant: 'default', color: 'bg-orange-500 text-white' }
    }

    return (
      <Badge 
        variant={variants[status]?.variant || 'secondary'}
        className={variants[status]?.color}
      >
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" />
            <span className="font-medium text-sm">Filtros</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Data */}
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? (
                      format(filterDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setFilterDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Filtro por Veículo */}
            <div className="space-y-2">
              <Label>Veículo</Label>
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os veículos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os veículos</SelectItem>
                  <SelectItem value="BRA-2023">BRA-2023</SelectItem>
                  <SelectItem value="BRA-2024">BRA-2024</SelectItem>
                  <SelectItem value="BRA-2025">BRA-2025</SelectItem>
                  <SelectItem value="BRA-2026">BRA-2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Status */}
            <div className="space-y-2">
              <Label>Status</Label>
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
            </div>
          </div>

          {/* Botão para limpar filtros */}
          {(filterDate || filterVehicle || filterStatus) && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setFilterDate(undefined)
                  setFilterVehicle('')
                  setFilterStatus('')
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pedidos aguardando criação de rota */}
      {!loading && pedidosSeparados.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-sm text-amber-800">
                  {pedidosSeparados.length} pedido{pedidosSeparados.length !== 1 ? 's' : ''} aguardando rota
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {pedidosSeparados.map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-amber-100">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{pedido.numero_pedido}</p>
                    <p className="text-xs text-slate-500 truncate">{pedido.supervisor_nome}{pedido.contrato_nome ? ` · ${pedido.contrato_nome}` : ''}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCriarRota(pedido)}
                    className="ml-3 flex-shrink-0 bg-blue-600 hover:bg-blue-700 gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Criar Rota
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Rotas */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
              <p className="text-gray-500">Carregando rotas...</p>
            </CardContent>
          </Card>
        ) : filteredRoutes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Route className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Nenhuma rota encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                {rotas.length === 0 
                  ? 'Quando um pedido for marcado como "Separado", uma rota será criada automaticamente aqui.'
                  : 'Ajuste os filtros para ver mais resultados'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRoutes.map((rota) => (
            <Card key={rota.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{rota.numero_rota}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(rota.data_criacao).toLocaleDateString('pt-BR')} às {new Date(rota.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {getStatusBadge(rota.status)}
                  </div>

                  {/* Ponto de partida → Destino */}
                  <div className="space-y-1.5">
                    {rota.ponto_partida && (
                      <div className="flex items-start gap-2">
                        <Navigation className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Partida</p>
                          <p className="text-sm font-medium">{rota.ponto_partida}</p>
                        </div>
                      </div>
                    )}

                    {/* Paradas */}
                    {Array.isArray(rota.paradas) && rota.paradas.length > 0 && (
                      <div className="flex items-start gap-2">
                        <div className="w-3.5 flex-shrink-0 mt-0.5 flex flex-col items-center gap-0.5">
                          {rota.paradas.map((_, i) => (
                            <span key={i} className="w-2 h-2 rounded-full bg-amber-400 block" />
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{rota.paradas.length} parada{rota.paradas.length !== 1 ? 's' : ''}</p>
                          {rota.paradas.map((p: any, i: number) => (
                            <p key={i} className="text-xs text-gray-600">{p.endereco}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Entrega</p>
                        <p className="text-sm font-medium truncate">{rota.endereco_completo}</p>
                        {(rota.endereco_cidade || rota.endereco_estado) && (
                          <p className="text-xs text-gray-500">{rota.endereco_cidade} - {rota.endereco_estado}</p>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rota.endereco_completo)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />Ver no mapa
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Destinatário */}
                  {(rota.destinatario_nome || rota.destinatario_tel) && (
                    <div className="flex items-start gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm">
                      <User className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500">Destinatário</p>
                        {rota.destinatario_nome && <p className="font-medium">{rota.destinatario_nome}</p>}
                        {rota.destinatario_tel && <p className="text-xs text-gray-600">{rota.destinatario_tel}</p>}
                        {rota.destinatario_doc && <p className="text-xs text-gray-500">Doc: {rota.destinatario_doc}</p>}
                      </div>
                    </div>
                  )}

                  {/* Informações da Rota */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Motorista:
                      </span>
                      <p className="font-medium">
                        {(rota as any).motorista?.nome ?? (rota.motorista_id ? 'Atribuído' : 'Aguardando')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 flex items-center gap-1">
                        <TruckIcon className="w-3 h-3" />
                        Veículo:
                      </span>
                      <p className="font-medium">
                        {(rota as any).veiculo?.placa ?? (rota.veiculo_id ? 'Atribuído' : 'Aguardando')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Prioridade:</span>
                      <p className={`font-medium ${
                        rota.prioridade === 'Urgente' ? 'text-red-600' :
                        rota.prioridade === 'Alta' ? 'text-orange-600' :
                        rota.prioridade === 'Normal' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {rota.prioridade}
                      </p>
                    </div>
                    {rota.distancia_est_km && (
                      <div>
                        <span className="text-gray-600">Distância:</span>
                        <p className="font-medium">{rota.distancia_est_km} km</p>
                      </div>
                    )}
                    {rota.tempo_est_min && (
                      <div>
                        <span className="text-gray-600">Tempo est.:</span>
                        <p className="font-medium">{rota.tempo_est_min} min</p>
                      </div>
                    )}
                  </div>

                  {/* Observações */}
                  {rota.observacoes && (
                    <div className="text-sm pt-2 border-t">
                      <span className="text-gray-600">Observações:</span>
                      <p className="text-gray-700 mt-1">{rota.observacoes}</p>
                    </div>
                  )}

                  {/* Datas importantes */}
                  {(rota.data_atribuicao || rota.data_inicio_rota || rota.data_entrega) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm pt-2 border-t">
                      {rota.data_atribuicao && (
                        <div>
                          <span className="text-gray-600">Atribuída em:</span>
                          <p className="font-medium text-xs">
                            {new Date(rota.data_atribuicao).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                      {rota.data_inicio_rota && (
                        <div>
                          <span className="text-gray-600">Iniciou em:</span>
                          <p className="font-medium text-xs">
                            {new Date(rota.data_inicio_rota).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                      {rota.data_entrega && (
                        <div>
                          <span className="text-gray-600">Entregue em:</span>
                          <p className="font-medium text-xs text-green-600">
                            {new Date(rota.data_entrega).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botão de Atribuir - Apenas para rotas aguardando */}
                  {rota.status === 'Aguardando Atribuição' && (
                    <div className="pt-3 border-t">
                      <Button 
                        onClick={() => handleAtribuir(rota)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Atribuir Motorista e Veículo
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Atribuição */}
      <AtribuirRotaDialog
        open={atribuirDialogOpen}
        onClose={() => setAtribuirDialogOpen(false)}
        rota={rotaSelecionada}
        onSuccess={handleAtribuicaoSuccess}
      />

      {/* Dialog de Criação de Rota */}
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
        } : null}
        onSuccess={() => { setCriarRotaOpen(false); setPedidoParaRota(null); loadAll() }}
      />

      {/* Resumo */}
      {filteredRoutes.length > 0 && !loading && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Resumo do Período</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total de Rotas:</span>
                <p className="font-medium">{filteredRoutes.length}</p>
              </div>
              <div>
                <span className="text-gray-600">Aguardando:</span>
                <p className="font-medium text-gray-600">
                  {filteredRoutes.filter(r => r.status === 'Aguardando Atribuição').length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Em Andamento:</span>
                <p className="font-medium text-blue-600">
                  {filteredRoutes.filter(r => r.status === 'Atribuída' || r.status === 'Em Rota').length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Entregues:</span>
                <p className="font-medium text-green-600">
                  {filteredRoutes.filter(r => r.status === 'Entregue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
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
import { CalendarIcon, MapPin, Clock, Route, Navigation, Filter, Loader2, User, Truck as TruckIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fetchRotas, type RotaEntrega } from '@/lib/services/rotas-service'

interface RouteHistoryProps {
  selectedVehicle?: any
}

// REMOVIDO: Mock data - Agora usando dados reais
const oldRouteHistoryData = [
  {
    id: 1,
    data: '2024-01-15',
    hora: '08:30',
    origem: 'São Paulo - Depósito Central',
    destino: 'Santos - Porto',
    distancia: 85.5,
    duracao: '2h 45min',
    status: 'Concluída',
    motorista: 'Carlos Lima',
    veiculo: 'BRA-2023',
    combustivelGasto: 12.8,
    velocidadeMedia: 55.2,
    paradas: 2
  },
  {
    id: 2,
    data: '2024-01-15',
    hora: '13:15',
    origem: 'Santos - Porto',
    destino: 'Campinas - Centro de Distribuição',
    distancia: 95.2,
    duracao: '3h 10min',
    status: 'Concluída',
    motorista: 'Carlos Lima',
    veiculo: 'BRA-2023',
    combustivelGasto: 15.1,
    velocidadeMedia: 48.7,
    paradas: 1
  },
  {
    id: 3,
    data: '2024-01-14',
    hora: '09:00',
    origem: 'Rio de Janeiro - Zona Sul',
    destino: 'Niterói - Centro',
    distancia: 45.8,
    duracao: '1h 35min',
    status: 'Concluída',
    motorista: 'Ana Oliveira',
    veiculo: 'BRA-2024',
    combustivelGasto: 8.2,
    velocidadeMedia: 42.1,
    paradas: 3
  },
  {
    id: 4,
    data: '2024-01-14',
    hora: '14:20',
    origem: 'Belo Horizonte - Centro',
    destino: 'Contagem - Industrial',
    distancia: 28.5,
    duracao: '1h 15min',
    status: 'Concluída',
    motorista: 'João Silva',
    veiculo: 'BRA-2025',
    combustivelGasto: 6.3,
    velocidadeMedia: 38.4,
    paradas: 2
  },
  {
    id: 5,
    data: '2024-01-14',
    hora: '16:45',
    origem: 'Curitiba - Centro',
    destino: 'São José dos Pinhais',
    distancia: 22.1,
    duracao: '45min',
    status: 'Cancelada',
    motorista: 'Maria Santos',
    veiculo: 'BRA-2026',
    combustivelGasto: 0,
    velocidadeMedia: 0,
    paradas: 0
  }
]

export function RouteHistory({ selectedVehicle }: RouteHistoryProps) {
  const [filterDate, setFilterDate] = useState<Date>()
  const [filterVehicle, setFilterVehicle] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [rotas, setRotas] = useState<RotaEntrega[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar rotas reais do banco
  useEffect(() => {
    const loadRotas = async () => {
      setLoading(true)
      try {
        const rotasData = await fetchRotas()
        console.log('[RouteHistory] Rotas carregadas:', rotasData.length)
        setRotas(rotasData)
      } catch (error) {
        console.error('[RouteHistory] Erro ao carregar rotas:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadRotas()
  }, [])

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

                  {/* Destino */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Endereço de Entrega</p>
                      <p className="text-xs text-gray-600">{rota.endereco_completo}</p>
                      {(rota.endereco_cidade || rota.endereco_estado) && (
                        <p className="text-xs text-gray-500 mt-1">
                          {rota.endereco_cidade} - {rota.endereco_estado}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Informações da Rota */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Motorista:
                      </span>
                      <p className="font-medium">
                        {rota.motorista_id ? 'Atribuído' : 'Aguardando'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 flex items-center gap-1">
                        <TruckIcon className="w-3 h-3" />
                        Veículo:
                      </span>
                      <p className="font-medium">
                        {rota.veiculo_id ? 'Atribuído' : 'Aguardando'}
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
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
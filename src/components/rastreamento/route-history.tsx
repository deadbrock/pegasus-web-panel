'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, MapPin, Clock, Route, Navigation, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RouteHistoryProps {
  selectedVehicle?: any
}

// Mock data para histórico de rotas
const routeHistoryData = [
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

  const filteredRoutes = routeHistoryData.filter(route => {
    if (selectedVehicle && route.veiculo !== selectedVehicle.placa) return false
    if (filterVehicle && route.veiculo !== filterVehicle) return false
    if (filterStatus && route.status !== filterStatus) return false
    if (filterDate) {
      const routeDate = new Date(route.data)
      if (routeDate.toDateString() !== filterDate.toDateString()) return false
    }
    return true
  })

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Concluída': { variant: 'default', color: 'bg-green-500' },
      'Em Andamento': { variant: 'default', color: 'bg-blue-500' },
      'Cancelada': { variant: 'destructive', color: 'bg-red-500' },
      'Pausada': { variant: 'outline', color: 'bg-yellow-500' }
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
                  <SelectItem value="Concluída">Concluída</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                  <SelectItem value="Pausada">Pausada</SelectItem>
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
        {filteredRoutes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Route className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">Nenhuma rota encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                Ajuste os filtros para ver mais resultados
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRoutes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Rota #{route.id}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(route.data).toLocaleDateString('pt-BR')} às {route.hora}
                      </span>
                    </div>
                    {getStatusBadge(route.status)}
                  </div>

                  {/* Origem e Destino */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Origem</p>
                        <p className="text-xs text-gray-600">{route.origem}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-dashed border-gray-300"></div>
                      <Navigation className="w-4 h-4 text-gray-400" />
                      <div className="flex-1 border-t border-dashed border-gray-300"></div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Destino</p>
                        <p className="text-xs text-gray-600">{route.destino}</p>
                      </div>
                    </div>
                  </div>

                  {/* Informações da Rota */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Veículo:</span>
                      <p className="font-medium">{route.veiculo}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Motorista:</span>
                      <p className="font-medium">{route.motorista}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Distância:</span>
                      <p className="font-medium">{route.distancia} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duração:</span>
                      <p className="font-medium">{route.duracao}</p>
                    </div>
                  </div>

                  {/* Métricas Adicionais */}
                  {route.status === 'Concluída' && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2 border-t">
                      <div>
                        <span className="text-gray-600">Vel. Média:</span>
                        <p className="font-medium">{route.velocidadeMedia} km/h</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Combustível:</span>
                        <p className="font-medium">{route.combustivelGasto}L</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Paradas:</span>
                        <p className="font-medium">{route.paradas}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Eficiência:</span>
                        <p className="font-medium text-green-600">
                          {(route.distancia / route.combustivelGasto).toFixed(1)} km/L
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resumo */}
      {filteredRoutes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3">Resumo do Período</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total de Rotas:</span>
                <p className="font-medium">{filteredRoutes.length}</p>
              </div>
              <div>
                <span className="text-gray-600">Concluídas:</span>
                <p className="font-medium text-green-600">
                  {filteredRoutes.filter(r => r.status === 'Concluída').length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Distância Total:</span>
                <p className="font-medium">
                  {filteredRoutes.reduce((acc, r) => acc + r.distancia, 0).toFixed(1)} km
                </p>
              </div>
              <div>
                <span className="text-gray-600">Combustível Total:</span>
                <p className="font-medium">
                  {filteredRoutes.reduce((acc, r) => acc + r.combustivelGasto, 0).toFixed(1)}L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
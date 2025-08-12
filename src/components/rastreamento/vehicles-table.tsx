'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, Navigation, AlertTriangle, Fuel, Thermometer, Clock, MapPin, Eye, Play } from 'lucide-react'

interface VehiclesTableProps {
  compact?: boolean
  onVehicleSelect: (vehicle: any) => void
  selectedVehicle?: any
}

// Mock data para veículos ativos
const vehiclesData = [
  {
    id: 1,
    placa: 'BRA-2023',
    motorista: 'Carlos Lima',
    modelo: 'Volkswagen Delivery',
    status: 'Em Movimento',
    velocidade: 65,
    posicao: 'São Paulo - Centro',
    destino: 'Santos - Porto',
    ultimaAtualizacao: '2024-01-15T14:23:45',
    combustivel: 75,
    temperatura: 85,
    kmDia: 245,
    eta: '16:30'
  },
  {
    id: 2,
    placa: 'BRA-2024',
    motorista: 'Ana Oliveira',
    modelo: 'Ford Cargo',
    status: 'Parado',
    velocidade: 0,
    posicao: 'Rio de Janeiro - Zona Sul',
    destino: 'Niterói - Centro',
    ultimaAtualizacao: '2024-01-15T14:20:12',
    combustivel: 45,
    temperatura: 90,
    kmDia: 180,
    eta: '17:15'
  },
  {
    id: 3,
    placa: 'BRA-2025',
    motorista: 'João Silva',
    modelo: 'Mercedes Sprinter',
    status: 'Em Movimento',
    velocidade: 45,
    posicao: 'Belo Horizonte - Centro',
    destino: 'Contagem - Industrial',
    ultimaAtualizacao: '2024-01-15T14:24:32',
    combustivel: 30,
    temperatura: 75,
    kmDia: 320,
    eta: '15:45'
  },
  {
    id: 4,
    placa: 'BRA-2026',
    motorista: 'Maria Santos',
    modelo: 'Iveco Daily',
    status: 'Entregando',
    velocidade: 15,
    posicao: 'Curitiba - Centro',
    destino: 'No destino',
    ultimaAtualizacao: '2024-01-15T14:25:01',
    combustivel: 85,
    temperatura: 80,
    kmDia: 125,
    eta: 'Chegou'
  },
  {
    id: 5,
    placa: 'BRA-2027',
    motorista: 'Pedro Costa',
    modelo: 'Fiat Ducato',
    status: 'Offline',
    velocidade: 0,
    posicao: 'Última: Porto Alegre',
    destino: '-',
    ultimaAtualizacao: '2024-01-15T13:45:23',
    combustivel: 60,
    temperatura: 0,
    kmDia: 95,
    eta: '-'
  }
]

export function VehiclesTable({ compact = false, onVehicleSelect, selectedVehicle }: VehiclesTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Em Movimento': { variant: 'default', color: 'bg-green-500' },
      'Parado': { variant: 'default', color: 'bg-yellow-500' },
      'Entregando': { variant: 'default', color: 'bg-blue-500' },
      'Offline': { variant: 'secondary', color: 'bg-gray-500' },
      'Alerta': { variant: 'destructive', color: 'bg-red-500' }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Movimento':
        return <Navigation className="w-4 h-4 text-green-600" />
      case 'Parado':
        return <Truck className="w-4 h-4 text-yellow-600" />
      case 'Entregando':
        return <MapPin className="w-4 h-4 text-blue-600" />
      case 'Offline':
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
      default:
        return <Truck className="w-4 h-4 text-gray-600" />
    }
  }

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora'
    if (diffMinutes < 60) return `${diffMinutes}min atrás`
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}h atrás`
  }

  const getRowClass = (vehicle: any) => {
    const isSelected = selectedVehicle?.id === vehicle.id
    return `hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`
  }

  const handleVehicleClick = (vehicle: any) => {
    onVehicleSelect(vehicle)
  }

  if (compact) {
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {vehiclesData.slice(0, 6).map((vehicle) => (
          <div
            key={vehicle.id}
            className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
              selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => handleVehicleClick(vehicle)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(vehicle.status)}
                <span className="font-medium text-sm">{vehicle.placa}</span>
              </div>
              {getStatusBadge(vehicle.status)}
            </div>
            
            <div className="space-y-1 text-xs">
              <p className="text-gray-600">{vehicle.motorista}</p>
              <div className="flex items-center gap-4">
                <span>{vehicle.velocidade} km/h</span>
                <span className={vehicle.combustivel < 35 ? 'text-red-600' : ''}>
                  {vehicle.combustivel}% ⛽
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Veículo</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Posição Atual</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Velocidade</TableHead>
            <TableHead>Combustível</TableHead>
            <TableHead>Última Atualização</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehiclesData.map((vehicle) => (
            <TableRow 
              key={vehicle.id} 
              className={getRowClass(vehicle)}
              onClick={() => handleVehicleClick(vehicle)}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">{vehicle.placa}</p>
                    <p className="text-sm text-gray-500">{vehicle.modelo}</p>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <p className="font-medium">{vehicle.motorista}</p>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusIcon(vehicle.status)}
                  {getStatusBadge(vehicle.status)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{vehicle.posicao}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <span className="text-sm">{vehicle.destino}</span>
                {vehicle.eta !== '-' && vehicle.eta !== 'Chegou' && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>ETA: {vehicle.eta}</span>
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {vehicle.status === 'Em Movimento' && (
                    <Navigation className="w-4 h-4 text-green-500" />
                  )}
                  <span className="font-medium">{vehicle.velocidade} km/h</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {vehicle.kmDia} km hoje
                </div>
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Fuel className={`w-4 h-4 ${vehicle.combustivel < 35 ? 'text-red-500' : 'text-gray-500'}`} />
                    <span className={`font-medium ${vehicle.combustivel < 35 ? 'text-red-600' : ''}`}>
                      {vehicle.combustivel}%
                    </span>
                  </div>
                  
                  {vehicle.status !== 'Offline' && (
                    <div className="flex items-center gap-2">
                      <Thermometer className={`w-4 h-4 ${vehicle.temperatura > 85 ? 'text-orange-500' : 'text-gray-500'}`} />
                      <span className={`text-sm ${vehicle.temperatura > 85 ? 'text-orange-600' : ''}`}>
                        {vehicle.temperatura}°C
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  {formatLastUpdate(vehicle.ultimaAtualizacao)}
                </div>
                {vehicle.status === 'Offline' && (
                  <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Sem sinal</span>
                  </div>
                )}
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Ação para visualizar detalhes
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Ação para seguir veículo
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Alertas na parte inferior */}
      <div className="p-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Total: {vehiclesData.length} veículos
            </span>
            <span className="text-green-600">
              Online: {vehiclesData.filter(v => v.status !== 'Offline').length}
            </span>
            <span className="text-red-600">
              Alertas: {vehiclesData.filter(v => v.combustivel < 35 || v.temperatura > 85).length}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Atualizado automaticamente a cada 5 segundos
          </div>
        </div>
      </div>
    </div>
  )
}
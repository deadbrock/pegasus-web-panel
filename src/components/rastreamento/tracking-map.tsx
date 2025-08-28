'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Truck, MapPin, Navigation, AlertTriangle, Play, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface TrackingMapProps {
  selectedVehicle?: any
  isRealTime: boolean
  data?: Array<{ id: string | number; placa?: string; motorista?: string; status?: string; latitude?: number; longitude?: number }>
}

// Mock data para veículos no mapa (fallback)
const vehiclesOnMap = [
  {
    id: 1,
    placa: 'BRA-2023',
    motorista: 'Carlos Lima',
    status: 'Em Movimento',
    posicao: { x: 35, y: 40 },
    velocidade: 65,
    destino: 'São Paulo - Centro',
    eta: '14:30',
    combustivel: 75,
    temperatura: 85
  },
  {
    id: 2,
    placa: 'BRA-2024',
    motorista: 'Ana Oliveira',
    status: 'Parado',
    posicao: { x: 60, y: 25 },
    velocidade: 0,
    destino: 'Rio de Janeiro - Zona Sul',
    eta: '16:45',
    combustivel: 45,
    temperatura: 90
  },
  {
    id: 3,
    placa: 'BRA-2025',
    motorista: 'João Silva',
    status: 'Em Movimento',
    posicao: { x: 75, y: 60 },
    velocidade: 45,
    destino: 'Belo Horizonte - Centro',
    eta: '18:20',
    combustivel: 30,
    temperatura: 75
  },
  {
    id: 4,
    placa: 'BRA-2026',
    motorista: 'Maria Santos',
    status: 'Entregando',
    posicao: { x: 45, y: 30 },
    velocidade: 15,
    destino: 'Santos - Porto',
    eta: 'No destino',
    combustivel: 85,
    temperatura: 80
  }
]

export function TrackingMap({ selectedVehicle, isRealTime, data }: TrackingMapProps) {
  const [hoveredVehicle, setHoveredVehicle] = useState<any>(null)
  const [mapCenter, setMapCenter] = useState({ x: 50, y: 50 })
  const [zoomLevel, setZoomLevel] = useState(1)

  const getVehicleIcon = (status: string, isSelected: boolean = false) => {
    const baseClasses = `w-6 h-6 ${isSelected ? 'text-blue-600' : ''}`
    
    switch (status) {
      case 'Em Movimento':
        return <Truck className={`${baseClasses} text-green-600`} />
      case 'Parado':
        return <Truck className={`${baseClasses} text-yellow-600`} />
      case 'Entregando':
        return <MapPin className={`${baseClasses} text-blue-600`} />
      default:
        return <Truck className={`${baseClasses} text-gray-600`} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Movimento':
        return 'bg-green-500'
      case 'Parado':
        return 'bg-yellow-500'
      case 'Entregando':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getVehicleMarkerSize = (vehicle: any) => {
    const isSelected = selectedVehicle?.id === vehicle.id
    return isSelected ? 'w-8 h-8' : 'w-6 h-6'
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleResetView = () => {
    setMapCenter({ x: 50, y: 50 })
    setZoomLevel(1)
  }

  // Simular movimento dos veículos em tempo real
  useEffect(() => {
    if (!isRealTime) return

    const interval = setInterval(() => {
      // Aqui seria feita a atualização real das posições via API
      console.log('Atualizando posições dos veículos...')
    }, 3000)

    return () => clearInterval(interval)
  }, [isRealTime])

  return (
    <div className="relative">
      {/* Controles do Mapa */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleResetView}>
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-md">
          <div className={`w-3 h-3 rounded-full ${isRealTime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isRealTime ? 'Tempo Real' : 'Pausado'}
          </span>
        </div>
      </div>

      {/* Mapa */}
      <div 
        className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-96 overflow-hidden cursor-move"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
      >
        {/* Grid do mapa */}
        <div className="absolute inset-0 opacity-30">
          {/* Linhas horizontais */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-gray-300"
              style={{ top: `${i * 10}%` }}
            />
          ))}
          {/* Linhas verticais */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-gray-300"
              style={{ left: `${i * 10}%` }}
            />
          ))}
        </div>

        {/* Simulação de rodovias */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 right-0 h-2 bg-gray-400 opacity-50 rounded"></div>
          <div className="absolute top-3/4 left-0 right-0 h-2 bg-gray-400 opacity-50 rounded"></div>
          <div className="absolute left-1/4 top-0 bottom-0 w-2 bg-gray-400 opacity-50 rounded"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-2 bg-gray-400 opacity-50 rounded"></div>
        </div>

        {/* Marcadores dos veículos */}
        {(data && data.length ? data : vehiclesOnMap).map((vehicle: any) => {
          const isSelected = selectedVehicle?.id === vehicle.id
          const isHovered = hoveredVehicle?.id === vehicle.id
          
          return (
            <div
              key={vehicle.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: vehicle.posicao?.x ? `${vehicle.posicao.x}%` : `${50 + Math.random() * 40 - 20}%`,
                top: vehicle.posicao?.y ? `${vehicle.posicao.y}%` : `${50 + Math.random() * 40 - 20}%`,
                zIndex: isSelected ? 20 : 10
              }}
              onMouseEnter={() => setHoveredVehicle(vehicle)}
              onMouseLeave={() => setHoveredVehicle(null)}
            >
              {/* Marcador do veículo */}
              <div className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg ${getStatusColor(vehicle.status)} ${getVehicleMarkerSize(vehicle)}`}>
                <div className="text-white text-xs font-bold">
                  {vehicle.placa.slice(-2)}
                </div>
                
                {/* Indicador de movimento */}
                {vehicle.status === 'Em Movimento' && (
                  <div className="absolute -top-1 -right-1">
                    <Navigation className="w-3 h-3 text-green-600" />
                  </div>
                )}

                {/* Alerta de combustível baixo */}
                {vehicle.combustivel < 35 && (
                  <div className="absolute -bottom-1 -left-1">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  </div>
                )}
              </div>

              {/* Tooltip detalhado */}
              {(isHovered || isSelected) && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                  <Card className="w-64 shadow-lg">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{vehicle.placa}</span>
                          <Badge 
                            variant="outline" 
                            className={`${getStatusColor(vehicle.status)} text-white border-0`}
                          >
                            {vehicle.status}
                          </Badge>
                        </div>

                        {/* Motorista */}
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{vehicle.motorista}</span>
                        </div>

                        {/* Destino */}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{vehicle.destino}</span>
                        </div>

                        {/* Métricas */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-600">Velocidade:</span>
                            <span className="font-medium ml-1">{vehicle.velocidade} km/h</span>
                          </div>
                          <div>
                            <span className="text-gray-600">ETA:</span>
                            <span className="font-medium ml-1">{vehicle.eta}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Combustível:</span>
                            <span className={`font-medium ml-1 ${vehicle.combustivel < 35 ? 'text-red-600' : ''}`}>
                              {vehicle.combustivel}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Temp:</span>
                            <span className={`font-medium ml-1 ${vehicle.temperatura > 85 ? 'text-orange-600' : ''}`}>
                              {vehicle.temperatura}°C
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )
        })}

        {/* Legenda */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3">
          <h3 className="text-sm font-medium mb-2">Status dos Veículos</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Em Movimento ({vehiclesOnMap.filter(v => v.status === 'Em Movimento').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Parado ({vehiclesOnMap.filter(v => v.status === 'Parado').length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs">Entregando ({vehiclesOnMap.filter(v => v.status === 'Entregando').length})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do veículo selecionado */}
      {selectedVehicle && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Veículo Selecionado: {selectedVehicle.placa}</h3>
            <Button variant="outline" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Seguir
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Motorista:</span>
              <p className="font-medium">{selectedVehicle.motorista}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium">{selectedVehicle.status}</p>
            </div>
            <div>
              <span className="text-gray-600">Destino:</span>
              <p className="font-medium">{selectedVehicle.destino}</p>
            </div>
            <div>
              <span className="text-gray-600">ETA:</span>
              <p className="font-medium">{selectedVehicle.eta}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
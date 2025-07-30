'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Truck, CheckCircle, Clock, AlertTriangle } from 'lucide-react'

// Mock data para entregas no mapa
const deliveryData = [
  {
    id: 'P-001235',
    cliente: 'Maria Santos',
    endereco: 'Av. Paulista, 456 - São Paulo/SP',
    status: 'Em Rota',
    motorista: 'Carlos Lima',
    veiculo: 'BRA-2023',
    posicao: { x: 45, y: 30 },
    estimativa: '14:30'
  },
  {
    id: 'P-001243',
    cliente: 'André Lima',
    endereco: 'Copacabana, 789 - Rio de Janeiro/RJ',
    status: 'Em Rota',
    motorista: 'Ana Oliveira',
    veiculo: 'BRA-2024',
    posicao: { x: 65, y: 55 },
    estimativa: '16:45'
  },
  {
    id: 'P-001236',
    cliente: 'Pedro Costa',
    endereco: 'Rua Santos Dumont, 789 - Rio de Janeiro/RJ',
    status: 'Entregue',
    motorista: 'Ana Oliveira',
    veiculo: 'BRA-2024',
    posicao: { x: 70, y: 50 },
    estimativa: 'Concluído'
  },
  {
    id: 'P-001237',
    cliente: 'Ana Souza',
    endereco: 'Rua da Liberdade, 321 - Belo Horizonte/MG',
    status: 'Atrasado',
    motorista: 'João Silva',
    veiculo: 'BRA-2025',
    posicao: { x: 35, y: 40 },
    estimativa: 'Atrasado'
  }
]

export function OrderDeliveryMap() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Rota':
        return <Truck className="w-4 h-4 text-yellow-600" />
      case 'Entregue':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'Atrasado':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Rota':
        return 'bg-yellow-500'
      case 'Entregue':
        return 'bg-green-500'
      case 'Atrasado':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Mapa Simulado */}
      <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
        {/* Background do mapa */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Linhas simulando ruas */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-0 right-0 h-px bg-gray-300"></div>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300"></div>
            <div className="absolute top-3/4 left-0 right-0 h-px bg-gray-300"></div>
            <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gray-300"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300"></div>
            <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gray-300"></div>
          </div>
        </div>

        {/* Marcadores das entregas */}
        {deliveryData.map((delivery) => (
          <div
            key={delivery.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{
              left: `${delivery.posicao.x}%`,
              top: `${delivery.posicao.y}%`
            }}
          >
            {/* Marcador */}
            <div className={`w-4 h-4 rounded-full ${getStatusColor(delivery.status)} border-2 border-white shadow-lg`}>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Card className="w-64 shadow-lg">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-medium">{delivery.id}</span>
                      <Badge variant="outline" className={getStatusColor(delivery.status).replace('bg-', 'text-')}>
                        {delivery.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{delivery.cliente}</p>
                      <p className="text-xs text-gray-600">{delivery.endereco}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{delivery.motorista}</span>
                      <span className="font-medium">{delivery.estimativa}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {/* Legenda */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <h3 className="text-sm font-medium mb-2">Legenda</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs">Em Rota</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs">Entregue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs">Atrasado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Entregas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveryData.map((delivery) => (
          <Card key={delivery.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">{delivery.id}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(delivery.status)}
                    <span className="text-sm">{delivery.status}</span>
                  </div>
                </div>
                
                <div>
                  <p className="font-medium">{delivery.cliente}</p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{delivery.endereco}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Truck className="w-4 h-4 text-blue-500" />
                    <span>{delivery.motorista}</span>
                  </div>
                  <span className="font-medium">
                    {delivery.status === 'Entregue' ? 'Concluído' : 
                     delivery.status === 'Atrasado' ? 'Atrasado' : 
                     `ETA: ${delivery.estimativa}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
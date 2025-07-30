'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Calendar,
  Eye
} from 'lucide-react'

// Mock data - substituir por dados do Supabase
const vehiclesStatus = [
  {
    id: 1,
    placa: 'BRA-2023',
    modelo: 'Volkswagen Delivery',
    km: 95000,
    proximaManutencao: 100000,
    status: 'Em Dia',
    ultimaManutencao: '2024-01-10',
    proximaData: '2024-03-15',
    pendentes: 0,
    concluidas: 8
  },
  {
    id: 2,
    placa: 'BRA-2024',
    modelo: 'Ford Cargo',
    km: 88500,
    proximaManutencao: 90000,
    status: 'Próximo do Vencimento',
    ultimaManutencao: '2023-12-15',
    proximaData: '2024-01-20',
    pendentes: 1,
    concluidas: 12
  },
  {
    id: 3,
    placa: 'BRA-2025',
    modelo: 'Mercedes Sprinter',
    km: 105000,
    proximaManutencao: 100000,
    status: 'Atrasada',
    ultimaManutencao: '2023-11-20',
    proximaData: '2024-01-10',
    pendentes: 2,
    concluidas: 6
  },
  {
    id: 4,
    placa: 'BRA-2022',
    modelo: 'Iveco Daily',
    km: 78000,
    proximaManutencao: 80000,
    status: 'Em Dia',
    ultimaManutencao: '2024-01-08',
    proximaData: '2024-02-25',
    pendentes: 0,
    concluidas: 15
  },
  {
    id: 5,
    placa: 'BRA-2026',
    modelo: 'Renault Master',
    km: 45000,
    proximaManutencao: 50000,
    status: 'Em Dia',
    ultimaManutencao: '2023-12-20',
    proximaData: '2024-04-10',
    pendentes: 0,
    concluidas: 4
  },
  {
    id: 6,
    placa: 'BRA-2021',
    modelo: 'Fiat Ducato',
    km: 110000,
    proximaManutencao: 105000,
    status: 'Atrasada',
    ultimaManutencao: '2023-10-15',
    proximaData: '2023-12-20',
    pendentes: 3,
    concluidas: 18
  }
]

export function VehicleMaintenanceStatus() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Em Dia': { variant: 'default', color: 'bg-green-500' },
      'Próximo do Vencimento': { variant: 'default', color: 'bg-yellow-500' },
      'Atrasada': { variant: 'destructive', color: 'bg-red-500' }
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
      case 'Em Dia':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'Próximo do Vencimento':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'Atrasada':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Wrench className="w-5 h-5 text-gray-500" />
    }
  }

  const getKmProgress = (currentKm: number, nextKm: number) => {
    if (currentKm >= nextKm) return 100
    const progress = (currentKm / nextKm) * 100
    return Math.min(progress, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehiclesStatus.map((vehicle) => (
        <Card key={vehicle.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{vehicle.placa}</CardTitle>
                  <p className="text-sm text-gray-600">{vehicle.modelo}</p>
                </div>
              </div>
              {getStatusIcon(vehicle.status)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              {getStatusBadge(vehicle.status)}
            </div>

            {/* Quilometragem Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quilometragem</span>
                <span>{vehicle.km.toLocaleString()} / {vehicle.proximaManutencao.toLocaleString()} km</span>
              </div>
              <Progress 
                value={getKmProgress(vehicle.km, vehicle.proximaManutencao)} 
                className="h-2"
              />
            </div>

            {/* Datas */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Última Manutenção:</span>
                <span>{formatDate(vehicle.ultimaManutencao)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Próxima Manutenção:</span>
                <span>{formatDate(vehicle.proximaData)}</span>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex justify-between pt-2 border-t">
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600">{vehicle.pendentes}</p>
                <p className="text-xs text-gray-600">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{vehicle.concluidas}</p>
                <p className="text-xs text-gray-600">Concluídas</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Detalhes
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
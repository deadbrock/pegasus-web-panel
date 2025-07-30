'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Wrench, AlertTriangle, CheckCircle, Truck } from 'lucide-react'

const vehicleMaintenanceData = [
  {
    id: 1,
    placa: 'BRA-2023',
    modelo: 'Volkswagen Delivery',
    status: 'Em Dia',
    proximaManutencao: '2024-03-15',
    diasRestantes: 45,
    manutencoesPendentes: 0,
    manutencoesConcluidas: 8,
    custosAnuais: 3200
  },
  {
    id: 2,
    placa: 'BRA-2024',
    modelo: 'Ford Cargo',
    status: 'Atrasada',
    proximaManutencao: '2024-01-10',
    diasRestantes: -5,
    manutencoesPendentes: 2,
    manutencoesConcluidas: 12,
    custosAnuais: 5800
  },
  {
    id: 3,
    placa: 'BRA-2025',
    modelo: 'Mercedes Sprinter',
    status: 'Próximo do Vencimento',
    proximaManutencao: '2024-01-20',
    diasRestantes: 5,
    manutencoesPendentes: 1,
    manutencoesConcluidas: 6,
    custosAnuais: 2900
  },
  {
    id: 4,
    placa: 'BRA-2022',
    modelo: 'Iveco Daily',
    status: 'Em Dia',
    proximaManutencao: '2024-02-25',
    diasRestantes: 40,
    manutencoesPendentes: 0,
    manutencoesConcluidas: 15,
    custosAnuais: 4100
  }
]

export function VehicleMaintenanceOverview() {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getProgressValue = (diasRestantes: number) => {
    if (diasRestantes <= 0) return 100
    const maxDias = 60 // Considera 60 dias como período máximo
    return Math.max(0, Math.min(100, ((maxDias - diasRestantes) / maxDias) * 100))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {vehicleMaintenanceData.map((vehicle) => (
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

            {/* Próxima Manutenção */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Próxima Manutenção</span>
                <span className={vehicle.diasRestantes <= 0 ? 'text-red-600 font-medium' : 
                                vehicle.diasRestantes <= 7 ? 'text-yellow-600 font-medium' : 
                                'text-gray-600'}>
                  {vehicle.diasRestantes <= 0 ? 
                    `${Math.abs(vehicle.diasRestantes)} dias atrasada` :
                    `em ${vehicle.diasRestantes} dias`
                  }
                </span>
              </div>
              <Progress 
                value={getProgressValue(vehicle.diasRestantes)} 
                className="h-2"
              />
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(vehicle.proximaManutencao)}</span>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="flex justify-between pt-2 border-t">
              <div className="text-center">
                <p className="text-lg font-semibold text-red-600">{vehicle.manutencoesPendentes}</p>
                <p className="text-xs text-gray-600">Pendentes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-green-600">{vehicle.manutencoesConcluidas}</p>
                <p className="text-xs text-gray-600">Concluídas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(vehicle.custosAnuais)}</p>
                <p className="text-xs text-gray-600">Custos/Ano</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
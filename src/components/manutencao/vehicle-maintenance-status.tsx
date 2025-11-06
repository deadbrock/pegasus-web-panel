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
import { useState, useEffect } from 'react'
import { VehicleScheduleDialog } from './vehicle-schedule-dialog'
import { VehicleDetailsDialog } from '@/components/veiculos/vehicle-details-dialog'
import { fetchVeiculos } from '@/lib/services/veiculos-service'
import { Manutencao } from '@/lib/services/manutencoes-service'

interface VehicleMaintenanceStatusProps {
  manutencoes?: Manutencao[]
}

export function VehicleMaintenanceStatus({ manutencoes = [] }: VehicleMaintenanceStatusProps) {
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<{ id: string; placa: string; modelo: string } | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsVehicle, setDetailsVehicle] = useState<any | null>(null)

  // Carrega veículos do Supabase
  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await fetchVeiculos()
      setVehicles(data)
      setLoading(false)
    }
    load()
  }, [])

  // Calcula estatísticas de manutenção para cada veículo
  const vehiclesWithStats = vehicles.map(v => {
    const vehicleManutencoes = manutencoes.filter(m => m.veiculo_id === v.id)
    const pendentes = vehicleManutencoes.filter(m => 
      m.status === 'Pendente' || m.status === 'Atrasada' || m.status === 'Agendada'
    ).length
    const concluidas = vehicleManutencoes.filter(m => m.status === 'Concluída').length
    
    // Última manutenção
    const ultimasManutencoes = vehicleManutencoes
      .filter(m => m.data_conclusao)
      .sort((a, b) => new Date(b.data_conclusao!).getTime() - new Date(a.data_conclusao!).getTime())
    
    const ultimaManutencao = ultimasManutencoes[0]?.data_conclusao || v.created_at || new Date().toISOString()
    
    // Próxima manutenção programada
    const proximasAgendadas = vehicleManutencoes
      .filter(m => m.status === 'Agendada')
      .sort((a, b) => new Date(a.data_agendada).getTime() - new Date(b.data_agendada).getTime())
    
    const proximaData = proximasAgendadas[0]?.data_agendada || new Date().toISOString()
    
    // Status baseado em pendências
    let status: 'Em Dia' | 'Próximo do Vencimento' | 'Atrasada' = 'Em Dia'
    if (pendentes > 2) {
      status = 'Atrasada'
    } else if (pendentes > 0) {
      status = 'Próximo do Vencimento'
    }
    
    return {
      ...v,
      pendentes,
      concluidas,
      ultimaManutencao,
      proximaData,
      maintenanceStatus: status,
      proximaManutencao: 50000 // KM estimado para próxima manutenção
    }
  })

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (vehiclesWithStats.length === 0) {
    return (
      <div className="text-center py-12">
        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhum veículo cadastrado</p>
        <p className="text-sm text-gray-500 mt-1">Cadastre veículos no módulo Frota</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehiclesWithStats.map((vehicle) => (
        <Card key={vehicle.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{vehicle.placa}</CardTitle>
                  <p className="text-sm text-gray-600">{vehicle.marca} {vehicle.modelo}</p>
                </div>
              </div>
              {getStatusIcon(vehicle.maintenanceStatus)}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              {getStatusBadge(vehicle.maintenanceStatus)}
            </div>

            {/* Quilometragem Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Quilometragem</span>
                <span>
                  {vehicle.quilometragem_atual ? 
                    `${vehicle.quilometragem_atual.toLocaleString()} km` : 
                    'N/A'
                  }
                </span>
              </div>
              {vehicle.quilometragem_atual && (
                <Progress 
                  value={getKmProgress(vehicle.quilometragem_atual, vehicle.proximaManutencao)} 
                  className="h-2"
                />
              )}
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setDetailsVehicle(vehicle)
                  setDetailsOpen(true)
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                Detalhes
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedVehicle({ 
                    id: vehicle.id, 
                    placa: vehicle.placa, 
                    modelo: `${vehicle.marca} ${vehicle.modelo}` 
                  })
                  setScheduleOpen(true)
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <VehicleScheduleDialog
        open={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        vehicle={selectedVehicle}
      />
      <VehicleDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        vehicle={detailsVehicle}
      />
    </div>
  )
}
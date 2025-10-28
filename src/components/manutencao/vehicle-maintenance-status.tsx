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
import { toast } from '@/hooks/use-toast'
import { useState } from 'react'
import { VehicleScheduleDialog } from './vehicle-schedule-dialog'
import { VehicleDetailsDialog } from '@/components/veiculos/vehicle-details-dialog'

// Mock data temporário - será substituído por dados reais do Supabase
const vehiclesData = [
  {
    id: 1,
    placa: 'BRA-2023',
    marca: 'Volkswagen',
    modelo: 'Constellation',
    tipo: 'Caminhão',
    ano: 2023,
    cor: 'Branco',
    combustivel: 'Diesel',
    capacidade: 15000,
    kmTotal: 45000,
    status: 'Ativo',
    ultimaManutencao: '2024-12-15'
  },
  {
    id: 2,
    placa: 'BRA-2024',
    marca: 'Mercedes-Benz',
    modelo: 'Actros',
    tipo: 'Caminhão',
    ano: 2024,
    cor: 'Branco',
    combustivel: 'Diesel',
    capacidade: 18000,
    kmTotal: 32000,
    status: 'Ativo',
    ultimaManutencao: '2025-01-05'
  },
  {
    id: 3,
    placa: 'BRA-2025',
    marca: 'Scania',
    modelo: 'R450',
    tipo: 'Caminhão',
    ano: 2025,
    cor: 'Vermelho',
    combustivel: 'Diesel',
    capacidade: 20000,
    kmTotal: 28500,
    status: 'Em Manutenção',
    ultimaManutencao: '2024-11-20'
  }
]

// Deriva informações do cadastro de veículos para exibir detalhes consistentes
const vehiclesStatus = (vehiclesData || []).map(v => ({
  id: v.id,
  placa: v.placa,
  modelo: `${v.marca} ${v.modelo}`,
  km: v.kmTotal,
  proximaManutencao: Math.round((v.kmTotal || 0) / 10000 + 1) * 10000,
  status: v.status === 'Em Manutenção' ? 'Próximo do Vencimento' : (v.status === 'Inativo' ? 'Atrasada' : 'Em Dia'),
  ultimaManutencao: v.ultimaManutencao,
  proximaData: new Date().toISOString().slice(0,10),
  pendentes: v.status === 'Em Manutenção' ? 1 : 0,
  concluidas: 5,
  marca: v.marca,
  tipo: v.tipo,
  ano: v.ano,
  cor: v.cor,
  combustivel: v.combustivel,
  capacidade: v.capacidade,
}))

export function VehicleMaintenanceStatus() {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<{ id: number | string; placa: string; modelo: string } | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsVehicle, setDetailsVehicle] = useState<any | null>(null)
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  const full = vehiclesData.find(v => v.placa === vehicle.placa)
                  setDetailsVehicle(full ?? {
                    placa: vehicle.placa,
                    marca: vehicle.modelo.split(' ')[0],
                    modelo: vehicle.modelo.split(' ').slice(1).join(' '),
                    tipo: vehicle.tipo,
                    ano: vehicle.ano,
                    cor: vehicle.cor,
                    combustivel: vehicle.combustivel,
                    capacidade: vehicle.capacidade,
                    kmTotal: vehicle.km,
                    status: vehicle.status,
                    ultimaManutencao: vehicle.ultimaManutencao,
                  })
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
                  setSelectedVehicle({ id: vehicle.id, placa: vehicle.placa, modelo: vehicle.modelo })
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
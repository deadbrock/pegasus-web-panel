'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Wrench, Truck, Calendar, MapPin } from 'lucide-react'
import { VehicleRecord } from '@/services/vehiclesService'

interface VehiclesTableProps {
  onEdit: (vehicle: any) => void
  onView?: (vehicle: VehicleRecord) => void
  data?: VehicleRecord[]
}

export function VehiclesTable({ onEdit, onView, data }: VehiclesTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Ativo': { variant: 'default', color: 'bg-green-500' },
      'Em Manutenção': { variant: 'default', color: 'bg-orange-500' },
      'Inativo': { variant: 'secondary', color: 'bg-gray-500' },
      'Vendido': { variant: 'destructive', color: 'bg-red-500' }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getVehicleIcon = (tipo: string) => {
    return tipo === 'Van' ? (
      <Truck className="w-4 h-4 text-blue-500" />
    ) : (
      <Truck className="w-4 h-4 text-green-500" />
    )
  }

  const rows: VehicleRecord[] = data || []

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500 border rounded-md">
        <div className="text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum veículo cadastrado</p>
          <p className="text-sm mt-2">Clique em "Novo Veículo" para adicionar o primeiro veículo à frota</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>KM Total</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Manutenção</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getVehicleIcon(vehicle.tipo || 'Caminhão')}
                  <span className="font-mono font-medium">{vehicle.placa || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{vehicle.marca || 'N/A'} {vehicle.modelo || ''}</p>
                  <p className="text-sm text-gray-500">{vehicle.cor || '-'} • {vehicle.combustivel || '-'}</p>
                </div>
              </TableCell>
              <TableCell>{vehicle.tipo || 'N/A'}</TableCell>
              <TableCell>{vehicle.ano || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{(vehicle.kmTotal || 0).toLocaleString()} km</span>
                </div>
              </TableCell>
              <TableCell>{(vehicle.capacidade || 0).toLocaleString()} kg</TableCell>
              <TableCell>{getStatusBadge(vehicle.status || 'Ativo')}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">-</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(vehicle)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(vehicle)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    title="Agendar Manutenção"
                  >
                    <Wrench className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
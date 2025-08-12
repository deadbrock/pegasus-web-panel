'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Wrench, Truck, Calendar, MapPin } from 'lucide-react'

// Mock data - substituir por dados do Supabase
export const vehiclesData = [
  {
    id: 1,
    placa: 'BRA-2023',
    marca: 'Volkswagen',
    modelo: 'Delivery 8.160',
    tipo: 'Caminhão',
    ano: 2023,
    cor: 'Branco',
    kmTotal: 15680,
    status: 'Ativo',
    combustivel: 'Diesel',
    capacidade: 3500,
    ultimaManutencao: '2024-01-10'
  },
  {
    id: 2,
    placa: 'BRA-2024',
    marca: 'Ford',
    modelo: 'Cargo 1719',
    tipo: 'Caminhão',
    ano: 2022,
    cor: 'Azul',
    kmTotal: 45200,
    status: 'Em Manutenção',
    combustivel: 'Diesel',
    capacidade: 5000,
    ultimaManutencao: '2024-01-08'
  },
  {
    id: 3,
    placa: 'BRA-2025',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter 416',
    tipo: 'Van',
    ano: 2023,
    cor: 'Prata',
    kmTotal: 28900,
    status: 'Ativo',
    combustivel: 'Diesel',
    capacidade: 1800,
    ultimaManutencao: '2024-01-05'
  },
  {
    id: 4,
    placa: 'BRA-2022',
    marca: 'Iveco',
    modelo: 'Daily 35S14',
    tipo: 'Van',
    ano: 2021,
    cor: 'Branco',
    kmTotal: 67800,
    status: 'Ativo',
    combustivel: 'Diesel',
    capacidade: 2200,
    ultimaManutencao: '2023-12-28'
  },
  {
    id: 5,
    placa: 'BRA-2026',
    marca: 'Renault',
    modelo: 'Master',
    tipo: 'Van',
    ano: 2024,
    cor: 'Branco',
    kmTotal: 8500,
    status: 'Ativo',
    combustivel: 'Diesel',
    capacidade: 1600,
    ultimaManutencao: '2024-01-12'
  },
  {
    id: 6,
    placa: 'BRA-2021',
    marca: 'Fiat',
    modelo: 'Ducato Maxi',
    tipo: 'Van',
    ano: 2020,
    cor: 'Branco',
    kmTotal: 89200,
    status: 'Inativo',
    combustivel: 'Diesel',
    capacidade: 1400,
    ultimaManutencao: '2023-11-15'
  }
]

interface VehiclesTableProps {
  onEdit: (vehicle: any) => void
}

export function VehiclesTable({ onEdit }: VehiclesTableProps) {
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
          {vehiclesData.map((vehicle) => (
            <TableRow key={vehicle.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getVehicleIcon(vehicle.tipo)}
                  <span className="font-mono font-medium">{vehicle.placa}</span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{vehicle.marca} {vehicle.modelo}</p>
                  <p className="text-sm text-gray-500">{vehicle.cor} • {vehicle.combustivel}</p>
                </div>
              </TableCell>
              <TableCell>{vehicle.tipo}</TableCell>
              <TableCell>{vehicle.ano}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{vehicle.kmTotal.toLocaleString()} km</span>
                </div>
              </TableCell>
              <TableCell>{vehicle.capacidade.toLocaleString()} kg</TableCell>
              <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{formatDate(vehicle.ultimaManutencao)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
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
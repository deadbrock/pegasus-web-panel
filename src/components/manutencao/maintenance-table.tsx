"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, Calendar } from 'lucide-react'

// Mock data - substituir por dados do Supabase
export const maintenanceData = [
  {
    id: 1,
    veiculo: 'BRA-2023',
    tipo: 'Preventiva',
    descricao: 'Revisão dos 10.000 km',
    dataAgendada: '2024-01-15',
    quilometragem: 10000,
    status: 'Agendada',
    custo: 850.00,
    responsavel: 'Oficina Central'
  },
  {
    id: 2,
    veiculo: 'BRA-2024',
    tipo: 'Corretiva',
    descricao: 'Reparo do sistema de freios',
    dataAgendada: '2024-01-12',
    quilometragem: 8500,
    status: 'Em Andamento',
    custo: 1200.00,
    responsavel: 'Auto Mecânica Silva'
  },
  {
    id: 3,
    veiculo: 'BRA-2025',
    tipo: 'Troca de Óleo',
    descricao: 'Troca de óleo e filtros',
    dataAgendada: '2024-01-18',
    quilometragem: 5000,
    status: 'Pendente',
    custo: 320.00,
    responsavel: 'Posto Shell'
  },
  {
    id: 4,
    veiculo: 'BRA-2022',
    tipo: 'Revisão',
    descricao: 'Revisão anual obrigatória',
    dataAgendada: '2024-01-10',
    quilometragem: 15000,
    status: 'Concluída',
    custo: 950.00,
    responsavel: 'Concessionária Ford'
  },
  {
    id: 5,
    veiculo: 'BRA-2026',
    tipo: 'Pneus',
    descricao: 'Troca de 4 pneus',
    dataAgendada: '2024-01-20',
    quilometragem: 12000,
    status: 'Atrasada',
    custo: 1600.00,
    responsavel: 'Borracharia Central'
  },
  {
    id: 6,
    veiculo: 'BRA-2021',
    tipo: 'Preventiva',
    descricao: 'Manutenção do ar condicionado',
    dataAgendada: '2024-01-22',
    quilometragem: 18000,
    status: 'Agendada',
    custo: 450.00,
    responsavel: 'Climatização Plus'
  }
]

interface MaintenanceTableProps {
  onEdit: (maintenance: any) => void
  data?: typeof maintenanceData
}

export function MaintenanceTable({ onEdit, data }: MaintenanceTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Agendada': { variant: 'outline', color: 'text-blue-600 border-blue-200' },
      'Em Andamento': { variant: 'default', color: 'bg-yellow-500' },
      'Pendente': { variant: 'secondary', color: 'bg-gray-500' },
      'Concluída': { variant: 'default', color: 'bg-green-500' },
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Veículo</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Data Agendada</TableHead>
            <TableHead>KM</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Custo</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(data ?? maintenanceData).map((maintenance) => (
            <TableRow key={maintenance.id}>
              <TableCell className="font-medium">{maintenance.veiculo}</TableCell>
              <TableCell>{maintenance.tipo}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {maintenance.descricao}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {formatDate(maintenance.dataAgendada)}
                </div>
              </TableCell>
              <TableCell>{maintenance.quilometragem.toLocaleString()} km</TableCell>
              <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(maintenance.custo)}
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {maintenance.responsavel}
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
                    onClick={() => onEdit(maintenance)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Trash2 className="w-4 h-4" />
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
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Eye, Calendar } from 'lucide-react'
import { Manutencao } from '@/lib/services/manutencoes-service'

interface MaintenanceTableProps {
  onEdit: (maintenance: Manutencao) => void
  data?: Manutencao[]
  onDelete?: (id: string) => void
}

export function MaintenanceTable({ onEdit, data = [], onDelete }: MaintenanceTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Agendada': { variant: 'outline', color: 'text-blue-600 border-blue-200' },
      'Em Andamento': { variant: 'default', color: 'bg-yellow-500' },
      'Pendente': { variant: 'secondary', color: 'bg-gray-500' },
      'Concluída': { variant: 'default', color: 'bg-green-500' },
      'Atrasada': { variant: 'destructive', color: 'bg-red-500' },
      'Cancelada': { variant: 'outline', color: 'text-gray-600 border-gray-200' }
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

  const formatCurrency = (value?: number | null) => {
    if (!value) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Nenhuma manutenção cadastrada</p>
        <p className="text-sm text-gray-500 mt-1">Clique em "Nova Manutenção" para começar</p>
      </div>
    )
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
          {data.map((maintenance) => (
            <TableRow key={maintenance.id}>
              <TableCell className="font-medium">{maintenance.veiculo_placa || 'N/A'}</TableCell>
              <TableCell>{maintenance.tipo}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {maintenance.descricao}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  {formatDate(maintenance.data_agendada)}
                </div>
              </TableCell>
              <TableCell>{maintenance.quilometragem.toLocaleString()} km</TableCell>
              <TableCell>{getStatusBadge(maintenance.status)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(maintenance.custo)}
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {maintenance.responsavel || 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(maintenance)}
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(maintenance)}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(maintenance.id)}
                      title="Excluir"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
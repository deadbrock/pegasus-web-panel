'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Edit, Trash2, Calendar, User, Truck } from 'lucide-react'
import type { CostRecord } from '@/services/costsService'

interface CostsTableProps {
  rows: CostRecord[]
  onEdit: (cost: any) => void
  onDelete?: (id: string | number) => void
}

// Dados agora vêm por props

export function CostsTable({ rows, onEdit, onDelete }: CostsTableProps) {
  const getCategoryBadge = (categoria: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Combustível': { variant: 'default', color: 'bg-orange-500' },
      'Manutenção': { variant: 'default', color: 'bg-blue-500' },
      'Pedágio': { variant: 'default', color: 'bg-purple-500' },
      'Seguro': { variant: 'default', color: 'bg-green-500' },
      'Documentação': { variant: 'default', color: 'bg-cyan-500' },
      'Multas': { variant: 'destructive', color: 'bg-red-500' },
      'Estacionamento': { variant: 'outline', color: 'bg-gray-500' },
      'Outros': { variant: 'secondary', color: 'bg-gray-500' }
    }

    return (
      <Badge 
        variant={variants[categoria]?.variant || 'secondary'}
        className={variants[categoria]?.color}
      >
        {categoria}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Pago': { variant: 'default', color: 'bg-green-500' },
      'Pendente': { variant: 'default', color: 'bg-yellow-500' },
      'Vencido': { variant: 'destructive', color: 'bg-red-500' }
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
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleEdit = (cost: any) => {
    onEdit(cost)
  }

  const handleDelete = (costId: string | number) => {
    onDelete?.(costId)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((cost: any) => (
            <TableRow key={cost.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{formatDate(cost.data)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {getCategoryBadge(cost.categoria)}
              </TableCell>
              
              <TableCell>
                <div>
                  <p className="font-medium">{cost.descricao}</p>
                  {cost.observacoes && (
                    <p className="text-sm text-gray-500 mt-1">{cost.observacoes}</p>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">
                    {formatCurrency(cost.valor)}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {(cost as any).veiculo || (cost as any).veiculo_id ? (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{(cost as any).veiculo || (cost as any).veiculo_id}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{cost.responsavel}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(cost.status)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cost)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cost.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Resumo na parte inferior */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">Total de registros: {rows.length}</span>
            <span className="text-green-600 font-medium">Total gasto: {formatCurrency(rows.reduce((sum: number, cost: any) => sum + (Number(cost.valor) || 0), 0))}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-600">Pagos: {rows.filter((c: any) => c.status === 'Pago').length}</span>
            <span className="text-yellow-600">Pendentes: {rows.filter((c: any) => c.status === 'Pendente').length}</span>
            <span className="text-red-600">Vencidos: {rows.filter((c: any) => c.status === 'Vencido').length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
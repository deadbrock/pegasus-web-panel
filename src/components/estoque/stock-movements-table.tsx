'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Minus, Calendar, User } from 'lucide-react'

const movementsData = [
  {
    id: 1,
    produto: 'Parafuso M6x20',
    tipo: 'entrada',
    quantidade: 100,
    data: '2024-01-15',
    usuario: 'João Silva',
    observacao: 'Compra - NF 1234'
  },
  {
    id: 2,
    produto: 'Óleo Lubrificante 1L',
    tipo: 'saida',
    quantidade: 5,
    data: '2024-01-14',
    usuario: 'Maria Santos',
    observacao: 'Manutenção veículo BRA-2023'
  },
  {
    id: 3,
    produto: 'Filtro de Ar',
    tipo: 'entrada',
    quantidade: 20,
    data: '2024-01-13',
    usuario: 'Pedro Costa',
    observacao: 'Estoque de segurança'
  }
]

export function StockMovementsTable() {
  const getMovementBadge = (tipo: string) => {
    if (tipo === 'entrada') {
      return (
        <Badge variant="default" className="bg-green-500">
          <Plus className="w-3 h-3 mr-1" />
          Entrada
        </Badge>
      )
    } else {
      return (
        <Badge variant="default" className="bg-red-500">
          <Minus className="w-3 h-3 mr-1" />
          Saída
        </Badge>
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Usuário</TableHead>
            <TableHead>Observação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movementsData.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="font-medium">{movement.produto}</TableCell>
              <TableCell>{getMovementBadge(movement.tipo)}</TableCell>
              <TableCell className="font-medium">{movement.quantidade}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{formatDate(movement.data)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{movement.usuario}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-600">{movement.observacao}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
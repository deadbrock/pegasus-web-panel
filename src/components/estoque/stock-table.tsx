'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, RefreshCw, Eye, MapPin, Package } from 'lucide-react'
import { stockData } from './stock-data'

interface StockTableProps {
  onEdit: (product: any) => void
  onUpdateStock: (product: any) => void
}

export function StockTable({ onEdit, onUpdateStock }: StockTableProps) {
  const getStockStatusBadge = (quantidade: number, estoqueMinimo: number) => {
    if (quantidade === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    } else if (quantidade <= estoqueMinimo) {
      return <Badge variant="default" className="bg-orange-500">Estoque Baixo</Badge>
    } else if (quantidade <= estoqueMinimo * 1.5) {
      return <Badge variant="default" className="bg-yellow-500">Atenção</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">Normal</Badge>
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

  const calculateTotalValue = (quantidade: number, valorUnitario: number) => {
    return quantidade * valorUnitario
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Mín.</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valor Unit.</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Localização</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stockData.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-mono text-sm">{product.codigo}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{product.nome}</p>
                  <p className="text-sm text-gray-500">{product.fornecedor}</p>
                </div>
              </TableCell>
              <TableCell>{product.categoria}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{product.quantidade}</span>
                  <span className="text-sm text-gray-500">{product.unidade}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{product.estoqueMinimo}</TableCell>
              <TableCell>
                {getStockStatusBadge(product.quantidade, product.estoqueMinimo)}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(product.valorUnitario)}
              </TableCell>
              <TableCell className="font-medium">
                {formatCurrency(calculateTotalValue(product.quantidade, product.valorUnitario))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{product.localizacao}</span>
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
                    onClick={() => onEdit(product)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateStock(product)}
                  >
                    <RefreshCw className="w-4 h-4" />
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
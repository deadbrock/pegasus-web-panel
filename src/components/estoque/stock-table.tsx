'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, RefreshCw, Eye, MapPin, Package } from 'lucide-react'

// Mock data - substituir por dados do Supabase
const stockData = [
  {
    id: 1,
    codigo: 'PRD001',
    nome: 'Parafuso M6x20',
    categoria: 'Fixação',
    quantidade: 850,
    estoqueMinimo: 100,
    unidade: 'UN',
    valorUnitario: 0.25,
    localizacao: 'A1-B3',
    fornecedor: 'Parafusos ABC',
    ultimaMovimentacao: '2024-01-15'
  },
  {
    id: 2,
    codigo: 'PRD002',
    nome: 'Óleo Lubrificante 1L',
    categoria: 'Lubrificantes',
    quantidade: 45,
    estoqueMinimo: 50,
    unidade: 'UN',
    valorUnitario: 18.50,
    localizacao: 'C2-A1',
    fornecedor: 'Petróleo XYZ',
    ultimaMovimentacao: '2024-01-14'
  },
  {
    id: 3,
    codigo: 'PRD003',
    nome: 'Filtro de Ar',
    categoria: 'Filtros',
    quantidade: 15,
    estoqueMinimo: 25,
    unidade: 'UN',
    valorUnitario: 45.90,
    localizacao: 'B1-C2',
    fornecedor: 'Filtros Brasil',
    ultimaMovimentacao: '2024-01-13'
  },
  {
    id: 4,
    codigo: 'PRD004',
    nome: 'Pneu 205/55R16',
    categoria: 'Pneus',
    quantidade: 8,
    estoqueMinimo: 12,
    unidade: 'UN',
    valorUnitario: 320.00,
    localizacao: 'D1-A1',
    fornecedor: 'Pneus Premium',
    ultimaMovimentacao: '2024-01-12'
  },
  {
    id: 5,
    codigo: 'PRD005',
    nome: 'Bateria 12V 60Ah',
    categoria: 'Elétricos',
    quantidade: 25,
    estoqueMinimo: 15,
    unidade: 'UN',
    valorUnitario: 280.00,
    localizacao: 'E1-B2',
    fornecedor: 'Energia Plus',
    ultimaMovimentacao: '2024-01-11'
  },
  {
    id: 6,
    codigo: 'PRD006',
    nome: 'Cabo de Vela',
    categoria: 'Elétricos',
    quantidade: 3,
    estoqueMinimo: 10,
    unidade: 'UN',
    valorUnitario: 85.00,
    localizacao: 'E2-C1',
    fornecedor: 'Peças Auto',
    ultimaMovimentacao: '2024-01-10'
  }
]

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
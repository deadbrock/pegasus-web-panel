'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package } from 'lucide-react'

interface Produto {
  id?: string
  codigo: string
  nome: string
  estoque_atual: number
  estoque_minimo: number
}

interface StockAlertsTableProps {
  produtos: Produto[]
  loading: boolean
}

export function StockAlertsTable({ produtos, loading }: StockAlertsTableProps) {
  // Filtrar produtos com alerta (abaixo do mínimo)
  const produtosComAlerta = produtos.filter(p => 
    p.estoque_atual <= p.estoque_minimo
  )

  const getNivel = (produto: Produto) => {
    if (produto.estoque_atual <= 0) return 'critico'
    if (produto.estoque_atual < produto.estoque_minimo * 0.5) return 'critico'
    return 'baixo'
  }

  const getAlertBadge = (nivel: string) => {
    if (nivel === 'critico') {
      return <Badge variant="destructive">Crítico</Badge>
    } else {
      return <Badge variant="default" className="bg-orange-500">Baixo</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Carregando alertas...</p>
      </div>
    )
  }

  if (produtosComAlerta.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertTriangle className="mx-auto h-12 w-12 mb-4 text-gray-400" />
        <p className="text-lg font-medium">Nenhum alerta de estoque</p>
        <p className="text-sm mt-2">Todos os produtos estão com estoque adequado</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produto</TableHead>
            <TableHead>Quantidade</TableHead>
            <TableHead>Mínimo</TableHead>
            <TableHead>Nível</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtosComAlerta.map((produto) => {
            const nivel = getNivel(produto)
            return (
              <TableRow key={produto.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-4 h-4 ${nivel === 'critico' ? 'text-red-500' : 'text-orange-500'}`} />
                    <div>
                      <p className="font-medium">{produto.nome}</p>
                      <p className="text-sm text-gray-500">{produto.codigo}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{produto.estoque_atual}</span>
                  </div>
                </TableCell>
                <TableCell>{produto.estoque_minimo}</TableCell>
                <TableCell>{getAlertBadge(nivel)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
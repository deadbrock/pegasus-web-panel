'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Package } from 'lucide-react'

const alertsData = [
  {
    id: 1,
    codigo: 'PRD002',
    nome: 'Óleo Lubrificante 1L',
    quantidade: 45,
    estoqueMinimo: 50,
    nivel: 'baixo'
  },
  {
    id: 2,
    codigo: 'PRD003',
    nome: 'Filtro de Ar',
    quantidade: 15,
    estoqueMinimo: 25,
    nivel: 'baixo'
  },
  {
    id: 3,
    codigo: 'PRD006',
    nome: 'Cabo de Vela',
    quantidade: 3,
    estoqueMinimo: 10,
    nivel: 'critico'
  }
]

export function StockAlertsTable() {
  const getAlertBadge = (nivel: string) => {
    if (nivel === 'critico') {
      return <Badge variant="destructive">Crítico</Badge>
    } else {
      return <Badge variant="default" className="bg-orange-500">Baixo</Badge>
    }
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
          {alertsData.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 ${alert.nivel === 'critico' ? 'text-red-500' : 'text-orange-500'}`} />
                  <div>
                    <p className="font-medium">{alert.nome}</p>
                    <p className="text-sm text-gray-500">{alert.codigo}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{alert.quantidade}</span>
                </div>
              </TableCell>
              <TableCell>{alert.estoqueMinimo}</TableCell>
              <TableCell>{getAlertBadge(alert.nivel)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
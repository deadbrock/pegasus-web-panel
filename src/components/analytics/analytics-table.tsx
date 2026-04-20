'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react'

// Dados virão do Supabase
const data: any[] = []

export function AnalyticsTable() {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      'Ativo': 'default',
      'Manutenção': 'destructive',
      'Férias': 'secondary'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" size="sm">
                Motorista
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm">
                Veículo
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm">
                Entregas
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm">
                Eficiência
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm">
                Combustível (km/l)
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tendência</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                Nenhum dado de analytics disponível.
              </TableCell>
            </TableRow>
          ) : data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.motorista}</TableCell>
              <TableCell>{row.veiculo}</TableCell>
              <TableCell>{row.entregas}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{row.eficiencia}%</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${row.eficiencia}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>{row.combustivel}</TableCell>
              <TableCell>{getStatusBadge(row.status)}</TableCell>
              <TableCell>{getTrendIcon(row.trend)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
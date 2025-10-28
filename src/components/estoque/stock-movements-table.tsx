'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Package } from 'lucide-react'

export function StockMovementsTable() {
  // Dados reais virão da tabela movimentacoes_estoque em breve
  return (
    <div className="text-center py-16 text-gray-500">
      <Package className="mx-auto h-16 w-16 mb-4 text-gray-400" />
      <p className="text-lg font-medium">Movimentações em Desenvolvimento</p>
      <p className="text-sm mt-2">
        As movimentações de estoque serão exibidas aqui conforme você processar notas fiscais
      </p>
      <p className="text-xs mt-4 text-gray-400">
        Tabela: movimentacoes_estoque
      </p>
    </div>
  )
}

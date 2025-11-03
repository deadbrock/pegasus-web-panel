'use client'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Package, RefreshCw, AlertCircle } from 'lucide-react'
import { fetchMovimentacoes, type MovimentacaoEstoque } from '@/lib/services/movimentacoes-service'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StockMovementsTable() {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMovimentacoes()
  }, [])

  const loadMovimentacoes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchMovimentacoes(100)
      setMovimentacoes(data)
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err)
      setError('Erro ao carregar movimentações')
    } finally {
      setLoading(false)
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <Badge className="bg-green-500"><TrendingUp className="w-3 h-3 mr-1" />Entrada</Badge>
      case 'saida':
        return <Badge className="bg-red-500"><TrendingDown className="w-3 h-3 mr-1" />Saída</Badge>
      case 'ajuste':
        return <Badge className="bg-blue-500"><RefreshCw className="w-3 h-3 mr-1" />Ajuste</Badge>
      case 'transferencia':
        return <Badge className="bg-purple-500"><Package className="w-3 h-3 mr-1" />Transferência</Badge>
      default:
        return <Badge>{tipo}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        <RefreshCw className="mx-auto h-16 w-16 mb-4 text-gray-400 animate-spin" />
        <p className="text-lg font-medium">Carregando movimentações...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16 text-gray-500">
        <AlertCircle className="mx-auto h-16 w-16 mb-4 text-red-400" />
        <p className="text-lg font-medium text-red-600">{error}</p>
        <p className="text-sm mt-2">Tente novamente mais tarde</p>
      </div>
    )
  }

  if (movimentacoes.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Package className="mx-auto h-16 w-16 mb-4 text-gray-400" />
        <p className="text-lg font-medium">Nenhuma movimentação registrada</p>
        <p className="text-sm mt-2">
          As movimentações aparecerão aqui quando você adicionar ou remover produtos do estoque
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Quantidade</TableHead>
            <TableHead className="text-right">Est. Anterior</TableHead>
            <TableHead className="text-right">Est. Novo</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movimentacoes.map((mov) => (
            <TableRow key={mov.id}>
              <TableCell className="font-medium">
                {mov.data_movimentacao || mov.created_at
                  ? format(
                      new Date(mov.data_movimentacao || mov.created_at!),
                      "dd/MM/yyyy HH:mm",
                      { locale: ptBR }
                    )
                  : '-'}
              </TableCell>
              <TableCell>{mov.produto?.codigo || '-'}</TableCell>
              <TableCell>{mov.produto?.nome || '-'}</TableCell>
              <TableCell>{getTipoBadge(mov.tipo)}</TableCell>
              <TableCell className="text-right font-semibold">
                {mov.tipo === 'entrada' || mov.tipo === 'ajuste' ? '+' : '-'}
                {mov.quantidade}
              </TableCell>
              <TableCell className="text-right text-gray-600">
                {mov.estoque_anterior !== undefined ? mov.estoque_anterior : '-'}
              </TableCell>
              <TableCell className="text-right text-gray-900 font-medium">
                {mov.estoque_novo !== undefined ? mov.estoque_novo : '-'}
              </TableCell>
              <TableCell className="text-sm text-gray-600">
                {mov.documento || '-'}
              </TableCell>
              <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                {mov.motivo || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

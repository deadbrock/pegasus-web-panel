'use client'

import { useState, useEffect } from 'react'
import { MapPin, RefreshCw, AlertCircle, Package } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { fetchProdutos, type Produto } from '@/lib/services/produtos-service'

export function StockLocationsTable() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProdutos()
  }, [])

  const loadProdutos = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchProdutos()
      // Ordenar por localização
      const sorted = data.sort((a, b) => {
        const locA = a.localizacao || ''
        const locB = b.localizacao || ''
        return locA.localeCompare(locB)
      })
      setProdutos(sorted)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
      setError('Erro ao carregar localizações')
    } finally {
      setLoading(false)
    }
  }

  // Agrupar produtos por localização
  const groupByLocation = () => {
    const grouped = produtos.reduce((acc, produto) => {
      const loc = produto.localizacao || 'Sem Localização'
      if (!acc[loc]) {
        acc[loc] = []
      }
      acc[loc].push(produto)
      return acc
    }, {} as Record<string, Produto[]>)

    return Object.entries(grouped).map(([location, products]) => ({
      location,
      products,
      totalProdutos: products.length,
      totalEstoque: products.reduce((sum, p) => sum + p.estoque_atual, 0),
      valorTotal: products.reduce((sum, p) => sum + (p.estoque_atual * (p.preco_unitario || 0)), 0)
    }))
  }

  const getStatusBadge = (estoque: number, minimo: number) => {
    if (estoque === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>
    }
    if (estoque <= minimo) {
      return <Badge className="bg-orange-500">Baixo</Badge>
    }
    return <Badge className="bg-green-500">OK</Badge>
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-gray-500">
        <RefreshCw className="mx-auto h-16 w-16 mb-4 text-gray-400 animate-spin" />
        <p className="text-lg font-medium">Carregando localizações...</p>
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

  if (produtos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <Package className="mx-auto h-16 w-16 mb-4 text-gray-400" />
        <p className="text-lg font-medium">Nenhum produto cadastrado</p>
        <p className="text-sm mt-2">
          Adicione produtos para visualizar suas localizações
        </p>
      </div>
    )
  }

  const locationsData = groupByLocation()

  return (
    <div className="space-y-6">
      {/* Resumo de Localizações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-700 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="font-semibold">Total de Localizações</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{locationsData.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <Package className="w-5 h-5" />
            <span className="font-semibold">Total de Produtos</span>
          </div>
          <p className="text-3xl font-bold text-green-900">{produtos.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-700 mb-2">
            <Package className="w-5 h-5" />
            <span className="font-semibold">Valor Total</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              locationsData.reduce((sum, loc) => sum + loc.valorTotal, 0)
            )}
          </p>
        </div>
      </div>

      {/* Tabela de Localizações */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Localização</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor Unit.</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {produto.localizacao || <span className="text-gray-400 italic">Não definido</span>}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">{produto.codigo}</TableCell>
                <TableCell>{produto.nome}</TableCell>
                <TableCell>
                  <Badge variant="outline">{produto.categoria}</Badge>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {produto.estoque_atual} {produto.unidade}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {produto.estoque_minimo} {produto.unidade}
                </TableCell>
                <TableCell>
                  {getStatusBadge(produto.estoque_atual, produto.estoque_minimo)}
                </TableCell>
                <TableCell className="text-right text-gray-600">
                  {produto.preco_unitario
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.preco_unitario)
                    : '-'}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {produto.preco_unitario
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        produto.estoque_atual * produto.preco_unitario
                      )
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Resumo por Localização */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locationsData.map((loc) => (
          <div key={loc.location} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{loc.location}</h3>
              </div>
              <Badge variant="secondary">{loc.totalProdutos} itens</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Qtd. Total:</span>
                <span className="font-semibold">{loc.totalEstoque} un</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Total:</span>
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loc.valorTotal)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

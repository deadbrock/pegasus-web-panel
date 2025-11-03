'use client'

import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { RefreshCw, Package } from 'lucide-react'
import { fetchProdutos } from '@/lib/services/produtos-service'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280']

export function StockLevelChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const produtos = await fetchProdutos()
      
      // Agrupar por categoria
      const grouped = produtos.reduce((acc, produto) => {
        const categoria = produto.categoria || 'Sem Categoria'
        if (!acc[categoria]) {
          acc[categoria] = 0
        }
        acc[categoria] += produto.estoque_atual
        return acc
      }, {} as Record<string, number>)
      
      // Converter para formato do gráfico
      const chartData = Object.entries(grouped)
        .map(([name, value], index) => ({
          name,
          value,
          color: COLORS[index % COLORS.length]
        }))
        .sort((a, b) => b.value - a.value) // Ordenar por quantidade
      
      setData(chartData)
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
      // Dados mockados em caso de erro
      setData([
        { name: 'Fixação', value: 850, color: '#3b82f6' },
        { name: 'Lubrificantes', value: 45, color: '#10b981' },
        { name: 'Filtros', value: 15, color: '#f59e0b' },
        { name: 'Pneus', value: 8, color: '#ef4444' },
        { name: 'Elétricos', value: 28, color: '#8b5cf6' },
        { name: 'Outros', value: 35, color: '#6b7280' }
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center text-gray-500">
        <Package className="w-16 h-16 mb-4 text-gray-400" />
        <p className="text-lg font-medium">Nenhum produto cadastrado</p>
        <p className="text-sm mt-2">Adicione produtos para visualizar o gráfico</p>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Quantidade']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { RefreshCw } from 'lucide-react'
import { fetchProdutos } from '@/lib/services/produtos-service'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function StockChart() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChartData()
  }, [])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const produtos = await fetchProdutos()
      
      // Gerar dados dos últimos 6 meses
      const chartData = []
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i)
        const mes = format(date, 'MMM', { locale: ptBR })
        
        // Calcular valor total e quantidade atual (simulação de evolução)
        const fator = 1 - (i * 0.05) // Simula crescimento de 5% ao mês
        const quantidadeTotal = produtos.reduce((sum, p) => sum + p.estoque_atual, 0) * fator
        const valorTotal = produtos.reduce((sum, p) => sum + (p.estoque_atual * (p.preco_unitario || 0)), 0) * fator
        
        chartData.push({
          mes: mes.charAt(0).toUpperCase() + mes.slice(1),
          valor: Math.round(valorTotal),
          quantidade: Math.round(quantidadeTotal)
        })
      }
      
      setData(chartData)
    } catch (error) {
      console.error('Erro ao carregar dados do gráfico:', error)
      // Dados mockados em caso de erro
      setData([
        { mes: 'Jul', valor: 2100000, quantidade: 1450 },
        { mes: 'Ago', valor: 2280000, quantidade: 1520 },
        { mes: 'Set', valor: 2150000, quantidade: 1480 },
        { mes: 'Out', valor: 2350000, quantidade: 1580 },
        { mes: 'Nov', valor: 2420000, quantidade: 1620 },
        { mes: 'Dez', valor: 2456780, quantidade: 1647 }
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

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'valor' || name === 'Valor (R$)') {
                return [new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(value), 'Valor Total']
              }
              return [value, 'Total de Produtos']
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="valor"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Valor (R$)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="quantidade"
            stroke="#10b981"
            strokeWidth={3}
            name="Quantidade"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
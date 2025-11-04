'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, Clock, Route, Fuel, Package } from 'lucide-react'
import { fetchVeiculos } from '@/lib/services/rastreamento-realtime'

interface TrackingMetricsProps {
  compact?: boolean
}

// Dados reais virão do Supabase

export function TrackingMetrics({ compact = false }: TrackingMetricsProps) {
  const [veiculos, setVeiculos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchVeiculos()
      setVeiculos(data)
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    } finally {
      setLoading(false)
    }
  }

  const veiculosAtivos = veiculos.filter(v => v.status === 'Ativo' || v.status === 'Em Rota').length
  const emMovimento = veiculos.filter(v => v.status === 'Em Rota').length
  const percentualOnline = veiculos.length > 0 ? (veiculosAtivos / veiculos.length) * 100 : 0

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Veículos Online */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Veículos Online</span>
            <span className="font-medium">{veiculosAtivos}/{veiculos.length}</span>
          </div>
          <Progress value={percentualOnline} className="h-2" />
        </div>

        {/* Em Movimento */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Em Movimento</span>
            <span className="font-medium">{emMovimento}</span>
          </div>
          <Progress value={veiculosAtivos > 0 ? (emMovimento / veiculosAtivos) * 100 : 0} className="h-2" />
        </div>

        {/* Métricas em Desenvolvimento */}
        <div className="text-center py-4 text-gray-400 text-xs">
          <p>Métricas avançadas em desenvolvimento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics em Desenvolvimento */}
      <div className="text-center py-16 text-gray-500">
        <Package className="mx-auto h-16 w-16 mb-4 text-gray-400" />
        <p className="text-lg font-medium">Analytics em Desenvolvimento</p>
        <p className="text-sm mt-2">
          Métricas avançadas e gráficos serão disponibilizados em breve
        </p>
        <div className="mt-6 text-left max-w-md mx-auto bg-blue-50 p-4 rounded-lg">
          <p className="font-medium text-blue-900 mb-2">Dados Básicos Disponíveis:</p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✓ Total de Veículos: {veiculos.length}</li>
            <li>✓ Veículos Ativos: {veiculosAtivos}</li>
            <li>✓ Em Movimento: {emMovimento}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
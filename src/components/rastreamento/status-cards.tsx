import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Car, Navigation, Clock, WifiOff, Route, TrendingUp } from 'lucide-react'
import { RastreamentoStats } from '@/types/rastreamento'

interface StatusCardsProps {
  stats: RastreamentoStats
}

export function StatusCards({ stats }: StatusCardsProps) {
  const cards = [
    {
      title: 'Total de Veículos',
      value: stats.total_veiculos,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Veículos Ativos',
      value: stats.veiculos_ativos,
      icon: Navigation,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Em Rota',
      value: stats.veiculos_em_rota,
      icon: Route,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Parados',
      value: stats.veiculos_parados,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Offline',
      value: stats.veiculos_offline,
      icon: WifiOff,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Distância Total',
      value: `${Math.round(stats.distancia_total_percorrida / 1000)} km`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 
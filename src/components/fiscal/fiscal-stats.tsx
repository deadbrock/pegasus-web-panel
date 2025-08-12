import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, TrendingUp, DollarSign, Building } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { FiscalStats as StatsType } from '@/types/fiscal'

interface FiscalStatsProps {
  stats: StatsType
}

export function FiscalStats({ stats }: FiscalStatsProps) {
  const cards = [
    {
      title: 'Total de Notas',
      value: stats.total_notas,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Notas Pendentes',
      value: stats.notas_pendentes,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Notas Processadas',
      value: stats.notas_processadas,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Valor Total (Mês)',
      value: formatCurrency(stats.valor_total_mes),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'ICMS (Mês)',
      value: formatCurrency(stats.valor_icms_mes),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Fornecedores Ativos',
      value: stats.fornecedores_ativos,
      icon: Building,
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
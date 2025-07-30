'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const driverPerformanceData = [
  {
    id: 1,
    nome: 'Carlos Lima',
    pontuacao: 96,
    tendencia: 'up',
    variacao: '+3%',
    entregas: 28,
    pontualidade: 98,
    seguranca: 95,
    eficiencia: 94,
    satisfacao: 97
  },
  {
    id: 2,
    nome: 'Ana Oliveira',
    pontuacao: 94,
    tendencia: 'up',
    variacao: '+1%',
    entregas: 24,
    pontualidade: 96,
    seguranca: 93,
    eficiencia: 92,
    satisfacao: 95
  },
  {
    id: 3,
    nome: 'João Silva',
    pontuacao: 92,
    tendencia: 'down',
    variacao: '-2%',
    entregas: 26,
    pontualidade: 89,
    seguranca: 97,
    eficiencia: 90,
    satisfacao: 92
  },
  {
    id: 4,
    nome: 'Maria Santos',
    pontuacao: 89,
    tendencia: 'stable',
    variacao: '0%',
    entregas: 22,
    pontualidade: 92,
    seguranca: 88,
    eficiencia: 87,
    satisfacao: 89
  },
  {
    id: 5,
    nome: 'Pedro Costa',
    pontuacao: 85,
    tendencia: 'up',
    variacao: '+4%',
    entregas: 18,
    pontualidade: 85,
    seguranca: 82,
    eficiencia: 89,
    satisfacao: 84
  },
  {
    id: 6,
    nome: 'Roberto Silva',
    pontuacao: 78,
    tendencia: 'down',
    variacao: '-5%',
    entregas: 12,
    pontualidade: 76,
    seguranca: 81,
    eficiencia: 75,
    satisfacao: 80
  }
]

export function DriverPerformanceOverview() {
  const getPerformanceBadge = (pontuacao: number) => {
    if (pontuacao >= 95) return <Badge variant="default" className="bg-green-600">Excelente</Badge>
    if (pontuacao >= 90) return <Badge variant="default" className="bg-blue-600">Muito Bom</Badge>
    if (pontuacao >= 80) return <Badge variant="default" className="bg-yellow-600">Bom</Badge>
    return <Badge variant="destructive">Precisa Melhorar</Badge>
  }

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getVariationColor = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {driverPerformanceData.map((driver) => (
        <Card key={driver.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle className="text-lg">{driver.nome}</CardTitle>
                  <p className="text-sm text-gray-600">{driver.entregas} entregas este mês</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(driver.tendencia)}
                <span className={`text-sm font-medium ${getVariationColor(driver.tendencia)}`}>
                  {driver.variacao}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Performance Badge */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{driver.pontuacao}%</span>
              {getPerformanceBadge(driver.pontuacao)}
            </div>

            {/* Progress Bar */}
            <Progress value={driver.pontuacao} className="h-2" />

            {/* Detailed Metrics */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pontualidade</span>
                <span className="font-medium">{driver.pontualidade}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Segurança</span>
                <span className="font-medium">{driver.seguranca}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Eficiência</span>
                <span className="font-medium">{driver.eficiencia}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Satisfação</span>
                <span className="font-medium">{driver.satisfacao}%</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex justify-between pt-2 border-t">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  driver.pontualidade >= 90 ? 'bg-green-500' : 
                  driver.pontualidade >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Pontual</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  driver.seguranca >= 90 ? 'bg-green-500' : 
                  driver.seguranca >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Seguro</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  driver.eficiencia >= 90 ? 'bg-green-500' : 
                  driver.eficiencia >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Eficiente</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  driver.satisfacao >= 90 ? 'bg-green-500' : 
                  driver.satisfacao >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Satisfação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
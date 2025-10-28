'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type DriverPerformance = {
  id: string | number
  nome: string
  pontuacao: number
  tendencia?: 'up' | 'down' | 'stable'
  variacao?: string
  entregas?: number
  pontualidade?: number
  seguranca?: number
  eficiencia?: number
  satisfacao?: number
}

type DriverPerformanceOverviewProps = {
  data?: DriverPerformance[]
}

export function DriverPerformanceOverview({ data }: DriverPerformanceOverviewProps) {
  const driverPerformanceData = data || []
  
  if (driverPerformanceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Nenhum dado de performance disponível</p>
          <p className="text-sm mt-2">Os dados de performance dos motoristas aparecerão aqui</p>
        </div>
      </div>
    )
  }
  

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
                <span className="font-medium">{driver.pontualidade || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Segurança</span>
                <span className="font-medium">{driver.seguranca || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Eficiência</span>
                <span className="font-medium">{driver.eficiencia || 0}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Satisfação</span>
                <span className="font-medium">{driver.satisfacao || 0}%</span>
              </div>
            </div>

            {/* Performance Indicators */}
            <div className="flex justify-between pt-2 border-t">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  (driver.pontualidade || 0) >= 90 ? 'bg-green-500' : 
                  (driver.pontualidade || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Pontual</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  (driver.seguranca || 0) >= 90 ? 'bg-green-500' : 
                  (driver.seguranca || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Seguro</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  (driver.eficiencia || 0) >= 90 ? 'bg-green-500' : 
                  (driver.eficiencia || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <p className="text-xs text-gray-600 mt-1">Eficiente</p>
              </div>
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto ${
                  (driver.satisfacao || 0) >= 90 ? 'bg-green-500' : 
                  (driver.satisfacao || 0) >= 80 ? 'bg-yellow-500' : 'bg-red-500'
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
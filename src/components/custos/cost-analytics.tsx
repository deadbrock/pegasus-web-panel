'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export function CostAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Analytics Avançadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <BarChart3 className="w-12 h-12 mb-3" />
          <p className="text-base font-medium">Analytics em desenvolvimento</p>
          <p className="text-sm mt-1 text-center max-w-xs">
            Esta seção exibirá análises orçamentárias, tendências e indicadores de eficiência com dados reais do sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

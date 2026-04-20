'use client'

import { BarChart2 } from 'lucide-react'

export function KPIChartsPanel() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
      <BarChart2 className="w-10 h-10 mb-3 text-gray-300" />
      <p className="font-medium">Nenhum dado de KPI disponível</p>
      <p className="text-sm mt-1">Os gráficos de KPIs aparecerão aqui com dados reais do período selecionado.</p>
    </div>
  )
}

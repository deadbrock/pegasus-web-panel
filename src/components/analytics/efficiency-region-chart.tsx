'use client'

import { BarChart2 } from 'lucide-react'

export function EfficiencyRegionChart() {
  return (
    <div className="flex flex-col items-center justify-center h-80 text-center text-gray-500">
      <BarChart2 className="w-10 h-10 mb-3 text-gray-300" />
      <p className="font-medium">Nenhum dado de eficiência por região</p>
      <p className="text-sm mt-1">O gráfico será preenchido com dados reais do Supabase.</p>
    </div>
  )
}

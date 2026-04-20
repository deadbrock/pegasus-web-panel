'use client'

import { Wrench } from 'lucide-react'

export function MaintenanceChart() {
  return (
    <div className="w-full h-64 flex flex-col items-center justify-center text-center text-gray-500">
      <Wrench className="w-10 h-10 mb-3 text-gray-300" />
      <p className="font-medium">Nenhum dado de manutenção disponível</p>
      <p className="text-sm mt-1">O gráfico semanal de manutenções aparecerá aqui com dados reais.</p>
    </div>
  )
}

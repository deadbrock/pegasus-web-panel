'use client'

import { TrendingUp } from 'lucide-react'

export function AuditHistoryChart() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 h-64">
        <TrendingUp className="w-10 h-10 mb-3 text-gray-300" />
        <p className="font-medium">Nenhum histórico de auditoria disponível</p>
        <p className="text-sm mt-1">O gráfico de evolução do score aparecerá aqui com dados reais.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Score Atual</p>
          <p className="text-2xl font-bold text-blue-600">—</p>
        </div>
        <div>
          <p className="text-gray-500">Média Período</p>
          <p className="text-2xl font-bold text-gray-700">—</p>
        </div>
        <div>
          <p className="text-gray-500">Tendência</p>
          <p className="text-2xl font-bold text-gray-400">—</p>
        </div>
      </div>
    </div>
  )
}

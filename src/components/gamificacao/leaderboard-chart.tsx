'use client'

import { TrendingUp } from 'lucide-react'

export function LeaderboardChart() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
      <TrendingUp className="w-10 h-10 mb-3 text-gray-300" />
      <p className="font-medium">Nenhum histórico de ranking disponível</p>
      <p className="text-sm mt-1">Os dados de evolução do ranking aparecerão aqui conforme os motoristas acumulam pontos.</p>
    </div>
  )
}

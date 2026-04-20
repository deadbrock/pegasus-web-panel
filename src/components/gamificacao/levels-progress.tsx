'use client'

import { Crown } from 'lucide-react'

export function LevelsProgress() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
        <Crown className="w-10 h-10 mb-3 text-gray-300" />
        <p className="font-medium">Nenhum motorista cadastrado</p>
        <p className="text-sm mt-1">A distribuição de níveis aparecerá aqui conforme os motoristas forem registrados.</p>
      </div>

      <div className="pt-3 border-t">
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <p className="text-xl font-bold text-gray-900">0</p>
            <p className="text-gray-600">Total Motoristas</p>
          </div>
          <div>
            <p className="text-xl font-bold text-yellow-600">0</p>
            <p className="text-gray-600">Elite (Ouro+)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

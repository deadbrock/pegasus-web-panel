'use client'

import { Activity } from 'lucide-react'

export function ActivityPoints() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500 h-48">
        <Activity className="w-10 h-10 mb-3 text-gray-300" />
        <p className="font-medium">Nenhuma atividade registrada</p>
        <p className="text-sm mt-1">O gráfico de evolução de pontos aparecerá aqui conforme as atividades forem realizadas.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Total Atual</p>
          <p className="text-xl font-bold text-blue-600">0</p>
        </div>
        <div>
          <p className="text-gray-500">Hoje</p>
          <p className="text-xl font-bold text-green-600">+0</p>
        </div>
        <div>
          <p className="text-gray-500">Média/Dia</p>
          <p className="text-xl font-bold text-purple-600">0</p>
        </div>
      </div>

      <div className="pt-3 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Atividades Hoje</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Entregas realizadas</span>
            <span className="font-medium text-green-600">0</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Conquistas obtidas</span>
            <span className="font-medium text-purple-600">0</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Pontos de bônus</span>
            <span className="font-medium text-blue-600">+0</span>
          </div>
        </div>
      </div>
    </div>
  )
}

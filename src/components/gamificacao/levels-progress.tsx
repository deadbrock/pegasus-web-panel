'use client'

import { Crown } from 'lucide-react'

// Mock data para distribuição de níveis
const levelsData = [
  { nivel: 'Iniciante', quantidade: 2, cor: 'bg-gray-400', porcentagem: 8 },
  { nivel: 'Bronze', quantidade: 8, cor: 'bg-orange-600', porcentagem: 33 },
  { nivel: 'Prata', quantidade: 7, cor: 'bg-gray-300', porcentagem: 29 },
  { nivel: 'Ouro', quantidade: 5, cor: 'bg-yellow-500', porcentagem: 21 },
  { nivel: 'Platina', quantidade: 2, cor: 'bg-blue-400', porcentagem: 8 },
  { nivel: 'Diamante', quantidade: 1, cor: 'bg-cyan-400', porcentagem: 4 }
]

export function LevelsProgress() {
  const total = levelsData.reduce((sum, level) => sum + level.quantidade, 0)

  return (
    <div className="space-y-4">
      {/* Distribuição Visual */}
      <div className="space-y-3">
        {levelsData.map((level, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${level.cor}`}>
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm font-medium">{level.nivel}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{level.quantidade}</span>
                <span className="text-xs text-gray-500">({level.porcentagem}%)</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${level.cor}`}
                style={{ width: `${level.porcentagem}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="pt-3 border-t">
        <div className="grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <p className="text-xl font-bold text-gray-900">{total}</p>
            <p className="text-gray-600">Total Motoristas</p>
          </div>
          <div>
            <p className="text-xl font-bold text-yellow-600">
              {levelsData.slice(3).reduce((sum, level) => sum + level.quantidade, 0)}
            </p>
            <p className="text-gray-600">Elite (Ouro+)</p>
          </div>
        </div>
      </div>

      {/* Próximas Promoções */}
      <div className="pt-3 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Próximas Promoções</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Carlos Lima</span>
            <div className="flex items-center gap-2">
              <span className="text-orange-600">Bronze</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-300">Prata</span>
              <span className="text-xs text-gray-500">(30 pts)</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Pedro Oliveira</span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">Ouro</span>
              <span className="text-gray-400">→</span>
              <span className="text-blue-400">Platina</span>
              <span className="text-xs text-gray-500">(150 pts)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Crown, Medal, Star, TrendingUp, User } from 'lucide-react'

interface DriversRankingProps {
  period: string
  compact?: boolean
}

// Ranking virá do Supabase — sem dados mock
const rankingData: any[] = []

export function DriversRanking({ period, compact = false }: DriversRankingProps) {
  const displayData = compact ? rankingData.slice(0, 5) : rankingData

  const getRankIcon = (posicao: number) => {
    switch (posicao) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">#{posicao}</span>
          </div>
        )
    }
  }

  const getLevelIcon = (nivel: string) => {
    switch (nivel) {
      case 'Diamante':
        return <Crown className="w-4 h-4 text-cyan-400" />
      case 'Platina':
        return <Crown className="w-4 h-4 text-blue-400" />
      case 'Ouro':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'Prata':
        return <Crown className="w-4 h-4 text-gray-300" />
      case 'Bronze':
        return <Crown className="w-4 h-4 text-orange-600" />
      default:
        return <User className="w-4 h-4 text-gray-400" />
    }
  }

  const getVariationColor = (variacao: string) => {
    if (variacao.startsWith('+')) return 'text-green-600'
    if (variacao.startsWith('-')) return 'text-red-600'
    return 'text-gray-600'
  }

  if (displayData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
        <Trophy className="w-10 h-10 mb-3 text-gray-300" />
        <p className="font-medium">Nenhum motorista no ranking ainda</p>
        <p className="text-sm mt-1">O ranking aparecerá aqui conforme os motoristas acumularem pontos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {displayData.map((motorista) => (
        <div key={motorista.posicao} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
          motorista.posicao <= 3 && !compact ? 'border-yellow-200 bg-yellow-50' : ''
        }`}>
          <div className="flex items-center gap-4">
            {/* Posição e Ícone */}
            <div className="flex items-center gap-3">
              {getRankIcon(motorista.posicao)}
              
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Informações do Motorista */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{motorista.motorista}</h4>
                <Badge 
                  className={`${motorista.cor_nivel} text-white border-none`}
                  variant="outline"
                >
                  <div className="flex items-center gap-1">
                    {getLevelIcon(motorista.nivel)}
                    <span className="text-xs">{motorista.nivel}</span>
                  </div>
                </Badge>
              </div>
              
              {!compact && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {motorista.conquistas} conquistas
                  </span>
                  <span>{motorista.entregas_mes} entregas</span>
                  <span>{motorista.eficiencia}% eficiência</span>
                </div>
              )}
            </div>
          </div>

          {/* Pontuação e Variação */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-lg font-bold text-blue-600">
                {motorista.pontos.toLocaleString()}
              </p>
              <span className="text-xs text-gray-500">pts</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              {period === 'mensal' && (
                <span className="text-gray-600">
                  +{motorista.pontos_mes} este mês
                </span>
              )}
              <div className={`flex items-center gap-1 ${getVariationColor(motorista.variacao)}`}>
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {motorista.variacao}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {!compact && (
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Mostrando {displayData.length} motoristas
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
              <Button variant="outline" size="sm">
                Comparar
              </Button>
            </div>
          </div>
        </div>
      )}

      {compact && rankingData.length > 5 && (
        <div className="text-center pt-3 border-t">
          <Button variant="outline" size="sm">
            Ver Ranking Completo
          </Button>
        </div>
      )}
    </div>
  )
}
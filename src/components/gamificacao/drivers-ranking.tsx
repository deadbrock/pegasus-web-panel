'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Crown, Medal, Star, TrendingUp, User } from 'lucide-react'

interface DriversRankingProps {
  period: string
  compact?: boolean
}

// Mock data para ranking de motoristas
const rankingData = [
  {
    posicao: 1,
    motorista: 'João Silva',
    pontos: 1875,
    nivel: 'Diamante',
    cor_nivel: 'bg-cyan-400',
    conquistas: 12,
    entregas_mes: 89,
    eficiencia: 96.2,
    pontos_mes: 245,
    variacao: '+12'
  },
  {
    posicao: 2,
    motorista: 'Maria Santos',
    pontos: 1654,
    nivel: 'Platina',
    cor_nivel: 'bg-blue-400',
    conquistas: 10,
    entregas_mes: 76,
    eficiencia: 94.8,
    pontos_mes: 189,
    variacao: '+8'
  },
  {
    posicao: 3,
    motorista: 'Carlos Lima',
    pontos: 1432,
    nivel: 'Ouro',
    cor_nivel: 'bg-yellow-500',
    conquistas: 8,
    entregas_mes: 71,
    eficiencia: 92.1,
    pontos_mes: 156,
    variacao: '-3'
  },
  {
    posicao: 4,
    motorista: 'Ana Costa',
    pontos: 1298,
    nivel: 'Ouro',
    cor_nivel: 'bg-yellow-500',
    conquistas: 7,
    entregas_mes: 65,
    eficiencia: 90.5,
    pontos_mes: 142,
    variacao: '+5'
  },
  {
    posicao: 5,
    motorista: 'Pedro Oliveira',
    pontos: 1156,
    nivel: 'Prata',
    cor_nivel: 'bg-gray-300',
    conquistas: 6,
    entregas_mes: 58,
    eficiencia: 88.9,
    pontos_mes: 128,
    variacao: '-1'
  },
  {
    posicao: 6,
    motorista: 'Roberto Silva',
    pontos: 1024,
    nivel: 'Prata',
    cor_nivel: 'bg-gray-300',
    conquistas: 5,
    entregas_mes: 52,
    eficiencia: 87.3,
    pontos_mes: 115,
    variacao: '+7'
  },
  {
    posicao: 7,
    motorista: 'Fernanda Lima',
    pontos: 896,
    nivel: 'Bronze',
    cor_nivel: 'bg-orange-600',
    conquistas: 4,
    entregas_mes: 47,
    eficiencia: 85.1,
    pontos_mes: 98,
    variacao: '+2'
  },
  {
    posicao: 8,
    motorista: 'Lucas Santos',
    pontos: 743,
    nivel: 'Bronze',
    cor_nivel: 'bg-orange-600',
    conquistas: 3,
    entregas_mes: 41,
    eficiencia: 82.8,
    pontos_mes: 87,
    variacao: '-4'
  }
]

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
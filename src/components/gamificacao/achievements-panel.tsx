'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Award, Star, Crown, CheckCircle, Lock, Trophy } from 'lucide-react'

// Mock data para conquistas baseado no sistema desktop
const achievementsData = [
  {
    id: 1,
    nome: 'Primeira Entrega',
    descricao: 'Realizou sua primeira entrega',
    pontos: 10,
    icone: 'primeira_entrega',
    raridade: 'comum',
    categoria: 'Inicial',
    alcancada: true,
    progresso: 100,
    requisito: '1 entrega',
    obtida_por: 24
  },
  {
    id: 2,
    nome: 'Pontualidade Master',
    descricao: '10 entregas consecutivas antes do prazo',
    pontos: 50,
    icone: 'pontualidade',
    raridade: 'rara',
    categoria: 'Performance',
    alcancada: true,
    progresso: 100,
    requisito: '10 entregas no prazo',
    obtida_por: 18
  },
  {
    id: 3,
    nome: 'Maratonista',
    descricao: 'Percorreu mais de 1000 km em uma semana',
    pontos: 75,
    icone: 'maratonista',
    raridade: 'epica',
    categoria: 'Resistência',
    alcancada: false,
    progresso: 85,
    requisito: '1000 km/semana',
    obtida_por: 8
  },
  {
    id: 4,
    nome: 'Economia Verde',
    descricao: 'Consumo abaixo da média em 15 viagens',
    pontos: 60,
    icone: 'economia',
    raridade: 'rara',
    categoria: 'Sustentabilidade',
    alcancada: true,
    progresso: 100,
    requisito: '15 viagens econômicas',
    obtida_por: 12
  },
  {
    id: 5,
    nome: 'Cliente Satisfeito',
    descricao: 'Recebeu 10 avaliações 5 estrelas',
    pontos: 80,
    icone: 'cliente_satisfeito',
    raridade: 'epica',
    categoria: 'Atendimento',
    alcancada: false,
    progresso: 70,
    requisito: '10 avaliações 5⭐',
    obtida_por: 15
  },
  {
    id: 6,
    nome: 'Zero Acidentes',
    descricao: '6 meses sem acidentes ou infrações',
    pontos: 150,
    icone: 'zero_acidentes',
    raridade: 'lendaria',
    categoria: 'Segurança',
    alcancada: false,
    progresso: 45,
    requisito: '6 meses sem incidentes',
    obtida_por: 6
  },
  {
    id: 7,
    nome: 'Mestre da Estrada',
    descricao: 'Completou 100 entregas',
    pontos: 120,
    icone: 'mestre_estrada',
    raridade: 'epica',
    categoria: 'Experiência',
    alcancada: false,
    progresso: 89,
    requisito: '100 entregas',
    obtida_por: 11
  },
  {
    id: 8,
    nome: 'Velocista Responsável',
    descricao: 'Tempo médio de entrega 20% menor que a média',
    pontos: 90,
    icone: 'velocista',
    raridade: 'rara',
    categoria: 'Eficiência',
    alcancada: false,
    progresso: 55,
    requisito: '20% mais rápido',
    obtida_por: 9
  }
]

export function AchievementsPanel() {
  const getRaridadeColor = (raridade: string) => {
    switch (raridade) {
      case 'comum': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'rara': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'epica': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'lendaria': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRaridadeIcon = (raridade: string) => {
    switch (raridade) {
      case 'comum': return CheckCircle
      case 'rara': return Star
      case 'epica': return Award
      case 'lendaria': return Crown
      default: return Award
    }
  }

  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Inicial': 'bg-green-500',
      'Performance': 'bg-blue-500',
      'Resistência': 'bg-red-500',
      'Sustentabilidade': 'bg-green-600',
      'Atendimento': 'bg-purple-500',
      'Segurança': 'bg-orange-500',
      'Experiência': 'bg-indigo-500',
      'Eficiência': 'bg-cyan-500'
    }
    return colors[categoria] || 'bg-gray-500'
  }

  return (
    <div className="space-y-6">
      {/* Resumo das Conquistas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-gray-900">
              {achievementsData.filter(a => a.alcancada).length}
            </p>
            <p className="text-sm text-gray-600">Conquistadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">
              {achievementsData.reduce((sum, a) => sum + (a.alcancada ? a.pontos : 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Pontos Ganhos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">
              {achievementsData.filter(a => a.raridade === 'epica' || a.raridade === 'lendaria').filter(a => a.alcancada).length}
            </p>
            <p className="text-sm text-gray-600">Épicas/Lendárias</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((achievementsData.filter(a => a.alcancada).length / achievementsData.length) * 100)}%
            </p>
            <p className="text-sm text-gray-600">Completude</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Conquistas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {achievementsData.map((achievement) => {
          const RaridadeIcon = getRaridadeIcon(achievement.raridade)
          
          return (
            <Card key={achievement.id} className={`${
              achievement.alcancada ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.alcancada ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {achievement.alcancada ? (
                        <RaridadeIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        achievement.progresso >= 100 ? (
                          <RaridadeIcon className="w-6 h-6 text-gray-600" />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${
                          achievement.alcancada ? 'text-green-800' : 'text-gray-700'
                        }`}>
                          {achievement.nome}
                        </h4>
                        <Badge variant="outline" className={getRaridadeColor(achievement.raridade)}>
                          {achievement.raridade}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-2 ${
                        achievement.alcancada ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {achievement.descricao}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getCategoriaColor(achievement.categoria)}`}></div>
                        <span className="text-xs text-gray-500">{achievement.categoria}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{achievement.requisito}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-bold ${
                      achievement.alcancada ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      +{achievement.pontos} pts
                    </p>
                    {achievement.alcancada && (
                      <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-1" />
                    )}
                  </div>
                </div>

                {/* Barra de Progresso */}
                {!achievement.alcancada && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Progresso</span>
                      <span className="text-gray-600">{achievement.progresso}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          achievement.progresso >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(achievement.progresso, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Estatísticas */}
                <div className="flex justify-between items-center mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    {achievement.obtida_por} motoristas obtiveram
                  </span>
                  {achievement.progresso >= 80 && !achievement.alcancada && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      Quase lá!
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Conquistas em Destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Conquistas Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievementsData
              .sort((a, b) => b.obtida_por - a.obtida_por)
              .slice(0, 5)
              .map((achievement, index) => (
                <div key={achievement.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{achievement.nome}</span>
                    <Badge variant="outline" className={getRaridadeColor(achievement.raridade)}>
                      {achievement.raridade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{achievement.obtida_por} motoristas</span>
                    <span className="text-sm font-medium text-blue-600">+{achievement.pontos} pts</span>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
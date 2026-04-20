'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Star, Clock, ShoppingCart, CreditCard } from 'lucide-react'

// Dados virão do Supabase
const rewardsData: any[] = []

export function RewardsStore() {
  const getPopularidadeColor = (popularidade: string) => {
    switch (popularidade) {
      case 'Muito Alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'Alta': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Baixa': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleResgatar = (reward: any) => {
    console.log('Resgatar recompensa:', reward)
  }

  const disponiveisCount = rewardsData.filter(r => r.disponivel).length
  const disponiveisPontos = rewardsData.filter(r => r.disponivel).map(r => r.pontos)
  const menorPreco = disponiveisPontos.length > 0 ? Math.min(...disponiveisPontos) : 0
  const totalEstoque = rewardsData.reduce((sum, r) => sum + (r.disponivel ? r.estoque : 0), 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">{disponiveisCount}</p>
            <p className="text-sm text-gray-600">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-gray-900">{menorPreco}</p>
            <p className="text-sm text-gray-600">Menor Preço</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">{totalEstoque}</p>
            <p className="text-sm text-gray-600">Itens em Estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600">Seus Pontos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Categorias:</span>
            {['Todos', 'Combustível', 'Benefícios', 'Alimentação', 'Hospedagem', 'Segurança', 'Educação', 'Financeiro', 'Vestuário'].map((categoria) => (
              <Button
                key={categoria}
                variant={categoria === 'Todos' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap"
              >
                {categoria}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {rewardsData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
          <Gift className="w-12 h-12 mb-3 text-gray-300" />
          <p className="font-medium">Nenhuma recompensa cadastrada</p>
          <p className="text-sm mt-1">As recompensas disponíveis para resgate aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewardsData.map((reward) => (
            <Card key={reward.id} className={`${
              !reward.disponivel ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-purple-300'
            } transition-all duration-200`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${reward.cor}`}>
                      <span className="text-2xl">{reward.icone}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{reward.nome}</h4>
                      <Badge variant="outline" className="text-xs">{reward.categoria}</Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className={getPopularidadeColor(reward.popularidade)}>
                    {reward.popularidade}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{reward.descricao}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Preço:</span>
                    <span className="font-medium text-purple-600">{reward.pontos} pontos</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Estoque:</span>
                    <span className={`font-medium ${reward.estoque > 10 ? 'text-green-600' : reward.estoque > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {reward.estoque > 0 ? `${reward.estoque} unidades` : 'Esgotado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Validade:</span>
                    <span className="text-gray-700">{reward.validade}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={!reward.disponivel || reward.estoque === 0}
                  onClick={() => handleResgatar(reward)}
                  variant="default"
                >
                  {!reward.disponivel ? 'Indisponível' : reward.estoque === 0 ? 'Esgotado' : 'Resgatar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Resgates Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center text-gray-500">
            <Clock className="w-8 h-8 mb-2 text-gray-300" />
            <p className="text-sm">Nenhum resgate realizado ainda.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

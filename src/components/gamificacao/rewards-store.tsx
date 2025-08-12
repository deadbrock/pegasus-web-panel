'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Star, Clock, ShoppingCart, CreditCard, Tag } from 'lucide-react'

// Mock data para loja de recompensas
const rewardsData = [
  {
    id: 1,
    nome: 'Vale Combustível R$ 50',
    descricao: 'Desconto de R$ 50 no abastecimento em postos parceiros',
    pontos: 250,
    categoria: 'Combustível',
    disponivel: true,
    estoque: 15,
    popularidade: 'Alta',
    validade: '30 dias após resgate',
    icone: '⛽',
    cor: 'bg-orange-500'
  },
  {
    id: 2,
    nome: 'Folga Remunerada',
    descricao: 'Um dia de folga remunerada para descanso',
    pontos: 800,
    categoria: 'Benefícios',
    disponivel: true,
    estoque: 5,
    popularidade: 'Muito Alta',
    validade: '90 dias após resgate',
    icone: '🏖️',
    cor: 'bg-blue-500'
  },
  {
    id: 3,
    nome: 'Kit Lanche Premium',
    descricao: 'Kit com lanches e bebidas para a viagem',
    pontos: 150,
    categoria: 'Alimentação',
    disponivel: true,
    estoque: 25,
    popularidade: 'Média',
    validade: '15 dias após resgate',
    icone: '🍕',
    cor: 'bg-green-500'
  },
  {
    id: 4,
    nome: 'Upgrade de Hospedagem',
    descricao: 'Upgrade para quarto superior em viagens longas',
    pontos: 600,
    categoria: 'Hospedagem',
    disponivel: true,
    estoque: 8,
    popularidade: 'Alta',
    validade: '60 dias após resgate',
    icone: '🏨',
    cor: 'bg-purple-500'
  },
  {
    id: 5,
    nome: 'Equipamento EPI Premium',
    descricao: 'Kit de equipamentos de proteção individual de alta qualidade',
    pontos: 450,
    categoria: 'Segurança',
    disponivel: true,
    estoque: 12,
    popularidade: 'Média',
    validade: 'Sem validade',
    icone: '🦺',
    cor: 'bg-red-500'
  },
  {
    id: 6,
    nome: 'Treinamento Especializado',
    descricao: 'Curso de direção defensiva ou economia de combustível',
    pontos: 1000,
    categoria: 'Educação',
    disponivel: true,
    estoque: 3,
    popularidade: 'Baixa',
    validade: '120 dias após resgate',
    icone: '📚',
    cor: 'bg-indigo-500'
  },
  {
    id: 7,
    nome: 'Bônus Salarial R$ 200',
    descricao: 'Bônus adicional no próximo salário',
    pontos: 1200,
    categoria: 'Financeiro',
    disponivel: false,
    estoque: 0,
    popularidade: 'Muito Alta',
    validade: 'Próximo pagamento',
    icone: '💰',
    cor: 'bg-yellow-500'
  },
  {
    id: 8,
    nome: 'Camiseta Empresa Premium',
    descricao: 'Camiseta de alta qualidade com logo da empresa',
    pontos: 100,
    categoria: 'Vestuário',
    disponivel: true,
    estoque: 30,
    popularidade: 'Baixa',
    validade: 'Sem validade',
    icone: '👕',
    cor: 'bg-gray-500'
  }
]

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

  const getCategoriaIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      'Combustível': '⛽',
      'Benefícios': '🎁',
      'Alimentação': '🍕',
      'Hospedagem': '🏨',
      'Segurança': '🦺',
      'Educação': '📚',
      'Financeiro': '💰',
      'Vestuário': '👕'
    }
    return icons[categoria] || '🎁'
  }

  const handleResgatar = (reward: any) => {
    console.log('Resgatar recompensa:', reward)
  }

  return (
    <div className="space-y-6">
      {/* Resumo da Loja */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">
              {rewardsData.filter(r => r.disponivel).length}
            </p>
            <p className="text-sm text-gray-600">Disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-gray-900">
              {Math.min(...rewardsData.filter(r => r.disponivel).map(r => r.pontos))}
            </p>
            <p className="text-sm text-gray-600">Menor Preço</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">
              {rewardsData.reduce((sum, r) => sum + (r.disponivel ? r.estoque : 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Itens em Estoque</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">
              1,875
            </p>
            <p className="text-sm text-gray-600">Seus Pontos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Categoria */}
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

      {/* Grid de Recompensas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewardsData.map((reward) => (
          <Card key={reward.id} className={`${
            !reward.disponivel ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-purple-300'
          } transition-all duration-200`}>
            <CardContent className="p-4">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${reward.cor}`}>
                    <span className="text-2xl">{reward.icone}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{reward.nome}</h4>
                    <Badge variant="outline" className="text-xs">
                      {reward.categoria}
                    </Badge>
                  </div>
                </div>
                <Badge variant="outline" className={getPopularidadeColor(reward.popularidade)}>
                  {reward.popularidade}
                </Badge>
              </div>

              {/* Descrição */}
              <p className="text-sm text-gray-600 mb-4">{reward.descricao}</p>

              {/* Informações do Item */}
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

              {/* Barra de Estoque */}
              {reward.disponivel && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        reward.estoque > 15 ? 'bg-green-500' : 
                        reward.estoque > 5 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((reward.estoque / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Botão de Ação */}
              <Button 
                className="w-full"
                disabled={!reward.disponivel || reward.estoque === 0 || reward.pontos > 1875}
                onClick={() => handleResgatar(reward)}
                variant={reward.pontos > 1875 ? 'outline' : 'default'}
              >
                {!reward.disponivel ? 'Indisponível' :
                 reward.estoque === 0 ? 'Esgotado' :
                 reward.pontos > 1875 ? `Faltam ${reward.pontos - 1875} pontos` :
                 'Resgatar'}
              </Button>

              {/* Tags especiais */}
              <div className="flex gap-2 mt-3">
                {reward.popularidade === 'Muito Alta' && (
                  <Badge variant="outline" className="text-red-600 border-red-300 text-xs">
                    🔥 Popular
                  </Badge>
                )}
                {reward.estoque <= 5 && reward.estoque > 0 && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300 text-xs">
                    ⚡ Últimas unidades
                  </Badge>
                )}
                {reward.pontos <= 200 && (
                  <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                    💡 Econômico
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Histórico de Resgates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Resgates Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { motorista: 'João Silva', item: 'Vale Combustível R$ 50', pontos: 250, tempo: '2 horas atrás' },
              { motorista: 'Maria Santos', item: 'Kit Lanche Premium', pontos: 150, tempo: '1 dia atrás' },
              { motorista: 'Carlos Lima', item: 'Vale Combustível R$ 50', pontos: 250, tempo: '2 dias atrás' },
              { motorista: 'Ana Costa', item: 'Camiseta Empresa Premium', pontos: 100, tempo: '3 dias atrás' }
            ].map((resgate, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium">{resgate.motorista}</p>
                    <p className="text-sm text-gray-600">{resgate.item}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-purple-600">-{resgate.pontos} pts</p>
                  <p className="text-xs text-gray-500">{resgate.tempo}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
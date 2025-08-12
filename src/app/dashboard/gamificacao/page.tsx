'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Award,
  Crown,
  Star,
  TrendingUp,
  Target,
  Users,
  Gift,
  Zap,
  Medal,
  Download,
  Settings,
  Plus
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { DriversRanking } from '@/components/gamificacao/drivers-ranking'
import { AchievementsPanel } from '@/components/gamificacao/achievements-panel'
import { LevelsProgress } from '@/components/gamificacao/levels-progress'
import { RewardsStore } from '@/components/gamificacao/rewards-store'
import { ActivityPoints } from '@/components/gamificacao/activity-points'
import { LeaderboardChart } from '@/components/gamificacao/leaderboard-chart'

export default function GamificacaoPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('mensal')

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Gamificação</h1>
          <p className="text-gray-600 mt-1">
            Engajamento e recompensas para motoristas da frota
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar Regras
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Ranking
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Conquista
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Motoristas Ativos"
          value="24"
          change="+3"
          changeType="positive"
          icon={Users}
          description="Participando"
        />
        <MetricCard
          title="Pontos Distribuídos"
          value="12.450"
          change="+8.2%"
          changeType="positive"
          icon={Star}
          description="Este mês"
        />
        <MetricCard
          title="Conquistas Obtidas"
          value="187"
          change="+23"
          changeType="positive"
          icon={Award}
          description="Total"
        />
        <MetricCard
          title="Engajamento"
          value="89.5%"
          change="+12%"
          changeType="positive"
          icon={TrendingUp}
          description="Taxa de participação"
        />
      </div>

      {/* Gamification Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
          <TabsTrigger value="niveis">Níveis</TabsTrigger>
          <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top 5 Ranking */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Top 5 Motoristas - {selectedPeriod === 'mensal' ? 'Este Mês' : 'Esta Semana'}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant={selectedPeriod === 'semanal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('semanal')}
                    >
                      Semanal
                    </Button>
                    <Button 
                      variant={selectedPeriod === 'mensal' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod('mensal')}
                    >
                      Mensal
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DriversRanking period={selectedPeriod} compact={true} />
              </CardContent>
            </Card>

            {/* Distribuição de Níveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Distribuição de Níveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LevelsProgress />
              </CardContent>
            </Card>
          </div>

          {/* Conquistas Recentes e Atividade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conquistas Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-orange-600" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      motorista: 'João Silva', 
                      conquista: 'Pontualidade', 
                      pontos: 25, 
                      tempo: '2 horas atrás',
                      cor: 'bg-green-100 text-green-800'
                    },
                    { 
                      motorista: 'Maria Santos', 
                      conquista: 'Economia de Combustível', 
                      pontos: 35, 
                      tempo: '5 horas atrás',
                      cor: 'bg-blue-100 text-blue-800'
                    },
                    { 
                      motorista: 'Carlos Lima', 
                      conquista: 'Cliente Satisfeito', 
                      pontos: 40, 
                      tempo: '1 dia atrás',
                      cor: 'bg-purple-100 text-purple-800'
                    },
                    { 
                      motorista: 'Ana Costa', 
                      conquista: 'Maratonista', 
                      pontos: 50, 
                      tempo: '2 dias atrás',
                      cor: 'bg-orange-100 text-orange-800'
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium">{item.motorista}</p>
                          <p className="text-sm text-gray-600">{item.conquista}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm px-2 py-1 rounded ${item.cor}`}>
                          +{item.pontos} pontos
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{item.tempo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Atividade de Pontos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Evolução de Pontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityPoints />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ranking Tab */}
        <TabsContent value="ranking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ranking Completo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ranking Completo de Motoristas</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DriversRanking period={selectedPeriod} />
              </CardContent>
            </Card>

            {/* Gráfico de Evolução */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <LeaderboardChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conquistas Tab */}
        <TabsContent value="conquistas" className="space-y-6">
          <AchievementsPanel />
        </TabsContent>

        {/* Níveis Tab */}
        <TabsContent value="niveis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sistema de Níveis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Sistema de Níveis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { nivel: 1, nome: 'Iniciante', pontos: 0, cor: 'bg-gray-400' },
                    { nivel: 2, nome: 'Bronze', pontos: 100, cor: 'bg-orange-600' },
                    { nivel: 3, nome: 'Prata', pontos: 300, cor: 'bg-gray-300' },
                    { nivel: 4, nome: 'Ouro', pontos: 600, cor: 'bg-yellow-500' },
                    { nivel: 5, nome: 'Platina', pontos: 1000, cor: 'bg-blue-400' },
                    { nivel: 6, nome: 'Diamante', pontos: 1500, cor: 'bg-cyan-400' }
                  ].map((level) => (
                    <div key={level.nivel} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${level.cor}`}>
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{level.nome}</p>
                          <p className="text-sm text-gray-600">Nível {level.nivel}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{level.pontos} pontos</p>
                        <p className="text-sm text-gray-600">Necessários</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progresso dos Motoristas */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso por Nível</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { nome: 'João Silva', nivel: 'Ouro', progresso: 75, pontos: '950/1000' },
                    { nome: 'Maria Santos', nivel: 'Prata', progresso: 60, pontos: '480/600' },
                    { nome: 'Carlos Lima', nivel: 'Bronze', progresso: 90, pontos: '270/300' },
                    { nome: 'Ana Costa', nivel: 'Platina', progresso: 30, pontos: '1150/1500' }
                  ].map((driver, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{driver.nome}</p>
                          <p className="text-sm text-gray-600">{driver.nivel}</p>
                        </div>
                        <p className="text-sm text-gray-600">{driver.pontos}</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${driver.progresso}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recompensas Tab */}
        <TabsContent value="recompensas" className="space-y-6">
          <RewardsStore />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas de Engajamento */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Participação</span>
                      <span>89.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[90%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">24 de 27 motoristas</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Conquistas por Motorista</span>
                      <span>7.8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[78%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: 10 conquistas</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pontos Médios por Mês</span>
                      <span>518</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-[85%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">15% acima do esperado</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Retenção de Motoristas</span>
                      <span>95.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full w-[95%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Melhoria significativa</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Impacto nos Resultados */}
            <Card>
              <CardHeader>
                <CardTitle>Impacto nos Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entregas no Prazo</span>
                    <span className="font-semibold text-green-600">↗ +12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Consumo de Combustível</span>
                    <span className="font-semibold text-green-600">↘ -8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avaliação dos Clientes</span>
                    <span className="font-semibold text-green-600">↗ +15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Acidentes</span>
                    <span className="font-semibold text-green-600">↘ -25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rotatividade</span>
                    <span className="font-semibold text-green-600">↘ -18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Produtividade</span>
                    <span className="font-semibold text-green-600">↗ +22%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conquistas Mais Populares */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Mais Populares</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { nome: 'Pontualidade', obtida: 18, total: 24, porcentagem: 75 },
                    { nome: 'Cliente Satisfeito', obtida: 15, total: 24, porcentagem: 63 },
                    { nome: 'Economia de Combustível', obtida: 12, total: 24, porcentagem: 50 },
                    { nome: 'Maratonista', obtida: 8, total: 24, porcentagem: 33 },
                    { nome: 'Zero Acidentes', obtida: 6, total: 24, porcentagem: 25 }
                  ].map((achievement, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{achievement.nome}</span>
                        <span className="text-sm text-gray-600">{achievement.obtida}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${achievement.porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ROI do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>ROI do Sistema de Gamificação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-green-600">324%</p>
                    <p className="text-sm text-gray-600">Retorno sobre Investimento</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Custo Mensal</p>
                      <p className="font-medium">R$ 2.400</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Economia Gerada</p>
                      <p className="font-medium text-green-600">R$ 7.776</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Produtividade</p>
                      <p className="font-medium text-blue-600">+22%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Satisfação</p>
                      <p className="font-medium text-purple-600">+15%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
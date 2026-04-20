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
  Plus,
  BarChart2
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
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <Award className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">Nenhuma conquista recente.</p>
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
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                  <Crown className="w-8 h-8 mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum motorista com progresso registrado.</p>
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
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
            <BarChart2 className="w-12 h-12 mb-3 text-gray-300" />
            <p className="font-medium text-lg">Analytics em desenvolvimento</p>
            <p className="text-sm mt-1 max-w-md">As métricas de engajamento, impacto nos resultados e ROI do sistema aparecerão aqui com dados reais.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
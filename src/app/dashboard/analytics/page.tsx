'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Truck,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { DeliveryEvolutionChart } from '@/components/analytics/delivery-evolution-chart'
import { CostsCategoryChart } from '@/components/analytics/costs-category-chart'
import { EfficiencyRegionChart } from '@/components/analytics/efficiency-region-chart'
import { RouteStatusChart } from '@/components/analytics/route-status-chart'
import { AnalyticsTable } from '@/components/analytics/analytics-table'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Análise de desempenho e indicadores operacionais
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Período
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Entregas"
          value="1,247"
          change="+12.5%"
          changeType="positive"
          icon={Truck}
          description="Este mês"
        />
        <MetricCard
          title="Eficiência Operacional"
          value="94.2%"
          change="+2.1%"
          changeType="positive"
          icon={Activity}
          description="Taxa de sucesso"
        />
        <MetricCard
          title="Custo Total"
          value="R$ 89.450"
          change="-5.8%"
          changeType="positive"
          icon={DollarSign}
          description="Redução de custos"
        />
        <MetricCard
          title="Motoristas Ativos"
          value="32"
          change="+3"
          changeType="positive"
          icon={Users}
          description="Em operação"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Evolution Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolução de Entregas - Últimos 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DeliveryEvolutionChart />
              </CardContent>
            </Card>

            {/* Route Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Status das Rotas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteStatusChart />
              </CardContent>
            </Card>

            {/* Costs by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Custos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostsCategoryChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Performance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Desempenho por Motorista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart />
              </CardContent>
            </Card>

            {/* Efficiency by Region */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Eficiência por Região
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EfficiencyRegionChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Combustível"
              value="R$ 35.200"
              change="-3.2%"
              changeType="positive"
              icon={DollarSign}
              description="39% do total"
            />
            <MetricCard
              title="Manutenção"
              value="R$ 28.450"
              change="+8.1%"
              changeType="negative"
              icon={DollarSign}
              description="32% do total"
            />
            <MetricCard
              title="Outros"
              value="R$ 25.800"
              change="-1.5%"
              changeType="positive"
              icon={DollarSign}
              description="29% do total"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhamento de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <CostsCategoryChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatório Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <AnalyticsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 
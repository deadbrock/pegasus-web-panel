'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComp } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import { getDeliveryEvolutionRange, getRouteStatusRange, getCostsByCategoryRange, getDriversPerformanceRange } from '@/lib/services/analytics-service'
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
  const [range, setRange] = React.useState<{ from: Date; to: Date }>({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() })

  const exportXlsx = async () => {
    const { from, to } = range
    const [evol, status, costs, perf] = await Promise.all([
      getDeliveryEvolutionRange(from, to),
      getRouteStatusRange(from, to),
      getCostsByCategoryRange(from, to),
      getDriversPerformanceRange(from, to),
    ])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(evol), 'Evolucao')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(status), 'StatusRotas')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(costs), 'Custos')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perf), 'Performance')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_${format(from, 'yyyy-MM-dd')}_${format(to, 'yyyy-MM-dd')}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                {`${format(range.from, 'dd/MM', { locale: ptBR })} - ${format(range.to, 'dd/MM', { locale: ptBR })}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <div className="p-2">
                <CalendarComp
                  mode="range"
                  selected={{ from: range.from, to: range.to } as any}
                  onSelect={(r: any) => r?.from && r?.to && setRange({ from: r.from, to: r.to })}
                  numberOfMonths={2}
                  initialFocus
                />
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={exportXlsx}>
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
                <DeliveryEvolutionChart from={range.from} to={range.to} />
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
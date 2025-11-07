'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComp } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import * as XLSX from 'xlsx'
import {
  calcularEstatisticasAnalytics,
  getDeliveryEvolutionRange,
  getRouteStatusRange,
  getCostsByCategoryRange,
  getDriversPerformanceRange,
  getCostsByCategory,
  type AnalyticsStats
} from '@/lib/services/analytics-realtime'
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
  Download,
  Loader2
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { DeliveryEvolutionChart } from '@/components/analytics/delivery-evolution-chart'
import { CostsCategoryChart } from '@/components/analytics/costs-category-chart'
import { RouteStatusChart } from '@/components/analytics/route-status-chart'
import { useToast } from '@/hooks/use-toast'

export default function AnalyticsPage() {
  const [range, setRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsStats>({
    totalEntregas: 0,
    totalEntregasCompletas: 0,
    totalEntregasPendentes: 0,
    eficienciaOperacional: 0,
    custoTotal: 0,
    motoristasAtivos: 0,
    variacao: { entregas: 0, eficiencia: 0, custos: 0, motoristas: 0 }
  })
  const [custosPorCategoria, setCustosPorCategoria] = useState<{ categoria: string; valor: number; percentual: number }[]>([])
  const { toast } = useToast()

  // Carregar dados
  const loadData = async () => {
    setLoading(true)
    try {
      // Calcular período anterior (mesmo tamanho do período atual)
      const diasPeriodo = Math.ceil((range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24))
      const periodoAnteriorFim = new Date(range.from)
      periodoAnteriorFim.setDate(periodoAnteriorFim.getDate() - 1)
      const periodoAnteriorInicio = new Date(periodoAnteriorFim)
      periodoAnteriorInicio.setDate(periodoAnteriorInicio.getDate() - diasPeriodo + 1)

      const [statsData, custosData] = await Promise.all([
        calcularEstatisticasAnalytics(
          { inicio: range.from, fim: range.to },
          { inicio: periodoAnteriorInicio, fim: periodoAnteriorFim }
        ),
        getCostsByCategory()
      ])

      setStats(statsData)
      setCustosPorCategoria(custosData)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de analytics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [range])

  const exportXlsx = async () => {
    const { from, to } = range
    try {
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
      
      toast({
        title: 'Sucesso!',
        description: 'Relatório exportado com sucesso'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o relatório',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const signal = value >= 0 ? '+' : ''
    return `${signal}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
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
                  locale={ptBR}
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
          value={stats.totalEntregas.toString()}
          change={formatPercent(stats.variacao.entregas)}
          changeType={stats.variacao.entregas >= 0 ? "positive" : "negative"}
          icon={Truck}
          description="Este período"
        />
        <MetricCard
          title="Eficiência Operacional"
          value={`${stats.eficienciaOperacional.toFixed(1)}%`}
          change={formatPercent(stats.variacao.eficiencia)}
          changeType={stats.variacao.eficiencia >= 0 ? "positive" : "negative"}
          icon={Activity}
          description="Taxa de sucesso"
        />
        <MetricCard
          title="Custo Total"
          value={formatCurrency(stats.custoTotal)}
          change={formatPercent(stats.variacao.custos)}
          changeType={stats.variacao.custos <= 0 ? "positive" : "negative"}
          icon={DollarSign}
          description={stats.variacao.custos <= 0 ? "Redução de custos" : "Aumento de custos"}
        />
        <MetricCard
          title="Motoristas Ativos"
          value={stats.motoristasAtivos.toString()}
          change={stats.variacao.motoristas >= 0 ? `+${stats.variacao.motoristas}` : stats.variacao.motoristas.toString()}
          changeType={stats.variacao.motoristas >= 0 ? "positive" : "negative"}
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
                  Evolução de Entregas - Período Selecionado
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
                <RouteStatusChart from={range.from} to={range.to} />
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
                <CostsCategoryChart from={range.from} to={range.to} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Driver Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Desempenho por Motorista (Top 10)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart from={range.from} to={range.to} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          {custosPorCategoria.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {custosPorCategoria.slice(0, 3).map((custo, index) => (
                  <MetricCard
                    key={index}
                    title={custo.categoria}
                    value={formatCurrency(custo.valor)}
                    change={`${custo.percentual}% do total`}
                    changeType="neutral"
                    icon={DollarSign}
                    description="Este mês"
                  />
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {custosPorCategoria.map((custo, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-semibold">{custo.categoria}</p>
                          <p className="text-sm text-gray-600">{custo.percentual}% do total</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{formatCurrency(custo.valor)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum custo registrado neste período</p>
                <p className="text-sm text-gray-500 mt-1">
                  Custos aparecerão aqui quando manutenções forem registradas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Resumo de Entregas */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">📦 Entregas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalEntregas}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Completas</p>
                      <p className="text-2xl font-bold text-green-600">{stats.totalEntregasCompletas}</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.totalEntregasPendentes}</p>
                    </div>
                  </div>
                </div>

                {/* Resumo Operacional */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">⚡ Operacional</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">Eficiência</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.eficienciaOperacional.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg">
                      <p className="text-sm text-gray-600">Motoristas</p>
                      <p className="text-2xl font-bold text-indigo-600">{stats.motoristasAtivos}</p>
                    </div>
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">💰 Financeiro</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Custo Total</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.custoTotal)}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Variação: <span className={stats.variacao.custos <= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercent(stats.variacao.custos)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


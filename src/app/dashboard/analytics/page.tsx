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
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-2"><div className="pg-shimmer h-7 w-32 rounded" /><div className="pg-shimmer h-4 w-56 rounded" /></div>
          <div className="flex gap-2"><div className="pg-shimmer h-8 w-36 rounded-lg" /><div className="pg-shimmer h-8 w-24 rounded-lg" /></div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="pg-card p-5"><div className="space-y-2.5"><div className="pg-shimmer h-3 w-20 rounded" /><div className="pg-shimmer h-8 w-28 rounded" /><div className="pg-shimmer h-3 w-16 rounded" /></div></div>)}
        </div>
        <div className="pg-card p-5 flex items-center justify-center h-64">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-sm text-slate-400">Carregando dados de analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Painel de inteligência operacional · {format(range.from, 'dd/MM', { locale: ptBR })} até {format(range.to, 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <button className="pg-btn-secondary text-xs h-8 px-3">
                <Calendar className="w-3.5 h-3.5" />
                {`${format(range.from, 'dd/MM', { locale: ptBR })} - ${format(range.to, 'dd/MM', { locale: ptBR })}`}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
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
          <button className="pg-btn-secondary text-xs h-8 px-3" onClick={exportXlsx}>
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total de Entregas" value={stats.totalEntregas.toString()} change={formatPercent(stats.variacao.entregas)} changeType={stats.variacao.entregas >= 0 ? 'positive' : 'negative'} icon={Truck} iconColor="blue" description="Este período" />
        <MetricCard title="Eficiência Operacional" value={`${stats.eficienciaOperacional.toFixed(1)}%`} change={formatPercent(stats.variacao.eficiencia)} changeType={stats.variacao.eficiencia >= 0 ? 'positive' : 'negative'} icon={Activity} iconColor="emerald" description="Taxa de sucesso" />
        <MetricCard title="Custo Total" value={formatCurrency(stats.custoTotal)} change={formatPercent(stats.variacao.custos)} changeType={stats.variacao.custos <= 0 ? 'positive' : 'negative'} icon={DollarSign} iconColor={stats.variacao.custos <= 0 ? 'emerald' : 'rose'} description={stats.variacao.custos <= 0 ? 'Redução de custos' : 'Aumento de custos'} />
        <MetricCard title="Motoristas Ativos" value={stats.motoristasAtivos.toString()} change={stats.variacao.motoristas >= 0 ? `+${stats.variacao.motoristas}` : stats.variacao.motoristas.toString()} changeType={stats.variacao.motoristas >= 0 ? 'positive' : 'negative'} icon={Users} iconColor="amber" description="Em operação" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 shadow-card p-1 h-9 w-auto inline-flex">
          <TabsTrigger value="overview" className="text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Performance</TabsTrigger>
          <TabsTrigger value="costs" className="text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Custos</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="pg-card p-5 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <p className="pg-section-title">Evolução de Entregas</p>
                <span className="text-xs text-slate-400 ml-1">· período selecionado</span>
              </div>
              <DeliveryEvolutionChart from={range.from} to={range.to} />
            </div>
            <div className="pg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="w-4 h-4 text-blue-500" />
                <p className="pg-section-title">Status das Rotas</p>
              </div>
              <RouteStatusChart from={range.from} to={range.to} />
            </div>
            <div className="pg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <p className="pg-section-title">Custos por Categoria</p>
              </div>
              <CostsCategoryChart from={range.from} to={range.to} />
            </div>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="pg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <p className="pg-section-title">Desempenho por Motorista</p>
              <span className="text-xs text-slate-400 ml-1">· Top 10</span>
            </div>
            <PerformanceChart from={range.from} to={range.to} />
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-4">
          {custosPorCategoria.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {custosPorCategoria.slice(0, 3).map((custo, index) => (
                  <MetricCard key={index} title={custo.categoria} value={formatCurrency(custo.valor)} change={`${custo.percentual}% do total`} changeType="neutral" icon={DollarSign} iconColor="blue" description="Este mês" />
                ))}
              </div>
              <div className="pg-card">
                <div className="px-5 py-4 border-b border-slate-100">
                  <p className="pg-section-title">Detalhamento de Custos</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {custosPorCategoria.map((custo, index) => (
                    <div key={index} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{custo.categoria}</p>
                        <p className="text-xs text-slate-400">{custo.percentual}% do total</p>
                      </div>
                      <p className="text-base font-bold text-slate-900 tabular-nums">{formatCurrency(custo.valor)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="pg-card">
              <div className="pg-empty py-16">
                <div className="pg-empty-icon w-14 h-14"><DollarSign className="w-6 h-6" /></div>
                <p className="pg-empty-title">Nenhum custo registrado</p>
                <p className="pg-empty-description">Custos aparecerão aqui quando manutenções forem registradas no período</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="pg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="pg-section-title">Resumo do Período</p>
              <p className="text-xs text-slate-400 mt-0.5">{format(range.from, 'dd/MM/yyyy', { locale: ptBR })} — {format(range.to, 'dd/MM/yyyy', { locale: ptBR })}</p>
            </div>
            <div className="p-5 space-y-5">
              {/* Entregas */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Entregas</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 mb-1">Total</p>
                    <p className="text-2xl font-bold text-blue-700 tabular-nums">{stats.totalEntregas}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 mb-1">Completas</p>
                    <p className="text-2xl font-bold text-emerald-700 tabular-nums">{stats.totalEntregasCompletas}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-1">Pendentes</p>
                    <p className="text-2xl font-bold text-amber-700 tabular-nums">{stats.totalEntregasPendentes}</p>
                  </div>
                </div>
              </div>
              {/* Operacional */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Operacional</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 mb-1">Eficiência</p>
                    <p className="text-2xl font-bold text-violet-700 tabular-nums">{stats.eficienciaOperacional.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Motoristas</p>
                    <p className="text-2xl font-bold text-slate-700 tabular-nums">{stats.motoristasAtivos}</p>
                  </div>
                </div>
              </div>
              {/* Financeiro */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Financeiro</p>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs text-slate-400 mb-1">Custo Total</p>
                  <p className="text-3xl font-bold text-slate-900 tabular-nums">{formatCurrency(stats.custoTotal)}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Variação: <span className={stats.variacao.custos <= 0 ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>
                      {formatPercent(stats.variacao.custos)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


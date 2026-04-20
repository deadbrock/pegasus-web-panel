'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Calendar,
  PieChart,
  BarChart3
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { CostsTable } from '@/components/custos/costs-table'
import { CostDialog } from '@/components/custos/cost-dialog'
import { CostCategoryChart } from '@/components/custos/cost-category-chart'
import { CostEvolutionChart } from '@/components/custos/cost-evolution-chart'
import { CostPerKmChart } from '@/components/custos/cost-per-km-chart'
import { VehicleCostsChart } from '@/components/custos/vehicle-costs-chart'
import { CostAnalytics } from '@/components/custos/cost-analytics'
import { CostsImportExport, requestOpenImportCostsDialog } from '@/components/custos/import-export'
import { exportRelatorioMensalCustos, exportCustosPorCategoria } from '@/components/custos/reports'
import { fetchCosts, deleteCost, type CostRecord } from '@/services/costsService'
import { useToast } from '@/hooks/use-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComp } from '@/components/ui/calendar'

export default function CustosPage() {
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false)
  const [selectedCost, setSelectedCost] = useState(null)
  const [rows, setRows] = useState<CostRecord[]>([])
  const [search, setSearch] = useState('')
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() })
  const { toast } = useToast()

  const load = async () => {
    const data = await fetchCosts({ from: range.from, to: range.to, search })
    setRows(data)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNewCost = () => {
    setSelectedCost(null)
    setIsCostDialogOpen(true)
  }

  const handleEditCost = (cost: any) => {
    setSelectedCost(cost)
    setIsCostDialogOpen(true)
  }

  const handleDeleteCost = async (id: any) => {
    const ok = await deleteCost(String(id))
    if (ok) {
      toast({ title: 'Custo removido' })
      load()
    } else {
      toast({ title: 'Erro ao remover', variant: 'destructive' })
    }
  }

  const handleImport = () => requestOpenImportCostsDialog()
  const handleExport = () => exportRelatorioMensalCustos(rows)
  const handleExportCategorias = () => exportCustosPorCategoria(rows)

  const custoTotal = useMemo(() => rows.reduce((acc, r) => acc + (r.valor ?? 0), 0), [rows])
  const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
  const maiorCategoria = useMemo(() => {
    const acc: Record<string, number> = {}
    rows.forEach(r => { if (r.categoria) acc[r.categoria] = (acc[r.categoria] ?? 0) + (r.valor ?? 0) })
    const sorted = Object.entries(acc).sort((a, b) => b[1] - a[1])
    if (!sorted.length) return { nome: '—', pct: '—' }
    const pct = custoTotal > 0 ? `${((sorted[0][1] / custoTotal) * 100).toFixed(0)}%` : '—'
    return { nome: sorted[0][0], pct }
  }, [rows, custoTotal])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Custos</h1>
          <p className="text-gray-600 mt-1">
            Controle financeiro e análise de custos operacionais
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Relatório
          </Button>
          <Button onClick={handleNewCost}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Custo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Custo Total no Período"
          value={fmtBRL(custoTotal)}
          change={rows.length ? `${rows.length} lançamentos` : 'Sem dados'}
          changeType="neutral"
          icon={DollarSign}
          description="Período selecionado"
        />
        <MetricCard
          title="Custo por Lançamento"
          value={rows.length ? fmtBRL(custoTotal / rows.length) : '—'}
          change={rows.length ? 'Média real' : 'Sem dados'}
          changeType="neutral"
          icon={Calculator}
          description="Média do período"
        />
        <MetricCard
          title="Maior Categoria"
          value={maiorCategoria.nome}
          change={maiorCategoria.pct}
          changeType="neutral"
          icon={PieChart}
          description="Do total no período"
        />
        <MetricCard
          title="Lançamentos"
          value={rows.length.toString()}
          change={rows.length ? 'Dados reais' : 'Sem dados'}
          changeType="positive"
          icon={TrendingUp}
          description="No período"
        />
      </div>

      {/* Cost Management Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="vehicles">Por Veículo</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custo por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Custos por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostCategoryChart />
              </CardContent>
            </Card>

            {/* Evolução dos Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Evolução Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostEvolutionChart />
              </CardContent>
            </Card>

            {/* Custo por KM */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Custo por KM - Últimos 6 meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CostPerKmChart />
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(
                    rows.reduce((acc: Record<string, number>, r) => {
                      const cat = r.categoria || 'Outros'
                      acc[cat] = (acc[cat] ?? 0) + (r.valor ?? 0)
                      return acc
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                    <div key={cat} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{cat}</span>
                      <span className="font-semibold">{fmtBRL(val)}</span>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhum custo no período</p>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total</span>
                      <span className="font-bold text-green-600">{fmtBRL(custoTotal)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Costs Tab */}
        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Custos</CardTitle>
                <div className="flex gap-2">
                  <div className="flex items-center">
                    <input
                      className="border rounded px-3 py-1 text-sm"
                      placeholder="Buscar descrição, responsável..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="outline" size="sm" className="ml-2" onClick={load}>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Período
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComp
                        mode="range"
                        selected={range as any}
                        onSelect={(r: any) => setRange(r)}
                        initialFocus
                      />
                      <div className="p-2 flex justify-end">
                        <Button size="sm" onClick={load}>Aplicar</Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CostsTable rows={rows} onEdit={handleEditCost} onDelete={handleDeleteCost} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análise por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <CostCategoryChart showDetails={true} />
              </CardContent>
            </Card>

            {/* Top Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking de Categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(
                    rows.reduce((acc: Record<string, { total: number; count: number }>, r) => {
                      const cat = r.categoria || 'Outros'
                      if (!acc[cat]) acc[cat] = { total: 0, count: 0 }
                      acc[cat].total += r.valor ?? 0
                      acc[cat].count++
                      return acc
                    }, {})
                  ).sort((a, b) => b[1].total - a[1].total).map(([cat, info]) => (
                    <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <p className="font-medium">{cat}</p>
                          <p className="text-sm text-gray-600">{info.count} lançamento{info.count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{fmtBRL(info.total)}</p>
                        <p className="text-sm text-gray-600">{custoTotal > 0 ? `${((info.total / custoTotal) * 100).toFixed(0)}%` : '—'}</p>
                      </div>
                    </div>
                  ))}
                  {rows.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">Nenhum lançamento no período</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custos por Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleCostsChart />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <CostAnalytics />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório Mensal de Custos
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleExportCategorias}>
                  <Download className="w-4 h-4 mr-2" />
                  Custos por Categoria
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Custo por KM - Comparativo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Análise de Eficiência
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Custos por Veículo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total de Lançamentos</span>
                      <span className="font-medium">{rows.length}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Custo Total</span>
                      <span className="font-medium">{fmtBRL(custoTotal)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Maior Categoria</span>
                      <span className="font-medium">{maiorCategoria.nome} ({maiorCategoria.pct})</span>
                    </div>
                  </div>
                  {rows.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Sem dados no período selecionado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cost Dialog */}
      <CostDialog
        open={isCostDialogOpen}
        onClose={() => setIsCostDialogOpen(false)}
        cost={selectedCost}
        onSaved={load}
      />
      <CostsImportExport onImported={load} />
    </div>
  )
} 
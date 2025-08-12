'use client'

import { useState } from 'react'
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

export default function CustosPage() {
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false)
  const [selectedCost, setSelectedCost] = useState(null)

  const handleNewCost = () => {
    setSelectedCost(null)
    setIsCostDialogOpen(true)
  }

  const handleEditCost = (cost: any) => {
    setSelectedCost(cost)
    setIsCostDialogOpen(true)
  }

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
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
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
          title="Custo Total Mensal"
          value="R$ 45.280"
          change="+8.2%"
          changeType="negative"
          icon={DollarSign}
          description="Janeiro 2024"
        />
        <MetricCard
          title="Custo por KM"
          value="R$ 4.35"
          change="-5.1%"
          changeType="positive"
          icon={Calculator}
          description="Meta: R$ 4.50"
        />
        <MetricCard
          title="Maior Categoria"
          value="Combustível"
          change="65%"
          changeType="neutral"
          icon={PieChart}
          description="Do total mensal"
        />
        <MetricCard
          title="Eficiência"
          value="94.2%"
          change="+2.8%"
          changeType="positive"
          icon={TrendingUp}
          description="Meta: 90%"
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Combustível</span>
                    <span className="font-semibold text-orange-600">R$ 29.432</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Manutenção</span>
                    <span className="font-semibold text-blue-600">R$ 12.850</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pedágio</span>
                    <span className="font-semibold text-purple-600">R$ 2.180</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Outros</span>
                    <span className="font-semibold text-gray-600">R$ 818</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Mês</span>
                      <span className="font-bold text-green-600">R$ 45.280</span>
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
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Período
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CostsTable onEdit={handleEditCost} />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <div>
                        <p className="font-medium">Combustível</p>
                        <p className="text-sm text-gray-600">324 lançamentos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ 29.432</p>
                      <p className="text-sm text-gray-600">65%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium">Manutenção</p>
                        <p className="text-sm text-gray-600">89 lançamentos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ 12.850</p>
                      <p className="text-sm text-gray-600">28%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <div>
                        <p className="font-medium">Pedágio</p>
                        <p className="text-sm text-gray-600">156 lançamentos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ 2.180</p>
                      <p className="text-sm text-gray-600">5%</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <div>
                        <p className="font-medium">Outros</p>
                        <p className="text-sm text-gray-600">34 lançamentos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">R$ 818</p>
                      <p className="text-sm text-gray-600">2%</p>
                    </div>
                  </div>
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
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Relatório Mensal de Custos
                </Button>
                <Button variant="outline" className="w-full justify-start">
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
                <CardTitle>Metas e Indicadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Meta Custo/KM</span>
                      <span>R$ 4.35 / R$ 4.50</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[97%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">3% abaixo da meta</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Controle Orçamentário</span>
                      <span>R$ 45.280 / R$ 48.000</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[94%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">6% abaixo do orçamento</div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eficiência Operacional</span>
                      <span>94.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-[94%]"></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">4% acima da meta</div>
                  </div>
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
      />
    </div>
  )
} 
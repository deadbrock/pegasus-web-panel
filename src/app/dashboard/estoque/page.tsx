'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Plus,
  Edit,
  Search,
  Filter,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  MapPin,
  RefreshCw,
  TrendingDown
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { StockTable } from '@/components/estoque/stock-table'
import { ProductDialog } from '@/components/estoque/product-dialog'
import { StockUpdateDialog } from '@/components/estoque/stock-update-dialog'
import { StockAlertsTable } from '@/components/estoque/stock-alerts-table'
import { StockMovementsTable } from '@/components/estoque/stock-movements-table'
import { StockLocationsTable } from '@/components/estoque/stock-locations-table'
import { StockChart } from '@/components/estoque/stock-chart'
import { StockLevelChart } from '@/components/estoque/stock-level-chart'
import { ImportExportButtons } from '@/components/estoque/import-export'
import { requestOpenImportDialog } from '@/components/estoque/import-export'
import { 
  exportRelatorioEstoqueAtual,
  exportRelatorioProdutosCriticos,
  exportRelatorioValorizacaoEstoque,
  exportRelatorioAnaliseABC,
  exportRelatorioMovimentacoesTemplate,
} from '@/components/estoque/reports'
import { toast } from '@/hooks/use-toast'
import { fetchProdutos, fetchProdutosStats } from '@/lib/services/produtos-service'

export default function EstoquePage() {
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Dados reais do Supabase
  const [produtos, setProdutos] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDados()
  }, [])

  const loadDados = async () => {
    setLoading(true)
    try {
      const [produtosData, statsData] = await Promise.all([
        fetchProdutos('', 'todos'),
        fetchProdutosStats()
      ])
      setProdutos(produtosData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados do estoque:', error)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar o estoque. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewProduct = () => {
    setSelectedProduct(null)
    setIsProductDialogOpen(true)
  }

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product)
    setIsProductDialogOpen(true)
  }

  const handleUpdateStock = (product: any) => {
    setSelectedProduct(product)
    setIsStockUpdateDialogOpen(true)
  }

  // Ações rápidas
  const handleQuickVerifyStock = () => {
    if (!stats) return
    toast({
      title: 'Verificação de estoque concluída',
      description: `Total: ${stats.total} | OK: ${stats.total - stats.estoque_baixo - stats.estoque_critico} | Baixo: ${stats.estoque_baixo} | Crítico: ${stats.estoque_critico}`,
    })
  }

  const handleQuickVerifyMinimums = () => {
    if (!stats) return
    toast({
      title: 'Verificação de mínimos',
      description: `${stats.estoque_baixo + stats.estoque_critico} produto(s) abaixo do mínimo`,
    })
  }

  const handleQuickRefreshStock = async () => {
    await loadDados()
    toast({ title: 'Estoque atualizado', description: 'Sincronização concluída.' })
  }

  const handleQuickImportInventory = () => {
    requestOpenImportDialog()
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Estoque</h1>
          <p className="text-gray-600 mt-1">
            Controle completo de produtos e movimentações
          </p>
        </div>
        <div className="flex gap-3">
          <ImportExportButtons />
          <Button onClick={handleNewProduct}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Produtos"
          value={loading ? '...' : stats?.total || '0'}
          change={loading ? '' : '+5.2%'}
          changeType="positive"
          icon={Package}
          description="Cadastrados"
        />
        <MetricCard
          title="Alertas de Estoque"
          value={loading ? '...' : (stats?.estoque_baixo || 0) + (stats?.estoque_critico || 0)}
          change={loading ? '' : `${stats?.estoque_critico || 0} críticos`}
          changeType="negative"
          icon={AlertTriangle}
          description="Abaixo do mínimo"
        />
        <MetricCard
          title="Valor do Estoque"
          value={loading ? '...' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.valor_total_estoque || 0)}
          change={loading ? '' : '+8.1%'}
          changeType="positive"
          icon={BarChart3}
          description="Total em estoque"
        />
        <MetricCard
          title="Produtos Críticos"
          value={loading ? '...' : stats?.estoque_critico || '0'}
          change={loading ? '' : 'Atenção'}
          changeType="negative"
          icon={TrendingDown}
          description="Sem estoque"
        />
      </div>

      {/* Stock Management Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="locations">Localizações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleQuickVerifyStock}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verificar Estoque
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleQuickVerifyMinimums}>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Verificar Mínimos
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleQuickRefreshStock}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Atualizar Estoque
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleQuickImportInventory}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Inventário
                </Button>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Produtos</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <StockTable 
                  produtos={produtos}
                  loading={loading}
                  onEdit={handleEditProduct}
                  onUpdateStock={handleUpdateStock}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Alert Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Resumo de Alertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estoque Crítico</span>
                  <span className="font-semibold text-red-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estoque Baixo</span>
                  <span className="font-semibold text-orange-600">15</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sem Estoque Mínimo</span>
                  <span className="font-semibold text-gray-600">42</span>
                </div>
                <div className="pt-2 border-t">
                  <Button variant="outline" className="w-full" size="sm">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Definir Mínimos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Table */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Alertas de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <StockAlertsTable />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Movimentações de Estoque</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <StockMovementsTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Localizações dos Produtos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockLocationsTable />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Evolution Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução do Estoque - Últimos 6 meses</CardTitle>
              </CardHeader>
              <CardContent>
                <StockChart />
              </CardContent>
            </Card>

            {/* Stock Levels by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Níveis por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <StockLevelChart />
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Movimentados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Parafuso M6x20</p>
                      <p className="text-sm text-gray-600">245 movimentações</p>
                    </div>
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Óleo Lubrificante</p>
                      <p className="text-sm text-gray-600">198 movimentações</p>
                    </div>
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Filtro de Ar</p>
                      <p className="text-sm text-gray-600">156 movimentações</p>
                    </div>
                    <Package className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={exportRelatorioEstoqueAtual}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório de Estoque Atual
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportRelatorioMovimentacoesTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Movimentações por Período
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportRelatorioProdutosCriticos}>
                  <Download className="w-4 h-4 mr-2" />
                  Produtos Críticos
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportRelatorioValorizacaoEstoque}>
                  <Download className="w-4 h-4 mr-2" />
                  Valorização do Estoque
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportRelatorioAnaliseABC}>
                  <Download className="w-4 h-4 mr-2" />
                  Análise ABC
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Acuracidade do Estoque</span>
                      <span>94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[94%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Giro de Estoque</span>
                      <span>8.2x/ano</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[82%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cobertura de Estoque</span>
                      <span>45 dias</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full w-[75%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ProductDialog
        open={isProductDialogOpen}
        onClose={() => setIsProductDialogOpen(false)}
        product={selectedProduct}
      />

      <StockUpdateDialog
        open={isStockUpdateDialogOpen}
        onClose={() => setIsStockUpdateDialogOpen(false)}
        product={selectedProduct}
      />
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { OrdersTable } from '@/components/pedidos/orders-table'
import { OrdersImportExport } from '@/components/pedidos/orders-import-export'
import { exportRelatorioPedidos, exportProdutosMaisPedidos } from '@/components/pedidos/orders-reports'
import { fetchOrders, subscribeOrders, fetchOrdersQuery, type OrderStatus } from '@/services/ordersService'
import { fetchPedidosMobile, subscribePedidosMobile, calcularEstatisticasPedidos, type PedidoMobile } from '@/services/pedidosMobileService'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComp } from '@/components/ui/calendar'
import { OrderDialog } from '@/components/pedidos/order-dialog'
import { MobileOrderViewDialog } from '@/components/pedidos/mobile-order-view-dialog'
import { OrderStatusChart } from '@/components/pedidos/order-status-chart'
import { OrderTimelineChart } from '@/components/pedidos/order-timeline-chart'
import { OrderDeliveryMap } from '@/components/pedidos/order-delivery-map'
import { OrdersKanban } from '@/components/pedidos/orders-kanban'

export default function PedidosPage() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [isMobileOrderDialogOpen, setIsMobileOrderDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [pedidosMobile, setPedidosMobile] = useState<PedidoMobile[]>([])
  const [stats, setStats] = useState<any>(null)
  const [timelineData, setTimelineData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() })
  
  useEffect(() => {
    const loadPedidos = async () => {
      // Buscar pedidos do web panel (ordersService) - DESABILITADO TEMPORARIAMENTE
      // const webOrders = await fetchOrders()
      
      // Buscar pedidos do mobile (supervisores)
      const mobilePedidos = await fetchPedidosMobile()
      
      console.log('[PedidosPage] Pedidos mobile carregados:', mobilePedidos.length)
      setPedidosMobile(mobilePedidos)
      
      // APENAS PEDIDOS MOBILE POR ENQUANTO
      // Pedidos web serão implementados posteriormente
      setOrders(mobilePedidos)
      
      // Calcular estatísticas
      const statistics = calcularEstatisticasPedidos(mobilePedidos)
      setStats(statistics)
      
      // Calcular dados da timeline (últimos 30 dias)
      const timeline = calcularTimelineData(mobilePedidos)
      setTimelineData(timeline)
    }
    
    loadPedidos()
    
    // Subscribe para mudanças em tempo real
    // const unsubWeb = subscribeOrders(loadPedidos) - DESABILITADO
    const unsubMobile = subscribePedidosMobile(loadPedidos)
    
    return () => {
      // unsubWeb()
      unsubMobile()
    }
  }, [])

  // Função auxiliar para calcular dados da timeline
  const calcularTimelineData = (pedidos: PedidoMobile[]) => {
    const hoje = new Date()
    const timeline: any[] = []
    
    for (let i = 29; i >= 0; i--) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      const dataStr = data.toISOString().split('T')[0]
      
      const pedidosDoDia = pedidos.filter(p => {
        const pedidoData = new Date(p.data_solicitacao).toISOString().split('T')[0]
        return pedidoData === dataStr
      })
      
      const entreguesDoDia = pedidosDoDia.filter(p => p.status === 'Entregue').length
      const canceladosDoDia = pedidosDoDia.filter(p => p.status === 'Cancelado' || p.status === 'Rejeitado').length
      
      timeline.push({
        dia: `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`,
        pedidos: pedidosDoDia.length,
        entregues: entreguesDoDia,
        cancelados: canceladosDoDia
      })
    }
    
    return timeline
  }

  const handleNewOrder = () => {
    setSelectedOrder(null)
    setIsOrderDialogOpen(true)
  }

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    // Verificar se é pedido mobile (tem supervisor_id) ou pedido web
    if (order.supervisor_id) {
      setIsMobileOrderDialogOpen(true)
    } else {
      setIsOrderDialogOpen(true)
    }
  }

  const handleExportRelatorio = async () => {
    const data = orders.length ? orders : await fetchOrders()
    exportRelatorioPedidos(data as any)
  }

  const handleBuscar = async () => {
    const rows = await fetchOrdersQuery({ search, status, from: range.from, to: range.to })
    setOrders(rows as any)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Controle completo dos pedidos e entregas
          </p>
        </div>
        <div className="flex gap-3">
          <OrdersImportExport />
          <Button onClick={handleNewOrder}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Pedido
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Pedidos"
          value={stats?.total?.toString() || '0'}
          change={stats?.total > 0 ? `+${stats.total}` : '0'}
          changeType="positive"
          icon={Package}
          description="Todos os pedidos"
        />
        <MetricCard
          title="Pedidos Entregues"
          value={stats?.entregues?.toString() || '0'}
          change={stats?.taxaEntrega || '0'}
          changeType="positive"
          icon={CheckCircle}
          description={`Taxa: ${stats?.taxaEntrega || '0'}%`}
        />
        <MetricCard
          title="Em Andamento"
          value={stats?.emAndamento?.toString() || '0'}
          change={stats?.emAndamento > 0 ? `+${stats.emAndamento}` : '0'}
          changeType="neutral"
          icon={Clock}
          description="Em processamento"
        />
        <MetricCard
          title="Pendentes"
          value={stats?.pendentes?.toString() || '0'}
          change={stats?.requeremAutorizacao > 0 ? `${stats.requeremAutorizacao} requer autorização` : '0'}
          changeType={stats?.requeremAutorizacao > 0 ? 'negative' : 'neutral'}
          icon={AlertCircle}
          description="Aguardando ação"
        />
      </div>

      {/* Orders Management Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusChart data={stats?.porStatus} />
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pedidosMobile.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhum pedido recente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pedidosMobile.slice(0, 3).map((pedido) => {
                      const statusConfig = {
                        'Pendente': { bg: 'bg-gray-50', icon: Clock, color: 'text-gray-600' },
                        'Aprovado': { bg: 'bg-indigo-50', icon: CheckCircle, color: 'text-indigo-600' },
                        'Em Separação': { bg: 'bg-blue-50', icon: Package, color: 'text-blue-600' },
                        'Saiu para Entrega': { bg: 'bg-yellow-50', icon: Truck, color: 'text-yellow-600' },
                        'Entregue': { bg: 'bg-green-50', icon: CheckCircle, color: 'text-green-600' },
                        'Cancelado': { bg: 'bg-red-50', icon: AlertCircle, color: 'text-red-600' },
                        'Rejeitado': { bg: 'bg-red-50', icon: AlertCircle, color: 'text-red-600' },
                      }
                      const config = statusConfig[pedido.status as keyof typeof statusConfig] || statusConfig['Pendente']
                      const IconComponent = config.icon
                      
                      return (
                        <div key={pedido.id} className={`flex items-center justify-between p-3 ${config.bg} rounded-lg`}>
                          <div>
                            <p className="font-medium">{pedido.numero_pedido}</p>
                            <p className="text-sm text-gray-600">
                              {pedido.supervisor_nome} - {pedido.itens?.length || 0} {pedido.itens?.length === 1 ? 'item' : 'itens'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <IconComponent className={`w-4 h-4 ${config.color}`} />
                            <span className={`text-sm font-medium ${config.color}`}>{pedido.status}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução de Pedidos - Últimos 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimelineChart data={timelineData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Pedidos Mobile</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Pedidos realizados pelos supervisores via aplicativo mobile
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <input className="border rounded px-3 py-1 text-sm" placeholder="Buscar número, cliente, endereço" value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" /> Período
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComp mode="range" selected={range as any} onSelect={(r: any) => setRange(r)} />
                      <div className="p-2 flex justify-end"><Button size="sm" onClick={handleBuscar}>Aplicar</Button></div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="outline" size="sm" onClick={handleBuscar}>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <OrdersTable onEdit={handleEditOrder} data={orders} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kanban Tab */}
        <TabsContent value="kanban" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos - Visão Kanban</CardTitle>
            </CardHeader>
            <CardContent>
              <OrdersKanban onEdit={handleEditOrder} data={orders} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Rastreamento de Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderDeliveryMap />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Métricas de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Entrega</span>
                      <span>{stats?.taxaEntrega || '0'}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats?.taxaEntrega || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pedidos Entregues</span>
                      <span>{stats?.entregues || 0} de {stats?.total || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats?.taxaEntrega || 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Em Andamento</span>
                      <span>{stats?.emAndamento || 0} pedidos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${stats?.total > 0 ? (stats.emAndamento / stats.total * 100).toFixed(0) : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cancelados/Rejeitados</span>
                      <span>{stats?.cancelados || 0} pedidos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${stats?.total > 0 ? (stats.cancelados / stats.total * 100).toFixed(0) : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Resumo por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pendentes</span>
                    <span className="font-semibold text-gray-600">{stats?.porStatus?.Pendente || 0} pedidos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Aprovados</span>
                    <span className="font-semibold text-indigo-600">{stats?.porStatus?.Aprovado || 0} pedidos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Em Separação</span>
                    <span className="font-semibold text-blue-600">{stats?.porStatus?.['Em Separação'] || 0} pedidos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Saiu para Entrega</span>
                    <span className="font-semibold text-yellow-600">{stats?.porStatus?.['Saiu para Entrega'] || 0} pedidos</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Entregues</span>
                    <span className="font-semibold text-green-600">{stats?.porStatus?.Entregue || 0} pedidos</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Requerem Autorização</span>
                      <span className="font-semibold text-orange-600">{stats?.requeremAutorizacao || 0} pedidos</span>
                    </div>
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
                <Button variant="outline" className="w-full justify-start" onClick={handleExportRelatorio}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório de Pedidos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Performance de Entrega
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Resumo Financeiro
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Análise de Contratos
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportProdutosMaisPedidos(orders as any)}>
                  <Download className="w-4 h-4 mr-2" />
                  Produtos Mais Pedidos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.requeremAutorizacao > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium text-orange-800">{stats.requeremAutorizacao} {stats.requeremAutorizacao === 1 ? 'pedido requer' : 'pedidos requerem'} autorização</p>
                        <p className="text-sm text-orange-600">Ação necessária</p>
                      </div>
                    </div>
                  )}
                  {stats?.pendentes > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">{stats.pendentes} {stats.pendentes === 1 ? 'pedido pendente' : 'pedidos pendentes'}</p>
                        <p className="text-sm text-gray-600">Aguardando processamento</p>
                      </div>
                    </div>
                  )}
                  {stats?.emAndamento > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">{stats.emAndamento} {stats.emAndamento === 1 ? 'pedido em andamento' : 'pedidos em andamento'}</p>
                        <p className="text-sm text-blue-600">Acompanhar progresso</p>
                      </div>
                    </div>
                  )}
                  {(!stats || (stats.requeremAutorizacao === 0 && stats.pendentes === 0 && stats.emAndamento === 0)) && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Nenhum alerta no momento</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Dialog (Web Panel) */}
      <OrderDialog
        open={isOrderDialogOpen}
        onClose={() => {
          setIsOrderDialogOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder}
      />

      {/* Mobile Order View Dialog (App Mobile) */}
      <MobileOrderViewDialog
        open={isMobileOrderDialogOpen}
        onClose={() => {
          setIsMobileOrderDialogOpen(false)
          setSelectedOrder(null)
        }}
        order={selectedOrder as PedidoMobile}
      />
    </div>
  )
} 
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComp } from '@/components/ui/calendar'
import { OrderDialog } from '@/components/pedidos/order-dialog'
import { OrderStatusChart } from '@/components/pedidos/order-status-chart'
import { OrderTimelineChart } from '@/components/pedidos/order-timeline-chart'
import { OrderDeliveryMap } from '@/components/pedidos/order-delivery-map'
import { OrdersKanban } from '@/components/pedidos/orders-kanban'

export default function PedidosPage() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orders, setOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined)
  const [range, setRange] = useState<{ from?: Date; to?: Date }>({ from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), to: new Date() })
  useEffect(() => {
    const load = async () => setOrders(await fetchOrders())
    load()
    const unsub = subscribeOrders(load)
    return () => unsub()
  }, [])

  const handleNewOrder = () => {
    setSelectedOrder(null)
    setIsOrderDialogOpen(true)
  }

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order)
    setIsOrderDialogOpen(true)
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
          value="156"
          change="+12"
          changeType="positive"
          icon={Package}
          description="Este mês"
        />
        <MetricCard
          title="Pedidos Entregues"
          value="128"
          change="+8.2%"
          changeType="positive"
          icon={CheckCircle}
          description="Taxa: 82%"
        />
        <MetricCard
          title="Em Andamento"
          value="23"
          change="+4"
          changeType="positive"
          icon={Clock}
          description="Em rota/separação"
        />
        <MetricCard
          title="Receita Total"
          value="R$ 89.420"
          change="+15.3%"
          changeType="positive"
          icon={DollarSign}
          description="Este mês"
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
                <OrderStatusChart />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">#P-001234</p>
                      <p className="text-sm text-gray-600">João Silva - R$ 245,90</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">Em Separação</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">#P-001235</p>
                      <p className="text-sm text-gray-600">Maria Santos - R$ 189,50</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-600">Em Rota</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">#P-001236</p>
                      <p className="text-sm text-gray-600">Pedro Costa - R$ 320,75</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Entregue</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução de Pedidos - Últimos 30 dias</CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimelineChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Pedidos</CardTitle>
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
                      <span>Taxa de Entrega no Prazo</span>
                      <span>89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[89%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tempo Médio de Processamento</span>
                      <span>2.4h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[75%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfação do Cliente</span>
                      <span>94%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-[94%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Devolução</span>
                      <span>3%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full w-[3%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
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
                    <span className="text-sm text-gray-600">Faturamento Mensal</span>
                    <span className="font-semibold text-green-600">R$ 89.420</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ticket Médio</span>
                    <span className="font-semibold">R$ 573,20</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pedidos Pagos</span>
                    <span className="font-semibold text-green-600">R$ 76.420</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pendentes</span>
                    <span className="font-semibold text-orange-600">R$ 13.000</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Crescimento vs Mês Anterior</span>
                      <span className="font-semibold text-green-600">+15.3%</span>
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
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">5 pedidos atrasados</p>
                      <p className="text-sm text-red-600">Ação necessária</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-yellow-800">12 entregas para hoje</p>
                      <p className="text-sm text-yellow-600">Acompanhar progresso</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-800">8 produtos em baixo estoque</p>
                      <p className="text-sm text-blue-600">Revisar inventário</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Dialog */}
      <OrderDialog
        open={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        order={selectedOrder}
      />
    </div>
  )
} 
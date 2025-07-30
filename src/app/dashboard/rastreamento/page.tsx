'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  MapPin, 
  Truck,
  Navigation,
  Activity,
  Clock,
  Route,
  Eye,
  RefreshCw,
  Filter,
  Download,
  Play,
  Pause,
  Settings
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { TrackingMap } from '@/components/rastreamento/tracking-map'
import { VehiclesTable } from '@/components/rastreamento/vehicles-table'
import { RouteHistory } from '@/components/rastreamento/route-history'
import { TrackingMetrics } from '@/components/rastreamento/tracking-metrics'
import { AlertsPanel } from '@/components/rastreamento/alerts-panel'

export default function RastreamentoPage() {
  const [isRealTimeActive, setIsRealTimeActive] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Atualização automática a cada 5 segundos
  useEffect(() => {
    if (!isRealTimeActive) return

    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // Aqui seria feita a atualização real dos dados via API
    }, 5000)

    return () => clearInterval(interval)
  }, [isRealTimeActive])

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle)
  }

  const toggleRealTime = () => {
    setIsRealTimeActive(!isRealTimeActive)
  }

  const handleRefresh = () => {
    setLastUpdate(new Date())
    // Atualização manual dos dados
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rastreamento da Frota</h1>
          <p className="text-gray-600 mt-1">
            Monitoramento em tempo real de veículos e entregas
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={isRealTimeActive ? "default" : "outline"} 
            size="sm"
            onClick={toggleRealTime}
          >
            {isRealTimeActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRealTimeActive ? 'Pausar' : 'Iniciar'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status e última atualização */}
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isRealTimeActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isRealTimeActive ? 'Rastreamento Ativo' : 'Rastreamento Pausado'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Última atualização: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Veículos Ativos"
          value="18"
          change="+2"
          changeType="positive"
          icon={Truck}
          description="Em operação"
        />
        <MetricCard
          title="Em Movimento"
          value="14"
          change="+1"
          changeType="positive"
          icon={Navigation}
          description="Trafegando"
        />
        <MetricCard
          title="Entregas Hoje"
          value="24"
          change="+8"
          changeType="positive"
          icon={MapPin}
          description="Finalizadas"
        />
        <MetricCard
          title="KM Percorridos"
          value="1,245"
          change="+12.5%"
          changeType="positive"
          icon={Route}
          description="Hoje"
        />
      </div>

      {/* Tracking Tabs */}
      <Tabs defaultValue="map" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="routes">Rotas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
        </TabsList>

        {/* Map Tab */}
        <TabsContent value="map" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Mapa Principal */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Rastreamento em Tempo Real
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Tudo
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Config
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <TrackingMap 
                    selectedVehicle={selectedVehicle}
                    isRealTime={isRealTimeActive}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Painel Lateral */}
            <div className="space-y-6">
              {/* Veículos Online */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Veículos Online</CardTitle>
                </CardHeader>
                <CardContent>
                  <VehiclesTable 
                    compact={true}
                    onVehicleSelect={handleVehicleSelect}
                    selectedVehicle={selectedVehicle}
                  />
                </CardContent>
              </Card>

              {/* Métricas Rápidas */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Métricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrackingMetrics compact={true} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Veículos</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar Status
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Lista
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <VehiclesTable 
                onVehicleSelect={handleVehicleSelect}
                selectedVehicle={selectedVehicle}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Histórico de Rotas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route className="w-5 h-5" />
                  Histórico de Rotas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteHistory selectedVehicle={selectedVehicle} />
              </CardContent>
            </Card>

            {/* Estatísticas de Rotas */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Rotas</span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rotas Concluídas</span>
                    <span className="font-semibold text-green-600">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Em Andamento</span>
                    <span className="font-semibold text-blue-600">5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Distância Total</span>
                    <span className="font-semibold">1,245 km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tempo Médio</span>
                    <span className="font-semibold">2h 15min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eficiência</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <TrackingMetrics />
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <AlertsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Wrench,
  MapPin,
  Calendar,
  Fuel,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { VehiclesTable } from '@/components/veiculos/vehicles-table'
import { VehicleDialog } from '@/components/veiculos/vehicle-dialog'
import { VehicleStatusChart } from '@/components/veiculos/vehicle-status-chart'
import { VehicleKmChart } from '@/components/veiculos/vehicle-km-chart'
import { VehicleMaintenanceOverview } from '@/components/veiculos/vehicle-maintenance-overview'

export default function VeiculosPage() {
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const handleNewVehicle = () => {
    setSelectedVehicle(null)
    setIsVehicleDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsVehicleDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h1>
          <p className="text-gray-600 mt-1">
            Controle completo da frota e manutenções
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNewVehicle}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Veículo
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Frota Total"
          value="27"
          change="+2"
          changeType="positive"
          icon={Truck}
          description="Veículos cadastrados"
        />
        <MetricCard
          title="Veículos Ativos"
          value="24"
          change="+1"
          changeType="positive"
          icon={TrendingUp}
          description="Em operação"
        />
        <MetricCard
          title="Em Manutenção"
          value="3"
          change="-1"
          changeType="positive"
          icon={Wrench}
          description="Indisponíveis"
        />
        <MetricCard
          title="KM Total da Frota"
          value="1.246.580"
          change="+15.2%"
          changeType="positive"
          icon={MapPin}
          description="Quilometragem acumulada"
        />
      </div>

      {/* Vehicle Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="fleet">Frota</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenções</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Status da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleStatusChart />
              </CardContent>
            </Card>

            {/* Upcoming Maintenance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Próximas Manutenções
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">BRA-2023</p>
                      <p className="text-sm text-gray-600">Revisão - Amanhã</p>
                    </div>
                    <Wrench className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">BRA-2024</p>
                      <p className="text-sm text-gray-600">Troca de Óleo - Atrasada</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">BRA-2025</p>
                      <p className="text-sm text-gray-600">Pneus - Em 3 dias</p>
                    </div>
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Usage */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quilometragem por Veículo - Últimos 6 meses</CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleKmChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Fleet Tab */}
        <TabsContent value="fleet" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Veículos</CardTitle>
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
              <VehiclesTable onEdit={handleEditVehicle} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview de Manutenções por Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleMaintenanceOverview />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fuel Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="w-5 h-5" />
                  Eficiência de Combustível
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Média da Frota</span>
                    <span className="font-semibold">12.5 km/l</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Melhor Performance</span>
                    <span className="font-semibold text-green-600">16.2 km/l</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pior Performance</span>
                    <span className="font-semibold text-red-600">8.1 km/l</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Economia Mensal</span>
                      <span className="font-semibold">R$ 2.450</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vehicle Age */}
            <Card>
              <CardHeader>
                <CardTitle>Idade da Frota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">0-2 anos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full w-[60%]"></div>
                      </div>
                      <span className="font-semibold">6</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">3-5 anos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-[80%]"></div>
                      </div>
                      <span className="font-semibold">12</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">6-10 anos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full w-[40%]"></div>
                      </div>
                      <span className="font-semibold">7</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">+10 anos</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full w-[15%]"></div>
                      </div>
                      <span className="font-semibold">2</span>
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
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Relatório da Frota
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Histórico de KM
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Custos de Manutenção
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Eficiência de Combustível
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Agenda de Manutenções
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
                      <span>Disponibilidade da Frota</span>
                      <span>89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[89%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eficiência Operacional</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[92%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Manutenções em Dia</span>
                      <span>78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full w-[78%]"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Vehicle Dialog */}
      <VehicleDialog
        open={isVehicleDialogOpen}
        onClose={() => setIsVehicleDialogOpen(false)}
        vehicle={selectedVehicle}
      />
    </div>
  )
}
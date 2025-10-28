'use client'
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
import { VehicleDetailsDialog } from '@/components/veiculos/vehicle-details-dialog'
import { VehicleStatusChart } from '@/components/veiculos/vehicle-status-chart'
import { VehicleKmChart } from '@/components/veiculos/vehicle-km-chart'
import { VehicleMaintenanceOverview } from '@/components/veiculos/vehicle-maintenance-overview'
import { useEffect, useState } from 'react'
import { fetchVehicles, createVehicle, updateVehicle, VehicleRecord } from '@/services/vehiclesService'
import { calcularEstatisticasVeiculos, calcularKmPorVeiculo, calcularPerformanceFrota, buscarProximasManutencoes } from '@/services/vehiclesStatsService'
import { useToast } from '@/hooks/use-toast'
import { exportRelatorioFrota, exportHistoricoKm, exportCustosManutencaoTemplate, exportEficienciaCombustivelTemplate, exportAgendaManutencoesTemplate } from '@/components/veiculos/reports'

export default function VeiculosPage() {
  const [isVehicleDialogOpen, setIsVehicleDialogOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null)
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([])
  const [stats, setStats] = useState<any>(null)
  const [kmData, setKmData] = useState<any[]>([])
  const [performance, setPerformance] = useState<any>(null)
  const [proximasManutencoes, setProximasManutencoes] = useState<any[]>([])
  const { toast} = useToast()

  const load = async () => {
    const rows = await fetchVehicles()
    setVehicles(rows)
    
    // Calcular estatísticas
    const statistics = calcularEstatisticasVeiculos(rows)
    setStats(statistics)
    
    // Calcular KM por veículo
    const km = calcularKmPorVeiculo(rows)
    setKmData(km)
    
    // Calcular performance
    const perf = calcularPerformanceFrota(rows)
    setPerformance(perf)
    
    // Buscar próximas manutenções
    const manutencoes = buscarProximasManutencoes(rows)
    setProximasManutencoes(manutencoes)
  }

  useEffect(() => {
    load()
  }, [])

  const handleNewVehicle = () => {
    setSelectedVehicle(null)
    setIsVehicleDialogOpen(true)
  }

  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setIsVehicleDialogOpen(true)
  }

  const handleViewDetails = (vehicle: VehicleRecord) => {
    setSelectedVehicle(vehicle)
    setIsDetailsOpen(true)
  }

  const handleSaveVehicle = async (data: VehicleRecord) => {
    try {
      if (selectedVehicle?.id) {
        const ok = await updateVehicle(selectedVehicle.id, data)
        if (!ok) throw new Error('Falha ao atualizar veículo')
        toast({ title: 'Veículo atualizado' })
      } else {
        const created = await createVehicle(data)
        if (!created) throw new Error('Falha ao criar veículo')
        toast({ title: 'Veículo criado' })
      }
      setIsVehicleDialogOpen(false)
      setSelectedVehicle(null)
      await load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Erro ao salvar veículo' })
    }
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
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Importação', description: 'Em breve' })}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportRelatorioFrota(vehicles)}>
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
          value={stats?.total?.toString() || '0'}
          change={stats?.total > 0 ? `+${stats.total}` : '0'}
          changeType="neutral"
          icon={Truck}
          description="Veículos cadastrados"
        />
        <MetricCard
          title="Veículos Ativos"
          value={stats?.ativos?.toString() || '0'}
          change={stats?.total > 0 ? `${((stats.ativos / stats.total) * 100).toFixed(0)}%` : '0%'}
          changeType="positive"
          icon={TrendingUp}
          description="Em operação"
        />
        <MetricCard
          title="Em Manutenção"
          value={stats?.emManutencao?.toString() || '0'}
          change={stats?.emManutencao > 0 ? `${stats.emManutencao} veículos` : 'Nenhum'}
          changeType={stats?.emManutencao > 0 ? 'negative' : 'neutral'}
          icon={Wrench}
          description="Indisponíveis"
        />
        <MetricCard
          title="KM Total da Frota"
          value={stats?.kmTotal?.toLocaleString('pt-BR') || '0'}
          change={stats?.kmTotal > 0 ? 'KM acumulado' : '0 KM'}
          changeType="neutral"
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
                <VehicleStatusChart data={stats?.porStatus} />
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
                {proximasManutencoes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Nenhuma manutenção agendada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {proximasManutencoes.map((manutencao, idx) => {
                      const config = {
                        atrasada: { bg: 'bg-red-50', icon: AlertTriangle, color: 'text-red-600', label: 'Atrasada' },
                        urgente: { bg: 'bg-yellow-50', icon: Wrench, color: 'text-yellow-600', label: 'Urgente' },
                        proxima: { bg: 'bg-blue-50', icon: Truck, color: 'text-blue-600', label: 'Próxima' }
                      }
                      const cfg = config[manutencao.status as keyof typeof config] || config.proxima
                      const Icon = cfg.icon
                      
                      return (
                        <div key={idx} className={`flex items-center justify-between p-3 ${cfg.bg} rounded-lg`}>
                          <div>
                            <p className="font-medium">{manutencao.placa}</p>
                            <p className="text-sm text-gray-600">
                              {manutencao.modelo} - {manutencao.diasRestantes < 0 
                                ? `${Math.abs(manutencao.diasRestantes)} dias atrasada` 
                                : manutencao.diasRestantes === 0 
                                ? 'Hoje'
                                : manutencao.diasRestantes === 1
                                ? 'Amanhã'
                                : `Em ${manutencao.diasRestantes} dias`}
                            </p>
                          </div>
                          <Icon className={`w-5 h-5 ${cfg.color}`} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Usage */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Quilometragem por Veículo - Top 6</CardTitle>
              </CardHeader>
              <CardContent>
                <VehicleKmChart data={kmData} />
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
              <VehiclesTable onEdit={handleEditVehicle} onView={handleViewDetails} data={vehicles} />
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
              <VehicleMaintenanceOverview vehicles={vehicles} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fleet Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Resumo da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total de Veículos</span>
                    <span className="font-semibold">{stats?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Veículos Ativos</span>
                    <span className="font-semibold text-green-600">{stats?.ativos || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Em Manutenção</span>
                    <span className="font-semibold text-orange-600">{stats?.emManutencao || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Inativos</span>
                    <span className="font-semibold text-gray-600">{stats?.inativos || 0}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">KM Total</span>
                      <span className="font-semibold">{stats?.kmTotal?.toLocaleString('pt-BR') || 0} km</span>
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
                {stats?.total === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Nenhum veículo cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(stats?.porIdade || {}).map(([faixa, qtd]: [string, any]) => {
                      const percentage = stats.total > 0 ? (qtd / stats.total) * 100 : 0
                      const colors = {
                        '0-2 anos': 'bg-green-600',
                        '3-5 anos': 'bg-blue-600',
                        '6-10 anos': 'bg-orange-600',
                        '+10 anos': 'bg-red-600'
                      }
                      const color = colors[faixa as keyof typeof colors] || 'bg-gray-600'
                      
                      return (
                        <div key={faixa} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{faixa}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`${color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <span className="font-semibold w-8 text-right">{qtd}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
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
                <Button variant="outline" className="w-full justify-start" onClick={() => exportRelatorioFrota(vehicles)}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório da Frota
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportHistoricoKm(vehicles)}>
                  <Download className="w-4 h-4 mr-2" />
                  Histórico de KM
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportCustosManutencaoTemplate()}>
                  <Download className="w-4 h-4 mr-2" />
                  Custos de Manutenção
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportEficienciaCombustivelTemplate()}>
                  <Download className="w-4 h-4 mr-2" />
                  Eficiência de Combustível
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportAgendaManutencoesTemplate()}>
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
                {stats?.total === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Nenhum veículo cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disponibilidade da Frota</span>
                        <span>{performance?.disponibilidade || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${performance?.disponibilidade || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Eficiência Operacional</span>
                        <span>{performance?.eficienciaOperacional || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${performance?.eficienciaOperacional || 0}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Manutenções em Dia</span>
                        <span>{performance?.manutencoesEmDia || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${performance?.manutencoesEmDia || 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                )}
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
        onSave={handleSaveVehicle}
      />

      <VehicleDetailsDialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} vehicle={selectedVehicle as any} />
    </div>
  )
}
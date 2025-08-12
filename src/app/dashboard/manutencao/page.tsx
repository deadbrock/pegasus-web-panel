'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import { 
  Wrench, 
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  Filter,
  Search
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { MaintenanceCalendar } from '@/components/manutencao/maintenance-calendar'
import { MaintenanceTable, maintenanceData } from '@/components/manutencao/maintenance-table'
import { MaintenanceDialog } from '@/components/manutencao/maintenance-dialog'
import { MaintenanceChart } from '@/components/manutencao/maintenance-chart'
import { VehicleMaintenanceStatus } from '@/components/manutencao/vehicle-maintenance-status'
import { downloadMaintenanceReports } from '@/components/manutencao/reports'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ManutencaoFilters } from '@/components/manutencao/manutencao-filters'
import type { ManutencaoFilter } from '@/types/supabase'

export default function ManutencaoPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<ManutencaoFilter>({})

  const handleNewMaintenance = () => {
    setSelectedMaintenance(null)
    setIsDialogOpen(true)
  }

  const handleEditMaintenance = (maintenance: any) => {
    setSelectedMaintenance(maintenance)
    setIsDialogOpen(true)
  }

  const handleExport = () => {
    const rows = maintenanceData.map(m => ({
      veiculo: m.veiculo,
      tipo: m.tipo,
      descricao: m.descricao,
      dataAgendada: m.dataAgendada,
      quilometragem: m.quilometragem,
      status: m.status,
      custo: m.custo,
      responsavel: m.responsavel,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Manutencoes')
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'manutencoes_export.xlsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Relatórios
  const exportRelatorioMensal = () => downloadMaintenanceReports('mensal')
  const exportCustoPorVeiculo = () => downloadMaintenanceReports('custo-por-veiculo')
  const exportHistoricoManutencao = () => downloadMaintenanceReports('historico')
  const exportPreventivasVencidas = () => downloadMaintenanceReports('preventivas-vencidas')

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manutenção</h1>
          <p className="text-gray-600 mt-1">
            Gestão e controle de manutenção de veículos
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNewMaintenance}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Manutenção
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Manutenções"
          value="145"
          change="+8.2%"
          changeType="positive"
          icon={Wrench}
          description="Este mês"
        />
        <MetricCard
          title="Pendentes"
          value="8"
          change="+2"
          changeType="negative"
          icon={Clock}
          description="Requerem atenção"
        />
        <MetricCard
          title="Em Andamento"
          value="4"
          change="-1"
          changeType="positive"
          icon={AlertTriangle}
          description="Em execução"
        />
        <MetricCard
          title="Concluídas"
          value="133"
          change="+15.3%"
          changeType="positive"
          icon={CheckCircle}
          description="Finalizadas"
        />
      </div>

      {/* Maintenance Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
          <TabsTrigger value="vehicles">Veículos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Maintenance Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Manutenções por Tipo - Últimos 6 meses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MaintenanceChart />
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
                      <p className="font-medium">BRA-2023 - Revisão</p>
                      <p className="text-sm text-gray-600">Amanhã - 10:00</p>
                    </div>
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">BRA-2024 - Troca de Óleo</p>
                      <p className="text-sm text-gray-600">Atrasada - 2 dias</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">BRA-2025 - Pneus</p>
                      <p className="text-sm text-gray-600">Em 3 dias - 14:30</p>
                    </div>
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Costs Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Custos de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Este mês</span>
                    <span className="font-semibold text-lg">R$ 18.450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mês anterior</span>
                    <span className="font-medium">R$ 22.300</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Economia</span>
                    <span className="font-medium text-green-600">-17.2%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Custo médio/veículo</span>
                      <span className="font-medium">R$ 685</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <MaintenanceCalendar />
            </CardContent>
          </Card>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Manutenções</CardTitle>
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
              <MaintenanceTable onEdit={handleEditMaintenance} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Status por Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleMaintenanceStatus />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={exportRelatorioMensal}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório Mensal de Manutenções
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportCustoPorVeiculo}>
                  <Download className="w-4 h-4 mr-2" />
                  Custos por Veículo
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportHistoricoManutencao}>
                  <Download className="w-4 h-4 mr-2" />
                  Histórico de Manutenções
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={exportPreventivasVencidas}>
                  <Download className="w-4 h-4 mr-2" />
                  Preventivas Vencidas
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
                      <span>Manutenções no Prazo</span>
                      <span>87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[87%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Disponibilidade da Frota</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[92%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eficiência de Custos</span>
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

      {/* Maintenance Dialog */}
      <MaintenanceDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maintenance={selectedMaintenance}
      />

      {/* Filters Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filtros de Manutenção</DialogTitle>
          </DialogHeader>
          <ManutencaoFilters
            filters={filters}
            onFiltersChange={(f) => {
              setFilters(f)
              setIsFilterOpen(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
} 
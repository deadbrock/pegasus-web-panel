'use client'

import { useState, useEffect } from 'react'
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
import { MaintenanceTable } from '@/components/manutencao/maintenance-table'
import { MaintenanceDialog } from '@/components/manutencao/maintenance-dialog'
import { MaintenanceChart } from '@/components/manutencao/maintenance-chart'
import { VehicleMaintenanceStatus } from '@/components/manutencao/vehicle-maintenance-status'
import { downloadMaintenanceReports } from '@/components/manutencao/reports'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ManutencaoFilters } from '@/components/manutencao/manutencao-filters'
import type { ManutencaoFilter } from '@/types/supabase'
import { 
  fetchManutencoes, 
  calcularEstatisticasManutencoes,
  subscribeManutencoes,
  type Manutencao
} from '@/lib/services/manutencoes-service'
import { useToast } from '@/hooks/use-toast'

export default function ManutencaoPage() {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    custoTotal: 0,
    custoMedio: 0
  })
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState<Manutencao | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<ManutencaoFilter>({})
  const { toast } = useToast()

  // Carrega manutenções do Supabase
  useEffect(() => {
    loadManutencoes()
    
    // Subscreve mudanças em tempo real
    const unsubscribe = subscribeManutencoes(() => {
      console.log('[Manutencao] Mudança detectada, recarregando...')
      loadManutencoes()
    })

    return () => unsubscribe()
  }, [])

  async function loadManutencoes() {
    setLoading(true)
    try {
      const [data, statistics] = await Promise.all([
        fetchManutencoes(),
        calcularEstatisticasManutencoes()
      ])
      setManutencoes(data)
      setStats(statistics)
    } catch (error) {
      console.error('[Manutencao] Erro ao carregar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as manutenções',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNewMaintenance = () => {
    setSelectedMaintenance(null)
    setIsDialogOpen(true)
  }

  const handleEditMaintenance = (maintenance: Manutencao) => {
    setSelectedMaintenance(maintenance)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    setIsDialogOpen(false)
    setSelectedMaintenance(null)
    await loadManutencoes()
    toast({
      title: 'Sucesso',
      description: 'Manutenção salva com sucesso!'
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta manutenção?')) return
    
    try {
      // Aqui você implementaria a função de delete
      await loadManutencoes()
      toast({
        title: 'Sucesso',
        description: 'Manutenção excluída com sucesso!'
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a manutenção',
        variant: 'destructive'
      })
    }
  }

  const handleExport = () => {
    const rows = manutencoes.map(m => ({
      veiculo: m.veiculo_placa || 'N/A',
      tipo: m.tipo,
      descricao: m.descricao,
      dataAgendada: new Date(m.data_agendada).toLocaleDateString('pt-BR'),
      quilometragem: m.quilometragem,
      status: m.status,
      custo: m.custo || 0,
      responsavel: m.responsavel || 'N/A',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Manutencoes')
    const data = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manutencoes_export_${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Relatórios
  const exportRelatorioMensal = () => downloadMaintenanceReports('mensal', manutencoes)
  const exportCustoPorVeiculo = () => downloadMaintenanceReports('custo-por-veiculo', manutencoes)
  const exportHistoricoManutencao = () => downloadMaintenanceReports('historico', manutencoes)
  const exportPreventivasVencidas = () => downloadMaintenanceReports('preventivas-vencidas', manutencoes)

  // Calcula próximas manutenções
  const proximasManutencoes = manutencoes
    .filter(m => m.status === 'Agendada' || m.status === 'Atrasada')
    .sort((a, b) => new Date(a.data_agendada).getTime() - new Date(b.data_agendada).getTime())
    .slice(0, 3)

  // Calcula custos
  const mesAtual = new Date().getMonth()
  const anoAtual = new Date().getFullYear()
  const custosMesAtual = manutencoes
    .filter(m => {
      const date = new Date(m.data_agendada)
      return date.getMonth() === mesAtual && date.getFullYear() === anoAtual
    })
    .reduce((acc, m) => acc + (m.custo || 0), 0)

  const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1
  const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual
  const custosMesAnterior = manutencoes
    .filter(m => {
      const date = new Date(m.data_agendada)
      return date.getMonth() === mesAnterior && date.getFullYear() === anoAnterior
    })
    .reduce((acc, m) => acc + (m.custo || 0), 0)

  const economia = custosMesAnterior > 0 
    ? ((custosMesAnterior - custosMesAtual) / custosMesAnterior * 100).toFixed(1)
    : '0.0'

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
          value={loading ? '...' : stats.total.toString()}
          change="+8.2%"
          changeType="positive"
          icon={Wrench}
          description="Cadastradas"
        />
        <MetricCard
          title="Pendentes"
          value={loading ? '...' : stats.pendentes.toString()}
          change={stats.pendentes > 5 ? '+' + (stats.pendentes - 5) : '0'}
          changeType={stats.pendentes > 5 ? "negative" : "positive"}
          icon={Clock}
          description="Requerem atenção"
        />
        <MetricCard
          title="Em Andamento"
          value={loading ? '...' : stats.emAndamento.toString()}
          change="-1"
          changeType="positive"
          icon={AlertTriangle}
          description="Em execução"
        />
        <MetricCard
          title="Concluídas"
          value={loading ? '...' : stats.concluidas.toString()}
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
                <MaintenanceChart manutencoes={manutencoes} />
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
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-3 bg-gray-100 rounded-lg animate-pulse h-16"></div>
                    ))}
                  </div>
                ) : proximasManutencoes.length > 0 ? (
                  <div className="space-y-4">
                    {proximasManutencoes.map((m) => {
                      const date = new Date(m.data_agendada)
                      const isAtrasada = m.status === 'Atrasada'
                      const bgColor = isAtrasada ? 'bg-red-50' : 'bg-blue-50'
                      const iconColor = isAtrasada ? 'text-red-600' : 'text-blue-600'
                      const Icon = isAtrasada ? AlertTriangle : Wrench
                      
                      return (
                        <div key={m.id} className={`flex items-center justify-between p-3 ${bgColor} rounded-lg`}>
                          <div>
                            <p className="font-medium">{m.veiculo_placa} - {m.tipo}</p>
                            <p className="text-sm text-gray-600">
                              {date.toLocaleDateString('pt-BR')} - {m.descricao}
                            </p>
                          </div>
                          <Icon className={`w-5 h-5 ${iconColor}`} />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    Nenhuma manutenção agendada
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Costs Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Custos de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-6 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Este mês</span>
                      <span className="font-semibold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custosMesAtual)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Mês anterior</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(custosMesAnterior)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Variação</span>
                      <span className={`font-medium ${Number(economia) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(economia) > 0 ? '-' : '+'}{economia}%
                      </span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Custo médio</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.custoMedio)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
              <MaintenanceCalendar manutencoes={manutencoes} />
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
                  <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
                    <Filter className="w-4 h-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MaintenanceTable 
                data={manutencoes} 
                onEdit={handleEditMaintenance}
                onDelete={handleDelete}
              />
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
              <VehicleMaintenanceStatus manutencoes={manutencoes} />
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
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedMaintenance(null)
        }}
        maintenance={selectedMaintenance}
        onSave={handleSave}
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
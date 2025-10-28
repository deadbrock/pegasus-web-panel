'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  UserCheck,
  AlertTriangle,
  Calendar,
  Award,
  TrendingUp,
  MapPin,
  CheckCircle
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { DriversTable } from '@/components/motoristas/drivers-table'
import { DriverDialog } from '@/components/motoristas/driver-dialog'
import { fetchDrivers, createDriver, updateDriver, DriverRecord } from '@/services/driversService'
import { useToast } from '@/hooks/use-toast'
import { DriverStatusChart } from '@/components/motoristas/driver-status-chart'
import { DriverLicenseChart } from '@/components/motoristas/driver-license-chart'
import { DriverPerformanceOverview } from '@/components/motoristas/driver-performance-overview'
import { exportListaMotoristas, exportCNHVencendo, exportDocumentosPendentesTemplate } from '@/components/motoristas/drivers-reports'
import { DriverDocumentsStatus } from '@/components/motoristas/driver-documents-status'
import { DriversImportExport } from '@/components/motoristas/drivers-import-export'
import { DriverDetailsDialog } from '@/components/motoristas/driver-details-dialog'
import { calcularEstatisticasMotoristas, buscarAlertasDocumentos, buscarMelhoresPerformances, type DriverStats } from '@/services/driversStatsService'

export default function MotoristasPage() {
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null)
  const [drivers, setDrivers] = useState<DriverRecord[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [stats, setStats] = useState<DriverStats | null>(null)
  const [alertas, setAlertas] = useState<any[]>([])
  const [melhoresPerformances, setMelhoresPerformances] = useState<any[]>([])
  const { toast } = useToast()

  const load = async () => {
    const rows = await fetchDrivers()
    setDrivers(rows)
    
    // Calcular estatísticas
    const estatisticas = calcularEstatisticasMotoristas(rows)
    setStats(estatisticas)
    
    // Buscar alertas e performances
    const alertasDoc = buscarAlertasDocumentos(rows)
    setAlertas(alertasDoc.slice(0, 3)) // Top 3 alertas
    
    const melhores = buscarMelhoresPerformances(rows)
    setMelhoresPerformances(melhores)
  }

  useEffect(() => {
    load()
  }, [])

  const handleNewDriver = () => {
    setSelectedDriver(null)
    setIsDriverDialogOpen(true)
  }

  const handleEditDriver = (driver: any) => {
    setSelectedDriver(driver)
    setIsDriverDialogOpen(true)
  }

  const handleViewDriver = (driver: any) => {
    setSelectedDriver(driver)
    setIsDetailsOpen(true)
  }

  const handleSave = async (payload: any) => {
    try {
      if (selectedDriver?.id) {
        const ok = await updateDriver(selectedDriver.id, payload)
        if (!ok) throw new Error('Falha ao atualizar motorista')
        toast({ title: 'Motorista atualizado' })
      } else {
        const created = await createDriver(payload as DriverRecord)
        if (!created) throw new Error('Falha ao criar motorista')
        toast({ title: 'Motorista criado' })
      }
      setIsDriverDialogOpen(false)
      setSelectedDriver(null)
      await load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Erro ao salvar motorista' })
    }
  }

  const exportDrivers = () => exportListaMotoristas(drivers)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Motoristas</h1>
          <p className="text-gray-600 mt-1">
            Controle completo dos condutores da frota
          </p>
        </div>
        <div className="flex gap-3">
          <DriversImportExport onImported={load} />
          <Button variant="outline" size="sm" onClick={exportDrivers}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleNewDriver}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Motorista
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Motoristas"
          value={stats?.total.toString() || '0'}
          change={stats && stats.total > 0 ? `${stats.total} cadastrados` : '-'}
          changeType="positive"
          icon={Users}
          description="Cadastrados"
        />
        <MetricCard
          title="Motoristas Ativos"
          value={stats?.ativos.toString() || '0'}
          change={stats && stats.ativos > 0 ? `${Math.round((stats.ativos / stats.total) * 100)}% da frota` : '-'}
          changeType="positive"
          icon={UserCheck}
          description="Aptos para dirigir"
        />
        <MetricCard
          title="CNH Vencendo"
          value={stats?.cnhVencendo.toString() || '0'}
          change={stats && stats.cnhVencidas > 0 ? `${stats.cnhVencidas} vencidas` : 'Nenhuma vencida'}
          changeType={stats && stats.cnhVencendo > 0 ? 'negative' : 'positive'}
          icon={AlertTriangle}
          description="Próximas ao vencimento"
        />
        <MetricCard
          title="Performance Média"
          value={stats ? `${stats.performance.satisfacao}%` : '-'}
          change={stats ? `${stats.performance.pontualidade}% pontualidade` : '-'}
          changeType="positive"
          icon={Award}
          description="Pontuação geral"
        />
      </div>

      {/* Driver Management Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="drivers">Motoristas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Status Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Motoristas</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverStatusChart statusData={stats?.porStatus} />
              </CardContent>
            </Card>

            {/* License Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias de CNH</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverLicenseChart data={stats?.porCategoria} />
              </CardContent>
            </Card>

            {/* Document Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Documentos Vencendo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
                    <p>Nenhum alerta de documentos!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {alertas.map((alerta, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          alerta.severidade === 'critico' ? 'bg-red-50' :
                          alerta.severidade === 'alerta' ? 'bg-yellow-50' : 'bg-orange-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{alerta.motorista}</p>
                          <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                        </div>
                        <AlertTriangle className={`w-5 h-5 ${
                          alerta.severidade === 'critico' ? 'text-red-600' :
                          alerta.severidade === 'alerta' ? 'text-yellow-600' : 'text-orange-600'
                        }`} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Melhores Performances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {melhoresPerformances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Award className="w-12 h-12 mb-2 text-gray-400" />
                    <p>Nenhum dado de performance</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {melhoresPerformances.map((motorista, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          index === 0 ? 'bg-green-50' : 
                          index === 1 ? 'bg-blue-50' : 'bg-purple-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{motorista.nome}</p>
                          <p className="text-sm text-gray-600">Pontuação: {motorista.pontuacao}%</p>
                        </div>
                        <Award className={`w-5 h-5 ${
                          index === 0 ? 'text-green-600' : 
                          index === 1 ? 'text-blue-600' : 'text-purple-600'
                        }`} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Drivers Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Motoristas</CardTitle>
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
              <DriversTable onEdit={handleEditDriver} onView={handleViewDriver} data={drivers} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <DriverDocumentsStatus statusSummary={stats?.documentosStatus} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance dos Motoristas</CardTitle>
            </CardHeader>
            <CardContent>
              <DriverPerformanceOverview data={[]} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => exportListaMotoristas(drivers)}>
                  <Download className="w-4 h-4 mr-2" />
                  Lista de Motoristas
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportCNHVencendo(drivers)}>
                  <Download className="w-4 h-4 mr-2" />
                  CNHs Vencendo
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Performance Mensal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Histórico de Viagens
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => exportDocumentosPendentesTemplate()}>
                  <Download className="w-4 h-4 mr-2" />
                  Documentos Pendentes
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Qualidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Pontualidade</span>
                      <span>{stats?.performance.pontualidade || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${stats?.performance.pontualidade || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Segurança</span>
                      <span>{stats?.performance.seguranca || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stats?.performance.seguranca || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eficiência</span>
                      <span>{stats?.performance.eficiencia || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${stats?.performance.eficiencia || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfação do Cliente</span>
                      <span>{stats?.performance.satisfacao || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${stats?.performance.satisfacao || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Driver Dialog */}
      <DriverDialog
        open={isDriverDialogOpen}
        onClose={() => setIsDriverDialogOpen(false)}
        driver={selectedDriver}
        onSave={handleSave as any}
      />

      <DriverDetailsDialog open={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} driver={selectedDriver} />
    </div>
  )
}
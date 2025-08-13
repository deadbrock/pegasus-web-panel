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
  MapPin
} from 'lucide-react'
import { MetricCard } from '@/components/dashboard/metric-card'
import { DriversTable } from '@/components/motoristas/drivers-table'
import { DriverDialog } from '@/components/motoristas/driver-dialog'
import { fetchDrivers, createDriver, updateDriver, DriverRecord } from '@/services/driversService'
import * as XLSX from 'xlsx'
import { useToast } from '@/hooks/use-toast'
import { DriverStatusChart } from '@/components/motoristas/driver-status-chart'
import { DriverLicenseChart } from '@/components/motoristas/driver-license-chart'
import { DriverPerformanceOverview } from '@/components/motoristas/driver-performance-overview'
import { DriverDocumentsStatus } from '@/components/motoristas/driver-documents-status'

export default function MotoristasPage() {
  const [isDriverDialogOpen, setIsDriverDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<DriverRecord | null>(null)
  const [drivers, setDrivers] = useState<DriverRecord[]>([])
  const { toast } = useToast()

  const load = async () => {
    const rows = await fetchDrivers()
    setDrivers(rows)
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

  const exportDrivers = () => {
    const rows = (drivers || []).map(d => ({
      Nome: d.nome,
      CPF: d.cpf,
      CNH: d.cnh,
      Telefone: d.telefone || '',
      Email: d.email || '',
      Endereco: d.endereco || '',
      Status: d.status || 'Ativo',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Motoristas')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'motoristas.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

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
          <Button variant="outline" size="sm" onClick={() => toast({ title: 'Importar', description: 'Em breve' })}>
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
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
          value="34"
          change="+3"
          changeType="positive"
          icon={Users}
          description="Cadastrados"
        />
        <MetricCard
          title="Motoristas Ativos"
          value="29"
          change="+2"
          changeType="positive"
          icon={UserCheck}
          description="Aptos para dirigir"
        />
        <MetricCard
          title="CNH Vencendo"
          value="4"
          change="+1"
          changeType="negative"
          icon={AlertTriangle}
          description="Próximas ao vencimento"
        />
        <MetricCard
          title="Performance Média"
          value="87%"
          change="+5.2%"
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
                <DriverStatusChart />
              </CardContent>
            </Card>

            {/* License Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categorias de CNH</CardTitle>
              </CardHeader>
              <CardContent>
                <DriverLicenseChart />
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">João Silva</p>
                      <p className="text-sm text-gray-600">CNH vence em 15 dias</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium">Maria Santos</p>
                      <p className="text-sm text-gray-600">CNH vence em 45 dias</p>
                    </div>
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="font-medium">Pedro Costa</p>
                      <p className="text-sm text-gray-600">Exame médico vence em 30 dias</p>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Carlos Lima</p>
                      <p className="text-sm text-gray-600">Pontuação: 96%</p>
                    </div>
                    <Award className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">Ana Oliveira</p>
                      <p className="text-sm text-gray-600">Pontuação: 94%</p>
                    </div>
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="font-medium">Roberto Silva</p>
                      <p className="text-sm text-gray-600">Pontuação: 91%</p>
                    </div>
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
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
              <DriversTable onEdit={handleEditDriver} data={drivers} />
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
              <DriverDocumentsStatus />
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
              <DriverPerformanceOverview />
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
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Lista de Motoristas
                </Button>
                <Button variant="outline" className="w-full justify-start">
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
                <Button variant="outline" className="w-full justify-start">
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
                      <span>91%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[91%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Segurança</span>
                      <span>95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-[95%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eficiência</span>
                      <span>88%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full w-[88%]"></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfação do Cliente</span>
                      <span>93%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full w-[93%]"></div>
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
    </div>
  )
}
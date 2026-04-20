'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Truck,
  Package,
  MapPin,
  FileText,
  Shield,
  Award,
  Settings,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Zap,
  Eye,
  Download
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts'
import { MetricCard } from '@/components/dashboard/metric-card'
import { useEffect, useState } from 'react'
import { fetchDashboardKPIs, type DashboardKPIs } from '@/lib/services/dashboard-service'
import { useRouter } from 'next/navigation'

// Sem dados mock — apenas dados reais do Supabase via fetchDashboardKPIs

export default function DashboardPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const now = new Date()
  const [selectedPeriod, setSelectedPeriod] = useState(`${['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][now.getMonth()]} ${now.getFullYear()}`)
  const [selectedMonth, setSelectedMonth] = useState(['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][now.getMonth()])
  const [selectedYear, setSelectedYear] = useState(now.getFullYear().toString())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  useEffect(() => { fetchDashboardKPIs().then(setKpis) }, [])

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  // Gerar anos de 2025 a 2050
  const years = Array.from({ length: 26 }, (_, i) => (2025 + i).toString())

  const handleApplyPeriod = () => {
    setSelectedPeriod(`${selectedMonth} ${selectedYear}`)
    setIsDialogOpen(false)
  }

  const handleQuickPeriod = (period: string) => {
    const now = new Date()
    const currentMonth = months[now.getMonth()]
    const currentYear = now.getFullYear().toString()
    
    switch(period) {
      case 'current':
        setSelectedMonth(currentMonth)
        setSelectedYear(currentYear)
        setSelectedPeriod(`${currentMonth} ${currentYear}`)
        break
      case 'last': {
        const lastMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1
        const lastYearVal = now.getMonth() === 0 ? (now.getFullYear() - 1).toString() : currentYear
        setSelectedMonth(months[lastMonthIdx])
        setSelectedYear(lastYearVal)
        setSelectedPeriod(`${months[lastMonthIdx]} ${lastYearVal}`)
        break
      }
      case 'year':
        setSelectedMonth('Dezembro')
        setSelectedYear(currentYear)
        setSelectedPeriod(`Ano ${currentYear}`)
        break
    }
    setIsDialogOpen(false)
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
  }

  const handleExportDashboard = () => {
    // Exportar dados do dashboard
    const dashboardData = {
      periodo: selectedPeriod,
      receita_total: kpis?.receita_total ?? 0,
      custo_total: kpis?.custo_total ?? 0,
      lucro_liquido: kpis?.lucro_liquido ?? 0,
      exportado_em: new Date().toLocaleString('pt-BR')
    }
    
    const dataStr = JSON.stringify(dashboardData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `dashboard-executivo-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'atencao': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online': return <Badge className="bg-green-500">Online</Badge>
      case 'atencao': return <Badge className="bg-yellow-500">Atenção</Badge>
      case 'offline': return <Badge variant="destructive">Offline</Badge>
      default: return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Executivo */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
            <p className="text-blue-100 mt-1">
              Visão consolidada da operação - {selectedPeriod}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Sistema Operacional</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Atualizado em: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white text-black border-white hover:bg-gray-100 hover:text-blue-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Período
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Selecionar Período</DialogTitle>
                  <DialogDescription>
                    Escolha o mês e ano para visualizar os dados do dashboard
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Atalhos Rápidos */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Atalhos Rápidos</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPeriod('current')}
                        className="w-full"
                      >
                        Mês Atual
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPeriod('last')}
                        className="w-full"
                      >
                        Mês Passado
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickPeriod('year')}
                        className="w-full"
                      >
                        Ano Atual
                      </Button>
                    </div>
                  </div>

                  {/* Seletores Personalizados */}
                  <div className="space-y-4">
                    <Label className="text-sm font-medium">Período Personalizado</Label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Seletor de Mês */}
                      <div className="space-y-2">
                        <Label htmlFor="month" className="text-xs text-gray-600">Mês</Label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger id="month">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month) => (
                              <SelectItem key={month} value={month}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Seletor de Ano */}
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-xs text-gray-600">Ano</Label>
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger id="year">
                            <SelectValue placeholder="Selecione o ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Preview do Período Selecionado */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-xs text-blue-600 font-medium">Período Selecionado:</p>
                          <p className="text-sm font-bold text-blue-900">{selectedMonth} de {selectedYear}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleApplyPeriod}
                    >
                      Aplicar Período
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              className="bg-white text-black border-white hover:bg-gray-100 hover:text-blue-600"
              onClick={handleExportDashboard}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-white text-black border-white hover:bg-gray-100 hover:text-blue-600"
              onClick={() => router.push('/dashboard/configuracoes')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurar
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Financeiros Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(kpis?.receita_total ?? 0)}
          change={kpis ? 'Dados reais' : 'Carregando...'}
          changeType="positive"
          icon={DollarSign}
          description="Este mês"
        />
        <MetricCard
          title="Custo Total"
          value={formatCurrency(kpis?.custo_total ?? 0)}
          change={kpis ? 'Dados reais' : 'Carregando...'}
          changeType="positive"
          icon={TrendingDown}
          description="Redução"
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(kpis?.lucro_liquido ?? 0)}
          change={kpis ? `Margem: ${(kpis.margem_lucro ?? 0).toFixed(1)}%` : 'Calculando...'}
          changeType="positive"
          icon={Target}
          description="Este mês"
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${kpis?.margem_lucro?.toFixed(1) ?? '0.0'}%`}
          change={kpis && kpis.margem_lucro > 20 ? 'Saudável' : 'Atenção'}
          changeType={kpis && kpis.margem_lucro > 20 ? 'positive' : 'negative'}
          icon={TrendingUp}
          description="Lucratividade"
        />
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Financeira */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Evolução Financeira (5 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Receita" />
                  <Area type="monotone" dataKey="custos" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Custos" />
                  <Area type="monotone" dataKey="lucro" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.8} name="Lucro" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Operacional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance vs Meta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                  <Bar dataKey="valor" fill="#3b82f6" name="Atual" />
                  <Bar dataKey="meta" fill="#94a3b8" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Widgets Financeiros Específicos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Centro de Custos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Despesas por Centro de Custo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                <BarChart3 className="w-8 h-8 mb-2" />
                <p className="text-sm">Nenhum dado de centro de custo</p>
                <p className="text-xs mt-1">Importe transações OFX para ver o rateio</p>
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Transações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <Activity className="w-8 h-8 mb-2" />
              <p className="text-sm">Nenhuma transação recente</p>
              <p className="text-xs mt-1">Importe extratos OFX para visualizar</p>
            </div>
            <div className="mt-3 pt-3 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push('/dashboard/financeiro')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas as Transações
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro Rápido */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600 font-medium">Entradas</p>
                <p className="text-lg font-bold text-green-700">{formatCurrency(kpis?.receita_total ?? 0)}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium">Saídas</p>
                <p className="text-lg font-bold text-red-700">{formatCurrency(kpis?.custo_total ?? 0)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lucro Líquido</span>
                <span className="font-bold text-blue-600">{formatCurrency(kpis?.lucro_liquido ?? 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Margem</span>
                <span className="font-medium text-gray-600">{kpis?.margem_lucro?.toFixed(1) ?? '0.0'}%</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => router.push('/dashboard/financeiro')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Importar OFX
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Pedidos Ativos"
          value={(kpis?.pedidos_ativos ?? 0).toString()}
          change={kpis ? `Total: ${kpis.pedidos_total}` : 'Carregando...'}
          changeType="neutral"
          icon={Package}
          description="Em andamento"
        />
        <MetricCard
          title="Taxa de Entrega"
          value={`${kpis?.taxa_entrega?.toFixed(1) ?? '0.0'}%`}
          change={kpis ? `${kpis.entregas_no_prazo} entregas` : 'Carregando...'}
          changeType="positive"
          icon={CheckCircle}
          description="No prazo"
        />
        <MetricCard
          title="Motoristas Ativos"
          value={`${kpis?.motoristas_ativos ?? 0}/${kpis?.total_motoristas ?? 0}`}
          change={kpis && kpis.cnh_vencendo > 0 ? `${kpis.cnh_vencendo} CNH vencendo` : 'Nenhum alerta'}
          changeType={kpis && kpis.cnh_vencendo > 0 ? 'negative' : 'positive'}
          icon={Users}
          description="CNH válidas"
        />
        <MetricCard
          title="Frota Ativa"
          value={`${kpis?.veiculos_ativos ?? 0}/${kpis?.total_veiculos ?? 0}`}
          change={kpis && kpis.veiculos_manutencao > 0 ? `${kpis.veiculos_manutencao} em manutenção` : 'Sem manutenções'}
          changeType={kpis && kpis.veiculos_manutencao > 0 ? 'negative' : 'positive'}
          icon={Truck}
          description="Veículos disponíveis"
        />
      </div>

      {/* Widgets dos Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status dos Módulos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Status dos Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['Pedidos', 'Rastreamento', 'Estoque', 'Frota', 'Financeiro', 'Compliance'] as const).map((modulo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-medium text-sm">{modulo}</p>
                      <p className="text-xs text-gray-600">Online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas Críticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis && kpis.estoque_critico > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Estoque Crítico</p>
                      <p className="text-xs text-gray-600">{kpis.estoque_critico} produtos zerados</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/estoque')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.estoque_baixo > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">Estoque Baixo</p>
                      <p className="text-xs text-gray-600">{kpis.estoque_baixo} produtos abaixo do mínimo</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/estoque')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.documentos_vencendo > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm">Documentos Vencendo</p>
                      <p className="text-xs text-gray-600">{kpis.documentos_vencendo} documentos em 30 dias</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/documentos')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.documentos_vencidos > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Documentos Vencidos</p>
                      <p className="text-xs text-gray-600">{kpis.documentos_vencidos} documentos vencidos</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/documentos')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.manutencoes_proximas > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Manutenções Próximas</p>
                      <p className="text-xs text-gray-600">{kpis.manutencoes_proximas} agendadas em 30 dias</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/manutencao')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.achados_criticos > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-sm">Achados Críticos</p>
                      <p className="text-xs text-gray-600">{kpis.achados_criticos} auditorias críticas</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/auditoria')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.contratos_vencendo > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-sm">Contratos Vencendo</p>
                      <p className="text-xs text-gray-600">{kpis.contratos_vencendo} contratos em 30 dias</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/contratos')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {kpis && kpis.cnh_vencendo > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">CNH Vencendo</p>
                      <p className="text-xs text-gray-600">{kpis.cnh_vencendo} motoristas em 30 dias</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => router.push('/dashboard/motoristas')}
                  >
                    Ver
                  </Button>
                </div>
              )}

              {!kpis && (
                <div className="text-center py-6 text-gray-500">
                  <p className="text-sm">Carregando alertas...</p>
                </div>
              )}

              {kpis && 
                kpis.estoque_critico === 0 && 
                kpis.estoque_baixo === 0 && 
                kpis.documentos_vencendo === 0 && 
                kpis.documentos_vencidos === 0 && 
                kpis.manutencoes_proximas === 0 && 
                kpis.achados_criticos === 0 && 
                kpis.contratos_vencendo === 0 && 
                kpis.cnh_vencendo === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">Nenhum alerta crítico!</p>
                  <p className="text-xs text-gray-600">Todos os indicadores estão normais</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Resumo de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Entregas no Prazo</span>
                  <span className="font-medium">{kpis ? `${kpis.taxa_entrega.toFixed(1)}%` : '—'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${kpis?.taxa_entrega ?? 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Score de Compliance</span>
                  <span className="font-medium">{kpis ? `${((kpis as any).score_compliance ?? 0).toFixed(1)}%` : '—'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(kpis as any)?.score_compliance ?? 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Frota Disponível</span>
                  <span className="font-medium">
                    {kpis && kpis.total_veiculos > 0
                      ? `${((kpis.veiculos_ativos / kpis.total_veiculos) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: kpis && kpis.total_veiculos > 0 ? `${(kpis.veiculos_ativos / kpis.total_veiculos) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Motoristas Disponíveis</span>
                  <span className="font-medium">
                    {kpis && kpis.total_motoristas > 0
                      ? `${((kpis.motoristas_ativos / kpis.total_motoristas) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full" 
                    style={{ width: kpis && kpis.total_motoristas > 0 ? `${(kpis.motoristas_ativos / kpis.total_motoristas) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>
            </div>

            {!kpis && (
              <div className="pt-3 border-t text-center text-gray-400 text-sm">
                Carregando indicadores...
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas dos Módulos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/pedidos')}
            >
              <Package className="w-6 h-6 mb-2" />
              <span className="text-sm">Novo Pedido</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/rastreamento')}
            >
              <MapPin className="w-6 h-6 mb-2" />
              <span className="text-sm">Rastreamento</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/relatorios')}
            >
              <FileText className="w-6 h-6 mb-2" />
              <span className="text-sm">Relatório Executivo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/motoristas')}
            >
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Gestão Motoristas</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/veiculos')}
            >
              <Truck className="w-6 h-6 mb-2" />
              <span className="text-sm">Status Frota</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/custos')}
            >
              <DollarSign className="w-6 h-6 mb-2" />
              <span className="text-sm">Análise Custos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/gamificacao')}
            >
              <Award className="w-6 h-6 mb-2" />
              <span className="text-sm">Gamificação</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => router.push('/dashboard/configuracoes')}
            >
              <Settings className="w-6 h-6 mb-2" />
              <span className="text-sm">Configurações</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Destaques e Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Destaques do Mês */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Destaques do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpis ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-green-800">Receita do Período</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {formatCurrency(kpis.receita_total)} em receita total no período selecionado.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Taxa de Entregas</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Taxa de entregas no prazo: {kpis.taxa_entrega.toFixed(1)}% ({kpis.entregas_no_prazo} entregas).
                  </p>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="font-medium text-purple-800">Frota e Equipe</span>
                  </div>
                  <p className="text-sm text-purple-700">
                    {kpis.motoristas_ativos}/{kpis.total_motoristas} motoristas ativos · {kpis.veiculos_ativos}/{kpis.total_veiculos} veículos disponíveis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <Award className="w-8 h-8 mb-2" />
                <p className="text-sm">Carregando destaques...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Próximas Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Alertas e Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis && kpis.estoque_critico > 0 && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Estoque Crítico</p>
                    <p className="text-xs text-gray-600">{kpis.estoque_critico} produtos precisam reposição</p>
                  </div>
                  <Badge variant="outline" className="text-red-600">Urgente</Badge>
                </div>
              )}
              {kpis && kpis.documentos_vencendo > 0 && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Documentos Vencendo</p>
                    <p className="text-xs text-gray-600">{kpis.documentos_vencendo} documentos em 30 dias</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-600">Médio</Badge>
                </div>
              )}
              {kpis && kpis.manutencoes_proximas > 0 && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Manutenções Próximas</p>
                    <p className="text-xs text-gray-600">{kpis.manutencoes_proximas} agendadas em 30 dias</p>
                  </div>
                  <Badge variant="outline" className="text-blue-600">Normal</Badge>
                </div>
              )}
              {kpis && kpis.cnh_vencendo > 0 && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">CNH Vencendo</p>
                    <p className="text-xs text-gray-600">{kpis.cnh_vencendo} motoristas em 30 dias</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600">Atenção</Badge>
                </div>
              )}
              {kpis && kpis.contratos_vencendo > 0 && (
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Contratos Vencendo</p>
                    <p className="text-xs text-gray-600">{kpis.contratos_vencendo} contratos em 30 dias</p>
                  </div>
                  <Badge variant="outline" className="text-purple-600">Atenção</Badge>
                </div>
              )}
              {!kpis && (
                <div className="text-center py-4 text-gray-400 text-sm">Carregando...</div>
              )}
              {kpis && kpis.estoque_critico === 0 && kpis.documentos_vencendo === 0 && kpis.manutencoes_proximas === 0 && kpis.cnh_vencendo === 0 && kpis.contratos_vencendo === 0 && (
                <div className="text-center py-6">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-700">Nenhuma ação pendente</p>
                  <p className="text-xs text-gray-500 mt-1">Todos os indicadores estão normais</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Consolidado */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-center text-slate-800">Resumo Executivo — {selectedPeriod}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{formatCurrency(kpis?.receita_total ?? 0)}</p>
              <p className="text-sm text-gray-600">Receita Total</p>
            </div>

            <div>
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{kpis ? `${kpis.taxa_entrega.toFixed(1)}%` : '—'}</p>
              <p className="text-sm text-gray-600">Taxa de Entregas</p>
              <p className="text-xs text-blue-600">{kpis ? `${kpis.entregas_no_prazo} no prazo` : ''}</p>
            </div>

            <div>
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{kpis ? `${kpis.motoristas_ativos}/${kpis.total_motoristas}` : '—'}</p>
              <p className="text-sm text-gray-600">Motoristas Ativos</p>
            </div>

            <div>
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{kpis ? `${kpis.margem_lucro.toFixed(1)}%` : '—'}</p>
              <p className="text-sm text-gray-600">Margem de Lucro</p>
              <p className="text-xs text-orange-600">{formatCurrency(kpis?.lucro_liquido ?? 0)}</p>
            </div>
          </div>

          {!kpis && (
            <div className="mt-6 text-center text-gray-400 text-sm py-4">
              Carregando resumo executivo...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
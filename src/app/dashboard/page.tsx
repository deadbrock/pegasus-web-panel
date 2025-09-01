'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

// Estado com fallback; será preenchido por dados reais
const dashboardDataDefault = {
  kpis_principais: {
    receita_total: 1247350,
    variacao_receita: 15.8,
    custo_total: 943125,
    variacao_custo: -8.2,
    lucro_liquido: 304225,
    margem_lucro: 24.4,
    roi: 32.3,
    variacao_roi: 4.7
  },
  operacional: {
    pedidos_ativos: 156,
    entregas_realizadas: 1247,
    taxa_sucesso: 96.8,
    tempo_medio_entrega: 2.3,
    distancia_total: 45280,
    eficiencia_combustivel: 8.2,
    variacao_pedidos: 12.5,
    variacao_entregas: 8.7,
    variacao_sucesso: 2.1
  },
  recursos: {
    total_motoristas: 27,
    motoristas_ativos: 24,
    performance_media: 89.2,
    total_veiculos: 25,
    veiculos_ativos: 22,
    ocupacao_frota: 88.0,
    variacao_performance: 6.3,
    variacao_ocupacao: 4.2
  },
  estoque: {
    total_produtos: 845,
    valor_estoque: 156780,
    alertas_criticos: 12,
    movimentacoes_mes: 234,
    giro_estoque: 4.2,
    variacao_giro: 8.5
  },
  financeiro: {
    custos_combustivel: 78450,
    custos_manutencao: 23650,
    custos_operacionais: 156890,
    economia_mes: 12340,
    variacao_economia: 18.7
  },
  compliance: {
    score_conformidade: 94.5,
    documentos_vencendo: 8,
    auditorias_pendentes: 3,
    nao_conformidades: 2,
    variacao_score: 2.8
  },
  gamificacao: {
    pontos_distribuidos: 12450,
    conquistas_obtidas: 187,
    motoristas_engajados: 21,
    taxa_engajamento: 87.5,
    variacao_engajamento: 12.3
  }
}
// Alias para manter compatibilidade com referências existentes
const dashboardData = dashboardDataDefault

// Dados para gráficos
const revenueEvolution = [
  { mes: 'Jan', receita: 1087000, custos: 834000, lucro: 253000 },
  { mes: 'Fev', receita: 1156000, custos: 882000, lucro: 274000 },
  { mes: 'Mar', receita: 1203000, custos: 901000, lucro: 302000 },
  { mes: 'Abr', receita: 1178000, custos: 923000, lucro: 255000 },
  { mes: 'Mai', receita: 1247350, custos: 943125, lucro: 304225 }
]

// Dados de centro de custos
const costCenterData = [
  { centro: 'Sede', valor: 125000, percentual: 28.5, variacao: -5.2 },
  { centro: 'Veículos', valor: 98000, percentual: 22.3, variacao: 8.1 },
  { centro: 'Filiais', valor: 85000, percentual: 19.4, variacao: 3.7 },
  { centro: 'Contratos', valor: 67000, percentual: 15.3, variacao: -2.1 },
  { centro: 'Diárias', valor: 35000, percentual: 8.0, variacao: 12.4 },
  { centro: 'Seguros', valor: 28000, percentual: 6.4, variacao: 0.8 }
]

// Dados de transações recentes (simulado para OFX)
const recentTransactions = [
  { 
    data: '2024-01-15', 
    descricao: 'COMBUSTÍVEL POSTO IPIRANGA', 
    valor: -2500.00, 
    centro: 'Veículos',
    status: 'alocado',
    banco: 'Caixa'
  },
  { 
    data: '2024-01-15', 
    descricao: 'PAGTO FORNECEDOR ABC LTDA', 
    valor: -15000.00, 
    centro: 'Contratos',
    status: 'alocado',
    banco: 'Caixa'
  },
  { 
    data: '2024-01-14', 
    descricao: 'RECEBIMENTO CLIENTE XYZ', 
    valor: 45000.00, 
    centro: '',
    status: 'pendente',
    banco: 'Caixa'
  },
  { 
    data: '2024-01-14', 
    descricao: 'ALUGUEL SEDE JANEIRO', 
    valor: -12000.00, 
    centro: 'Sede',
    status: 'alocado',
    banco: 'Caixa'
  }
]

const operationalMetrics = [
  { categoria: 'Entregas', valor: 96.8, meta: 95, cor: '#10b981' },
  { categoria: 'Qualidade', valor: 94.2, meta: 90, cor: '#3b82f6' },
  { categoria: 'Eficiência', valor: 89.2, meta: 85, cor: '#8b5cf6' },
  { categoria: 'Satisfação', valor: 91.8, meta: 88, cor: '#f59e0b' }
]

const moduleStatus = [
  { modulo: 'Pedidos', status: 'online', performance: 98.5, alertas: 0 },
  { modulo: 'Rastreamento', status: 'online', performance: 97.2, alertas: 1 },
  { modulo: 'Estoque', status: 'online', performance: 94.8, alertas: 12 },
  { modulo: 'Frota', status: 'online', performance: 96.1, alertas: 3 },
  { modulo: 'Financeiro', status: 'online', performance: 99.1, alertas: 0 },
  { modulo: 'Compliance', status: 'atencao', performance: 92.3, alertas: 5 }
]

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  useEffect(() => { fetchDashboardKPIs().then(setKpis) }, [])
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
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
              Visão consolidada da operação - Maio 2024
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Sistema Operacional</span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-4 h-4" />
                <span className="text-sm">Última atualização: há 2 min</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Calendar className="w-4 h-4 mr-2" />
              Período
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
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
          value={formatCurrency(kpis?.receita_total ?? dashboardDataDefault.kpis_principais.receita_total)}
          change={`+${dashboardData.kpis_principais.variacao_receita}%`}
          changeType="positive"
          icon={DollarSign}
          description="Este mês"
        />
        <MetricCard
          title="Custo Total"
          value={formatCurrency(kpis?.custo_total ?? dashboardDataDefault.kpis_principais.custo_total)}
          change={`${dashboardData.kpis_principais.variacao_custo}%`}
          changeType="positive"
          icon={TrendingDown}
          description="Redução"
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(kpis?.lucro_liquido ?? dashboardDataDefault.kpis_principais.lucro_liquido)}
          change={`${dashboardData.kpis_principais.margem_lucro}%`}
          changeType="positive"
          icon={Target}
          description="Margem"
        />
        <MetricCard
          title="ROI"
          value={`${dashboardDataDefault.kpis_principais.roi}%`}
          change={`+${dashboardData.kpis_principais.variacao_roi}%`}
          changeType="positive"
          icon={TrendingUp}
          description="Retorno"
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
                <AreaChart data={revenueEvolution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), '']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="receita" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Receita"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="custos" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Custos"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="lucro" 
                    stackId="3"
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.8}
                    name="Lucro"
                  />
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
                <BarChart data={operationalMetrics}>
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
            <div className="space-y-3">
              {costCenterData.map((centro, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{centro.centro}</span>
                      <span className="text-gray-600">{centro.percentual}%</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>{formatCurrency(centro.valor)}</span>
                      <span className={`flex items-center gap-1 ${getVariationColor(centro.variacao)}`}>
                        {getVariationIcon(centro.variacao)}
                        {Math.abs(centro.variacao)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${centro.percentual}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="space-y-3">
              {recentTransactions.map((transacao, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{transacao.descricao}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{transacao.data}</span>
                      <span>•</span>
                      <span>{transacao.banco}</span>
                      {transacao.centro && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs px-1">{transacao.centro}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${
                      transacao.valor > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(transacao.valor)}
                    </p>
                    <Badge 
                      variant={transacao.status === 'alocado' ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {transacao.status === 'alocado' ? 'Alocado' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <Button variant="outline" size="sm" className="w-full">
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
                <p className="text-lg font-bold text-green-700">R$ 245K</p>
                <p className="text-xs text-green-600">+12.5%</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600 font-medium">Saídas</p>
                <p className="text-lg font-bold text-red-700">R$ 189K</p>
                <p className="text-xs text-red-600">-8.2%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Saldo Atual</span>
                <span className="font-bold text-blue-600">R$ 156.780</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pendente Alocação</span>
                <span className="font-medium text-orange-600">3 transações</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Próx. Vencimento</span>
                <span className="font-medium text-gray-600">5 dias</span>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button size="sm" className="w-full">
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
          value={(kpis?.pedidos_ativos ?? dashboardDataDefault.operacional.pedidos_ativos).toString()}
          change={`+${dashboardData.operacional.variacao_pedidos}%`}
          changeType="positive"
          icon={Package}
          description="Em andamento"
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${dashboardDataDefault.operacional.taxa_sucesso}%`}
          change={`+${dashboardData.operacional.variacao_sucesso}%`}
          changeType="positive"
          icon={CheckCircle}
          description="Entregas"
        />
        <MetricCard
          title="Motoristas Ativos"
          value={`${dashboardDataDefault.recursos.motoristas_ativos}/${dashboardDataDefault.recursos.total_motoristas}`}
          change={`${dashboardData.recursos.performance_media}%`}
          changeType="positive"
          icon={Users}
          description="Performance"
        />
        <MetricCard
          title="Ocupação Frota"
          value={`${dashboardDataDefault.recursos.ocupacao_frota}%`}
          change={`+${dashboardData.recursos.variacao_ocupacao}%`}
          changeType="positive"
          icon={Truck}
          description="Utilização"
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
              {moduleStatus.map((module, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(module.status)}`}></div>
                    <div>
                      <p className="font-medium text-sm">{module.modulo}</p>
                      <p className="text-xs text-gray-600">{module.performance}% uptime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(module.status)}
                    {module.alertas > 0 && (
                      <Badge variant="outline" className="text-orange-600">
                        {module.alertas} alertas
                      </Badge>
                    )}
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
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Estoque Crítico</p>
                    <p className="text-xs text-gray-600">12 produtos abaixo do mínimo</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">Documentos Vencendo</p>
                    <p className="text-xs text-gray-600">8 documentos em 7 dias</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm">Manutenção Vencida</p>
                    <p className="text-xs text-gray-600">3 veículos atrasados</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Auditorias Pendentes</p>
                    <p className="text-xs text-gray-600">3 auditorias em atraso</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>
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
                  <span className="font-medium">96.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-[97%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Score de Compliance</span>
                  <span className="font-medium">94.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-[95%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Eficiência da Frota</span>
                  <span className="font-medium">89.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full w-[89%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Engajamento (Gamificação)</span>
                  <span className="font-medium">87.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full w-[88%]"></div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">A+</p>
                <p className="text-sm text-gray-600">Score Geral</p>
              </div>
            </div>
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
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Package className="w-6 h-6 mb-2" />
              <span className="text-sm">Novo Pedido</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <MapPin className="w-6 h-6 mb-2" />
              <span className="text-sm">Rastreamento</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <FileText className="w-6 h-6 mb-2" />
              <span className="text-sm">Relatório Executivo</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Users className="w-6 h-6 mb-2" />
              <span className="text-sm">Gestão Motoristas</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Truck className="w-6 h-6 mb-2" />
              <span className="text-sm">Status Frota</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <DollarSign className="w-6 h-6 mb-2" />
              <span className="text-sm">Análise Custos</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Award className="w-6 h-6 mb-2" />
              <span className="text-sm">Gamificação</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
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
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">Receita Record</span>
                </div>
                <p className="text-sm text-green-700">
                  Alcançamos R$ 1.247.350 em receita, um aumento de 15.8% comparado ao mês anterior.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Meta de Entregas</span>
                </div>
                <p className="text-sm text-blue-700">
                  Taxa de entregas no prazo atingiu 96.8%, superando a meta de 95%.
                </p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-800">Gamificação Impacto</span>
                </div>
                <p className="text-sm text-purple-700">
                  Sistema de gamificação elevou o engajamento para 87.5% (+12.3%).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Próximas Ações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximas Ações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Resolver Estoque Crítico</p>
                  <p className="text-xs text-gray-600">Hoje - 12 produtos precisam reposição</p>
                </div>
                <Badge variant="outline" className="text-red-600">Urgente</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Revisar Documentos</p>
                  <p className="text-xs text-gray-600">Esta semana - 8 documentos vencendo</p>
                </div>
                <Badge variant="outline" className="text-yellow-600">Médio</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Auditoria Mensal</p>
                  <p className="text-xs text-gray-600">Próxima semana - Compliance geral</p>
                </div>
                <Badge variant="outline" className="text-blue-600">Normal</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Relatório Executivo</p>
                  <p className="text-xs text-gray-600">Fim do mês - Dashboard consolidado</p>
                </div>
                <Badge variant="outline" className="text-green-600">Baixo</Badge>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Expansão Gamificação</p>
                  <p className="text-xs text-gray-600">Próximo mês - Novas conquistas</p>
                </div>
                <Badge variant="outline" className="text-purple-600">Futuro</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Consolidado */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
        <CardHeader>
          <CardTitle className="text-center text-slate-800">Resumo Executivo - Maio 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">R$ 1.24M</p>
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-xs text-green-600">+15.8% vs abril</p>
            </div>

            <div>
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">96.8%</p>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <p className="text-xs text-blue-600">Meta: 95%</p>
            </div>

            <div>
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">89.2%</p>
              <p className="text-sm text-gray-600">Performance Equipe</p>
              <p className="text-xs text-purple-600">24 de 27 ativos</p>
            </div>

            <div>
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">32.3%</p>
              <p className="text-sm text-gray-600">ROI</p>
              <p className="text-xs text-orange-600">+4.7% vs abril</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 text-center">Principais Conquistas:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
              <div>• Receita record de R$ 1.247.350 (+15.8%)</div>
              <div>• Taxa de entregas no prazo: 96.8%</div>
              <div>• Redução de custos operacionais: 8.2%</div>
              <div>• ROI de 32.3% com crescimento sustentável</div>
              <div>• Sistema de gamificação aumentou engajamento em 12.3%</div>
              <div>• Score de compliance mantido em 94.5%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Truck,
  Package,
  Shield,
  Calendar,
  Download,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts'

// Mock data para dashboard executivo
const dashboardData = {
  kpis_principais: {
    receita_mensal: {
      valor: 245750,
      variacao: 12.3,
      meta: 220000,
      tendencia: 'positiva'
    },
    custo_operacional: {
      valor: 186420,
      variacao: -8.5,
      meta: 200000,
      tendencia: 'positiva'
    },
    margem_lucro: {
      valor: 24.1,
      variacao: 3.2,
      meta: 22,
      tendencia: 'positiva'
    },
    roi: {
      valor: 18.7,
      variacao: 2.8,
      meta: 15,
      tendencia: 'positiva'
    }
  },
  performance_operacional: {
    entregas_realizadas: 1247,
    entregas_no_prazo: 96.2,
    distancia_percorrida: 28450,
    eficiencia_combustivel: 7.8,
    variacao_entregas: 8.5,
    variacao_prazo: 2.1,
    variacao_distancia: 5.2,
    variacao_combustivel: -12.3
  },
  recursos_humanos: {
    total_motoristas: 27,
    motoristas_ativos: 24,
    performance_media: 87.3,
    pontos_gamificacao: 12450,
    conquistas_mes: 23,
    variacao_performance: 4.8,
    variacao_gamificacao: 15.2
  },
  frota_status: {
    veiculos_ativos: 22,
    veiculos_manutencao: 3,
    ocupacao_frota: 89.5,
    km_mes: 45280,
    custo_manutencao: 8750,
    variacao_ocupacao: 3.4,
    variacao_km: 7.2
  },
  alertas_criticos: [
    { tipo: 'Manutenção', descricao: '3 veículos com manutenção vencida', nivel: 'alto', icone: 'truck' },
    { tipo: 'Estoque', descricao: '5 produtos com estoque crítico', nivel: 'medio', icone: 'package' },
    { tipo: 'Compliance', descricao: '2 documentos vencendo em 7 dias', nivel: 'medio', icone: 'shield' },
    { tipo: 'Performance', descricao: '1 motorista abaixo da meta', nivel: 'baixo', icone: 'user' }
  ]
}

// Dados para gráficos
const revenueData = [
  { mes: 'Jan', receita: 198000, custo: 152000 },
  { mes: 'Fev', receita: 215000, custo: 163000 },
  { mes: 'Mar', receita: 232000, custo: 171000 },
  { mes: 'Abr', receita: 228000, custo: 168000 },
  { mes: 'Mai', receita: 245750, custo: 186420 }
]

const performanceData = [
  { categoria: 'Entregas', valor: 96.2, meta: 95 },
  { categoria: 'Pontualidade', valor: 94.8, meta: 90 },
  { categoria: 'Eficiência', valor: 87.3, meta: 85 },
  { categoria: 'Satisfação', valor: 91.5, meta: 88 }
]

const distributionData = [
  { name: 'Operacional', value: 45, color: '#3b82f6' },
  { name: 'Combustível', value: 28, color: '#ef4444' },
  { name: 'Manutenção', value: 15, color: '#f59e0b' },
  { name: 'Outros', value: 12, color: '#10b981' }
]

export function ExecutiveDashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value)
  }

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />
  }

  const getAlertColor = (nivel: string) => {
    switch (nivel) {
      case 'alto': return 'bg-red-100 text-red-800 border-red-200'
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baixo': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertIcon = (icone: string) => {
    switch (icone) {
      case 'truck': return <Truck className="w-4 h-4" />
      case 'package': return <Package className="w-4 h-4" />
      case 'shield': return <Shield className="w-4 h-4" />
      case 'user': return <Users className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Executivo</h2>
          <p className="text-gray-600">Visão consolidada dos principais indicadores da operação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Maio 2024
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.kpis_principais.receita_mensal.valor)}
                </p>
                <div className={`flex items-center mt-1 text-sm ${getVariationColor(dashboardData.kpis_principais.receita_mensal.variacao)}`}>
                  {getVariationIcon(dashboardData.kpis_principais.receita_mensal.variacao)}
                  <span className="ml-1">+{dashboardData.kpis_principais.receita_mensal.variacao}%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Meta: {formatCurrency(dashboardData.kpis_principais.receita_mensal.meta)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Custo Operacional</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.kpis_principais.custo_operacional.valor)}
                </p>
                <div className={`flex items-center mt-1 text-sm ${getVariationColor(dashboardData.kpis_principais.custo_operacional.variacao)}`}>
                  {getVariationIcon(dashboardData.kpis_principais.custo_operacional.variacao)}
                  <span className="ml-1">{dashboardData.kpis_principais.custo_operacional.variacao}%</span>
                </div>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Meta: {formatCurrency(dashboardData.kpis_principais.custo_operacional.meta)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Margem de Lucro</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.kpis_principais.margem_lucro.valor}%
                </p>
                <div className={`flex items-center mt-1 text-sm ${getVariationColor(dashboardData.kpis_principais.margem_lucro.variacao)}`}>
                  {getVariationIcon(dashboardData.kpis_principais.margem_lucro.variacao)}
                  <span className="ml-1">+{dashboardData.kpis_principais.margem_lucro.variacao}%</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Meta: {dashboardData.kpis_principais.margem_lucro.meta}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.kpis_principais.roi.valor}%
                </p>
                <div className={`flex items-center mt-1 text-sm ${getVariationColor(dashboardData.kpis_principais.roi.variacao)}`}>
                  {getVariationIcon(dashboardData.kpis_principais.roi.variacao)}
                  <span className="ml-1">+{dashboardData.kpis_principais.roi.variacao}%</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-3 text-xs text-gray-600">
              Meta: {dashboardData.kpis_principais.roi.meta}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Financeira */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira (5 meses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
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
                    dataKey="custo" 
                    stackId="2"
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.6}
                    name="Custo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance vs Meta */}
        <Card>
          <CardHeader>
            <CardTitle>Performance vs Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                  <Bar dataKey="valor" fill="#3b82f6" name="Atual" />
                  <Bar dataKey="meta" fill="#94a3b8" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Métricas Operacionais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Operacional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Performance Operacional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Entregas Realizadas</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.performance_operacional.entregas_realizadas}</span>
                <div className={`text-xs ${getVariationColor(dashboardData.performance_operacional.variacao_entregas)}`}>
                  +{dashboardData.performance_operacional.variacao_entregas}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Entregas no Prazo</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.performance_operacional.entregas_no_prazo}%</span>
                <div className={`text-xs ${getVariationColor(dashboardData.performance_operacional.variacao_prazo)}`}>
                  +{dashboardData.performance_operacional.variacao_prazo}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Distância Percorrida</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.performance_operacional.distancia_percorrida.toLocaleString()} km</span>
                <div className={`text-xs ${getVariationColor(dashboardData.performance_operacional.variacao_distancia)}`}>
                  +{dashboardData.performance_operacional.variacao_distancia}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Eficiência Combustível</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.performance_operacional.eficiencia_combustivel} km/l</span>
                <div className={`text-xs ${getVariationColor(dashboardData.performance_operacional.variacao_combustivel)}`}>
                  {dashboardData.performance_operacional.variacao_combustivel}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos Humanos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recursos Humanos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Motoristas Ativos</span>
              <span className="font-semibold">
                {dashboardData.recursos_humanos.motoristas_ativos}/{dashboardData.recursos_humanos.total_motoristas}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Performance Média</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.recursos_humanos.performance_media}%</span>
                <div className={`text-xs ${getVariationColor(dashboardData.recursos_humanos.variacao_performance)}`}>
                  +{dashboardData.recursos_humanos.variacao_performance}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pontos Gamificação</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.recursos_humanos.pontos_gamificacao.toLocaleString()}</span>
                <div className={`text-xs ${getVariationColor(dashboardData.recursos_humanos.variacao_gamificacao)}`}>
                  +{dashboardData.recursos_humanos.variacao_gamificacao}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conquistas este Mês</span>
              <span className="font-semibold">{dashboardData.recursos_humanos.conquistas_mes}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status da Frota */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Status da Frota
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Veículos Ativos</span>
              <span className="font-semibold">
                {dashboardData.frota_status.veiculos_ativos}/{dashboardData.frota_status.veiculos_ativos + dashboardData.frota_status.veiculos_manutencao}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ocupação da Frota</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.frota_status.ocupacao_frota}%</span>
                <div className={`text-xs ${getVariationColor(dashboardData.frota_status.variacao_ocupacao)}`}>
                  +{dashboardData.frota_status.variacao_ocupacao}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">KM Rodados</span>
              <div className="text-right">
                <span className="font-semibold">{dashboardData.frota_status.km_mes.toLocaleString()} km</span>
                <div className={`text-xs ${getVariationColor(dashboardData.frota_status.variacao_km)}`}>
                  +{dashboardData.frota_status.variacao_km}%
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Custo Manutenção</span>
              <span className="font-semibold">{formatCurrency(dashboardData.frota_status.custo_manutencao)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos e Distribuição de Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Críticos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Alertas Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.alertas_criticos.map((alerta, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAlertColor(alerta.nivel)}`}>
                    {getAlertIcon(alerta.icone)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{alerta.tipo}</span>
                      <Badge variant="outline" className={getAlertColor(alerta.nivel)}>
                        {alerta.nivel}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{alerta.descricao}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Resolver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição de Custos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip 
                    formatter={(value: any) => [`${value}%`, '']}
                  />
                  <RechartsPieChart data={distributionData}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {distributionData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo - Maio 2024</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">96.2%</p>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
            </div>

            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">87.3%</p>
              <p className="text-sm text-gray-600">Performance Média</p>
            </div>

            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">+12.3%</p>
              <p className="text-sm text-gray-600">Crescimento Receita</p>
            </div>

            <div className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">18.7%</p>
              <p className="text-sm text-gray-600">ROI Atual</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Destaques do Mês:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Receita superou meta em 11.7% (R$ 245.750 vs R$ 220.000)</li>
              <li>• Custos operacionais reduziram em 8.5% comparado ao mês anterior</li>
              <li>• Taxa de entregas no prazo atingiu 96.2%, melhor resultado do ano</li>
              <li>• Sistema de gamificação aumentou performance dos motoristas em 15.2%</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
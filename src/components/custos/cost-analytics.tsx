'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Calculator, Target, AlertTriangle, CheckCircle } from 'lucide-react'

// Mock data para analytics avançadas
const budgetAnalysis = [
  { categoria: 'Combustível', orcado: 30000, realizado: 29432, percentual: 98.1 },
  { categoria: 'Manutenção', orcado: 15000, realizado: 12850, percentual: 85.7 },
  { categoria: 'Pedágio', orcado: 2500, realizado: 2180, percentual: 87.2 },
  { categoria: 'Seguro', orcado: 4000, realizado: 3750, percentual: 93.8 },
  { categoria: 'Outros', orcado: 3000, realizado: 1788, percentual: 59.6 }
]

const costTrends = [
  { periodo: 'Jul', variacao: -2.3, tendencia: 'down' },
  { periodo: 'Ago', variacao: 8.5, tendencia: 'up' },
  { periodo: 'Set', variacao: -5.8, tendencia: 'down' },
  { periodo: 'Out', variacao: 16.5, tendencia: 'up' },
  { periodo: 'Nov', variacao: -5.0, tendencia: 'down' },
  { periodo: 'Dez', variacao: 13.2, tendencia: 'up' }
]

const efficiencyMetrics = [
  { mes: 'Jul', eficiencia: 92.3, economia: 1250 },
  { mes: 'Ago', eficiencia: 88.7, economia: -980 },
  { mes: 'Set', eficiencia: 94.1, economia: 2100 },
  { mes: 'Out', eficiencia: 86.2, economia: -1850 },
  { mes: 'Nov', eficiencia: 91.8, economia: 1450 },
  { mes: 'Dez', eficiencia: 85.9, economia: -2200 }
]

export function CostAnalytics() {
  const totalBudget = budgetAnalysis.reduce((sum, item) => sum + item.orcado, 0)
  const totalSpent = budgetAnalysis.reduce((sum, item) => sum + item.realizado, 0)
  const totalSavings = totalBudget - totalSpent

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Economia vs Orçamento</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalSavings.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((totalSavings / totalBudget) * 100).toFixed(1)}% do orçado
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Variação Mensal</p>
                <p className="text-2xl font-bold text-orange-600">+13.2%</p>
                <p className="text-xs text-gray-500 mt-1">vs mês anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiência Média</p>
                <p className="text-2xl font-bold text-blue-600">89.8%</p>
                <p className="text-xs text-gray-500 mt-1">Últimos 6 meses</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Operacional</p>
                <p className="text-2xl font-bold text-purple-600">15.8%</p>
                <p className="text-xs text-gray-500 mt-1">Retorno investimento</p>
              </div>
              <Calculator className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise Orçamentária */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Controle Orçamentário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetAnalysis.map((item) => (
                <div key={item.categoria} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.categoria}</span>
                    <div className="text-right">
                      <span className="text-sm">
                        R$ {item.realizado.toLocaleString('pt-BR')} / R$ {item.orcado.toLocaleString('pt-BR')}
                      </span>
                      <div className={`text-xs ${item.percentual > 100 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.percentual.toFixed(1)}% do orçado
                      </div>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(item.percentual, 100)} 
                    className={`h-2 ${item.percentual > 100 ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendências de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Variação']}
                  />
                  <Bar 
                    dataKey="variacao" 
                    fill={(entry: any) => entry > 0 ? '#ef4444' : '#10b981'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eficiência e Economia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eficiência Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[80, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Eficiência']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eficiencia" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Economia Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyMetrics}>
                  <defs>
                    <linearGradient id="colorEconomia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Economia']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="economia" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorEconomia)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas Financeiros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Combustível acima da meta</p>
                  <p className="text-sm text-red-600">+15% vs orçamento mensal</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Custos de manutenção crescendo</p>
                  <p className="text-sm text-yellow-600">+25% vs mês anterior</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Economia em pedágios</p>
                  <p className="text-sm text-green-600">-12% através de rotas otimizadas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recomendações de Otimização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">🚛 Otimização de Combustível</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Implementar sistema de monitoramento de consumo em tempo real
                </p>
                <div className="text-sm">
                  <span className="text-green-600">Economia potencial: R$ 2.500/mês</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">🔧 Manutenção Preventiva</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Expandir programa de manutenção preventiva
                </p>
                <div className="text-sm">
                  <span className="text-green-600">Redução de custos: 30%</span>
                </div>
              </div>

              <div className="p-3 border rounded-lg">
                <h4 className="font-medium mb-2">📍 Planejamento de Rotas</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Usar IA para otimização automática de rotas
                </p>
                <div className="text-sm">
                  <span className="text-green-600">Economia: R$ 1.200/mês</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Executivo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-2">📊 Performance Atual</h4>
              <p className="text-sm text-gray-600">
                Custos operacionais dentro do orçamento com economia de R$ {totalSavings.toLocaleString('pt-BR')} 
                ({((totalSavings / totalBudget) * 100).toFixed(1)}% do orçado)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">🎯 Principais Desafios</h4>
              <p className="text-sm text-gray-600">
                Aumento de 13.2% nos custos de combustível e variabilidade alta 
                na eficiência operacional (85.9% - 94.1%)
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">💡 Oportunidades</h4>
              <p className="text-sm text-gray-600">
                Potencial de economia de R$ 3.700/mês através de otimização 
                de combustível, manutenção preventiva e rotas inteligentes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
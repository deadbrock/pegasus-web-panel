'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Clock, Route, Fuel, AlertTriangle, CheckCircle } from 'lucide-react'

interface TrackingMetricsProps {
  compact?: boolean
}

// Mock data para métricas
const efficiencyData = [
  { mes: 'Jul', eficiencia: 85, kmTotal: 12450 },
  { mes: 'Ago', eficiencia: 88, kmTotal: 13200 },
  { mes: 'Set', eficiencia: 82, kmTotal: 11800 },
  { mes: 'Out', eficiencia: 91, kmTotal: 14600 },
  { mes: 'Nov', eficiencia: 89, kmTotal: 13900 },
  { mes: 'Dez', eficiencia: 94, kmTotal: 15200 }
]

const fuelConsumptionData = [
  { veiculo: 'BRA-2023', consumo: 8.5, meta: 9.0 },
  { veiculo: 'BRA-2024', consumo: 7.8, meta: 8.5 },
  { veiculo: 'BRA-2025', consumo: 9.2, meta: 9.0 },
  { veiculo: 'BRA-2026', consumo: 8.1, meta: 8.5 },
  { veiculo: 'BRA-2027', consumo: 7.9, meta: 8.0 }
]

const routeStatusData = [
  { name: 'No Prazo', value: 78, color: '#10b981' },
  { name: 'Atrasadas', value: 15, color: '#f59e0b' },
  { name: 'Canceladas', value: 7, color: '#ef4444' }
]

export function TrackingMetrics({ compact = false }: TrackingMetricsProps) {
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Eficiência da Frota */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Eficiência da Frota</span>
            <span className="font-medium">94%</span>
          </div>
          <Progress value={94} className="h-2" />
        </div>

        {/* Consumo Médio */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Consumo Médio</span>
            <span className="font-medium">8.3 km/L</span>
          </div>
          <Progress value={83} className="h-2" />
        </div>

        {/* Rotas no Prazo */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Rotas no Prazo</span>
            <span className="font-medium">78%</span>
          </div>
          <Progress value={78} className="h-2" />
        </div>

        {/* Veículos Online */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Veículos Online</span>
            <span className="font-medium">18/20</span>
          </div>
          <Progress value={90} className="h-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Eficiência Operacional</p>
                <p className="text-2xl font-bold text-green-600">94%</p>
                <p className="text-xs text-gray-500 mt-1">+5% vs mês anterior</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tempo Médio de Rota</p>
                <p className="text-2xl font-bold text-blue-600">2h 15min</p>
                <p className="text-xs text-gray-500 mt-1">-8min vs média</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">KM Percorridos Hoje</p>
                <p className="text-2xl font-bold text-purple-600">1,245</p>
                <p className="text-xs text-gray-500 mt-1">Meta: 1,200 km</p>
              </div>
              <Route className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Consumo Médio</p>
                <p className="text-2xl font-bold text-orange-600">8.3 km/L</p>
                <p className="text-xs text-gray-500 mt-1">Meta: 8.0 km/L</p>
              </div>
              <Fuel className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eficiência ao Longo do Tempo */}
        <Card>
          <CardHeader>
            <CardTitle>Eficiência da Frota - Últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'eficiencia') return [`${value}%`, 'Eficiência']
                      return [`${value.toLocaleString()} km`, 'KM Total']
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="eficiencia" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Consumo de Combustível por Veículo */}
        <Card>
          <CardHeader>
            <CardTitle>Consumo de Combustível por Veículo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelConsumptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="veiculo" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} km/L`, 
                      name === 'consumo' ? 'Atual' : 'Meta'
                    ]}
                  />
                  <Bar dataKey="meta" fill="#e5e7eb" name="Meta" />
                  <Bar dataKey="consumo" fill="#3b82f6" name="Atual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status das Rotas */}
        <Card>
          <CardHeader>
            <CardTitle>Performance de Entregas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={routeStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {routeStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Percentual']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Qualidade */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Pontualidade */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Pontualidade</span>
                  <span className="font-medium">89%</span>
                </div>
                <Progress value={89} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Meta: 85%</span>
                  <span className="text-green-600">+4% acima da meta</span>
                </div>
              </div>

              {/* Segurança */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Segurança</span>
                  <span className="font-medium">96%</span>
                </div>
                <Progress value={96} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Meta: 95%</span>
                  <span className="text-green-600">+1% acima da meta</span>
                </div>
              </div>

              {/* Manutenções em Dia */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Manutenções em Dia</span>
                  <span className="font-medium">82%</span>
                </div>
                <Progress value={82} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Meta: 90%</span>
                  <span className="text-orange-600">-8% abaixo da meta</span>
                </div>
              </div>

              {/* Disponibilidade */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Disponibilidade da Frota</span>
                  <span className="font-medium">91%</span>
                </div>
                <Progress value={91} className="h-3" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Meta: 88%</span>
                  <span className="text-green-600">+3% acima da meta</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Meta de eficiência atingida</p>
                <p className="text-sm text-green-600">Frota operando 4% acima da meta mensal</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">3 veículos com manutenção pendente</p>
                <p className="text-sm text-yellow-600">Agendar manutenções para evitar problemas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Consumo de combustível otimizado</p>
                <p className="text-sm text-blue-600">Economia de 8% comparado ao mês anterior</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
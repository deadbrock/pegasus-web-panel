'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

// Mock data para KPIs
const kpiData = [
  { name: 'Jan', custoPorKm: 4.25, meta: 4.50, entregasNoPrazo: 92, metaEntregas: 95, ocupacaoFrota: 85, metaOcupacao: 85 },
  { name: 'Fev', custoPorKm: 4.35, meta: 4.50, entregasNoPrazo: 89, metaEntregas: 95, ocupacaoFrota: 88, metaOcupacao: 85 },
  { name: 'Mar', custoPorKm: 4.15, meta: 4.50, entregasNoPrazo: 94, metaEntregas: 95, ocupacaoFrota: 87, metaOcupacao: 85 },
  { name: 'Abr', custoPorKm: 4.20, meta: 4.50, entregasNoPrazo: 96, metaEntregas: 95, ocupacaoFrota: 89, metaOcupacao: 85 },
  { name: 'Mai', custoPorKm: 4.10, meta: 4.50, entregasNoPrazo: 93, metaEntregas: 95, ocupacaoFrota: 91, metaOcupacao: 85 },
  { name: 'Jun', custoPorKm: 4.35, meta: 4.50, entregasNoPrazo: 94, metaEntregas: 95, ocupacaoFrota: 89, metaOcupacao: 85 }
]

export function KPIChartsPanel() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey.includes('Prazo') || entry.dataKey.includes('Ocupacao') ? '%' : ''}
              {entry.dataKey.includes('custo') ? ' R$' : ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Custo por KM */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Custo por KM (Real vs. Meta)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="custoPorKm" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Real"
              />
              <Line 
                type="monotone" 
                dataKey="meta" 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                name="Meta"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-600 font-medium">3% abaixo da meta</span>
          <span className="text-gray-500">R$ 4.35 atual</span>
        </div>
      </div>

      {/* Entregas no Prazo (OTIF) */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Entregas no Prazo (OTIF %)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[80, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="entregasNoPrazo" fill="#10b981" name="Real" />
              <Bar dataKey="metaEntregas" fill="#ef4444" opacity={0.3} name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-orange-600 font-medium">0.8% abaixo da meta</span>
          <span className="text-gray-500">94.2% atual</span>
        </div>
      </div>

      {/* Ocupação da Frota */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Ocupação da Frota (%)</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} domain={[75, 95]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ocupacaoFrota" fill="#8b5cf6" name="Real" />
              <Bar dataKey="metaOcupacao" fill="#ef4444" opacity={0.3} name="Meta" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-green-600 font-medium">3.7% acima da meta</span>
          <span className="text-gray-500">88.7% atual</span>
        </div>
      </div>
    </div>
  )
}
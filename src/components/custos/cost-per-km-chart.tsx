'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts'
import { Calculator } from 'lucide-react'

interface CostPerKmChartProps {
  data?: Array<{ mes: string; custoKm: number; meta?: number; kmTotal?: number; custoTotal?: number; eficiencia?: number }>
}

export function CostPerKmChart({ data }: CostPerKmChartProps) {
  const costPerKmData = data ?? []

  if (costPerKmData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <Calculator className="w-10 h-10 mb-2" />
        <p className="text-sm">Sem dados de custo por KM</p>
        <p className="text-xs mt-1">Registre viagens e custos para calcular</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d = costPerKmData.find((item: any) => item.mes === label)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Custo/KM: R$ {d?.custoKm.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Meta: R$ {d?.meta?.toFixed(2) ?? '—'}
          </p>
          <p className="text-sm text-gray-600">
            KM Total: {d?.kmTotal?.toLocaleString('pt-BR') ?? '—'}
          </p>
          <p className="text-sm text-gray-600">
            Custo Total: R$ {d?.custoTotal?.toLocaleString('pt-BR') ?? '—'}
          </p>
          <p className={`text-sm ${d && d.eficiencia && d.eficiencia > 100 ? 'text-red-600' : 'text-green-600'}`}>
            Eficiência: {d?.eficiencia?.toFixed(1) ?? '—'}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={costPerKmData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis 
            yAxisId="left"
            domain={[3.5, 5.5]}
            tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            domain={[8000, 11000]}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k km`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Linha de meta */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="meta" 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Meta"
          />
          
          {/* Custo por KM real */}
          <Bar 
            yAxisId="left"
            dataKey="custoKm" 
            fill="#3b82f6" 
            name="Custo/KM"
            radius={[4, 4, 0, 0]}
          />
          
          {/* KM total como linha */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="kmTotal" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="KM Total"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface CostEvolutionChartProps {
  data?: Array<{ mes: string; total: number; combustivel?: number; manutencao?: number; outros?: number }>
}

export function CostEvolutionChart({ data }: CostEvolutionChartProps) {
  const evolutionData = data ?? []

  if (evolutionData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400">
        <TrendingUp className="w-10 h-10 mb-2" />
        <p className="text-sm">Sem dados de evolução</p>
        <p className="text-xs mt-1">Cadastre custos para visualizar o histórico</p>
      </div>
    )
  }
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: R$ {entry.value.toLocaleString('pt-BR')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={evolutionData}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorCombustivel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorManutencao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
          <Tooltip content={<CustomTooltip />} />
          
          <Area 
            type="monotone" 
            dataKey="total" 
            stackId="1"
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorTotal)"
            name="Total"
          />
          <Area 
            type="monotone" 
            dataKey="combustivel" 
            stackId="2"
            stroke="#f97316" 
            fillOpacity={1} 
            fill="url(#colorCombustivel)"
            name="Combustível"
          />
          <Area 
            type="monotone" 
            dataKey="manutencao" 
            stackId="3"
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorManutencao)"
            name="Manutenção"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

interface TimelineData {
  dia: string
  pedidos: number
  entregues: number
  cancelados: number
}

interface OrderTimelineChartProps {
  data?: TimelineData[]
}

export function OrderTimelineChart({ data }: OrderTimelineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum dado disponível</p>
          <p className="text-sm mt-2">Os dados aparecerão aqui quando houver pedidos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="dia" 
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                'pedidos': 'Total de Pedidos',
                'entregues': 'Pedidos Entregues',
                'cancelados': 'Pedidos Cancelados'
              }
              return [value, labels[name] || name]
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="pedidos" 
            stackId="1"
            stroke="#3b82f6" 
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="entregues" 
            stackId="2"
            stroke="#10b981" 
            fill="#10b981"
            fillOpacity={0.6}
          />
          <Line 
            type="monotone" 
            dataKey="cancelados" 
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
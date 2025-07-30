'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const data = [
  { dia: '01/01', pedidos: 12, entregues: 10, cancelados: 1 },
  { dia: '02/01', pedidos: 15, entregues: 14, cancelados: 0 },
  { dia: '03/01', pedidos: 8, entregues: 8, cancelados: 0 },
  { dia: '04/01', pedidos: 18, entregues: 16, cancelados: 2 },
  { dia: '05/01', pedidos: 22, entregues: 20, cancelados: 1 },
  { dia: '06/01', pedidos: 25, entregues: 23, cancelados: 1 },
  { dia: '07/01', pedidos: 14, entregues: 13, cancelados: 0 },
  { dia: '08/01', pedidos: 16, entregues: 15, cancelados: 1 },
  { dia: '09/01', pedidos: 19, entregues: 18, cancelados: 0 },
  { dia: '10/01', pedidos: 21, entregues: 19, cancelados: 1 },
  { dia: '11/01', pedidos: 17, entregues: 16, cancelados: 0 },
  { dia: '12/01', pedidos: 23, entregues: 21, cancelados: 1 },
  { dia: '13/01', pedidos: 26, entregues: 24, cancelados: 2 },
  { dia: '14/01', pedidos: 20, entregues: 19, cancelados: 0 },
  { dia: '15/01', pedidos: 24, entregues: 22, cancelados: 1 }
]

export function OrderTimelineChart() {
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
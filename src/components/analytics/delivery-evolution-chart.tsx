'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useEffect, useState } from 'react'
import { getDeliveryEvolution } from '@/lib/services/analytics-service'

export function DeliveryEvolutionChart() {
  const [data, setData] = useState<any[]>([])
  useEffect(() => {
    getDeliveryEvolution(30).then(setData)
  }, [])
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id="colorEntregas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorConcluidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="data" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey="entregas"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorEntregas)"
            name="Total de Entregas"
          />
          <Area
            type="monotone"
            dataKey="concluidas"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorConcluidas)"
            name="Entregas Concluídas"
          />
          <Line
            type="monotone"
            dataKey="meta"
            stroke="#ef4444"
            strokeDasharray="5 5"
            strokeWidth={2}
            name="Meta Diária"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
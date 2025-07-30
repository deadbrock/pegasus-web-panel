'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

// Mock data - substituir por dados do Supabase
const data = [
  {
    data: '01/07',
    entregas: 65,
    meta: 70,
    concluidas: 62
  },
  {
    data: '02/07',
    entregas: 72,
    meta: 70,
    concluidas: 68
  },
  {
    data: '03/07',
    entregas: 68,
    meta: 70,
    concluidas: 65
  },
  {
    data: '04/07',
    entregas: 85,
    meta: 70,
    concluidas: 82
  },
  {
    data: '05/07',
    entregas: 78,
    meta: 70,
    concluidas: 75
  },
  {
    data: '06/07',
    entregas: 92,
    meta: 70,
    concluidas: 89
  },
  {
    data: '07/07',
    entregas: 88,
    meta: 70,
    concluidas: 84
  },
  {
    data: '08/07',
    entregas: 95,
    meta: 70,
    concluidas: 91
  },
  {
    data: '09/07',
    entregas: 82,
    meta: 70,
    concluidas: 78
  },
  {
    data: '10/07',
    entregas: 89,
    meta: 70,
    concluidas: 86
  },
  {
    data: '11/07',
    entregas: 96,
    meta: 70,
    concluidas: 93
  },
  {
    data: '12/07',
    entregas: 102,
    meta: 70,
    concluidas: 98
  }
]

export function DeliveryEvolutionChart() {
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
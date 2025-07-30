'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { categoria: 'A', quantidade: 2, color: '#6b7280' },
  { categoria: 'B', quantidade: 5, color: '#3b82f6' },
  { categoria: 'C', quantidade: 8, color: '#10b981' },
  { categoria: 'D', quantidade: 15, color: '#f59e0b' },
  { categoria: 'E', quantidade: 4, color: '#8b5cf6' }
]

export function DriverLicenseChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="categoria" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `CNH ${value}`}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [`${value}`, 'Motoristas']}
            labelFormatter={(label) => `CNH ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="quantidade" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
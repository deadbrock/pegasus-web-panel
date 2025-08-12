'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data - substituir por dados do Supabase
const data = [
  {
    regiao: 'Centro',
    eficiencia: 94,
    entregas: 245,
    meta: 90
  },
  {
    regiao: 'Norte',
    eficiencia: 87,
    entregas: 189,
    meta: 90
  },
  {
    regiao: 'Sul',
    eficiencia: 92,
    entregas: 201,
    meta: 90
  },
  {
    regiao: 'Leste',
    eficiencia: 89,
    entregas: 167,
    meta: 90
  },
  {
    regiao: 'Oeste',
    eficiencia: 96,
    entregas: 234,
    meta: 90
  },
  {
    regiao: 'Nordeste',
    eficiencia: 85,
    entregas: 145,
    meta: 90
  }
]

export function EfficiencyRegionChart() {
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
          <XAxis dataKey="regiao" />
          <YAxis domain={[0, 100]} />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'eficiencia') return [`${value}%`, 'Eficiência']
              if (name === 'meta') return [`${value}%`, 'Meta']
              return [value, 'Entregas']
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="eficiencia" 
            fill="#10b981" 
            name="Eficiência"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="meta" 
            fill="#94a3b8" 
            name="Meta"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.6}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
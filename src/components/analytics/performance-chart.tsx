'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data - substituir por dados do Supabase
const data = [
  {
    name: 'João Silva',
    entregas: 45,
    pontuacao: 92,
    eficiencia: 88
  },
  {
    name: 'Maria Santos',
    entregas: 52,
    pontuacao: 96,
    eficiencia: 94
  },
  {
    name: 'Pedro Costa',
    entregas: 38,
    pontuacao: 85,
    eficiencia: 82
  },
  {
    name: 'Ana Oliveira',
    entregas: 41,
    pontuacao: 89,
    eficiencia: 87
  },
  {
    name: 'Carlos Lima',
    entregas: 47,
    pontuacao: 91,
    eficiencia: 89
  },
  {
    name: 'Luiza Alves',
    entregas: 35,
    pontuacao: 86,
    eficiencia: 85
  }
]

export function PerformanceChart() {
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
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="entregas" 
            fill="#3b82f6" 
            name="Entregas"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="pontuacao" 
            fill="#10b981" 
            name="Pontuação"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
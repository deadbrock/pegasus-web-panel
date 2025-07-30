'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock data - substituir por dados do Supabase
const data = [
  {
    mes: 'Jan',
    preventiva: 12,
    corretiva: 8,
    revisao: 15,
    oleo: 20,
    pneus: 5
  },
  {
    mes: 'Fev',
    preventiva: 15,
    corretiva: 6,
    revisao: 18,
    oleo: 22,
    pneus: 8
  },
  {
    mes: 'Mar',
    preventiva: 18,
    corretiva: 10,
    revisao: 20,
    oleo: 25,
    pneus: 12
  },
  {
    mes: 'Abr',
    preventiva: 14,
    corretiva: 5,
    revisao: 16,
    oleo: 19,
    pneus: 7
  },
  {
    mes: 'Mai',
    preventiva: 20,
    corretiva: 12,
    revisao: 22,
    oleo: 28,
    pneus: 15
  },
  {
    mes: 'Jun',
    preventiva: 16,
    corretiva: 8,
    revisao: 19,
    oleo: 24,
    pneus: 10
  }
]

export function MaintenanceChart() {
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
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="preventiva" 
            stackId="maintenance"
            fill="#10b981" 
            name="Preventiva"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="corretiva" 
            stackId="maintenance"
            fill="#ef4444" 
            name="Corretiva"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="revisao" 
            stackId="maintenance"
            fill="#3b82f6" 
            name="Revisão"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="oleo" 
            stackId="maintenance"
            fill="#f59e0b" 
            name="Troca de Óleo"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="pneus" 
            stackId="maintenance"
            fill="#8b5cf6" 
            name="Pneus"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
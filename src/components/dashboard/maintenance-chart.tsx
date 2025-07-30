'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

// Mock data para o gráfico
const data = [
  { name: 'Sem 1', preventiva: 4, corretiva: 2, total: 6 },
  { name: 'Sem 2', preventiva: 6, corretiva: 1, total: 7 },
  { name: 'Sem 3', preventiva: 3, corretiva: 3, total: 6 },
  { name: 'Sem 4', preventiva: 5, corretiva: 2, total: 7 },
]

export function MaintenanceChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="preventiva" 
            stroke="#16a34a" 
            strokeWidth={2}
            name="Preventiva"
            dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="corretiva" 
            stroke="#dc2626" 
            strokeWidth={2}
            name="Corretiva"
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="total" 
            stroke="#1e40af" 
            strokeWidth={2}
            name="Total"
            dot={{ fill: '#1e40af', strokeWidth: 2, r: 4 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 
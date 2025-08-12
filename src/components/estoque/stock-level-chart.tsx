'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Fixação', value: 850, color: '#3b82f6' },
  { name: 'Lubrificantes', value: 45, color: '#10b981' },
  { name: 'Filtros', value: 15, color: '#f59e0b' },
  { name: 'Pneus', value: 8, color: '#ef4444' },
  { name: 'Elétricos', value: 28, color: '#8b5cf6' },
  { name: 'Outros', value: 35, color: '#6b7280' }
]

export function StockLevelChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Quantidade']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
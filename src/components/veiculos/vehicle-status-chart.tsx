'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Ativo', value: 24, color: '#10b981' },
  { name: 'Em Manutenção', value: 3, color: '#f59e0b' },
  { name: 'Inativo', value: 0, color: '#6b7280' },
  { name: 'Vendido', value: 0, color: '#ef4444' }
]

export function VehicleStatusChart() {
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
            label={({ name, value, percent }) => 
              value > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : null
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Veículos']}
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
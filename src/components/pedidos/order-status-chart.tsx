'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Entregue', value: 128, color: '#10b981' },
  { name: 'Em Rota', value: 15, color: '#f59e0b' },
  { name: 'Em Separação', value: 8, color: '#3b82f6' },
  { name: 'Pendente', value: 5, color: '#6b7280' },
  { name: 'Atrasado', value: 3, color: '#ef4444' },
  { name: 'Cancelado', value: 2, color: '#9ca3af' }
]

export function OrderStatusChart() {
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
            formatter={(value: number) => [value, 'Pedidos']}
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
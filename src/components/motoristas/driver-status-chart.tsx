'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type DriverStatusChartProps = {
  statusData?: { name: string; value: number; color: string }[]
}

export function DriverStatusChart({ statusData }: DriverStatusChartProps) {
  const data = (statusData || []).filter(item => item.value > 0)
  
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum motorista cadastrado</p>
          <p className="text-sm mt-2">Adicione motoristas para visualizar o gráfico</p>
        </div>
      </div>
    )
  }
  

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
            formatter={(value: number) => [value, 'Motoristas']}
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
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface OrderStatusChartProps {
  data?: {
    Pendente: number
    Aprovado: number
    'Em Separação': number
    'Saiu para Entrega': number
    Entregue: number
    Cancelado: number
    Rejeitado: number
  }
}

export function OrderStatusChart({ data: statusData }: OrderStatusChartProps) {
  const data = statusData
    ? [
        { name: 'Entregue', value: statusData['Entregue'], color: '#10b981' },
        { name: 'Saiu para Entrega', value: statusData['Saiu para Entrega'], color: '#f59e0b' },
        { name: 'Em Separação', value: statusData['Em Separação'], color: '#3b82f6' },
        { name: 'Aprovado', value: statusData['Aprovado'], color: '#6366f1' },
        { name: 'Pendente', value: statusData['Pendente'], color: '#6b7280' },
        { name: 'Cancelado', value: statusData['Cancelado'], color: '#ef4444' },
        { name: 'Rejeitado', value: statusData['Rejeitado'], color: '#9ca3af' }
      ].filter(item => item.value > 0)
    : []

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum pedido encontrado</p>
          <p className="text-sm mt-2">Os dados aparecerão aqui quando houver pedidos</p>
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
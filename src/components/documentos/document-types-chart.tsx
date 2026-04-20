'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DocumentTypesChartProps {
  data?: Array<{ name: string; value: number; color?: string }>
}

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#6b7280']

export function DocumentTypesChart({ data }: DocumentTypesChartProps) {
  const typesData = (data ?? []).map((d, i) => ({ ...d, color: d.color ?? COLORS[i % COLORS.length] }))
  const total = typesData.reduce((sum, item) => sum + item.value, 0)

  if (typesData.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400">
        <p className="text-sm">Sem documentos cadastrados</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Quantidade: {data.value} documentos
          </p>
          <p className="text-sm text-gray-600">
            Percentual: {percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = (entry: any) => {
    const percentage = ((entry.value / total) * 100).toFixed(0)
    return `${percentage}%`
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={typesData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {typesData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => value}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
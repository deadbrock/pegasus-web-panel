'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface CostCategoryChartProps {
  showDetails?: boolean
}

// Mock data para custos por categoria
const categoryData = [
  { name: 'Combustível', value: 29432, color: '#f97316' },
  { name: 'Manutenção', value: 12850, color: '#3b82f6' },
  { name: 'Pedágio', value: 2180, color: '#8b5cf6' },
  { name: 'Seguro', value: 3750, color: '#10b981' },
  { name: 'Documentação', value: 856, color: '#06b6d4' },
  { name: 'Multas', value: 390, color: '#ef4444' },
  { name: 'Outros', value: 542, color: '#6b7280' }
]

export function CostCategoryChart({ showDetails = false }: CostCategoryChartProps) {
  const total = categoryData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Valor: R$ {data.value.toLocaleString('pt-BR')}
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
    const percentage = ((entry.value / total) * 100).toFixed(1)
    return `${percentage}%`
  }

  if (showDetails) {
    return (
      <div className="space-y-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Detalhes das categorias */}
        <div className="space-y-2">
          {categoryData.map((category) => {
            const percentage = ((category.value / total) * 100).toFixed(1)
            
            return (
              <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R$ {category.value.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-gray-600">{percentage}%</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">R$ {total.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
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
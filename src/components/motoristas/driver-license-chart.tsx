'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type DriverLicenseChartProps = {
  data?: { categoria: string; quantidade: number }[]
}

export function DriverLicenseChart({ data }: DriverLicenseChartProps) {
  const chartData = data || []
  
  if (chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum dado de CNH disponível</p>
          <p className="text-sm mt-2">Cadastre motoristas para visualizar as categorias</p>
        </div>
      </div>
    )
  }
  

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="categoria" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `CNH ${value}`}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [`${value}`, 'Motoristas']}
            labelFormatter={(label) => `CNH ${label}`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="quantidade" 
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface KmData {
  placa: string
  kmTotal: number
  kmMensal: number
}

interface VehicleKmChartProps {
  data?: KmData[]
}

export function VehicleKmChart({ data }: VehicleKmChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum dado de quilometragem</p>
          <p className="text-sm mt-2">Os dados aparecerão aqui quando houver veículos</p>
        </div>
      </div>
    )
  }

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
          <XAxis dataKey="placa" />
          <YAxis />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'kmTotal') return [`${value.toLocaleString()} km`, 'KM Total']
              return [`${value.toLocaleString()} km`, 'KM Este Mês']
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="kmTotal" 
            fill="#3b82f6" 
            name="KM Total"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
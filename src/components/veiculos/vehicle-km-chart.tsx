'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { placa: 'BRA-2023', kmMensal: 2850, kmTotal: 15680 },
  { placa: 'BRA-2024', kmMensal: 3200, kmTotal: 45200 },
  { placa: 'BRA-2025', kmMensal: 2100, kmTotal: 28900 },
  { placa: 'BRA-2022', kmMensal: 4100, kmTotal: 67800 },
  { placa: 'BRA-2026', kmMensal: 1800, kmTotal: 8500 },
  { placa: 'BRA-2021', kmMensal: 0, kmTotal: 89200 }
]

export function VehicleKmChart() {
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
              if (name === 'kmMensal') return [`${value.toLocaleString()} km`, 'KM Este Mês']
              return [`${value.toLocaleString()} km`, 'KM Total']
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="kmMensal" 
            fill="#3b82f6" 
            name="KM Este Mês"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
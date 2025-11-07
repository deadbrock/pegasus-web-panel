'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'
import { getDriversPerformanceRange } from '@/lib/services/analytics-realtime'

interface Props { from?: Date; to?: Date }

export function PerformanceChart({ from, to }: Props) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      const start = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const end = to || new Date()
      const result = await getDriversPerformanceRange(start, end)
      setData(result)
    }
    loadData()
  }, [from?.toString(), to?.toString()])
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
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Bar 
            dataKey="entregas" 
            fill="#3b82f6" 
            name="Entregas"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="pontuacao" 
            fill="#10b981" 
            name="Pontuação"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useEffect, useState } from 'react'
import { fetchFindings, type AuditFindingRecord } from '@/services/auditoriaService'

export function AuditAreasChart() {
  const [areasData, setAreasData] = useState<{ name: string; value: number; color: string }[]>([])
  useEffect(() => {
    (async () => {
      const rows = await fetchFindings({})
      const counts: Record<string, number> = {}
      rows.forEach(r => { counts[r.area] = (counts[r.area] || 0) + 1 })
      const palette = ['#ef4444','#f59e0b','#3b82f6','#8b5cf6','#10b981','#06b6d4','#16a34a','#f97316']
      const data = Object.entries(counts).map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }))
      setAreasData(data)
    })()
  }, [])

  const total = areasData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            Apontamentos: {data.value}
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
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={areasData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {areasData.map((entry, index) => (
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

      {/* Detalhamento por Área */}
      <div className="space-y-2">
        {areasData.map((area, index) => {
          const percentage = ((area.value / total) * 100).toFixed(1)
          return (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: area.color }}
                ></div>
                <span>{area.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{area.value}</span>
                <span className="text-gray-500">({percentage}%)</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useEffect, useState } from 'react'
import { getRouteStatus, getRouteStatusRange } from '@/lib/services/analytics-service'
const palette = ['#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6']

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Não mostrar label para fatias muito pequenas

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
    >
      {value}
    </text>
  )
}

interface Props { from?: Date; to?: Date }

export function RouteStatusChart({ from, to }: Props) {
  const [data, setData] = useState<any[]>([])
  useEffect(() => {
    if (from && to) getRouteStatusRange(from, to).then(setData)
    else getRouteStatus().then(setData)
  }, [from?.toString(), to?.toString()])
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [value, 'Rotas']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: entry.color }}>
                {value}: {(entry.payload as any).value} rotas
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
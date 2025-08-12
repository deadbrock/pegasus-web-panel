'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock data para evolução do ranking dos top 5 motoristas
const leaderboardData = [
  { semana: 'S1', joao: 1, maria: 2, carlos: 3, ana: 4, pedro: 5 },
  { semana: 'S2', joao: 1, maria: 2, carlos: 4, ana: 3, pedro: 5 },
  { semana: 'S3', joao: 1, maria: 3, carlos: 2, ana: 4, pedro: 6 },
  { semana: 'S4', joao: 1, maria: 2, carlos: 3, ana: 5, pedro: 4 },
  { semana: 'S5', joao: 2, maria: 1, carlos: 3, ana: 4, pedro: 5 },
  { semana: 'S6', joao: 1, maria: 2, carlos: 4, ana: 3, pedro: 5 },
  { semana: 'S7', joao: 1, maria: 2, carlos: 3, ana: 4, pedro: 6 },
  { semana: 'S8', joao: 1, maria: 3, carlos: 2, ana: 5, pedro: 4 }
]

export function LeaderboardChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: #{entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // Inverter os valores para que posição 1 apareça no topo
  const processedData = leaderboardData.map(item => ({
    ...item,
    joao: 6 - item.joao,
    maria: 6 - item.maria,
    carlos: 6 - item.carlos,
    ana: 6 - item.ana,
    pedro: 6 - item.pedro
  }))

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 5]}
              tickFormatter={(value) => `#${6 - value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="joao" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="João Silva"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="maria" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Maria Santos"
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="carlos" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Carlos Lima"
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="ana" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Ana Costa"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="pedro" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              name="Pedro Oliveira"
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Análise de Movimento */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Movimentação Recente</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Maria Santos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">↗ +1</span>
              <span className="text-gray-600">#2 → #1</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>João Silva</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600">↘ -1</span>
              <span className="text-gray-600">#1 → #2</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Carlos Lima</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">→ 0</span>
              <span className="text-gray-600">#3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estabilidade */}
      <div className="pt-3 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Análise de Estabilidade</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Mais Estável</p>
            <p className="font-medium text-blue-600">João Silva</p>
          </div>
          <div>
            <p className="text-gray-500">Maior Ascensão</p>
            <p className="font-medium text-green-600">Ana Costa</p>
          </div>
        </div>
      </div>
    </div>
  )
}
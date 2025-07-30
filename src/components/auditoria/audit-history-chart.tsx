'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// Mock data para histórico do score
const historyData = [
  { date: '01/12', score: 82.5, apontamentos: 35 },
  { date: '08/12', score: 84.1, apontamentos: 32 },
  { date: '15/12', score: 83.7, apontamentos: 34 },
  { date: '22/12', score: 85.9, apontamentos: 29 },
  { date: '29/12', score: 86.8, apontamentos: 27 },
  { date: '05/01', score: 85.2, apontamentos: 31 },
  { date: '12/01', score: 87.3, apontamentos: 25 },
  { date: '19/01', score: 88.1, apontamentos: 23 },
  { date: '26/01', score: 89.5, apontamentos: 20 },
  { date: '02/02', score: 87.3, apontamentos: 23 }
]

export function AuditHistoryChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">Semana: {label}</p>
          <p className="text-sm text-blue-600">
            Score: {data.score}%
          </p>
          <p className="text-sm text-gray-600">
            Apontamentos: {data.apontamentos}
          </p>
        </div>
      )
    }
    return null
  }

  const averageScore = historyData.reduce((sum, item) => sum + item.score, 0) / historyData.length

  return (
    <div className="space-y-4">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[75, 95]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Linha da Meta */}
            <ReferenceLine 
              y={90} 
              stroke="#ef4444" 
              strokeDasharray="5 5" 
              label={{ value: "Meta 90%", position: "topRight" }}
            />
            
            {/* Linha da Média */}
            <ReferenceLine 
              y={averageScore} 
              stroke="#6b7280" 
              strokeDasharray="3 3" 
              label={{ value: `Média ${averageScore.toFixed(1)}%`, position: "bottomRight" }}
            />
            
            {/* Linha do Score */}
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Score Atual</p>
          <p className="text-2xl font-bold text-blue-600">
            {historyData[historyData.length - 1].score}%
          </p>
        </div>
        <div>
          <p className="text-gray-500">Média Período</p>
          <p className="text-2xl font-bold text-gray-700">
            {averageScore.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-500">Tendência</p>
          <p className={`text-2xl font-bold ${
            historyData[historyData.length - 1].score > historyData[historyData.length - 2].score 
              ? 'text-green-600' : 'text-red-600'
          }`}>
            {historyData[historyData.length - 1].score > historyData[historyData.length - 2].score 
              ? '↗' : '↘'}
          </p>
        </div>
      </div>

      {/* Análise de Tendência */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Análise de Tendência</h4>
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            • Score melhorou {((historyData[historyData.length - 1].score - historyData[0].score)).toFixed(1)} pontos no período
          </p>
          <p className="text-gray-600">
            • Redução de {historyData[0].apontamentos - historyData[historyData.length - 1].apontamentos} apontamentos
          </p>
          <p className="text-gray-600">
            • {historyData[historyData.length - 1].score >= 90 ? 'Meta atingida' : `Faltam ${(90 - historyData[historyData.length - 1].score).toFixed(1)} pontos para atingir a meta`}
          </p>
        </div>
      </div>
    </div>
  )
}
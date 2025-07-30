'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Mock data para evolução de pontos
const activityData = [
  { data: '01/01', pontos: 45, entregas: 3, conquistas: 1 },
  { data: '02/01', pontos: 89, entregas: 5, conquistas: 0 },
  { data: '03/01', pontos: 112, entregas: 4, conquistas: 1 },
  { data: '04/01', pontos: 134, entregas: 6, conquistas: 0 },
  { data: '05/01', pontos: 178, entregas: 7, conquistas: 2 },
  { data: '06/01', pontos: 203, entregas: 5, conquistas: 0 },
  { data: '07/01', pontos: 267, entregas: 8, conquistas: 1 },
  { data: '08/01', pontos: 298, entregas: 6, conquistas: 0 },
  { data: '09/01', pontos: 334, entregas: 7, conquistas: 1 },
  { data: '10/01', pontos: 378, entregas: 9, conquistas: 0 },
  { data: '11/01', pontos: 412, entregas: 6, conquistas: 1 },
  { data: '12/01', pontos: 456, entregas: 8, conquistas: 0 },
  { data: '13/01', pontos: 523, entregas: 10, conquistas: 2 },
  { data: '14/01', pontos: 567, entregas: 7, conquistas: 0 }
]

export function ActivityPoints() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Pontos: {data.pontos}
          </p>
          <p className="text-sm text-green-600">
            Entregas: {data.entregas}
          </p>
          <p className="text-sm text-purple-600">
            Conquistas: {data.conquistas}
          </p>
        </div>
      )
    }
    return null
  }

  const totalPontos = activityData[activityData.length - 1].pontos
  const pontosOntem = activityData[activityData.length - 2].pontos
  const variacao = totalPontos - pontosOntem

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="data" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="pontos" 
              stroke="#3b82f6" 
              fill="#93c5fd" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-gray-500">Total Atual</p>
          <p className="text-xl font-bold text-blue-600">{totalPontos}</p>
        </div>
        <div>
          <p className="text-gray-500">Hoje</p>
          <p className={`text-xl font-bold ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {variacao >= 0 ? '+' : ''}{variacao}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Média/Dia</p>
          <p className="text-xl font-bold text-purple-600">
            {Math.round(totalPontos / activityData.length)}
          </p>
        </div>
      </div>

      {/* Atividades do Dia */}
      <div className="pt-3 border-t">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Atividades Hoje</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Entregas realizadas</span>
            <span className="font-medium text-green-600">7</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Conquistas obtidas</span>
            <span className="font-medium text-purple-600">1</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Pontos de bônus</span>
            <span className="font-medium text-blue-600">+25</span>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Mock data para cronograma de vencimentos
const expirationData = [
  { periodo: 'Jan 2024', vencimentos: 5, vencidos: 2, validos: 3 },
  { periodo: 'Fev 2024', vencimentos: 3, vencidos: 1, validos: 2 },
  { periodo: 'Mar 2024', vencimentos: 8, vencidos: 0, validos: 8 },
  { periodo: 'Abr 2024', vencimentos: 12, vencidos: 1, validos: 11 },
  { periodo: 'Mai 2024', vencimentos: 6, vencidos: 0, validos: 6 },
  { periodo: 'Jun 2024', vencimentos: 9, vencidos: 0, validos: 9 },
  { periodo: 'Jul 2024', vencimentos: 4, vencidos: 0, validos: 4 },
  { periodo: 'Ago 2024', vencimentos: 7, vencidos: 0, validos: 7 },
  { periodo: 'Set 2024', vencimentos: 11, vencidos: 0, validos: 11 },
  { periodo: 'Out 2024', vencimentos: 5, vencidos: 0, validos: 5 },
  { periodo: 'Nov 2024', vencimentos: 8, vencidos: 0, validos: 8 },
  { periodo: 'Dez 2024', vencimentos: 13, vencidos: 0, validos: 13 }
]

export function ExpirationChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = expirationData.find(item => item.periodo === label)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Total: {data?.vencimentos} documentos
          </p>
          <p className="text-sm text-green-600">
            Válidos: {data?.validos}
          </p>
          {data?.vencidos > 0 && (
            <p className="text-sm text-red-600">
              Vencidos: {data?.vencidos}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const getBarColor = (data: any) => {
    if (data.vencidos > 0) return '#ef4444' // Vermelho se houver vencidos
    if (data.vencimentos > 10) return '#f59e0b' // Laranja se muitos vencimentos
    return '#3b82f6' // Azul padrão
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={expirationData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="periodo" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="vencimentos" 
            radius={[4, 4, 0, 0]}
          >
            {expirationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Dados virão via prop do backend/Supabase
const expirationData: any[] = []

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
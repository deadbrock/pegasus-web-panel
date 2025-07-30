'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { mes: 'Jul', valor: 2100000, quantidade: 1450 },
  { mes: 'Ago', valor: 2280000, quantidade: 1520 },
  { mes: 'Set', valor: 2150000, quantidade: 1480 },
  { mes: 'Out', valor: 2350000, quantidade: 1580 },
  { mes: 'Nov', valor: 2420000, quantidade: 1620 },
  { mes: 'Dez', valor: 2456780, quantidade: 1647 }
]

export function StockChart() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === 'valor') {
                return [new Intl.NumberFormat('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                }).format(value), 'Valor Total']
              }
              return [value, 'Total de Produtos']
            }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="valor"
            stroke="#3b82f6"
            strokeWidth={3}
            name="Valor (R$)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="quantidade"
            stroke="#10b981"
            strokeWidth={3}
            name="Quantidade"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
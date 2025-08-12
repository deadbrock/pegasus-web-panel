'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts'

// Mock data para custo por KM
const costPerKmData = [
  { 
    mes: 'Jul', 
    custoKm: 4.12, 
    meta: 4.50, 
    kmTotal: 9340, 
    custoTotal: 38450,
    eficiencia: 91.6
  },
  { 
    mes: 'Ago', 
    custoKm: 4.48, 
    meta: 4.50, 
    kmTotal: 9460, 
    custoTotal: 42380,
    eficiencia: 99.6
  },
  { 
    mes: 'Set', 
    custoKm: 4.22, 
    meta: 4.50, 
    kmTotal: 9460, 
    custoTotal: 39920,
    eficiencia: 93.8
  },
  { 
    mes: 'Out', 
    custoKm: 4.68, 
    meta: 4.50, 
    kmTotal: 9940, 
    custoTotal: 46520,
    eficiencia: 104.0
  },
  { 
    mes: 'Nov', 
    custoKm: 4.35, 
    meta: 4.50, 
    kmTotal: 10150, 
    custoTotal: 44180,
    eficiencia: 96.7
  },
  { 
    mes: 'Dez', 
    custoKm: 4.85, 
    meta: 4.50, 
    kmTotal: 10310, 
    custoTotal: 50000,
    eficiencia: 107.8
  }
]

export function CostPerKmChart() {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = costPerKmData.find(item => item.mes === label)
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Custo/KM: R$ {data?.custoKm.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            Meta: R$ {data?.meta.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            KM Total: {data?.kmTotal.toLocaleString('pt-BR')}
          </p>
          <p className="text-sm text-gray-600">
            Custo Total: R$ {data?.custoTotal.toLocaleString('pt-BR')}
          </p>
          <p className={`text-sm ${data && data.eficiencia > 100 ? 'text-red-600' : 'text-green-600'}`}>
            Eficiência: {data?.eficiencia.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={costPerKmData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis 
            yAxisId="left"
            domain={[3.5, 5.5]}
            tickFormatter={(value) => `R$ ${value.toFixed(2)}`}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            domain={[8000, 11000]}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k km`}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Linha de meta */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="meta" 
            stroke="#ef4444" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            name="Meta"
          />
          
          {/* Custo por KM real */}
          <Bar 
            yAxisId="left"
            dataKey="custoKm" 
            fill="#3b82f6" 
            name="Custo/KM"
            radius={[4, 4, 0, 0]}
          />
          
          {/* KM total como linha */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="kmTotal" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="KM Total"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
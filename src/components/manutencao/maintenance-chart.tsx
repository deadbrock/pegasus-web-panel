'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Manutencao } from '@/lib/services/manutencoes-service'
import { useMemo } from 'react'

interface MaintenanceChartProps {
  manutencoes?: Manutencao[]
}

export function MaintenanceChart({ manutencoes = [] }: MaintenanceChartProps) {
  // Agrupa manutenções por mês e tipo
  const data = useMemo(() => {
    const now = new Date()
    const last6Months = []
    
    // Gera os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.toLocaleDateString('pt-BR', { month: 'short' })
      last6Months.push({
        mes: month.charAt(0).toUpperCase() + month.slice(1),
        month: date.getMonth(),
        year: date.getFullYear(),
        preventiva: 0,
        corretiva: 0,
        revisao: 0,
        oleo: 0,
        pneus: 0,
        outros: 0
      })
    }

    // Conta manutenções por tipo e mês
    manutencoes.forEach(m => {
      const date = new Date(m.data_agendada)
      const monthData = last6Months.find(
        d => d.month === date.getMonth() && d.year === date.getFullYear()
      )
      
      if (monthData) {
        const tipo = m.tipo.toLowerCase().replace(/\s/g, '')
        if (tipo.includes('preventiva')) {
          monthData.preventiva++
        } else if (tipo.includes('corretiva')) {
          monthData.corretiva++
        } else if (tipo.includes('revisao') || tipo.includes('revisão')) {
          monthData.revisao++
        } else if (tipo.includes('oleo') || tipo.includes('óleo')) {
          monthData.oleo++
        } else if (tipo.includes('pneu')) {
          monthData.pneus++
        } else {
          monthData.outros++
        }
      }
    })

    return last6Months
  }, [manutencoes])
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
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Bar 
            dataKey="preventiva" 
            stackId="maintenance"
            fill="#10b981" 
            name="Preventiva"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="corretiva" 
            stackId="maintenance"
            fill="#ef4444" 
            name="Corretiva"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="revisao" 
            stackId="maintenance"
            fill="#3b82f6" 
            name="Revisão"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="oleo" 
            stackId="maintenance"
            fill="#f59e0b" 
            name="Troca de Óleo"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="pneus" 
            stackId="maintenance"
            fill="#8b5cf6" 
            name="Pneus"
            radius={[0, 0, 0, 0]}
          />
          <Bar 
            dataKey="outros" 
            stackId="maintenance"
            fill="#6b7280" 
            name="Outros"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
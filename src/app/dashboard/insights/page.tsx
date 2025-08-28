"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '@/lib/supabaseClient'

type Row = { scope: string; period: string; value: number }

export default function InsightsPage() {
  const [rows, setRows] = useState<Row[]>([])

  const load = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const base = process.env.NEXT_PUBLIC_API_URL || ''
    const res = await fetch(`${base}/api/forecast`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setRows(await res.json())
  }

  useEffect(() => { load() }, [])

  const orders = rows.filter(r => r.scope === 'orders')
  const est = rows.filter(r => r.scope === 'estoque_consumo')
  const custos = rows.filter(r => r.scope === 'custos')
  const manutencao = rows.filter(r => r.scope === 'manutencao')

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Insights Preditivos</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <div className="text-sm font-medium mb-2">Previsão de Pedidos (30 dias)</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={orders}>
                <XAxis dataKey="period" hide/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Pedidos" stroke="#2563eb" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <div className="text-sm font-medium mb-2">Consumo de Estoque (30 dias)</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={est}>
                <XAxis dataKey="period" hide/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Consumo" stroke="#16a34a" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <div className="text-sm font-medium mb-2">Custos (6 meses)</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={custos}>
                <XAxis dataKey="period" hide/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Custos" stroke="#ef4444" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <div className="text-sm font-medium mb-2">Manutenção (6 meses)</div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={manutencao}>
                <XAxis dataKey="period" hide/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" name="Ordens" stroke="#a855f7" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



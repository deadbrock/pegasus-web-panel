"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

type Row = { scope: string; period: string; value: number }

export default function ForecastPage() {
  const { toast } = useToast()
  const [rows, setRows] = useState<Row[]>([])

  const run = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const base = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${base}/api/forecast/run`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      toast({ title: 'Forecast', description: 'Previsões geradas.' })
      await load()
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao gerar previsões', variant: 'destructive' })
    }
  }

  const load = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const base = process.env.NEXT_PUBLIC_API_URL || ''
    const res = await fetch(`${base}/api/forecast`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setRows(await res.json())
  }

  useEffect(() => { load() }, [])

  const dataOrders = rows.filter(r => r.scope === 'orders')

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Forecast</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={run}>Gerar previsões</Button>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataOrders}>
                <XAxis dataKey="period" hide/>
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Alert = { type: string; title: string; payload?: any }

export default function RadarPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  const load = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token
    const base = process.env.NEXT_PUBLIC_API_URL || ''
    const res = await fetch(`${base}/api/radar`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setAlerts(await res.json())
  }

  useEffect(() => { load() }, [])

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Radar Logístico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {alerts.length === 0 && <div className="text-gray-500">Sem alertas preditivos no momento.</div>}
          {alerts.map((a, i) => (
            <div key={i} className="p-3 border rounded bg-white">
              <div className="font-medium">{a.title}</div>
              {a.payload && (
                <div className="text-xs text-gray-600">{JSON.stringify(a.payload)}</div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}



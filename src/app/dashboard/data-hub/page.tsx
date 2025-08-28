"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

export default function DataHubPage() {
  const { toast } = useToast()

  const refresh = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const base = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${base}/api/datahub/refresh`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(await res.text())
      const j = await res.json()
      toast({ title: 'Data Hub', description: `Eventos consolidados: ${j.rows}` })
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao atualizar Data Hub', variant: 'destructive' })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Hub</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">Central de dados normalizados para análises preditivas.</p>
          <Button onClick={refresh}>Atualizar snapshot</Button>
        </CardContent>
      </Card>
    </div>
  )
}



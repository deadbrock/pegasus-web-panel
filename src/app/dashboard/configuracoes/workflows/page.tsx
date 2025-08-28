"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabaseClient'

type ModuleKey = 'motoristas' | 'estoque' | 'pedidos'
type TriggerKey = 'cnh_vencendo' | 'estoque_critico' | 'pedido_alto_valor'

export default function WorkflowsPage() {
  const { toast } = useToast()
  const [moduleKey, setModuleKey] = useState<ModuleKey>('motoristas')
  const [triggerKey, setTriggerKey] = useState<TriggerKey>('cnh_vencendo')
  const [conditionJson, setConditionJson] = useState<string>(JSON.stringify({ dias: 30 }, null, 2))
  const [actionJson, setActionJson] = useState<string>(JSON.stringify({ notify: true, channels: ['panel'] }, null, 2))
  const [saving, setSaving] = useState(false)
  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false })
      if (!error) setList(data || [])
    }
    load()
  }, [])

  const onChangeModule = (val: ModuleKey) => {
    setModuleKey(val)
    if (val === 'motoristas') {
      setTriggerKey('cnh_vencendo')
      setConditionJson(JSON.stringify({ dias: 30 }, null, 2))
    } else if (val === 'estoque') {
      setTriggerKey('estoque_critico')
      setConditionJson(JSON.stringify({}, null, 2))
    } else {
      setTriggerKey('pedido_alto_valor')
      setConditionJson(JSON.stringify({ valor_min: 10000 }, null, 2))
    }
  }

  const saveWorkflow = async () => {
    try {
      setSaving(true)
      const condition = JSON.parse(conditionJson || '{}')
      const action = JSON.parse(actionJson || '{}')
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) throw new Error('Usuário não autenticado')
      const { error } = await supabase
        .from('workflows')
        .insert({ module: moduleKey, trigger: triggerKey, condition, action, user_id: uid, active: true } as any)
      if (error) throw new Error(error.message)
      toast({ title: 'Workflow criado', description: 'Seu workflow foi salvo e ficará ativo.' })
      const reload = await supabase.from('workflows').select('*').order('created_at', { ascending: false })
      if (!reload.error) setList(reload.data || [])
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Falha ao salvar workflow', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Workflow Automatizado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>Módulo</Label>
              <Select value={moduleKey} onValueChange={(v) => onChangeModule(v as ModuleKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="motoristas">Motoristas</SelectItem>
                  <SelectItem value="estoque">Estoque</SelectItem>
                  <SelectItem value="pedidos">Pedidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Trigger</Label>
              <Select value={triggerKey} onValueChange={(v) => setTriggerKey(v as TriggerKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {moduleKey === 'motoristas' && <SelectItem value="cnh_vencendo">CNH vencendo</SelectItem>}
                  {moduleKey === 'estoque' && <SelectItem value="estoque_critico">Estoque crítico</SelectItem>}
                  {moduleKey === 'pedidos' && <SelectItem value="pedido_alto_valor">Pedido de alto valor</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={saveWorkflow} disabled={saving}>Salvar</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Condição (JSON)</Label>
              <Textarea rows={10} value={conditionJson} onChange={(e) => setConditionJson(e.target.value)} />
            </div>
            <div>
              <Label>Ação (JSON)</Label>
              <Textarea rows={10} value={actionJson} onChange={(e) => setActionJson(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">{list.length} workflow(s) cadastrados.</div>
        </CardContent>
      </Card>
    </div>
  )
}



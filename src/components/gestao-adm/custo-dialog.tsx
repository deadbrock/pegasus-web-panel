'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { createCusto, updateCusto } from '@/services/admCustosService'
import type {
  AdmContratoCusto, AdmContratoCustoInsert,
  AdmCustoTipo, AdmCustoPeriodicidade,
} from '@/types/adm-contratos'
import {
  ADM_CUSTO_TIPO_LABELS, ADM_CUSTO_PERIODICIDADE_LABELS, custoToMensal,
} from '@/types/adm-contratos'

interface CustoDialogProps {
  open: boolean
  onClose: () => void
  contratoId: string
  custo?: AdmContratoCusto | null
  onSaved: () => void
}

const emptyForm = (contratoId: string): AdmContratoCustoInsert => ({
  contrato_id:  contratoId,
  tipo_custo:   'administrativo',
  descricao:    '',
  valor:        0,
  periodicidade:'mensal',
  observacoes:  '',
  ativo:        true,
  created_by:   null,
})

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CustoDialog({ open, onClose, contratoId, custo, onSaved }: CustoDialogProps) {
  const [form, setForm]     = useState<AdmContratoCustoInsert>(emptyForm(contratoId))
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const isEdit = Boolean(custo?.id)

  useEffect(() => {
    setError('')
    if (custo) {
      setForm({
        contrato_id:  custo.contrato_id,
        tipo_custo:   custo.tipo_custo,
        descricao:    custo.descricao,
        valor:        custo.valor,
        periodicidade:custo.periodicidade,
        observacoes:  custo.observacoes ?? '',
        ativo:        custo.ativo,
        created_by:   custo.created_by ?? null,
      })
    } else {
      setForm(emptyForm(contratoId))
    }
  }, [custo, open, contratoId])

  const set = <K extends keyof AdmContratoCustoInsert>(k: K, v: AdmContratoCustoInsert[K]) =>
    setForm(p => ({ ...p, [k]: v }))

  const valorMensal = custoToMensal(Number(form.valor) || 0, form.periodicidade)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.descricao.trim()) { setError('Descrição é obrigatória'); return }
    if (!form.valor || form.valor <= 0) { setError('Valor deve ser maior que zero'); return }
    setSaving(true)
    try {
      let ok = false
      const payload = {
        ...form,
        valor: Number(form.valor),
        observacoes: form.observacoes || null,
      }
      if (isEdit && custo?.id) {
        ok = await updateCusto(custo.id, payload)
      } else {
        const result = await createCusto(payload)
        ok = !!result
      }
      if (ok) { onSaved(); onClose() }
      else setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-slate-900">
            {isEdit ? 'Editar Custo' : 'Adicionar Custo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Tipo de custo */}
          <div className="space-y-1.5">
            <Label>Tipo de Custo <span className="text-rose-500">*</span></Label>
            <Select value={form.tipo_custo} onValueChange={(v) => set('tipo_custo', v as AdmCustoTipo)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(ADM_CUSTO_TIPO_LABELS) as [AdmCustoTipo, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label>Descrição <span className="text-rose-500">*</span></Label>
            <Input
              placeholder="Ex: Salário do analista dedicado ao contrato"
              value={form.descricao}
              onChange={(e) => { set('descricao', e.target.value); setError('') }}
            />
          </div>

          {/* Valor + Periodicidade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Valor (R$) <span className="text-rose-500">*</span></Label>
              <Input
                type="number" min="0" step="0.01" placeholder="0,00"
                value={form.valor || ''}
                onChange={(e) => set('valor', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Periodicidade</Label>
              <Select value={form.periodicidade} onValueChange={(v) => set('periodicidade', v as AdmCustoPeriodicidade)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.entries(ADM_CUSTO_PERIODICIDADE_LABELS) as [AdmCustoPeriodicidade, string][]).map(([v, l]) => (
                    <SelectItem key={v} value={v}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview mensal */}
          {form.periodicidade !== 'mensal' && form.periodicidade !== 'unico' && Number(form.valor) > 0 && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-2.5 text-xs text-slate-600">
              Equivalente a <strong className="text-slate-800">{fmt(valorMensal)}/mês</strong>
              {' '}({ADM_CUSTO_PERIODICIDADE_LABELS[form.periodicidade].toLowerCase()})
            </div>
          )}
          {form.periodicidade === 'unico' && Number(form.valor) > 0 && (
            <div className="bg-amber-50 rounded-lg border border-amber-200 px-4 py-2.5 text-xs text-amber-700">
              Custo único — não será somado à projeção mensal do contrato.
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              placeholder="Detalhes adicionais sobre este custo..."
              rows={2}
              value={form.observacoes ?? ''}
              onChange={(e) => set('observacoes', e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Salvar' : 'Adicionar Custo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import {
  upsertAdmContratoFinanceiro,
  updateAdmContratoFinanceiro,
} from '@/services/admContratosService'
import type { AdmContratoFinanceiro, AdmContratoFinanceiroInsert } from '@/types/adm-contratos'

interface FinancialEntryDialogProps {
  open: boolean
  onClose: () => void
  contratoId: string
  entry?: AdmContratoFinanceiro | null
  onSaved: () => void
}

export function FinancialEntryDialog({
  open,
  onClose,
  contratoId,
  entry,
  onSaved,
}: FinancialEntryDialogProps) {
  const [periodo, setPeriodo] = useState('')
  const [receita, setReceita] = useState('')
  const [custo, setCusto] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(entry?.id)

  const lucroPreview =
    parseFloat(receita || '0') - parseFloat(custo || '0')
  const margemPreview =
    parseFloat(receita || '0') > 0
      ? ((lucroPreview / parseFloat(receita)) * 100).toFixed(1)
      : '0.0'

  useEffect(() => {
    if (entry) {
      setPeriodo(entry.periodo_referencia ?? '')
      setReceita(String(entry.receita ?? ''))
      setCusto(String(entry.custo ?? ''))
    } else {
      const now = new Date()
      setPeriodo(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
      setReceita('')
      setCusto('')
    }
    setError(null)
  }, [entry, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!periodo) { setError('Informe o período de referência'); return }

    setSaving(true)
    setError(null)
    try {
      let ok = false
      if (isEdit && entry?.id) {
        ok = await updateAdmContratoFinanceiro(entry.id, {
          receita: parseFloat(receita || '0'),
          custo: parseFloat(custo || '0'),
        })
      } else {
        const payload: AdmContratoFinanceiroInsert = {
          contrato_id: contratoId,
          periodo_referencia: periodo,
          receita: parseFloat(receita || '0'),
          custo: parseFloat(custo || '0'),
        }
        const result = await upsertAdmContratoFinanceiro(payload)
        ok = !!result
      }

      if (ok) {
        onSaved()
        onClose()
      } else {
        setError('Erro ao salvar. Verifique os dados e tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Editar Período Financeiro' : 'Registrar Período Financeiro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="periodo">Período de Referência</Label>
            <Input
              id="periodo"
              type="month"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="receita">Receita (R$)</Label>
              <Input
                id="receita"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={receita}
                onChange={(e) => setReceita(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="custo">Custo (R$)</Label>
              <Input
                id="custo"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={custo}
                onChange={(e) => setCusto(e.target.value)}
              />
            </div>
          </div>

          {/* Preview calculado */}
          {(receita || custo) && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Lucro calculado</p>
                <p
                  className={`text-sm font-semibold ${
                    lucroPreview >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {lucroPreview >= 0 ? '+' : ''}
                  {lucroPreview.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Margem</p>
                <p
                  className={`text-sm font-semibold ${
                    parseFloat(margemPreview) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {margemPreview}%
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Salvar' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

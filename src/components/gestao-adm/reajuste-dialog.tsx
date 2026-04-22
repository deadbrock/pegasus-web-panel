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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, TrendingUp, ArrowRight } from 'lucide-react'
import { aplicarReajuste, simularReajuste } from '@/services/admReajustesService'
import type { AdmReajusteInsert, AdmReajusteTipo } from '@/types/adm-contratos'
import {
  ADM_REAJUSTE_TIPO_LABELS,
  ADM_REAJUSTE_INDICES,
} from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

interface ReajusteDialogProps {
  open: boolean
  onClose: () => void
  contratoId: string
  valorAtual: number
  onSaved: () => void
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function ReajusteDialog({
  open,
  onClose,
  contratoId,
  valorAtual,
  onSaved,
}: ReajusteDialogProps) {
  const [tipo, setTipo] = useState<AdmReajusteTipo>('manual')
  const [indice, setIndice] = useState('')
  const [percentual, setPercentual] = useState('')
  const [dataAplicacao, setDataAplicacao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pct = parseFloat(percentual || '0')
  const valorSimulado = simularReajuste(valorAtual, pct)
  const variacao = valorSimulado - valorAtual
  const isPositive = pct >= 0

  useEffect(() => {
    if (open) {
      setTipo('manual')
      setIndice('')
      setPercentual('')
      setDataAplicacao(new Date().toISOString().split('T')[0])
      setObservacoes('')
      setError(null)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!percentual.trim()) { setError('Informe o percentual de reajuste'); return }
    if (!dataAplicacao) { setError('Informe a data de aplicação'); return }

    setSaving(true)
    setError(null)
    try {
      const payload: AdmReajusteInsert = {
        contrato_id: contratoId,
        tipo_reajuste: tipo,
        indice_referencia: tipo === 'indice' ? indice || null : null,
        percentual: pct,
        valor_anterior: valorAtual,
        valor_novo: valorSimulado,
        data_aplicacao: dataAplicacao,
        observacoes: observacoes || null,
        created_by: null,
      }

      const result = await aplicarReajuste(payload)
      if (result) {
        onSaved()
        onClose()
      } else {
        setError('Erro ao aplicar reajuste. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Novo Reajuste Contratual
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Tipo + Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Reajuste</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as AdmReajusteTipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ADM_REAJUSTE_TIPO_LABELS) as [AdmReajusteTipo, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_aplicacao">
                Data de Aplicação <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="data_aplicacao"
                type="date"
                value={dataAplicacao}
                onChange={(e) => setDataAplicacao(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Índice de referência (só para tipo "indice") */}
          {tipo === 'indice' && (
            <div className="space-y-1.5">
              <Label>Índice de Referência</Label>
              <Select value={indice} onValueChange={setIndice}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o índice" />
                </SelectTrigger>
                <SelectContent>
                  {ADM_REAJUSTE_INDICES.map((idx) => (
                    <SelectItem key={idx} value={idx}>
                      {idx}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Percentual */}
          <div className="space-y-1.5">
            <Label htmlFor="percentual">
              Percentual (%) <span className="text-rose-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="percentual"
                type="number"
                step="0.01"
                placeholder="Ex: 5.25 ou -2.00"
                value={percentual}
                onChange={(e) => setPercentual(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                %
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Use valor negativo para redução de valor.
            </p>
          </div>

          {/* Simulação */}
          {percentual.trim() !== '' && !isNaN(pct) && (
            <div
              className={cn(
                'rounded-xl border p-4 space-y-3',
                isPositive
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              )}
            >
              <p
                className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  isPositive ? 'text-amber-700' : 'text-blue-700'
                )}
              >
                Simulação do Reajuste
              </p>

              <div className="flex items-center gap-3">
                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 mb-1">Valor atual</p>
                  <p className="text-base font-bold text-slate-700">
                    {formatCurrency(valorAtual)}
                  </p>
                </div>

                <ArrowRight
                  className={cn(
                    'w-4 h-4 flex-shrink-0',
                    isPositive ? 'text-amber-500' : 'text-blue-500'
                  )}
                />

                <div className="text-center flex-1">
                  <p className="text-xs text-slate-500 mb-1">Novo valor</p>
                  <p
                    className={cn(
                      'text-base font-bold',
                      isPositive ? 'text-amber-700' : 'text-blue-700'
                    )}
                  >
                    {formatCurrency(valorSimulado)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    'text-xs font-semibold px-3 py-1 rounded-full',
                    isPositive
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  )}
                >
                  {isPositive ? '+' : ''}
                  {formatCurrency(variacao)} ({isPositive ? '+' : ''}
                  {pct.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Justificativa ou notas sobre o reajuste..."
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving || !percentual.trim()}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Aplicar Reajuste
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { Loader2 } from 'lucide-react'
import { createAdmContrato, updateAdmContrato } from '@/services/admContratosService'
import type { AdmContrato, AdmContratoInsert, AdmContratoStatus } from '@/types/adm-contratos'
import { ADM_STATUS_LABELS } from '@/types/adm-contratos'

interface ContractFormDialogProps {
  open: boolean
  onClose: () => void
  contrato?: AdmContrato | null
  onSaved: () => void
}

const emptyForm: AdmContratoInsert = {
  codigo: '',
  nome: '',
  cliente_nome: '',
  cliente_documento: '',
  responsavel: '',
  valor_mensal: undefined,
  data_inicio: '',
  data_fim: '',
  status: 'ativo',
  observacoes: '',
}

export function ContractFormDialog({
  open,
  onClose,
  contrato,
  onSaved,
}: ContractFormDialogProps) {
  const [form, setForm] = useState<AdmContratoInsert>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = Boolean(contrato?.id)

  useEffect(() => {
    if (contrato) {
      setForm({
        codigo: contrato.codigo ?? '',
        nome: contrato.nome ?? '',
        cliente_nome: contrato.cliente_nome ?? '',
        cliente_documento: contrato.cliente_documento ?? '',
        responsavel: contrato.responsavel ?? '',
        valor_mensal: contrato.valor_mensal ?? undefined,
        data_inicio: contrato.data_inicio ?? '',
        data_fim: contrato.data_fim ?? '',
        status: contrato.status ?? 'ativo',
        observacoes: contrato.observacoes ?? '',
      })
    } else {
      setForm(emptyForm)
    }
    setErrors({})
  }, [contrato, open])

  const set = (field: keyof AdmContratoInsert, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.codigo.trim()) e.codigo = 'Código é obrigatório'
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório'
    if (!form.cliente_nome.trim()) e.cliente_nome = 'Cliente é obrigatório'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload: AdmContratoInsert = {
        ...form,
        valor_mensal: form.valor_mensal ? Number(form.valor_mensal) : null,
        data_inicio: form.data_inicio || null,
        data_fim: form.data_fim || null,
        cliente_documento: form.cliente_documento || null,
        responsavel: form.responsavel || null,
        observacoes: form.observacoes || null,
      }

      let ok = false
      if (isEdit && contrato?.id) {
        ok = await updateAdmContrato(contrato.id, payload)
      } else {
        const result = await createAdmContrato(payload)
        ok = !!result
      }

      if (ok) {
        onSaved()
        onClose()
      } else {
        setErrors({ _global: 'Erro ao salvar contrato. Tente novamente.' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Erro global */}
          {errors._global && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {errors._global}
            </div>
          )}

          {/* Linha 1: Código + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="codigo">
                Código <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="codigo"
                placeholder="Ex: CTR-2025-001"
                value={form.codigo}
                onChange={(e) => set('codigo', e.target.value)}
                className={errors.codigo ? 'border-rose-400' : ''}
              />
              {errors.codigo && (
                <p className="text-xs text-rose-500">{errors.codigo}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as AdmContratoStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(ADM_STATUS_LABELS) as [AdmContratoStatus, string][]).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nome do contrato */}
          <div className="space-y-1.5">
            <Label htmlFor="nome">
              Nome do Contrato <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="nome"
              placeholder="Ex: Contrato de Serviços Logísticos — Empresa XYZ"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              className={errors.nome ? 'border-rose-400' : ''}
            />
            {errors.nome && <p className="text-xs text-rose-500">{errors.nome}</p>}
          </div>

          {/* Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cliente_nome">
                Cliente <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cliente_nome"
                placeholder="Razão social ou nome"
                value={form.cliente_nome}
                onChange={(e) => set('cliente_nome', e.target.value)}
                className={errors.cliente_nome ? 'border-rose-400' : ''}
              />
              {errors.cliente_nome && (
                <p className="text-xs text-rose-500">{errors.cliente_nome}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cliente_documento">CPF / CNPJ</Label>
              <Input
                id="cliente_documento"
                placeholder="00.000.000/0001-00"
                value={form.cliente_documento ?? ''}
                onChange={(e) => set('cliente_documento', e.target.value)}
              />
            </div>
          </div>

          {/* Responsável + Valor mensal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                placeholder="Nome do responsável"
                value={form.responsavel ?? ''}
                onChange={(e) => set('responsavel', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor_mensal">Valor Mensal (R$)</Label>
              <Input
                id="valor_mensal"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.valor_mensal ?? ''}
                onChange={(e) =>
                  set('valor_mensal', e.target.value ? parseFloat(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_inicio">Data de Início</Label>
              <Input
                id="data_inicio"
                type="date"
                value={form.data_inicio ?? ''}
                onChange={(e) => set('data_inicio', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_fim">Data de Término</Label>
              <Input
                id="data_fim"
                type="date"
                value={form.data_fim ?? ''}
                onChange={(e) => set('data_fim', e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre o contrato..."
              rows={3}
              value={form.observacoes ?? ''}
              onChange={(e) => set('observacoes', e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Salvar Alterações' : 'Criar Contrato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { createManutencao, updateManutencao } from '@/services/admManutencaoService'
import type {
  AdmManutencaoContrato,
  AdmManutencaoInsert,
  AdmManutencaoTipo,
  AdmManutencaoPrioridade,
  AdmManutencaoStatus,
} from '@/types/adm-contratos'
import {
  ADM_MANUTENCAO_TIPO_LABELS,
  ADM_MANUTENCAO_PRIORIDADE_LABELS,
  ADM_MANUTENCAO_STATUS_LABELS,
} from '@/types/adm-contratos'

interface ManutencaoDialogProps {
  open: boolean
  onClose: () => void
  contratoId: string
  manutencao?: AdmManutencaoContrato | null
  onSaved: () => void
}

const emptyForm = {
  tipo: 'ocorrencia' as AdmManutencaoTipo,
  titulo: '',
  descricao: '',
  prioridade: 'media' as AdmManutencaoPrioridade,
  status: 'aberta' as AdmManutencaoStatus,
  data_registro: '',
  data_conclusao: '',
  responsavel: '',
}

export function ManutencaoDialog({
  open,
  onClose,
  contratoId,
  manutencao,
  onSaved,
}: ManutencaoDialogProps) {
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEdit = Boolean(manutencao?.id)

  useEffect(() => {
    if (manutencao) {
      setForm({
        tipo: manutencao.tipo,
        titulo: manutencao.titulo ?? '',
        descricao: manutencao.descricao ?? '',
        prioridade: manutencao.prioridade,
        status: manutencao.status,
        data_registro: manutencao.data_registro ?? '',
        data_conclusao: manutencao.data_conclusao ?? '',
        responsavel: manutencao.responsavel ?? '',
      })
    } else {
      setForm({
        ...emptyForm,
        data_registro: new Date().toISOString().split('T')[0],
      })
    }
    setError(null)
  }, [manutencao, open])

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('Título é obrigatório'); return }

    setSaving(true)
    setError(null)
    try {
      let ok = false
      if (isEdit && manutencao?.id) {
        ok = await updateManutencao(
          manutencao.id,
          {
            tipo: form.tipo,
            titulo: form.titulo,
            descricao: form.descricao || null,
            prioridade: form.prioridade,
            status: form.status,
            data_registro: form.data_registro || undefined,
            data_conclusao: form.data_conclusao || null,
            responsavel: form.responsavel || null,
          },
          contratoId
        )
      } else {
        const payload: AdmManutencaoInsert = {
          contrato_id: contratoId,
          tipo: form.tipo,
          titulo: form.titulo,
          descricao: form.descricao || null,
          prioridade: form.prioridade,
          status: form.status,
          data_registro: form.data_registro || new Date().toISOString().split('T')[0],
          data_conclusao: form.data_conclusao || null,
          responsavel: form.responsavel || null,
          created_by: null,
        }
        const result = await createManutencao(payload)
        ok = !!result
      }

      if (ok) {
        onSaved()
        onClose()
      } else {
        setError('Erro ao salvar. Tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Editar Ocorrência' : 'Registrar Ocorrência'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {/* Tipo + Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => set('tipo', v as AdmManutencaoTipo)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(ADM_MANUTENCAO_TIPO_LABELS) as [
                      AdmManutencaoTipo,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select
                value={form.prioridade}
                onValueChange={(v) => set('prioridade', v as AdmManutencaoPrioridade)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(ADM_MANUTENCAO_PRIORIDADE_LABELS) as [
                      AdmManutencaoPrioridade,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1.5">
            <Label htmlFor="titulo">
              Título <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="titulo"
              placeholder="Descreva brevemente a ocorrência"
              value={form.titulo}
              onChange={(e) => set('titulo', e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Detalhes adicionais sobre a ocorrência..."
              rows={3}
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Status + Responsável */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set('status', v as AdmManutencaoStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(ADM_MANUTENCAO_STATUS_LABELS) as [
                      AdmManutencaoStatus,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                placeholder="Nome do responsável"
                value={form.responsavel}
                onChange={(e) => set('responsavel', e.target.value)}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_registro">Data de Registro</Label>
              <Input
                id="data_registro"
                type="date"
                value={form.data_registro}
                onChange={(e) => set('data_registro', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="data_conclusao">Data de Conclusão</Label>
              <Input
                id="data_conclusao"
                type="date"
                value={form.data_conclusao}
                onChange={(e) => set('data_conclusao', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEdit ? 'Salvar Alterações' : 'Registrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

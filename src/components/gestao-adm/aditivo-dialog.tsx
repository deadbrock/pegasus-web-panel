'use client'

import { useEffect, useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, FilePlus2, AlertTriangle } from 'lucide-react'
import {
  AdmAditivo, AdmAditivoTipo, AdmContrato,
  ADM_ADITIVO_TIPO_LABELS,
} from '@/types/adm-contratos'
import { createAditivo, updateAditivo, fetchProximoNumeroAditivo } from '@/services/admAditivosService'

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (v?: number | null) =>
  v != null
    ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : '—'

const today = () => new Date().toISOString().split('T')[0]

// ─── tipos de aditivo com ícone/cor ─────────────────────────────────────────

const TIPOS: { value: AdmAditivoTipo; label: string; desc: string }[] = [
  { value: 'valor',    label: 'Alteração de Valor',    desc: 'Reajuste ou redução do valor mensal contratual' },
  { value: 'prazo',    label: 'Prorrogação de Prazo',  desc: 'Extensão ou alteração da data de vigência' },
  { value: 'escopo',   label: 'Alteração de Escopo',   desc: 'Mudança no objeto, serviços ou obrigações do contrato' },
  { value: 'rescisao', label: 'Rescisão Amigável',     desc: 'Encerramento antecipado por mútuo acordo' },
  { value: 'outros',   label: 'Outros',                desc: 'Demais alterações contratuais' },
]

// ─── tipos ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  contrato: AdmContrato
  aditivo?: AdmAditivo | null     // null = novo
  onSaved: (a: AdmAditivo) => void
}

interface FormState {
  numero_aditivo: number
  tipo: AdmAditivoTipo
  data_assinatura: string
  data_vigencia: string
  objeto: string
  descricao: string
  aprovado_por: string
  // valor
  valor_anterior: string
  valor_novo: string
  // prazo
  data_fim_anterior: string
  data_fim_nova: string
  status: 'ativo' | 'cancelado'
}

const emptyForm = (nextNum: number, contrato: AdmContrato): FormState => ({
  numero_aditivo:    nextNum,
  tipo:              'valor',
  data_assinatura:   today(),
  data_vigencia:     '',
  objeto:            '',
  descricao:         '',
  aprovado_por:      '',
  valor_anterior:    contrato.valor_mensal?.toString() ?? '',
  valor_novo:        '',
  data_fim_anterior: contrato.data_fim ?? '',
  data_fim_nova:     '',
  status:            'ativo',
})

// ─── component ──────────────────────────────────────────────────────────────

export function AditivoDialog({ open, onClose, contrato, aditivo, onSaved }: Props) {
  const isEdit = !!aditivo
  const [form, setForm] = useState<FormState>(emptyForm(1, contrato))
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [loadingNum, setLoadingNum] = useState(false)

  // ── carregar dados iniciais ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return

    if (aditivo) {
      setForm({
        numero_aditivo:    aditivo.numero_aditivo,
        tipo:              aditivo.tipo,
        data_assinatura:   aditivo.data_assinatura,
        data_vigencia:     aditivo.data_vigencia ?? '',
        objeto:            aditivo.objeto,
        descricao:         aditivo.descricao ?? '',
        aprovado_por:      aditivo.aprovado_por ?? '',
        valor_anterior:    aditivo.valor_anterior?.toString() ?? '',
        valor_novo:        aditivo.valor_novo?.toString() ?? '',
        data_fim_anterior: aditivo.data_fim_anterior ?? '',
        data_fim_nova:     aditivo.data_fim_nova ?? '',
        status:            aditivo.status,
      })
    } else {
      setLoadingNum(true)
      fetchProximoNumeroAditivo(contrato.id)
        .then((n) => setForm(emptyForm(n, contrato)))
        .finally(() => setLoadingNum(false))
    }
    setErrors({})
  }, [open, aditivo, contrato])

  const set = (field: keyof FormState, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  // ── quando muda tipo, preenche campos automáticos ─────────────────────────
  const handleTipo = (tipo: AdmAditivoTipo) => {
    setForm((prev) => ({
      ...prev,
      tipo,
      valor_anterior:    tipo === 'valor' ? (contrato.valor_mensal?.toString() ?? '') : prev.valor_anterior,
      data_fim_anterior: tipo === 'prazo' ? (contrato.data_fim ?? '') : prev.data_fim_anterior,
    }))
  }

  // ── validação ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.objeto.trim())         e.objeto         = 'Informe o objeto do aditivo'
    if (!form.data_assinatura)       e.data_assinatura = 'Informe a data de assinatura'
    if (form.tipo === 'valor') {
      if (!form.valor_novo)          e.valor_novo  = 'Informe o novo valor'
      if (isNaN(Number(form.valor_novo.replace(',', '.')))) e.valor_novo = 'Valor inválido'
    }
    if (form.tipo === 'prazo') {
      if (!form.data_fim_nova)       e.data_fim_nova = 'Informe a nova data de fim'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── submit ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

    const parseVal = (s: string) => {
      const n = parseFloat(s.replace(',', '.'))
      return isNaN(n) ? null : n
    }

    const payload = {
      contrato_id:       contrato.id,
      numero_aditivo:    form.numero_aditivo,
      tipo:              form.tipo,
      data_assinatura:   form.data_assinatura,
      data_vigencia:     form.data_vigencia || null,
      objeto:            form.objeto.trim(),
      descricao:         form.descricao.trim() || null,
      aprovado_por:      form.aprovado_por.trim() || null,
      status:            form.status,
      // valor
      valor_anterior:    form.tipo === 'valor' ? parseVal(form.valor_anterior) : null,
      valor_novo:        form.tipo === 'valor' ? parseVal(form.valor_novo)     : null,
      // prazo
      data_fim_anterior: form.tipo === 'prazo' ? (form.data_fim_anterior || null) : null,
      data_fim_nova:     form.tipo === 'prazo' ? (form.data_fim_nova || null)     : null,
    }

    try {
      if (isEdit && aditivo) {
        const ok = await updateAditivo(aditivo.id, payload)
        if (ok) onSaved({ ...aditivo, ...payload, updated_at: new Date().toISOString() } as AdmAditivo)
        else alert('Não foi possível salvar o aditivo.')
      } else {
        const result = await createAditivo(payload)
        if (result) onSaved(result)
        else alert('Não foi possível criar o aditivo.')
      }
    } finally {
      setSaving(false)
    }
  }

  // ── render ────────────────────────────────────────────────────────────────
  const ordinal = (n: number) => `${n}º Aditivo`
  const inputCls = (field?: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors
    ${field ? 'border-rose-400 focus:ring-1 focus:ring-rose-400' : 'border-slate-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-200'}`

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FilePlus2 className="w-5 h-5 text-violet-600" />
            {isEdit
              ? `Editar ${ordinal(form.numero_aditivo)} — ${contrato.nome}`
              : loadingNum
                ? 'Carregando...'
                : `Novo ${ordinal(form.numero_aditivo)} — ${contrato.nome}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">

          {/* ── Tipo do aditivo ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Tipo de Aditivo *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTipo(t.value)}
                  className={`flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border-2 text-left transition-all
                    ${form.tipo === t.value
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                >
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-xs text-slate-500 leading-snug">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Cabeçalho ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Número do Aditivo</label>
              <input
                type="number" min={1}
                value={form.numero_aditivo}
                onChange={(e) => set('numero_aditivo', parseInt(e.target.value) || 1)}
                className={inputCls()}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de Assinatura *</label>
              <input
                type="date"
                value={form.data_assinatura}
                onChange={(e) => set('data_assinatura', e.target.value)}
                className={inputCls(errors.data_assinatura)}
              />
              {errors.data_assinatura && <p className="text-xs text-rose-500 mt-0.5">{errors.data_assinatura}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de Vigência</label>
              <input
                type="date"
                value={form.data_vigencia}
                onChange={(e) => set('data_vigencia', e.target.value)}
                className={inputCls()}
              />
              <p className="text-[11px] text-slate-400 mt-0.5">Quando o aditivo entra em vigor (opcional)</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Aprovado por</label>
              <input
                type="text"
                placeholder="Nome do aprovador"
                value={form.aprovado_por}
                onChange={(e) => set('aprovado_por', e.target.value)}
                className={inputCls()}
              />
            </div>
          </div>

          {/* ── Campos específicos por tipo ── */}
          {form.tipo === 'valor' && (
            <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Alteração de Valor</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valor Anterior (R$)</label>
                  <input
                    type="number" step="0.01" min="0"
                    placeholder="0,00"
                    value={form.valor_anterior}
                    onChange={(e) => set('valor_anterior', e.target.value)}
                    className={inputCls()}
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Atual: {fmt(contrato.valor_mensal)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Novo Valor (R$) *</label>
                  <input
                    type="number" step="0.01" min="0"
                    placeholder="0,00"
                    value={form.valor_novo}
                    onChange={(e) => set('valor_novo', e.target.value)}
                    className={inputCls(errors.valor_novo)}
                  />
                  {errors.valor_novo && <p className="text-xs text-rose-500 mt-0.5">{errors.valor_novo}</p>}
                </div>
              </div>
              {form.valor_anterior && form.valor_novo && !isNaN(Number(form.valor_novo)) && (
                <div className="flex items-center gap-2 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs text-amber-700">
                    Variação: {(((Number(form.valor_novo) - Number(form.valor_anterior)) / Number(form.valor_anterior)) * 100).toFixed(2)}%
                    ({Number(form.valor_novo) >= Number(form.valor_anterior) ? '+' : ''}
                    {fmt(Number(form.valor_novo) - Number(form.valor_anterior))})
                  </p>
                </div>
              )}
            </div>
          )}

          {form.tipo === 'prazo' && (
            <div className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Prorrogação de Prazo</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Data Fim Anterior</label>
                  <input
                    type="date"
                    value={form.data_fim_anterior}
                    onChange={(e) => set('data_fim_anterior', e.target.value)}
                    className={inputCls()}
                  />
                  <p className="text-[11px] text-slate-400 mt-0.5">Atual: {contrato.data_fim ?? 'Não definida'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nova Data Fim *</label>
                  <input
                    type="date"
                    value={form.data_fim_nova}
                    onChange={(e) => set('data_fim_nova', e.target.value)}
                    className={inputCls(errors.data_fim_nova)}
                  />
                  {errors.data_fim_nova && <p className="text-xs text-rose-500 mt-0.5">{errors.data_fim_nova}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Objeto ── */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Objeto do Aditivo *</label>
            <textarea
              rows={2}
              placeholder="Descreva o objeto / finalidade deste aditivo…"
              value={form.objeto}
              onChange={(e) => set('objeto', e.target.value)}
              className={`${inputCls(errors.objeto)} resize-none`}
            />
            {errors.objeto && <p className="text-xs text-rose-500 mt-0.5">{errors.objeto}</p>}
          </div>

          {/* ── Descrição ── */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Detalhamento / Justificativa</label>
            <textarea
              rows={3}
              placeholder="Contexto adicional, motivações, cláusulas relevantes…"
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              className={`${inputCls()} resize-none`}
            />
          </div>

          {/* ── Status (apenas em edição) ── */}
          {isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className={inputCls()}
              >
                <option value="ativo">Ativo</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            onClick={handleSave}
            disabled={saving || loadingNum}
            className="bg-violet-600 hover:bg-violet-700 text-white border-0 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus2 className="w-4 h-4" />}
            {saving ? 'Salvando…' : isEdit ? 'Salvar Alterações' : 'Criar Aditivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

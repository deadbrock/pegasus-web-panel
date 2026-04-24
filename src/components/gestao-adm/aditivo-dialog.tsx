'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Loader2, FilePlus2, AlertTriangle, Plus, Trash2,
  Users, Package, DollarSign, ChevronDown, ChevronUp,
  Settings2, Check, X,
} from 'lucide-react'
import {
  AdmAditivo, AdmAditivoTipo, AdmContrato, AdmTipoServico,
  AdmQuadroFuncionario, AdmTurno,
  ADM_ADITIVO_TIPO_LABELS, ADM_TURNO_LABELS, quadroItemTotal,
} from '@/types/adm-contratos'
import { createAditivo, updateAditivo, fetchProximoNumeroAditivo } from '@/services/admAditivosService'
import { fetchTiposServico, createTipoServico } from '@/services/admTiposServicoService'
import { cn } from '@/lib/utils'

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (v?: number | null) =>
  v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

const today = () => new Date().toISOString().split('T')[0]

const parseNum = (s: string) => {
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'))
  return isNaN(n) ? null : n
}

// ─── tipos de aditivo ────────────────────────────────────────────────────────

const TIPOS: { value: AdmAditivoTipo; label: string; desc: string }[] = [
  { value: 'valor',    label: 'Alteração de Valor',    desc: 'Reajuste ou redução do valor mensal' },
  { value: 'prazo',    label: 'Prorrogação de Prazo',  desc: 'Extensão ou alteração da vigência' },
  { value: 'escopo',   label: 'Alteração de Escopo',   desc: 'Mudança no objeto ou serviços' },
  { value: 'rescisao', label: 'Rescisão Amigável',     desc: 'Encerramento antecipado consensual' },
  { value: 'outros',   label: 'Outros',                desc: 'Demais alterações contratuais' },
]

const TURNOS: AdmTurno[] = ['diurno', 'noturno', '12x36', '44h', 'outros']

// ─── form state ──────────────────────────────────────────────────────────────

interface QuadroRow extends AdmQuadroFuncionario {
  _key: string
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
  // escopo
  tipos_servico_ids: string[]
  tipos_servico_nomes: string[]
  escopo_descricao: string
  valor_materiais: string
  per_capita: string
  valor_mensal_total: string
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
  tipos_servico_ids:   [],
  tipos_servico_nomes: [],
  escopo_descricao:  '',
  valor_materiais:   '',
  per_capita:        '',
  valor_mensal_total:'',
})

const emptyRow = (): QuadroRow => ({
  _key: crypto.randomUUID(),
  funcao: '',
  quantidade: 1,
  valor_unitario: 0,
  turno: 'diurno',
})

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  open: boolean
  onClose: () => void
  contrato: AdmContrato
  aditivo?: AdmAditivo | null
  onSaved: (a: AdmAditivo) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AditivoDialog({ open, onClose, contrato, aditivo, onSaved }: Props) {
  const isEdit = !!aditivo

  const [form, setForm] = useState<FormState>(emptyForm(1, contrato))
  const [quadro, setQuadro] = useState<QuadroRow[]>([])
  const [tiposServico, setTiposServico] = useState<AdmTipoServico[]>([])
  const [saving, setSaving] = useState(false)
  const [loadingNum, setLoadingNum] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})

  // Painel de novo tipo de serviço
  const [novoTipoNome, setNovoTipoNome] = useState('')
  const [novoTipoDesc, setNovoTipoDesc] = useState('')
  const [addingTipo, setAddingTipo] = useState(false)
  const [savingTipo, setSavingTipo] = useState(false)

  // Seção escopo expandida
  const [escopoOpen, setEscopoOpen] = useState(true)

  // ── Carregar tipos de serviço ───────────────────────────────────────────────
  const loadTipos = useCallback(async () => {
    const data = await fetchTiposServico()
    setTiposServico(data)
  }, [])

  // ── Inicializar form ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    loadTipos()

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
        tipos_servico_ids:   aditivo.tipos_servico_ids   ?? [],
        tipos_servico_nomes: aditivo.tipos_servico_nomes ?? [],
        escopo_descricao:  aditivo.escopo_descricao ?? '',
        valor_materiais:   aditivo.valor_materiais?.toString() ?? '',
        per_capita:        aditivo.per_capita?.toString() ?? '',
        valor_mensal_total:aditivo.valor_mensal_total?.toString() ?? '',
      })
      setQuadro(
        (aditivo.quadro_funcionarios ?? []).map((r) => ({ ...r, _key: crypto.randomUUID() }))
      )
    } else {
      setLoadingNum(true)
      fetchProximoNumeroAditivo(contrato.id)
        .then((n) => setForm(emptyForm(n, contrato)))
        .finally(() => setLoadingNum(false))
      setQuadro([])
    }
    setErrors({})
    setAddingTipo(false)
    setNovoTipoNome('')
    setNovoTipoDesc('')
  }, [open, aditivo, contrato, loadTipos])

  const set = (field: keyof FormState, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleTipo = (tipo: AdmAditivoTipo) => {
    setForm((prev) => ({
      ...prev,
      tipo,
      valor_anterior:    tipo === 'valor' ? (contrato.valor_mensal?.toString() ?? '') : prev.valor_anterior,
      data_fim_anterior: tipo === 'prazo' ? (contrato.data_fim ?? '') : prev.data_fim_anterior,
    }))
  }

  // ── Quadro de funcionários ──────────────────────────────────────────────────
  const addRow = () => setQuadro((prev) => [...prev, emptyRow()])

  const updateRow = (key: string, field: keyof AdmQuadroFuncionario, value: string | number) =>
    setQuadro((prev) =>
      prev.map((r) => r._key === key ? { ...r, [field]: value } : r)
    )

  const removeRow = (key: string) =>
    setQuadro((prev) => prev.filter((r) => r._key !== key))

  // ── Calcular totais ─────────────────────────────────────────────────────────
  const totalQuadro = quadro.reduce((s, r) => s + quadroItemTotal(r), 0)
  const totalFuncionarios = quadro.reduce((s, r) => s + (r.quantidade || 0), 0)
  const materiaisNum = parseNum(form.valor_materiais) ?? 0
  const totalServico = totalQuadro + materiaisNum

  // Per capita automático
  const perCapitaCalc = totalFuncionarios > 0 ? totalServico / totalFuncionarios : 0

  // ── Sincronizar valor_mensal_total e per_capita automaticamente ──────────────
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      // total mensal = mão de obra + materiais
      ...(quadro.length > 0 || materiaisNum > 0
        ? { valor_mensal_total: totalServico.toFixed(2) }
        : {}),
      // per capita = custo de mão de obra por funcionário
      ...(totalFuncionarios > 0
        ? { per_capita: String(Math.round((totalQuadro / totalFuncionarios) * 100) / 100) }
        : {}),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalQuadro, totalFuncionarios, totalServico])

  // ── Novo tipo de serviço ────────────────────────────────────────────────────
  const handleSaveTipo = async () => {
    if (!novoTipoNome.trim()) return
    setSavingTipo(true)
    const created = await createTipoServico(novoTipoNome, novoTipoDesc)
    setSavingTipo(false)
    if (created) {
      setTiposServico((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)))
      setForm((prev) => ({
        ...prev,
        tipos_servico_ids:   [...(prev.tipos_servico_ids ?? []), created.id],
        tipos_servico_nomes: [...(prev.tipos_servico_nomes ?? []), created.nome],
      }))
      setAddingTipo(false)
      setNovoTipoNome('')
      setNovoTipoDesc('')
    }
  }

  const toggleTipoServico = (id: string, nome: string) => {
    setForm((prev) => {
      const ids   = prev.tipos_servico_ids   ?? []
      const nomes = prev.tipos_servico_nomes ?? []
      if (ids.includes(id)) {
        return { ...prev, tipos_servico_ids: ids.filter((x) => x !== id), tipos_servico_nomes: nomes.filter((x) => x !== nome) }
      }
      return { ...prev, tipos_servico_ids: [...ids, id], tipos_servico_nomes: [...nomes, nome] }
    })
  }

  // ── Validação ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.objeto.trim())   e.objeto = 'Informe o objeto do aditivo'
    if (!form.data_assinatura) e.data_assinatura = 'Informe a data de assinatura'
    if (form.tipo === 'valor' && !form.valor_novo)   e.valor_novo = 'Informe o novo valor'
    if (form.tipo === 'prazo' && !form.data_fim_nova) e.data_fim_nova = 'Informe a nova data de fim'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Salvar ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)

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
      valor_anterior:    form.tipo === 'valor' ? parseNum(form.valor_anterior) : null,
      valor_novo:        form.tipo === 'valor' ? parseNum(form.valor_novo)     : null,
      data_fim_anterior: form.tipo === 'prazo' ? (form.data_fim_anterior || null) : null,
      data_fim_nova:     form.tipo === 'prazo' ? (form.data_fim_nova || null)     : null,
      // escopo
      tipos_servico_ids:   form.tipos_servico_ids?.length   ? form.tipos_servico_ids   : null,
      tipos_servico_nomes: form.tipos_servico_nomes?.length ? form.tipos_servico_nomes : null,
      escopo_descricao:  form.escopo_descricao.trim() || null,
      valor_materiais:   parseNum(form.valor_materiais),
      per_capita:        form.per_capita ? parseNum(form.per_capita) : (perCapitaCalc > 0 ? perCapitaCalc : null),
      valor_mensal_total:parseNum(form.valor_mensal_total),
      quadro_funcionarios: quadro.map(({ _key: _, ...r }) => r),
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

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputCls = (err?: string) => cn(
    'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors',
    err
      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
      : 'border-slate-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-200'
  )

  const ordinal = (n: number) => `${n}º Aditivo`

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <FilePlus2 className="w-5 h-5 text-violet-600" />
            {isEdit
              ? `Editar ${ordinal(form.numero_aditivo)} — ${contrato.nome}`
              : loadingNum ? 'Carregando…'
              : `Novo ${ordinal(form.numero_aditivo)} — ${contrato.nome}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-1">

          {/* ══ Tipo do aditivo ══════════════════════════════════════════════ */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Tipo de Aditivo *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIPOS.map((t) => (
                <button key={t.value} type="button" onClick={() => handleTipo(t.value)}
                  className={cn(
                    'flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all',
                    form.tipo === t.value
                      ? 'border-violet-500 bg-violet-50 text-violet-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  )}>
                  <span className="text-sm font-semibold">{t.label}</span>
                  <span className="text-[11px] text-slate-500 leading-tight">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ══ Dados gerais ═════════════════════════════════════════════════ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Número do Aditivo</label>
              <input type="number" min={1} value={form.numero_aditivo}
                onChange={(e) => set('numero_aditivo', parseInt(e.target.value) || 1)}
                className={inputCls()} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de Assinatura *</label>
              <input type="date" value={form.data_assinatura}
                onChange={(e) => set('data_assinatura', e.target.value)}
                className={inputCls(errors.data_assinatura)} />
              {errors.data_assinatura && <p className="text-xs text-rose-500 mt-0.5">{errors.data_assinatura}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Data de Vigência</label>
              <input type="date" value={form.data_vigencia}
                onChange={(e) => set('data_vigencia', e.target.value)}
                className={inputCls()} />
              <p className="text-[11px] text-slate-400 mt-0.5">Quando o aditivo entra em vigor</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Aprovado por</label>
              <input type="text" placeholder="Nome do aprovador" value={form.aprovado_por}
                onChange={(e) => set('aprovado_por', e.target.value)}
                className={inputCls()} />
            </div>
          </div>

          {/* ══ Campos específicos por tipo ══════════════════════════════════ */}
          {form.tipo === 'valor' && (
            <div className="border border-blue-200 bg-blue-50/60 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Alteração de Valor</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Valor Anterior (R$)</label>
                  <input type="number" step="0.01" min="0" placeholder="0,00"
                    value={form.valor_anterior}
                    onChange={(e) => set('valor_anterior', e.target.value)}
                    className={inputCls()} />
                  <p className="text-[11px] text-slate-400 mt-0.5">Atual: {fmt(contrato.valor_mensal)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Novo Valor (R$) *</label>
                  <input type="number" step="0.01" min="0" placeholder="0,00"
                    value={form.valor_novo}
                    onChange={(e) => set('valor_novo', e.target.value)}
                    className={inputCls(errors.valor_novo)} />
                  {errors.valor_novo && <p className="text-xs text-rose-500 mt-0.5">{errors.valor_novo}</p>}
                </div>
              </div>
              {form.valor_anterior && form.valor_novo && !isNaN(Number(form.valor_novo)) && (
                <div className="flex items-center gap-2 pt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <p className="text-xs text-amber-700">
                    Variação: {(((Number(form.valor_novo) - Number(form.valor_anterior)) / Number(form.valor_anterior)) * 100).toFixed(2)}%
                    &nbsp;({Number(form.valor_novo) >= Number(form.valor_anterior) ? '+' : ''}{fmt(Number(form.valor_novo) - Number(form.valor_anterior))})
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
                  <input type="date" value={form.data_fim_anterior}
                    onChange={(e) => set('data_fim_anterior', e.target.value)}
                    className={inputCls()} />
                  <p className="text-[11px] text-slate-400 mt-0.5">Atual: {contrato.data_fim ?? 'Não definida'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nova Data Fim *</label>
                  <input type="date" value={form.data_fim_nova}
                    onChange={(e) => set('data_fim_nova', e.target.value)}
                    className={inputCls(errors.data_fim_nova)} />
                  {errors.data_fim_nova && <p className="text-xs text-rose-500 mt-0.5">{errors.data_fim_nova}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ══ Objeto ═══════════════════════════════════════════════════════ */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Objeto do Aditivo *</label>
            <textarea rows={2} placeholder="Descreva o objeto / finalidade deste aditivo…"
              value={form.objeto} onChange={(e) => set('objeto', e.target.value)}
              className={cn(inputCls(errors.objeto), 'resize-none')} />
            {errors.objeto && <p className="text-xs text-rose-500 mt-0.5">{errors.objeto}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Detalhamento / Justificativa</label>
            <textarea rows={2} placeholder="Contexto, motivações, cláusulas relevantes…"
              value={form.descricao} onChange={(e) => set('descricao', e.target.value)}
              className={cn(inputCls(), 'resize-none')} />
          </div>

          {/* ══ SEÇÃO ESCOPO DO SERVIÇO ═══════════════════════════════════════ */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {/* Header colapsável */}
            <button
              type="button"
              onClick={() => setEscopoOpen((p) => !p)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-semibold text-slate-800">Escopo do Serviço</span>
                <span className="text-xs text-slate-400">(opcional)</span>
              </div>
              {escopoOpen
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {escopoOpen && (
              <div className="p-4 space-y-5">

                {/* Tipo de serviço */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Tipo de Serviço
                  </label>

                  {/* Grid de tipos */}
                  <div className="flex flex-wrap gap-2 mb-2">
                  <p className="text-xs text-slate-400 mb-1 w-full">
                    Selecione um ou mais tipos. Clique novamente para desmarcar.
                  </p>
                  {tiposServico.map((t) => {
                    const sel = (form.tipos_servico_ids ?? []).includes(t.id)
                    return (
                      <button key={t.id} type="button"
                        onClick={() => toggleTipoServico(t.id, t.nome)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                          sel
                            ? 'border-violet-500 bg-violet-100 text-violet-800'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        )}>
                        {sel && <Check className="w-3.5 h-3.5" />}
                        {t.nome}
                      </button>
                    )
                  })}
                  {(form.tipos_servico_ids ?? []).length > 0 && (
                    <button type="button"
                      onClick={() => setForm((p) => ({ ...p, tipos_servico_ids: [], tipos_servico_nomes: [] }))}
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors">
                      <X className="w-3 h-3" />Limpar
                    </button>
                  )}
                  </div>

                  {/* Adicionar novo tipo */}
                  {!addingTipo ? (
                    <button type="button" onClick={() => setAddingTipo(true)}
                      className="flex items-center gap-1 text-xs text-violet-600 hover:underline font-medium">
                      <Plus className="w-3.5 h-3.5" />Adicionar tipo personalizado
                    </button>
                  ) : (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text" autoFocus placeholder="Nome do tipo (ex: GARÇOM)"
                          value={novoTipoNome} onChange={(e) => setNovoTipoNome(e.target.value.toUpperCase())}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none"
                        />
                        <input
                          type="text" placeholder="Descrição (opcional)"
                          value={novoTipoDesc} onChange={(e) => setNovoTipoDesc(e.target.value)}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Button size="sm" disabled={savingTipo || !novoTipoNome.trim()}
                          onClick={handleSaveTipo}
                          className="h-7 bg-violet-600 hover:bg-violet-700 text-white border-0">
                          {savingTipo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </Button>
                        <Button size="sm" variant="outline"
                          onClick={() => { setAddingTipo(false); setNovoTipoNome(''); setNovoTipoDesc('') }}
                          className="h-7">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Escopo descritivo */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Descrição do Escopo</label>
                  <textarea rows={3}
                    placeholder="Detalhe as atividades, responsabilidades, locais de atuação, frequência…"
                    value={form.escopo_descricao}
                    onChange={(e) => set('escopo_descricao', e.target.value)}
                    className={cn(inputCls(), 'resize-none')} />
                </div>

                {/* ── Quadro de Funcionários ── */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-500" />
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Quadro de Funcionários
                      </label>
                    </div>
                    <Button type="button" size="sm" variant="outline"
                      onClick={addRow}
                      className="h-7 gap-1 text-xs text-violet-700 border-violet-200 hover:bg-violet-50">
                      <Plus className="w-3.5 h-3.5" />Adicionar Função
                    </Button>
                  </div>

                  {quadro.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center">
                      <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Nenhuma função adicionada</p>
                      <button type="button" onClick={addRow}
                        className="text-xs text-violet-600 hover:underline mt-1 font-medium">
                        + Adicionar primeira função
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_80px_120px_120px_36px] gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide px-1">
                        <span>Função</span>
                        <span>Qtd.</span>
                        <span>Turno</span>
                        <span>Valor Unit.</span>
                        <span />
                      </div>
                      {quadro.map((row) => (
                        <div key={row._key}
                          className="grid grid-cols-[1fr_80px_120px_120px_36px] gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                          <input
                            type="text" placeholder="Ex: ASG, Vigia, Copeiro…"
                            value={row.funcao}
                            onChange={(e) => updateRow(row._key, 'funcao', e.target.value)}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none"
                          />
                          <input
                            type="number" min="1"
                            value={row.quantidade}
                            onChange={(e) => updateRow(row._key, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none text-center"
                          />
                          <select
                            value={row.turno}
                            onChange={(e) => updateRow(row._key, 'turno', e.target.value as AdmTurno)}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none">
                            {TURNOS.map((t) => (
                              <option key={t} value={t}>{ADM_TURNO_LABELS[t]}</option>
                            ))}
                          </select>
                          <input
                            type="number" min="0" step="0.01" placeholder="0,00"
                            value={row.valor_unitario || ''}
                            onChange={(e) => updateRow(row._key, 'valor_unitario', parseFloat(e.target.value) || 0)}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none text-right"
                          />
                          <button type="button" onClick={() => removeRow(row._key)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Subtotal quadro */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 mt-1">
                        <span className="text-xs text-slate-600">
                          <strong className="text-slate-800">{totalFuncionarios}</strong> funcionário(s)
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                          Subtotal: <span className="text-violet-700">{fmt(totalQuadro)}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Materiais + Per Capita + Valor Total ── */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />Materiais / Insumos (R$)
                    </label>
                    <input type="number" min="0" step="0.01" placeholder="0,00"
                      value={form.valor_materiais}
                      onChange={(e) => set('valor_materiais', e.target.value)}
                      className={inputCls()} />
                    <p className="text-[11px] text-slate-400 mt-0.5">Custo de materiais de consumo</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />Per Capita (R$)
                    </label>
                    <input type="number" min="0" step="0.01" placeholder="0,00"
                      value={form.per_capita}
                      onChange={(e) => set('per_capita', e.target.value)}
                      className={inputCls()} />
                    {perCapitaCalc > 0 && !form.per_capita && (
                      <p className="text-[11px] text-violet-600 mt-0.5 font-medium">
                        Calculado: {fmt(perCapitaCalc)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />Valor Mensal Total (R$)
                    </label>
                    <input type="number" min="0" step="0.01" placeholder="0,00"
                      value={form.valor_mensal_total}
                      onChange={(e) => set('valor_mensal_total', e.target.value)}
                      className={inputCls()} />
                    {(quadro.length > 0 || materiaisNum > 0) && (
                      <p className="text-[11px] text-violet-600 mt-0.5 font-medium">
                        Calculado: {fmt(totalServico)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resumo financeiro */}
                {(quadro.length > 0 || materiaisNum > 0) && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-violet-500 mb-0.5">Mão de Obra</p>
                      <p className="text-sm font-bold text-violet-800">{fmt(totalQuadro)}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-amber-500 mb-0.5">Materiais</p>
                      <p className="text-sm font-bold text-amber-800">{fmt(materiaisNum)}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                      <p className="text-[11px] text-emerald-500 mb-0.5">Total Mensal</p>
                      <p className="text-sm font-bold text-emerald-800">{fmt(totalServico)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status (apenas em edição) */}
          {isEdit && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls()}>
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
            className="bg-violet-600 hover:bg-violet-700 text-white border-0 gap-2">
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <FilePlus2 className="w-4 h-4" />}
            {saving ? 'Salvando…' : isEdit ? 'Salvar Alterações' : 'Criar Aditivo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

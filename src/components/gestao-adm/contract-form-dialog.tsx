'use client'

import { useEffect, useState, useCallback } from 'react'
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
import {
  Loader2, FileText, User, MapPin, CheckCircle2,
  Settings2, Users, Package, DollarSign, Plus, Trash2,
  Check, X,
} from 'lucide-react'
import { createAdmContrato, updateAdmContrato } from '@/services/admContratosService'
import { fetchTiposServico, createTipoServico } from '@/services/admTiposServicoService'
import type {
  AdmContrato, AdmContratoInsert, AdmContratoStatus,
  AdmTipoServico, AdmQuadroFuncionario, AdmTurno,
} from '@/types/adm-contratos'
import {
  ADM_STATUS_LABELS, ADM_TURNO_LABELS, quadroItemTotal,
} from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type TabId = 'contrato' | 'escopo' | 'cliente' | 'aprovacao'
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'contrato',  label: 'Contrato',  icon: FileText },
  { id: 'escopo',    label: 'Escopo',    icon: Settings2 },
  { id: 'cliente',   label: 'Cliente',   icon: User },
  { id: 'aprovacao', label: 'Aprovação', icon: CheckCircle2 },
]

const TAB_ORDER: TabId[] = ['contrato', 'escopo', 'cliente', 'aprovacao']

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (v?: number | null) =>
  v != null ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'

interface QuadroRow extends AdmQuadroFuncionario { _key: string }
const emptyRow = (): QuadroRow => ({
  _key: crypto.randomUUID(), funcao: '', quantidade: 1, valor_unitario: 0, turno: 'diurno',
})
const TURNOS: AdmTurno[] = ['diurno', 'noturno', '12x36', '44h', 'outros']

// ─── Estado inicial ───────────────────────────────────────────────────────────
const emptyForm = (): AdmContratoInsert => ({
  codigo: '', nome: '', cliente_nome: '', cliente_documento: '',
  cliente_email: '', cliente_telefone: '', cliente_contato: '',
  cliente_cep: '', cliente_endereco: '', cliente_numero: '',
  cliente_complemento: '', cliente_bairro: '', cliente_cidade: '', cliente_uf: '',
  aprovado_por: '', data_aprovacao: '',
  responsavel: '', valor_mensal: undefined,
  data_inicio: '', data_fim: '',
  status: 'ativo', observacoes: '',
  tipos_servico_ids: [], tipos_servico_nomes: [],
  escopo_descricao: null, valor_materiais: null,
  per_capita: null, valor_mensal_escopo: null,
  quadro_funcionarios: [],
})

// ─── Props ────────────────────────────────────────────────────────────────────
interface ContractFormDialogProps {
  open: boolean
  onClose: () => void
  contrato?: AdmContrato | null
  onSaved: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ContractFormDialog({ open, onClose, contrato, onSaved }: ContractFormDialogProps) {
  const [tab, setTab]       = useState<TabId>('contrato')
  const [form, setForm]     = useState<AdmContratoInsert>(emptyForm())
  const [quadro, setQuadro] = useState<QuadroRow[]>([])
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tipos de serviço
  const [tiposServico, setTiposServico]   = useState<AdmTipoServico[]>([])
  const [addingTipo, setAddingTipo]       = useState(false)
  const [novoTipoNome, setNovoTipoNome]   = useState('')
  const [novoTipoDesc, setNovoTipoDesc]   = useState('')
  const [savingTipo, setSavingTipo]       = useState(false)

  const isEdit = Boolean(contrato?.id)

  const loadTipos = useCallback(async () => {
    const data = await fetchTiposServico()
    setTiposServico(data)
  }, [])

  useEffect(() => {
    if (!open) return
    setTab('contrato')
    setErrors({})
    loadTipos()

    if (contrato) {
      setForm({
        codigo: contrato.codigo ?? '',
        nome: contrato.nome ?? '',
        cliente_nome: contrato.cliente_nome ?? '',
        cliente_documento: contrato.cliente_documento ?? '',
        cliente_email: contrato.cliente_email ?? '',
        cliente_telefone: contrato.cliente_telefone ?? '',
        cliente_contato: contrato.cliente_contato ?? '',
        cliente_cep: contrato.cliente_cep ?? '',
        cliente_endereco: contrato.cliente_endereco ?? '',
        cliente_numero: contrato.cliente_numero ?? '',
        cliente_complemento: contrato.cliente_complemento ?? '',
        cliente_bairro: contrato.cliente_bairro ?? '',
        cliente_cidade: contrato.cliente_cidade ?? '',
        cliente_uf: contrato.cliente_uf ?? '',
        aprovado_por: contrato.aprovado_por ?? '',
        data_aprovacao: contrato.data_aprovacao ?? '',
        responsavel: contrato.responsavel ?? '',
        valor_mensal: contrato.valor_mensal ?? undefined,
        data_inicio: contrato.data_inicio ?? '',
        data_fim: contrato.data_fim ?? '',
        status: contrato.status ?? 'ativo',
        observacoes: contrato.observacoes ?? '',
        tipos_servico_ids:   contrato.tipos_servico_ids   ?? [],
        tipos_servico_nomes: contrato.tipos_servico_nomes ?? [],
        escopo_descricao:    contrato.escopo_descricao   ?? null,
        valor_materiais:    contrato.valor_materiais    ?? null,
        per_capita:         contrato.per_capita         ?? null,
        valor_mensal_escopo:contrato.valor_mensal_escopo?? null,
        quadro_funcionarios:contrato.quadro_funcionarios?? [],
      })
      setQuadro(
        (contrato.quadro_funcionarios ?? []).map((r) => ({ ...r, _key: crypto.randomUUID() }))
      )
    } else {
      setForm(emptyForm())
      setQuadro([])
    }
    setAddingTipo(false)
    setNovoTipoNome('')
    setNovoTipoDesc('')
  }, [contrato, open, loadTipos])

  const set = (field: keyof AdmContratoInsert, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[field as string]; return n })
  }

  // ── Quadro ───────────────────────────────────────────────────────────────────
  const addRow    = () => setQuadro((p) => [...p, emptyRow()])
  const removeRow = (key: string) => setQuadro((p) => p.filter((r) => r._key !== key))
  const updateRow = (key: string, field: keyof AdmQuadroFuncionario, value: string | number) =>
    setQuadro((p) => p.map((r) => r._key === key ? { ...r, [field]: value } : r))

  const totalQuadro       = quadro.reduce((s, r) => s + quadroItemTotal(r), 0)
  const totalFuncionarios = quadro.reduce((s, r) => s + (r.quantidade || 0), 0)
  const materiaisNum      = Number(form.valor_materiais) || 0
  const totalServico      = totalQuadro + materiaisNum
  const perCapitaCalc     = totalFuncionarios > 0 ? totalServico / totalFuncionarios : 0

  // Sincronizar valor_mensal_escopo e per_capita automaticamente
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      // total mensal = mão de obra + materiais
      ...(quadro.length > 0 || materiaisNum > 0
        ? { valor_mensal_escopo: totalServico || null }
        : {}),
      // per capita = custo de mão de obra por funcionário
      ...(totalFuncionarios > 0
        ? { per_capita: Math.round((totalQuadro / totalFuncionarios) * 100) / 100 }
        : {}),
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalQuadro, totalFuncionarios, totalServico])

  // ── Tipo de serviço (multi-seleção) ─────────────────────────────────────────
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

  const handleSaveTipo = async () => {
    if (!novoTipoNome.trim()) return
    setSavingTipo(true)
    const created = await createTipoServico(novoTipoNome, novoTipoDesc)
    setSavingTipo(false)
    if (created) {
      setTiposServico((p) => [...p, created].sort((a, b) => a.nome.localeCompare(b.nome)))
      toggleTipoServico(created.id, created.nome)
      setAddingTipo(false)
      setNovoTipoNome('')
      setNovoTipoDesc('')
    }
  }

  // ── Validação ────────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.codigo.trim())       e.codigo       = 'Obrigatório'
    if (!form.nome.trim())         e.nome         = 'Obrigatório'
    if (!form.cliente_nome.trim()) e.cliente_nome = 'Obrigatório'
    if (form.cliente_uf && form.cliente_uf.length > 2) e.cliente_uf = 'Máximo 2 caracteres'
    setErrors(e)
    if (Object.keys(e).length) {
      if (e.codigo || e.nome) setTab('contrato')
      else if (e.cliente_nome || e.cliente_uf) setTab('cliente')
    }
    return Object.keys(e).length === 0
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const quadroClean: AdmQuadroFuncionario[] = quadro.map(({ _key: _, ...r }) => r)
      const payload: AdmContratoInsert = {
        ...form,
        valor_mensal:        form.valor_mensal ? Number(form.valor_mensal) : null,
        data_inicio:         form.data_inicio  || null,
        data_fim:            form.data_fim     || null,
        data_aprovacao:      form.data_aprovacao || null,
        cliente_documento:   form.cliente_documento   || null,
        cliente_email:       form.cliente_email       || null,
        cliente_telefone:    form.cliente_telefone    || null,
        cliente_contato:     form.cliente_contato     || null,
        cliente_cep:         form.cliente_cep         || null,
        cliente_endereco:    form.cliente_endereco    || null,
        cliente_numero:      form.cliente_numero      || null,
        cliente_complemento: form.cliente_complemento || null,
        cliente_bairro:      form.cliente_bairro      || null,
        cliente_cidade:      form.cliente_cidade      || null,
        cliente_uf:          form.cliente_uf          || null,
        aprovado_por:        form.aprovado_por        || null,
        responsavel:         form.responsavel         || null,
        observacoes:         form.observacoes         || null,
        // escopo
        tipos_servico_ids:   form.tipos_servico_ids?.length   ? form.tipos_servico_ids   : null,
        tipos_servico_nomes: form.tipos_servico_nomes?.length ? form.tipos_servico_nomes : null,
        escopo_descricao:    form.escopo_descricao    || null,
        valor_materiais:     form.valor_materiais     || null,
        per_capita:          form.per_capita ? Number(form.per_capita) : (perCapitaCalc > 0 ? perCapitaCalc : null),
        valor_mensal_escopo: form.valor_mensal_escopo || null,
        quadro_funcionarios: quadroClean,
      }
      let ok = false
      if (isEdit && contrato?.id) {
        ok = await updateAdmContrato(contrato.id, payload)
      } else {
        const result = await createAdmContrato(payload)
        ok = !!result
      }
      if (ok) { onSaved(); onClose() }
      else setErrors({ _global: 'Erro ao salvar contrato. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  // Navegar entre abas
  const nextTab = () => {
    const idx = TAB_ORDER.indexOf(tab)
    if (idx < TAB_ORDER.length - 1) setTab(TAB_ORDER[idx + 1])
  }
  const prevTab = () => {
    const idx = TAB_ORDER.indexOf(tab)
    if (idx > 0) setTab(TAB_ORDER[idx - 1])
  }

  // Campos com erro por aba
  const tabErrors: Record<TabId, boolean> = {
    contrato:  !!(errors.codigo || errors.nome),
    escopo:    false,
    cliente:   !!(errors.cliente_nome || errors.cliente_uf),
    aprovacao: false,
  }

  // ── Input style ──────────────────────────────────────────────────────────────
  const inputCls = (err?: string) => cn(
    'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors',
    err
      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400'
      : 'border-slate-200 focus:border-violet-400 focus:ring-1 focus:ring-violet-200'
  )

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {isEdit ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab bar */}
        <div className="flex border-b border-slate-100 px-6 mt-4 shrink-0 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap',
                  active
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}>
                <Icon className={cn('w-3.5 h-3.5', active ? 'text-violet-600' : 'text-slate-400')} />
                {t.label}
                {tabErrors[t.id] && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5" />}
              </button>
            )
          })}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {errors._global && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {errors._global}
              </div>
            )}

            {/* ── Aba: Contrato ───────────────────────────────────────────── */}
            {tab === 'contrato' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Código" required error={errors.codigo}>
                    <Input placeholder="Ex: CTR-2025-001" value={form.codigo}
                      onChange={(e) => set('codigo', e.target.value)}
                      className={errors.codigo ? 'border-rose-400' : ''} />
                  </Field>
                  <Field label="Status">
                    <Select value={form.status} onValueChange={(v) => set('status', v as AdmContratoStatus)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.entries(ADM_STATUS_LABELS) as [AdmContratoStatus, string][]).map(([v, l]) => (
                          <SelectItem key={v} value={v}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field label="Nome do Contrato" required error={errors.nome}>
                  <Input placeholder="Ex: Contrato de Serviços Logísticos — Empresa XYZ"
                    value={form.nome} onChange={(e) => set('nome', e.target.value)}
                    className={errors.nome ? 'border-rose-400' : ''} />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Responsável Interno">
                    <Input placeholder="Nome do gestor responsável"
                      value={form.responsavel ?? ''} onChange={(e) => set('responsavel', e.target.value)} />
                  </Field>
                  <Field label="Valor Mensal (R$)">
                    <Input type="number" min="0" step="0.01" placeholder="0,00"
                      value={form.valor_mensal ?? ''}
                      onChange={(e) => set('valor_mensal', e.target.value ? parseFloat(e.target.value) : undefined)} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Data de Início">
                    <Input type="date" value={form.data_inicio ?? ''} onChange={(e) => set('data_inicio', e.target.value)} />
                  </Field>
                  <Field label="Data de Término">
                    <Input type="date" value={form.data_fim ?? ''} onChange={(e) => set('data_fim', e.target.value)} />
                  </Field>
                </div>

                <Field label="Observações">
                  <Textarea placeholder="Informações adicionais sobre o contrato..." rows={3}
                    value={form.observacoes ?? ''} onChange={(e) => set('observacoes', e.target.value)}
                    className="resize-none" />
                </Field>
              </div>
            )}

            {/* ── Aba: Escopo ─────────────────────────────────────────────── */}
            {tab === 'escopo' && (
              <div className="space-y-5">
                <SectionTitle icon={Settings2} title="Tipo de Serviço" />

                {/* Multi-seleção de tipos */}
                <div>
                  <p className="text-xs text-slate-400 mb-2">
                    Selecione um ou mais tipos de serviço. Clique novamente para desmarcar.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tiposServico.map((t) => {
                      const sel = (form.tipos_servico_ids ?? []).includes(t.id)
                      return (
                        <button key={t.id} type="button" onClick={() => toggleTipoServico(t.id, t.nome)}
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
                        <X className="w-3 h-3" />Limpar tudo
                      </button>
                    )}
                  </div>
                  {(form.tipos_servico_ids ?? []).length > 0 && (
                    <p className="text-xs text-violet-600 font-medium mt-2">
                      {(form.tipos_servico_nomes ?? []).join(', ')} selecionado(s)
                    </p>
                  )}
                </div>

                {/* Inline: novo tipo */}
                {!addingTipo ? (
                  <button type="button" onClick={() => setAddingTipo(true)}
                    className="flex items-center gap-1 text-xs text-violet-600 hover:underline font-medium">
                    <Plus className="w-3.5 h-3.5" />Adicionar tipo personalizado
                  </button>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-violet-50 rounded-lg border border-violet-200">
                    <div className="flex-1 space-y-2">
                      <input autoFocus type="text" placeholder="Nome (ex: GARÇOM)"
                        value={novoTipoNome} onChange={(e) => setNovoTipoNome(e.target.value.toUpperCase())}
                        className={inputCls()} />
                      <input type="text" placeholder="Descrição (opcional)"
                        value={novoTipoDesc} onChange={(e) => setNovoTipoDesc(e.target.value)}
                        className={inputCls()} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Button size="sm" type="button" disabled={savingTipo || !novoTipoNome.trim()}
                        onClick={handleSaveTipo}
                        className="h-7 bg-violet-600 hover:bg-violet-700 text-white border-0">
                        {savingTipo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </Button>
                      <Button size="sm" type="button" variant="outline"
                        onClick={() => { setAddingTipo(false); setNovoTipoNome(''); setNovoTipoDesc('') }}
                        className="h-7">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Descrição do escopo */}
                <div>
                  <SectionTitle icon={FileText} title="Descrição do Escopo" />
                  <div className="mt-3">
                    <Textarea rows={4}
                      placeholder="Detalhe as atividades, responsabilidades, locais de atuação, frequência, horários…"
                      value={form.escopo_descricao ?? ''}
                      onChange={(e) => set('escopo_descricao', e.target.value || null)}
                      className="resize-none" />
                  </div>
                </div>

                {/* Quadro de funcionários */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <SectionTitle icon={Users} title="Quadro de Funcionários" />
                    <Button type="button" size="sm" variant="outline" onClick={addRow}
                      className="h-7 gap-1 text-xs text-violet-700 border-violet-200 hover:bg-violet-50">
                      <Plus className="w-3.5 h-3.5" />Adicionar Função
                    </Button>
                  </div>

                  {quadro.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center">
                      <Users className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-400 mb-1">Nenhuma função adicionada</p>
                      <button type="button" onClick={addRow}
                        className="text-xs text-violet-600 hover:underline font-medium">
                        + Adicionar primeira função
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Header */}
                      <div className="grid grid-cols-[1fr_72px_110px_110px_36px] gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-1">
                        <span>Função</span><span>Qtd.</span><span>Turno</span><span>Valor Unit.</span><span />
                      </div>
                      {quadro.map((row) => (
                        <div key={row._key}
                          className="grid grid-cols-[1fr_72px_110px_110px_36px] gap-2 items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                          <input type="text" placeholder="Ex: ASG, Vigia…"
                            value={row.funcao}
                            onChange={(e) => updateRow(row._key, 'funcao', e.target.value)}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 focus:ring-1 focus:ring-violet-200 outline-none" />
                          <input type="number" min="1"
                            value={row.quantidade}
                            onChange={(e) => updateRow(row._key, 'quantidade', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 outline-none text-center" />
                          <select value={row.turno}
                            onChange={(e) => updateRow(row._key, 'turno', e.target.value as AdmTurno)}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 outline-none">
                            {TURNOS.map((t) => <option key={t} value={t}>{ADM_TURNO_LABELS[t]}</option>)}
                          </select>
                          <input type="number" min="0" step="0.01" placeholder="0,00"
                            value={row.valor_unitario || ''}
                            onChange={(e) => updateRow(row._key, 'valor_unitario', parseFloat(e.target.value) || 0)}
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-sm bg-white focus:border-violet-400 outline-none text-right" />
                          <button type="button" onClick={() => removeRow(row._key)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {/* Subtotal */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-lg border border-slate-200">
                        <span className="text-xs text-slate-500">
                          <strong className="text-slate-700">{totalFuncionarios}</strong> funcionário(s)
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          Subtotal: <span className="text-violet-700">{fmt(totalQuadro)}</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Materiais + Per Capita + Valor Total */}
                <div>
                  <SectionTitle icon={Package} title="Custos Complementares" />
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" />Materiais / Insumos (R$)
                      </label>
                      <input type="number" min="0" step="0.01" placeholder="0,00"
                        value={form.valor_materiais ?? ''}
                        onChange={(e) => set('valor_materiais', e.target.value ? parseFloat(e.target.value) : null)}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />Per Capita (R$)
                      </label>
                      <input type="number" min="0" step="0.01" placeholder="0,00"
                        value={form.per_capita ?? ''}
                        onChange={(e) => set('per_capita', e.target.value ? parseFloat(e.target.value) : null)}
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
                        value={form.valor_mensal_escopo ?? ''}
                        onChange={(e) => set('valor_mensal_escopo', e.target.value ? parseFloat(e.target.value) : null)}
                        className={inputCls()} />
                      {(quadro.length > 0 || materiaisNum > 0) && (
                        <p className="text-[11px] text-violet-600 mt-0.5 font-medium">
                          Calculado: {fmt(totalServico)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cards de resumo */}
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

            {/* ── Aba: Cliente ─────────────────────────────────────────────── */}
            {tab === 'cliente' && (
              <div className="space-y-4">
                <SectionTitle icon={User} title="Identificação" />

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Razão Social / Nome" required error={errors.cliente_nome}>
                    <Input placeholder="Nome do cliente"
                      value={form.cliente_nome} onChange={(e) => set('cliente_nome', e.target.value)}
                      className={errors.cliente_nome ? 'border-rose-400' : ''} />
                  </Field>
                  <Field label="CNPJ / CPF">
                    <Input placeholder="00.000.000/0001-00"
                      value={form.cliente_documento ?? ''} onChange={(e) => set('cliente_documento', e.target.value)} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="E-mail">
                    <Input type="email" placeholder="contato@empresa.com.br"
                      value={form.cliente_email ?? ''} onChange={(e) => set('cliente_email', e.target.value)} />
                  </Field>
                  <Field label="Telefone / WhatsApp">
                    <Input placeholder="(00) 00000-0000"
                      value={form.cliente_telefone ?? ''} onChange={(e) => set('cliente_telefone', e.target.value)} />
                  </Field>
                </div>

                <Field label="Nome do Contato / Interlocutor">
                  <Input placeholder="Pessoa de referência no cliente"
                    value={form.cliente_contato ?? ''} onChange={(e) => set('cliente_contato', e.target.value)} />
                </Field>

                <div className="pt-2">
                  <SectionTitle icon={MapPin} title="Endereço" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Field label="CEP">
                    <Input placeholder="00000-000" maxLength={9}
                      value={form.cliente_cep ?? ''} onChange={(e) => set('cliente_cep', e.target.value)} />
                  </Field>
                  <Field label="Cidade">
                    <Input placeholder="Cidade"
                      value={form.cliente_cidade ?? ''} onChange={(e) => set('cliente_cidade', e.target.value)} />
                  </Field>
                  <Field label="UF" error={errors.cliente_uf}>
                    <Input placeholder="SP" maxLength={2}
                      className={cn('uppercase', errors.cliente_uf ? 'border-rose-400' : '')}
                      value={form.cliente_uf ?? ''}
                      onChange={(e) => set('cliente_uf', e.target.value.toUpperCase())} />
                  </Field>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Field label="Logradouro">
                      <Input placeholder="Rua, Av., Alameda..."
                        value={form.cliente_endereco ?? ''} onChange={(e) => set('cliente_endereco', e.target.value)} />
                    </Field>
                  </div>
                  <Field label="Número">
                    <Input placeholder="123"
                      value={form.cliente_numero ?? ''} onChange={(e) => set('cliente_numero', e.target.value)} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Complemento">
                    <Input placeholder="Sala, Andar, Bloco..."
                      value={form.cliente_complemento ?? ''} onChange={(e) => set('cliente_complemento', e.target.value)} />
                  </Field>
                  <Field label="Bairro">
                    <Input placeholder="Bairro"
                      value={form.cliente_bairro ?? ''} onChange={(e) => set('cliente_bairro', e.target.value)} />
                  </Field>
                </div>
              </div>
            )}

            {/* ── Aba: Aprovação ────────────────────────────────────────────── */}
            {tab === 'aprovacao' && (
              <div className="space-y-4">
                <SectionTitle icon={CheckCircle2} title="Dados de Aprovação" />
                <p className="text-xs text-slate-500">Registre quem aprovou este contrato internamente e quando.</p>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Aprovado por">
                    <Input placeholder="Nome do aprovador"
                      value={form.aprovado_por ?? ''} onChange={(e) => set('aprovado_por', e.target.value)} />
                  </Field>
                  <Field label="Data de Aprovação">
                    <Input type="date"
                      value={form.data_aprovacao ?? ''} onChange={(e) => set('data_aprovacao', e.target.value)} />
                  </Field>
                </div>

                {/* Resumo */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-slate-600">Resumo do Contrato</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-500 mt-1">
                    {[
                      ['Código',        form.codigo || '—'],
                      ['Nome',          form.nome || '—'],
                      ['Cliente',       form.cliente_nome || '—'],
                      ['Responsável',   form.responsavel || '—'],
                      ['Valor Mensal',  form.valor_mensal ? fmt(Number(form.valor_mensal)) : '—'],
                      ['Tipo(s) Serviço', (form.tipos_servico_nomes ?? []).join(', ') || '—'],
                      ['Total Escopo',  form.valor_mensal_escopo ? fmt(Number(form.valor_mensal_escopo)) : '—'],
                      ['Funcionários',  totalFuncionarios > 0 ? `${totalFuncionarios} pessoa(s)` : '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <span className="text-slate-400 shrink-0">{k}:</span>
                        <span className="font-medium text-slate-700 truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0 flex items-center justify-between">
            <div>
              {TAB_ORDER.indexOf(tab) > 0 && (
                <Button type="button" variant="ghost" size="sm" className="text-slate-500 text-xs" onClick={prevTab}>
                  ← {TABS[TAB_ORDER.indexOf(tab) - 1].label}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {TAB_ORDER.indexOf(tab) < TAB_ORDER.length - 1 && (
                <Button type="button" variant="outline" size="sm" onClick={nextTab}>
                  {TABS[TAB_ORDER.indexOf(tab) + 1].label} →
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? 'Salvar' : 'Criar Contrato'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
      <Icon className="w-3.5 h-3.5 text-slate-400" />
      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
    </div>
  )
}

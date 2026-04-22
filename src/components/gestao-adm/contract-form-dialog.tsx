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
import { Loader2, FileText, User, MapPin, CheckCircle2 } from 'lucide-react'
import { createAdmContrato, updateAdmContrato } from '@/services/admContratosService'
import type { AdmContrato, AdmContratoInsert, AdmContratoStatus } from '@/types/adm-contratos'
import { ADM_STATUS_LABELS } from '@/types/adm-contratos'
import { cn } from '@/lib/utils'

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type TabId = 'contrato' | 'cliente' | 'aprovacao'
const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'contrato',  label: 'Contrato',  icon: FileText },
  { id: 'cliente',   label: 'Cliente',   icon: User },
  { id: 'aprovacao', label: 'Aprovação', icon: CheckCircle2 },
]

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
})

interface ContractFormDialogProps {
  open: boolean
  onClose: () => void
  contrato?: AdmContrato | null
  onSaved: () => void
}

export function ContractFormDialog({ open, onClose, contrato, onSaved }: ContractFormDialogProps) {
  const [tab, setTab]     = useState<TabId>('contrato')
  const [form, setForm]   = useState<AdmContratoInsert>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = Boolean(contrato?.id)

  useEffect(() => {
    setTab('contrato')
    setErrors({})
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
      })
    } else {
      setForm(emptyForm())
    }
  }, [contrato, open])

  const set = (field: keyof AdmContratoInsert, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.codigo.trim())      e.codigo = 'Obrigatório'
    if (!form.nome.trim())        e.nome = 'Obrigatório'
    if (!form.cliente_nome.trim()) e.cliente_nome = 'Obrigatório'
    if (form.cliente_uf && form.cliente_uf.length > 2) e.cliente_uf = 'Máximo 2 caracteres'
    setErrors(e)
    if (Object.keys(e).length) {
      // Redireciona para a aba com erro
      if (e.codigo || e.nome) setTab('contrato')
      else if (e.cliente_nome || e.cliente_uf) setTab('cliente')
    }
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload: AdmContratoInsert = {
        ...form,
        valor_mensal:      form.valor_mensal ? Number(form.valor_mensal) : null,
        data_inicio:       form.data_inicio || null,
        data_fim:          form.data_fim || null,
        data_aprovacao:    form.data_aprovacao || null,
        cliente_documento: form.cliente_documento || null,
        cliente_email:     form.cliente_email || null,
        cliente_telefone:  form.cliente_telefone || null,
        cliente_contato:   form.cliente_contato || null,
        cliente_cep:       form.cliente_cep || null,
        cliente_endereco:  form.cliente_endereco || null,
        cliente_numero:    form.cliente_numero || null,
        cliente_complemento: form.cliente_complemento || null,
        cliente_bairro:    form.cliente_bairro || null,
        cliente_cidade:    form.cliente_cidade || null,
        cliente_uf:        form.cliente_uf || null,
        aprovado_por:      form.aprovado_por || null,
        responsavel:       form.responsavel || null,
        observacoes:       form.observacoes || null,
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

  // Campos com erro por aba
  const tabErrors: Record<TabId, boolean> = {
    contrato:  !!(errors.codigo || errors.nome),
    cliente:   !!(errors.cliente_nome || errors.cliente_uf),
    aprovacao: false,
  }

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
        <div className="flex border-b border-slate-100 px-6 mt-4 shrink-0">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px',
                  active
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', active ? 'text-violet-600' : 'text-slate-400')} />
                {t.label}
                {tabErrors[t.id] && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ml-0.5" />
                )}
              </button>
            )
          })}
        </div>

        {/* Form body — scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {errors._global && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {errors._global}
              </div>
            )}

            {/* ── Aba: Contrato ─────────────────────────────────────────────── */}
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

            {/* ── Aba: Cliente ──────────────────────────────────────────────── */}
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
                <p className="text-xs text-slate-500">
                  Registre quem aprovou este contrato internamente e quando.
                </p>

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

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-1.5 mt-2">
                  <p className="text-xs font-semibold text-slate-600">Resumo do Contrato</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-500 mt-1">
                    {[
                      ['Código', form.codigo || '—'],
                      ['Nome', form.nome || '—'],
                      ['Cliente', form.cliente_nome || '—'],
                      ['Responsável', form.responsavel || '—'],
                      ['Valor Mensal', form.valor_mensal ? `R$ ${Number(form.valor_mensal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'],
                      ['Status', form.status],
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
            <div className="flex gap-2">
              {TABS.filter(t => t.id !== tab).slice(0, 1).map(prev => (
                <Button key={prev.id} type="button" variant="ghost" size="sm"
                  className="text-slate-500 text-xs"
                  onClick={() => setTab(prev.id)}>
                  ← {prev.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              {/* Próxima aba */}
              {tab !== 'aprovacao' && (
                <Button type="button" variant="outline" size="sm"
                  onClick={() => setTab(tab === 'contrato' ? 'cliente' : 'aprovacao')}>
                  Próximo →
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

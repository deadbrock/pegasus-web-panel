'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ClipboardList,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  Loader2,
  LogOut,
  PackageSearch,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { fetchProdutos, type Produto } from '@/lib/services/produtos-service'
import { STATUS_COLORS, STATUS_LABELS, URGENCIA_COLORS, type PedidoMaterialStatus, type PedidoMaterialUrgencia } from '@/services/pedidosMateriaisService'

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface PortalSupervisor {
  id: string
  nome: string
  setor?: string | null
}

interface PortalEncarregado {
  id: string
  supervisor_id: string
  nome: string
  setor?: string | null
}

interface PortalSession {
  tipo: 'encarregado' | 'supervisor'
  supervisor: PortalSupervisor
  encarregado?: PortalEncarregado
}

interface ItemCarrinho {
  _key: string
  produto_id?: string | null
  produto_codigo: string
  produto_nome: string
  unidade: string
  quantidade: number
  observacoes: string
}

interface PedidoPortal {
  id: string
  numero_pedido: string
  solicitante_nome: string
  solicitante_setor?: string | null
  portal_supervisor_id?: string | null
  portal_encarregado_id?: string | null
  supervisor_nome?: string | null
  aprovado_por?: string | null
  data_aprovacao?: string | null
  motivo_rejeicao?: string | null
  urgencia: PedidoMaterialUrgencia
  status: PedidoMaterialStatus
  observacoes?: string | null
  created_at: string
  updated_at: string
  itens?: {
    id: string
    produto_codigo: string
    produto_nome: string
    unidade: string
    quantidade: number
    observacoes?: string | null
  }[]
}

const SESSION_KEY = 'portal_op_session'

function saveSession(s: PortalSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s))
}
function loadSession(): PortalSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: PedidoMaterialStatus }) {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// ─── Header isolado ───────────────────────────────────────────────────────────
function PortalHeader({ session, onLogout }: { session: PortalSession; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900 leading-none">Pegasus</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">Portal Operacional</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-800 leading-none">
              {session.tipo === 'encarregado' ? session.encarregado?.nome : session.supervisor.nome}
            </p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5">
              {session.tipo === 'supervisor' ? 'Supervisor' : 'Encarregado'} · {session.supervisor.nome}
            </p>
          </div>
          <button onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  )
}

// ─── Tela de Seleção de Perfil ───────────────────────────────────────────────
function RoleSelectScreen({ onSelect }: { onSelect: (tipo: 'encarregado' | 'supervisor') => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">Pegasus</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Portal Operacional</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <PackageSearch className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Bem-vindo ao Portal</h1>
            <p className="text-sm text-slate-500 mt-1">Selecione como deseja acessar</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => onSelect('encarregado')}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Sou Encarregado</p>
                <p className="text-xs text-slate-500 mt-0.5">Solicitar materiais do estoque</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-blue-500 transition-colors" />
            </button>

            <button onClick={() => onSelect('supervisor')}
              className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-md transition-all group text-left">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Sou Supervisor</p>
                <p className="text-xs text-slate-500 mt-0.5">Validar pedidos da equipe</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 ml-auto group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">© {new Date().getFullYear()} Pegasus · Portal Operacional</p>
        </div>
      </div>
    </div>
  )
}

// ─── Setup do Encarregado (selecionar supervisor → encarregado) ───────────────
function EncarregadoSetup({ onReady, onBack }: {
  onReady: (session: PortalSession) => void
  onBack: () => void
}) {
  const [supervisores, setSupervisores] = useState<PortalSupervisor[]>([])
  const [encarregados, setEncarregados] = useState<PortalEncarregado[]>([])
  const [selectedSup, setSelectedSup] = useState<PortalSupervisor | null>(null)
  const [selectedEnc, setSelectedEnc] = useState<PortalEncarregado | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingEnc, setLoadingEnc] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/portal/supervisores')
      .then((r) => r.json())
      .then((d) => setSupervisores((d.supervisores ?? []).filter((s: PortalSupervisor & { ativo?: boolean }) => s.ativo !== false)))
      .catch(() => setError('Erro ao carregar supervisores'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectSupervisor = async (supId: string) => {
    const sup = supervisores.find((s) => s.id === supId) ?? null
    setSelectedSup(sup)
    setSelectedEnc(null)
    if (!sup) return
    setLoadingEnc(true)
    try {
      const r = await fetch(`/api/portal/encarregados?supervisor_id=${supId}`)
      const d = await r.json()
      setEncarregados((d.encarregados ?? []).filter((e: PortalEncarregado & { ativo?: boolean }) => e.ativo !== false))
    } catch {
      setError('Erro ao carregar encarregados')
    } finally {
      setLoadingEnc(false)
    }
  }

  const handleConfirm = () => {
    if (!selectedSup || !selectedEnc) return
    const session: PortalSession = { tipo: 'encarregado', supervisor: selectedSup, encarregado: selectedEnc }
    saveSession(session)
    onReady(session)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-bold text-slate-900">Portal Operacional</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-7 h-7 text-blue-500" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Identificação</h1>
            <p className="text-sm text-slate-500 mt-1">Selecione seu supervisor e nome</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Supervisor responsável</Label>
              {loading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                </div>
              ) : (
                <Select value={selectedSup?.id ?? ''} onValueChange={handleSelectSupervisor}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o supervisor..." /></SelectTrigger>
                  <SelectContent>
                    {supervisores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nome}{s.setor ? ` · ${s.setor}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedSup && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Seu nome</Label>
                {loadingEnc ? (
                  <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando encarregados...
                  </div>
                ) : encarregados.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Nenhum encarregado cadastrado para este supervisor.</p>
                ) : (
                  <Select value={selectedEnc?.id ?? ''} onValueChange={(v) => setSelectedEnc(encarregados.find((e) => e.id === v) ?? null)}>
                    <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione seu nome..." /></SelectTrigger>
                    <SelectContent>
                      {encarregados.map((e) => (
                        <SelectItem key={e.id} value={e.id}>{e.nome}{e.setor ? ` · ${e.setor}` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={!selectedSup || !selectedEnc}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl mt-2',
                'text-sm font-semibold text-white',
                'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600',
                'shadow-lg shadow-blue-500/25 transition-all duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
              )}>
              Acessar Portal <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Login do Supervisor ───────────────────────────────────────────────────────
function SupervisorLogin({ onReady, onBack }: {
  onReady: (session: PortalSession) => void
  onBack: () => void
}) {
  const [supervisores, setSupervisores] = useState<PortalSupervisor[]>([])
  const [selectedSupId, setSelectedSupId] = useState('')
  const [codigo, setCodigo] = useState('')
  const [showCodigo, setShowCodigo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/portal/supervisores')
      .then((r) => r.json())
      .then((d) => setSupervisores((d.supervisores ?? []).filter((s: PortalSupervisor & { ativo?: boolean }) => s.ativo !== false)))
      .catch(() => setError('Erro ao carregar supervisores'))
      .finally(() => setLoading(false))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSupId || !codigo) return
    setSubmitting(true)
    setError(null)
    try {
      const r = await fetch('/api/portal/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisor_id: selectedSupId, codigo }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Código inválido')
      const session: PortalSession = { tipo: 'supervisor', supervisor: d.supervisor }
      saveSession(session)
      onReady(session)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao validar')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="w-full bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <p className="text-sm font-bold text-slate-900">Portal Operacional</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-7 h-7 text-emerald-600" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Acesso Supervisor</h1>
            <p className="text-sm text-slate-500 mt-1">Informe seu código único de validação</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Supervisor</Label>
              {loading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                </div>
              ) : (
                <Select value={selectedSupId} onValueChange={setSelectedSupId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione seu nome..." /></SelectTrigger>
                  <SelectContent>
                    {supervisores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.nome}{s.setor ? ` · ${s.setor}` : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Código de validação</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showCodigo ? 'text' : 'password'}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ex.: AB12CD"
                  maxLength={6}
                  className={cn(
                    'w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm bg-white tracking-[0.25em] font-mono',
                    'placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 text-slate-900',
                    'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all',
                    error ? 'border-rose-300' : 'border-slate-200'
                  )} />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowCodigo((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCodigo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-3 text-sm text-rose-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting || !selectedSupId || !codigo}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl',
                'text-sm font-semibold text-white',
                'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600',
                'shadow-lg shadow-emerald-500/25 transition-all duration-150',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none'
              )}>
              {submitting
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Validando...</>
                : <>Entrar <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Card de Pedido ───────────────────────────────────────────────────────────
function PedidoCard({
  pedido, isSupervisor, onAction, onExpand, expanded, actionLoading,
}: {
  pedido: PedidoPortal
  isSupervisor: boolean
  onAction: (p: PedidoPortal, acao: string) => void
  onExpand: (id: string) => void
  expanded: boolean
  actionLoading: boolean
}) {
  const itens = pedido.itens?.length ?? 0
  return (
    <div className={cn('bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-opacity', actionLoading && 'opacity-60 pointer-events-none')}>
      <div className="flex items-start gap-3 p-4 cursor-pointer select-none active:bg-slate-50 transition-colors" onClick={() => onExpand(pedido.id)}>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 truncate">{pedido.numero_pedido}</p>
            <StatusBadge status={pedido.status} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{pedido.solicitante_nome}</p>
          {pedido.solicitante_setor && <p className="text-xs text-slate-400 truncate">{pedido.solicitante_setor}</p>}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold', URGENCIA_COLORS[pedido.urgencia])}>
              {pedido.urgencia}
            </span>
            <span className="text-xs text-slate-400">{itens} item{itens !== 1 ? 's' : ''}</span>
            <span className="text-xs text-slate-400">{new Date(pedido.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 flex-shrink-0 transition-transform mt-1', expanded && 'rotate-180')} />
      </div>

      {expanded && (
        <div className="border-t border-slate-100">
          {(pedido.itens?.length ?? 0) > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Itens</p>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden">
                {pedido.itens!.map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-center justify-between px-3 py-2.5 bg-slate-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.produto_nome}</p>
                      <p className="text-xs text-slate-400">{item.produto_codigo} · {item.unidade}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-sm font-bold text-slate-900">{item.quantidade}</p>
                      <p className="text-[10px] text-slate-400">{item.unidade}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pedido.observacoes && (
            <div className="px-4 pb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Observações</p>
              <p className="text-sm text-slate-600">{pedido.observacoes}</p>
            </div>
          )}

          {pedido.motivo_rejeicao && (
            <div className="mx-4 mb-3 flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Motivo da rejeição</p>
                <p className="text-xs text-rose-600">{pedido.motivo_rejeicao}</p>
              </div>
            </div>
          )}

          {pedido.aprovado_por && (
            <div className="px-4 pb-3">
              <p className="text-xs text-slate-400">
                {pedido.status === 'Rejeitado' ? 'Rejeitado' : 'Validado'} por: <span className="font-medium text-slate-600">{pedido.aprovado_por}</span>
              </p>
            </div>
          )}

          {/* Ações — portal só permite validar ou rejeitar */}
          <div className="px-4 pb-4 pt-1 flex flex-wrap gap-2">
            {isSupervisor && pedido.status === 'Aguardando Validação' && (
              <>
                <button onClick={() => onAction(pedido, 'validar')}
                  className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />Validar e Enviar
                </button>
                <button onClick={() => onAction(pedido, 'rejeitar')}
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
                  <XCircle className="w-3.5 h-3.5" />Rejeitar
                </button>
              </>
            )}
            {pedido.status === 'Aguardando Validação' && !isSupervisor && (
              <button onClick={() => onAction(pedido, 'cancelar')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />Cancelar
              </button>
            )}
            {pedido.status !== 'Aguardando Validação' && pedido.status !== 'Rejeitado' && pedido.status !== 'Cancelado' && (
              <p className="w-full text-xs text-slate-400 italic py-1">
                Pedido enviado ao sistema · acompanhe pelo painel principal
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dialog: Novo Pedido ──────────────────────────────────────────────────────
function NovoPedidoDialog({
  open, onClose, onSaved, session,
}: {
  open: boolean
  onClose: () => void
  onSaved: (p: PedidoPortal) => void
  session: PortalSession
}) {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [searchProduto, setSearchProduto] = useState('')
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [urgencia, setUrgencia] = useState<PedidoMaterialUrgencia>('Baixa')
  const [observacoes, setObservacoes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoadingProdutos(true)
    fetchProdutos()
      .then((d) => setProdutos(d.filter((p) => p.status === 'Ativo')))
      .catch(() => setProdutos([]))
      .finally(() => setLoadingProdutos(false))
  }, [open])

  const produtosFiltrados = useMemo(() => {
    const q = searchProduto.toLowerCase().trim()
    if (!q) return produtos
    return produtos.filter((p) => p.nome.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q))
  }, [produtos, searchProduto])

  function adicionarProduto(produto: Produto) {
    setCarrinho((prev) => [...prev, {
      _key: `${produto.id}-${Date.now()}`,
      produto_id: produto.id ?? null,
      produto_codigo: produto.codigo,
      produto_nome: produto.nome,
      unidade: produto.unidade,
      quantidade: 1,
      observacoes: '',
    }])
  }

  async function handleSubmit() {
    if (carrinho.length === 0) { setError('Adicione pelo menos um item.'); return }
    setSaving(true)
    setError(null)
    try {
      const r = await fetch('/api/portal/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portal_supervisor_id: session.supervisor.id,
          portal_encarregado_id: session.encarregado!.id,
          solicitante_nome: session.encarregado!.nome,
          solicitante_setor: session.encarregado?.setor ?? session.supervisor.nome,
          urgencia,
          observacoes: observacoes.trim() || null,
          itens: carrinho.map(({ _key: _k, ...item }) => item),
        }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao criar pedido')
      onSaved(d.pedido)
      onClose()
      setCarrinho([])
      setObservacoes('')
      setUrgencia('Baixa')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar pedido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[95vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
            <PackageSearch className="w-5 h-5 text-blue-600" />
            Novo Pedido de Material
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 mb-1">Solicitante</p>
            <p className="text-sm text-blue-900 font-medium">{session.encarregado?.nome}</p>
            {session.encarregado?.setor && <p className="text-xs text-blue-600">{session.encarregado.setor}</p>}
            <p className="text-xs text-blue-500 mt-0.5">Supervisor: {session.supervisor.nome}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Urgência</Label>
              <Select value={urgencia} onValueChange={(v) => setUrgencia(v as PedidoMaterialUrgencia)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Baixa', 'Média', 'Alta', 'Urgente'] as PedidoMaterialUrgencia[]).map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Observações</Label>
            <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)}
              className="w-full min-h-[60px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Informações adicionais..." />
          </div>

          {/* Catálogo */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selecionar Produtos</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar produto..." value={searchProduto} onChange={(e) => setSearchProduto(e.target.value)} />
            </div>
            {loadingProdutos ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                <p className="text-sm text-slate-500">Carregando produtos...</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-slate-100 p-2 bg-slate-50">
                {produtosFiltrados.map((produto) => {
                  const semEstoque = produto.estoque_atual <= 0
                  return (
                    <div key={produto.id}
                      className={cn('flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white border transition-all',
                        semEstoque ? 'border-rose-100 opacity-70' : 'border-slate-200 hover:border-blue-300 hover:shadow-sm')}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{produto.nome}</p>
                        <p className="text-xs text-slate-400">{produto.codigo} · {produto.categoria}</p>
                        <p className={cn('text-xs font-medium', semEstoque ? 'text-rose-500' : 'text-emerald-600')}>
                          Estoque: {produto.estoque_atual} {produto.unidade}{semEstoque ? ' · Sem estoque' : ''}
                        </p>
                      </div>
                      <button disabled={semEstoque} onClick={() => adicionarProduto(produto)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {carrinho.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itens do Pedido ({carrinho.length})</p>
              {carrinho.map((item) => (
                <div key={item._key} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.produto_nome}</p>
                    <p className="text-xs text-slate-400">{item.produto_codigo}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input type="number" min={1} value={item.quantidade}
                      onChange={(e) => setCarrinho((prev) => prev.map((i) => i._key === item._key ? { ...i, quantidade: Math.max(1, Number(e.target.value)) } : i))}
                      className="w-16 text-center text-sm rounded-lg border border-slate-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <span className="text-xs text-slate-400 w-8 truncate">{item.unidade}</span>
                    <button onClick={() => setCarrinho((prev) => prev.filter((i) => i._key !== item._key))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-slate-100 px-5 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving || carrinho.length === 0}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            {saving ? 'Enviando...' : 'Enviar Pedido'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog: Rejeitar ─────────────────────────────────────────────────────────
function RejeitarDialog({ pedido, supervisorNome, onClose, onRejeitado }: {
  pedido: PedidoPortal | null
  supervisorNome: string
  onClose: () => void
  onRejeitado: () => void
}) {
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const handleRejeitar = async () => {
    if (!pedido) return
    setSaving(true)
    try {
      await fetch('/api/portal/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedido.id, status: 'Rejeitado', motivo_rejeicao: motivo, supervisor_nome: supervisorNome }),
      })
      onRejeitado()
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={!!pedido} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-700">
            <XCircle className="w-5 h-5" />Rejeitar Pedido
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-slate-600">Informe o motivo para <span className="font-semibold">{pedido?.numero_pedido}</span>.</p>
          <div className="space-y-1">
            <Label>Motivo</Label>
            <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Explique o motivo..." />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleRejeitar} disabled={saving} className="bg-rose-600 hover:bg-rose-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Rejeitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── App Principal (Encarregado ou Supervisor) ────────────────────────────────
function PortalApp({ session, onLogout }: { session: PortalSession; onLogout: () => void }) {
  const isSupervisor = session.tipo === 'supervisor'
  const [pedidos, setPedidos] = useState<PedidoPortal[]>([])
  const [loading, setLoading] = useState(true)
  const [novoPedidoOpen, setNovoPedidoOpen] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<PedidoMaterialStatus | 'todos'>('todos')
  const [search, setSearch] = useState('')
  const [pedidoParaRejeitar, setPedidoParaRejeitar] = useState<PedidoPortal | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const param = isSupervisor
        ? `supervisor_id=${session.supervisor.id}`
        : `encarregado_id=${session.encarregado!.id}`
      const r = await fetch(`/api/portal/pedidos?${param}`)
      const d = await r.json()
      setPedidos(d.pedidos ?? [])
    } catch { setPedidos([]) }
    finally { setLoading(false) }
  }, [isSupervisor, session])

  useEffect(() => { load() }, [load])

  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos
    if (filterStatus !== 'todos') lista = lista.filter((p) => p.status === filterStatus)
    if (search.trim()) {
      const q = search.toLowerCase()
      lista = lista.filter((p) => p.numero_pedido.toLowerCase().includes(q) || p.solicitante_nome.toLowerCase().includes(q))
    }
    return lista
  }, [pedidos, filterStatus, search])

  const stats = useMemo(() => ({
    aguardando: pedidos.filter((p) => p.status === 'Aguardando Validação').length,
    pendentes: pedidos.filter((p) => p.status === 'Pendente').length,
    aprovados: pedidos.filter((p) => ['Aprovado', 'Em Separação', 'Separado'].includes(p.status)).length,
    entregues: pedidos.filter((p) => p.status === 'Entregue').length,
    rejeitados: pedidos.filter((p) => ['Rejeitado', 'Cancelado'].includes(p.status)).length,
  }), [pedidos])

  function toggleExpand(id: string) {
    setExpandedIds((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })
  }

  async function handleAction(pedido: PedidoPortal, acao: string) {
    if (acao === 'rejeitar') { setPedidoParaRejeitar(pedido); return }
    setActionLoadingId(pedido.id)

    try {
      if (acao === 'validar') {
        // Supervisor valida → pedido entra no sistema como "Pendente"
        await fetch('/api/portal/pedidos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: pedido.id,
            status: 'Pendente',
            supervisor_nome: session.supervisor.nome,
          }),
        })
      } else if (acao === 'cancelar') {
        // Encarregado cancela pedido ainda não validado
        await fetch('/api/portal/pedidos', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: pedido.id, status: 'Cancelado' }),
        })
      }
      await load()
    } finally { setActionLoadingId(null) }
  }

  const STATUS_OPTIONS: (PedidoMaterialStatus | 'todos')[] = [
    'todos', 'Aguardando Validação', 'Pendente', 'Rejeitado', 'Cancelado',
    'Em Análise', 'Aprovado', 'Em Separação', 'Separado', 'Entregue',
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PortalHeader session={session} onLogout={onLogout} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isSupervisor ? 'Pedidos da Equipe' : 'Meus Pedidos'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isSupervisor
                ? `Supervisor: ${session.supervisor.nome} · Valide os pedidos dos encarregados`
                : `Encarregado: ${session.encarregado?.nome} · Solicite materiais do estoque`}
            </p>
          </div>
          {!isSupervisor && (
            <Button onClick={() => setNovoPedidoOpen(true)} className="flex-shrink-0 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Pedido</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {[
            { label: 'Ag. Validação', value: stats.aguardando, color: 'text-yellow-700' },
            { label: 'Pendentes',     value: stats.pendentes,  color: 'text-amber-600' },
            { label: 'Aprovados',     value: stats.aprovados,  color: 'text-emerald-600' },
            { label: 'Entregues',     value: stats.entregues,  color: 'text-green-600' },
            { label: 'Rejeitados',    value: stats.rejeitados, color: 'text-rose-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 text-center shadow-sm">
              <p className={cn('text-lg font-bold', color)}>{value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <Input className="pl-9" placeholder="Buscar pedido ou solicitante..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as PedidoMaterialStatus | 'todos')}>
              <SelectTrigger className="sm:w-48">
                <Filter className="w-3.5 h-3.5 mr-2 text-slate-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === 'todos' ? 'Todos os status' : STATUS_LABELS[s as PedidoMaterialStatus]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-3" />
            <p className="text-slate-500">Carregando pedidos...</p>
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-14 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <ClipboardList className="w-7 h-7 text-blue-300" />
            </div>
            <p className="text-slate-800 font-semibold">Nenhum pedido encontrado</p>
            <p className="text-slate-400 text-sm mt-1">
              {search || filterStatus !== 'todos' ? 'Tente ajustar os filtros.' : 'Nenhum pedido registrado ainda.'}
            </p>
            {!isSupervisor && !search && filterStatus === 'todos' && (
              <Button className="mt-4" onClick={() => setNovoPedidoOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />Novo Pedido
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {pedidosFiltrados.map((pedido) => (
              <PedidoCard key={pedido.id} pedido={pedido} isSupervisor={isSupervisor}
                onAction={handleAction} onExpand={toggleExpand}
                expanded={expandedIds.has(pedido.id)}
                actionLoading={actionLoadingId === pedido.id} />
            ))}
            <p className="text-xs text-center text-slate-400 pb-4">
              {pedidosFiltrados.length} pedido{pedidosFiltrados.length !== 1 ? 's' : ''} exibido{pedidosFiltrados.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>

      <NovoPedidoDialog open={novoPedidoOpen} onClose={() => setNovoPedidoOpen(false)}
        onSaved={(novo) => { setPedidos((prev) => [novo, ...prev]); setExpandedIds((prev) => { const s = new Set(prev); s.add(novo.id); return s }) }}
        session={session} />

      <RejeitarDialog pedido={pedidoParaRejeitar}
        supervisorNome={session.supervisor.nome}
        onClose={() => setPedidoParaRejeitar(null)}
        onRejeitado={load} />
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
type AppState =
  | { screen: 'loading' }
  | { screen: 'role-select' }
  | { screen: 'encarregado-setup' }
  | { screen: 'supervisor-login' }
  | { screen: 'app'; session: PortalSession }

export default function OperacionalPage() {
  const [state, setState] = useState<AppState>({ screen: 'loading' })

  useEffect(() => {
    const saved = loadSession()
    if (saved) setState({ screen: 'app', session: saved })
    else setState({ screen: 'role-select' })
  }, [])

  function handleLogout() {
    clearSession()
    setState({ screen: 'role-select' })
  }

  if (state.screen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (state.screen === 'role-select') {
    return <RoleSelectScreen onSelect={(tipo) => setState({ screen: tipo === 'encarregado' ? 'encarregado-setup' : 'supervisor-login' })} />
  }

  if (state.screen === 'encarregado-setup') {
    return (
      <EncarregadoSetup
        onReady={(session) => setState({ screen: 'app', session })}
        onBack={() => setState({ screen: 'role-select' })}
      />
    )
  }

  if (state.screen === 'supervisor-login') {
    return (
      <SupervisorLogin
        onReady={(session) => setState({ screen: 'app', session })}
        onBack={() => setState({ screen: 'role-select' })}
      />
    )
  }

  return <PortalApp session={state.session} onLogout={handleLogout} />
}

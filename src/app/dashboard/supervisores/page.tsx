'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  KeyRound,
  Loader2,
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface PortalSupervisor {
  id: string
  nome: string
  telefone?: string | null
  setor?: string | null
  ativo: boolean
  created_at: string
  encarregados?: PortalEncarregado[]
}

interface PortalEncarregado {
  id: string
  supervisor_id: string
  nome: string
  telefone?: string | null
  setor?: string | null
  ativo: boolean
  created_at: string
}

// ─── Componente: Card de Supervisor ──────────────────────────────────────────
function SupervisorCard({
  supervisor,
  onToggleAtivo,
  onDelete,
  onAddEncarregado,
  onDeleteEncarregado,
  onToggleEncarregadoAtivo,
  onRegenerarCodigo,
  onRegenerarCodigoEncarregado,
}: {
  supervisor: PortalSupervisor
  onToggleAtivo: (sup: PortalSupervisor) => void
  onDelete: (sup: PortalSupervisor) => void
  onAddEncarregado: (sup: PortalSupervisor) => void
  onDeleteEncarregado: (enc: PortalEncarregado) => void
  onToggleEncarregadoAtivo: (enc: PortalEncarregado) => void
  onRegenerarCodigo: (sup: PortalSupervisor) => void
  onRegenerarCodigoEncarregado: (enc: PortalEncarregado) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const encarregados = supervisor.encarregados ?? []
  const ativos = encarregados.filter((e) => e.ativo).length

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header do supervisor */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors select-none"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0',
          supervisor.ativo ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-slate-300'
        )}>
          {supervisor.nome.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900">{supervisor.nome}</span>
            <Badge variant={supervisor.ativo ? 'default' : 'secondary'} className="text-[10px]">
              {supervisor.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          {supervisor.setor && <p className="text-sm text-slate-500">{supervisor.setor}</p>}
          {supervisor.telefone && <p className="text-xs text-slate-400">{supervisor.telefone}</p>}
          <p className="text-xs text-slate-400 mt-0.5">
            {ativos} encarregado{ativos !== 1 ? 's' : ''} ativo{ativos !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1"
            onClick={(e) => { e.stopPropagation(); onRegenerarCodigo(supervisor) }}>
            <KeyRound className="w-3 h-3" />Código
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onToggleAtivo(supervisor) }}>
            {supervisor.ativo ? 'Desativar' : 'Ativar'}
          </Button>
          <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700"
            onClick={(e) => { e.stopPropagation(); onDelete(supervisor) }}>
            <Trash2 className="w-4 h-4" />
          </Button>
          {expanded
            ? <ChevronDown className="w-4 h-4 text-slate-400" />
            : <ChevronRight className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Encarregados */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Encarregados ({encarregados.length})
            </p>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
              onClick={() => onAddEncarregado(supervisor)}>
              <Plus className="w-3 h-3" />Adicionar
            </Button>
          </div>

          {encarregados.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Users className="w-6 h-6 mx-auto mb-1 text-slate-300" />
              <p className="text-sm">Nenhum encarregado cadastrado</p>
              <p className="text-xs mt-0.5">Adicione os encarregados deste supervisor</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {encarregados.map((enc) => (
                <div key={enc.id}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                    enc.ativo ? 'bg-blue-500' : 'bg-slate-300'
                  )}>
                    {enc.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{enc.nome}</p>
                    {enc.setor && <p className="text-xs text-slate-400 truncate">{enc.setor}</p>}
                    {enc.telefone && <p className="text-xs text-slate-400">{enc.telefone}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge variant={enc.ativo ? 'default' : 'secondary'} className="text-[10px]">
                      {enc.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <button className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Gerar/Regenerar código de acesso"
                      onClick={() => onRegenerarCodigoEncarregado(enc)}>
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      title={enc.ativo ? 'Desativar' : 'Ativar'}
                      onClick={() => onToggleEncarregadoAtivo(enc)}>
                      {enc.ativo
                        ? <X className="w-3.5 h-3.5" />
                        : <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remover"
                      onClick={() => onDeleteEncarregado(enc)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function SupervisoresPage() {
  const { toast } = useToast()
  const [supervisores, setSupervisores] = useState<PortalSupervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog: Criar Supervisor
  const [criandoSup, setCriandoSup] = useState(false)
  const [formSup, setFormSup] = useState({ nome: '', telefone: '', setor: '' })
  const [submetendoSup, setSubmetendoSup] = useState(false)
  const [codigoCriado, setCodigoCriado] = useState<{ supervisor: PortalSupervisor; codigo: string } | null>(null)

  // Dialog: Adicionar Encarregado
  const [supAlvo, setSupAlvo] = useState<PortalSupervisor | null>(null)
  const [formEnc, setFormEnc] = useState({ nome: '', telefone: '', setor: '' })
  const [submetendoEnc, setSubmetendoEnc] = useState(false)
  const [codigoEncCriado, setCodigoEncCriado] = useState<{ encarregado: PortalEncarregado; codigo: string } | null>(null)

  const loadSupervisores = useCallback(async () => {
    setLoading(true)
    try {
      const [supRes, encRes] = await Promise.all([
        fetch('/api/portal/supervisores').then((r) => r.json()),
        fetch('/api/portal/encarregados').then((r) => r.json()),
      ])
      const sups: PortalSupervisor[] = supRes.supervisores ?? []
      const encs: PortalEncarregado[] = encRes.encarregados ?? []

      const supComEnc = sups.map((s) => ({
        ...s,
        encarregados: encs.filter((e) => e.supervisor_id === s.id),
      }))
      setSupervisores(supComEnc)
    } catch (err: unknown) {
      toast({ title: 'Erro ao carregar dados', description: err instanceof Error ? err.message : 'Erro inesperado', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { loadSupervisores() }, [loadSupervisores])

  // ── Criar supervisor ──────────────────────────────────────────────────────
  const handleCriarSupervisor = async () => {
    if (!formSup.nome.trim()) {
      toast({ title: 'Nome obrigatório', description: 'Informe o nome do supervisor.', variant: 'destructive' })
      return
    }
    setSubmetendoSup(true)
    try {
      const r = await fetch('/api/portal/supervisores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: formSup.nome.trim(), telefone: formSup.telefone.trim() || undefined, setor: formSup.setor.trim() || undefined }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao criar')
      setCriandoSup(false)
      setFormSup({ nome: '', telefone: '', setor: '' })
      setCodigoCriado({ supervisor: d.supervisor, codigo: d.codigo })
      await loadSupervisores()
    } catch (err: unknown) {
      toast({ title: 'Erro ao criar supervisor', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    } finally {
      setSubmetendoSup(false)
    }
  }

  // ── Toggle ativo supervisor ───────────────────────────────────────────────
  const handleToggleSupervisor = async (sup: PortalSupervisor) => {
    try {
      const r = await fetch('/api/portal/supervisores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sup.id, ativo: !sup.ativo }),
      })
      if (!r.ok) throw new Error('Erro ao atualizar')
      toast({ title: sup.ativo ? 'Supervisor desativado' : 'Supervisor ativado' })
      await loadSupervisores()
    } catch (err: unknown) {
      toast({ title: 'Erro', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    }
  }

  // ── Excluir supervisor ────────────────────────────────────────────────────
  const handleDeleteSupervisor = async (sup: PortalSupervisor) => {
    if (!confirm(`Excluir supervisor "${sup.nome}"? Os encarregados vinculados também serão removidos.`)) return
    try {
      const r = await fetch('/api/portal/supervisores', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sup.id }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro ao excluir')
      toast({ title: `${sup.nome} removido com sucesso.` })
      await loadSupervisores()
    } catch (err: unknown) {
      toast({ title: 'Erro ao excluir', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    }
  }

  // ── Adicionar encarregado ─────────────────────────────────────────────────
  const handleAdicionarEncarregado = async () => {
    if (!supAlvo || !formEnc.nome.trim()) {
      toast({ title: 'Nome obrigatório', variant: 'destructive' })
      return
    }
    setSubmetendoEnc(true)
    try {
      const r = await fetch('/api/portal/encarregados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisor_id: supAlvo.id, nome: formEnc.nome.trim(), telefone: formEnc.telefone.trim() || undefined, setor: formEnc.setor.trim() || undefined }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro')
      setSupAlvo(null)
      setFormEnc({ nome: '', telefone: '', setor: '' })
      // Mostrar código gerado UMA ÚNICA VEZ
      if (d.codigo) setCodigoEncCriado({ encarregado: d.encarregado, codigo: d.codigo })
      await loadSupervisores()
    } catch (err: unknown) {
      toast({ title: 'Erro ao adicionar encarregado', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    } finally {
      setSubmetendoEnc(false)
    }
  }

  // ── Toggle ativo encarregado ──────────────────────────────────────────────
  const handleToggleEncarregado = async (enc: PortalEncarregado) => {
    try {
      const r = await fetch('/api/portal/encarregados', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enc.id, ativo: !enc.ativo }),
      })
      if (!r.ok) throw new Error('Erro')
      await loadSupervisores()
    } catch (err: unknown) {
      toast({ title: 'Erro', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    }
  }

  // ── Excluir encarregado ───────────────────────────────────────────────────
  const handleDeleteEncarregado = async (enc: PortalEncarregado) => {
    if (!confirm(`Remover encarregado "${enc.nome}"?`)) return
    try {
      const r = await fetch('/api/portal/encarregados', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enc.id }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro')
      await loadSupervisores()
    } catch (err: unknown) {
      toast({ title: 'Erro ao remover', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    }
  }

  // ── Regenerar código do encarregado ──────────────────────────────────────
  const handleRegenerarCodigoEncarregado = async (enc: PortalEncarregado) => {
    if (!confirm(`Regenerar o código de acesso de "${enc.nome}"? O código anterior será invalidado.`)) return
    try {
      const r = await fetch('/api/portal/encarregados', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: enc.id, regenerar_codigo: true }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro')
      if (d.codigo) setCodigoEncCriado({ encarregado: enc, codigo: d.codigo })
    } catch (err: unknown) {
      toast({ title: 'Erro ao regenerar código', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    }
  }

  // ── Regenerar código do supervisor ────────────────────────────────────────
  const handleRegenerarCodigo = async (sup: PortalSupervisor) => {
    if (!confirm(`Regenerar o código de validação de "${sup.nome}"? O código antigo será invalidado imediatamente.`)) return
    try {
      const r = await fetch('/api/portal/supervisores', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sup.id, regenerar_codigo: true }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'Erro')
      setCodigoCriado({ supervisor: { ...sup }, codigo: d.codigo })
    } catch (err: unknown) {
      toast({ title: 'Erro ao regenerar código', description: err instanceof Error ? err.message : 'Erro', variant: 'destructive' })
    }
  }

  const filteredSupervisores = supervisores.filter(
    (s) => s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.setor?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalAtivos = supervisores.filter((s) => s.ativo).length
  const totalEncarregados = supervisores.reduce((acc, s) => acc + (s.encarregados?.length ?? 0), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervisores do Portal</h1>
          <p className="text-gray-600 mt-1">Gerencie supervisores e encarregados do Portal Operacional</p>
        </div>
        <Button onClick={() => setCriandoSup(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Supervisor
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Supervisores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{supervisores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Supervisores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{totalAtivos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Encarregados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalEncarregados}</div>
          </CardContent>
        </Card>
      </div>

      {/* Informativo */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 space-y-1">
          <strong>Como funciona o Portal Operacional</strong>
          <ul className="list-disc list-inside space-y-0.5 text-blue-700 mt-1">
            <li>Cada supervisor possui um <strong>código único de login</strong> — gerado automaticamente, mostrado apenas uma vez.</li>
            <li>O supervisor cadastra os encarregados da sua equipe. Cada encarregado também recebe um <strong>código de acesso próprio</strong>.</li>
            <li>No portal, o encarregado seleciona seu supervisor, seu nome e informa seu código para entrar.</li>
            <li>Os pedidos criados ficam com status <em>"Aguardando Validação"</em> até o supervisor validar com seu código.</li>
            <li>Após validação, o pedido entra no sistema como <em>"Pendente"</em> e segue o fluxo normal.</li>
            <li>Para regenerar o código de um encarregado, clique no ícone de chave (<KeyRound className="inline w-3 h-3" />) ao lado do nome.</li>
          </ul>
        </div>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Supervisores Cadastrados</CardTitle>
          <CardDescription>Clique em um supervisor para ver e gerenciar seus encarregados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou setor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
              <p className="text-slate-500">Carregando supervisores...</p>
            </div>
          ) : filteredSupervisores.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery ? 'Nenhum supervisor encontrado' : 'Nenhum supervisor cadastrado'}
              {!searchQuery && (
                <div className="mt-3">
                  <Button onClick={() => setCriandoSup(true)} size="sm">
                    <Plus className="w-4 h-4 mr-1" />Criar primeiro supervisor
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSupervisores.map((sup) => (
                <SupervisorCard
                  key={sup.id}
                  supervisor={sup}
                  onToggleAtivo={handleToggleSupervisor}
                  onDelete={handleDeleteSupervisor}
                  onAddEncarregado={(s) => { setSupAlvo(s); setFormEnc({ nome: '', telefone: '', setor: '' }) }}
                  onDeleteEncarregado={handleDeleteEncarregado}
                  onToggleEncarregadoAtivo={handleToggleEncarregado}
                  onRegenerarCodigo={handleRegenerarCodigo}
                  onRegenerarCodigoEncarregado={handleRegenerarCodigoEncarregado}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Dialog: Criar Supervisor ── */}
      <Dialog open={criandoSup} onOpenChange={setCriandoSup}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Cadastrar Novo Supervisor
            </DialogTitle>
            <DialogDescription>
              Um código único de validação será gerado automaticamente e mostrado uma única vez.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="sup-nome">Nome Completo *</Label>
              <Input id="sup-nome" placeholder="Ex.: João Silva" value={formSup.nome}
                onChange={(e) => setFormSup((p) => ({ ...p, nome: e.target.value }))}
                disabled={submetendoSup} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sup-setor">Setor / Área</Label>
              <Input id="sup-setor" placeholder="Ex.: Limpeza, Portaria..." value={formSup.setor}
                onChange={(e) => setFormSup((p) => ({ ...p, setor: e.target.value }))}
                disabled={submetendoSup} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sup-tel">Telefone</Label>
              <Input id="sup-tel" placeholder="Ex.: (11) 99999-9999" value={formSup.telefone}
                onChange={(e) => setFormSup((p) => ({ ...p, telefone: e.target.value }))}
                disabled={submetendoSup} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setCriandoSup(false)} disabled={submetendoSup}>Cancelar</Button>
            <Button onClick={handleCriarSupervisor} disabled={submetendoSup}>
              {submetendoSup ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Criando...</> : 'Criar Supervisor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Mostrar Código (uma única vez) ── */}
      <Dialog open={!!codigoCriado} onOpenChange={(v) => !v && setCodigoCriado(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <KeyRound className="w-5 h-5" />
              Código de Validação Gerado
            </DialogTitle>
            <DialogDescription>
              <strong>Guarde este código agora</strong> — ele não será exibido novamente por segurança.
              Entregue pessoalmente ao supervisor.
            </DialogDescription>
          </DialogHeader>

          {codigoCriado && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Supervisor: <strong>{codigoCriado.supervisor.nome}</strong></p>
                <div className="inline-flex items-center gap-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl px-8 py-5">
                  <span className="text-4xl font-mono font-bold tracking-[0.3em] text-emerald-800">
                    {codigoCriado.codigo}
                  </span>
                </div>
              </div>

              <Button className="w-full" variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(codigoCriado.codigo)
                  toast({ title: 'Código copiado!' })
                }}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Este código é <strong>único e secreto</strong>. O supervisor o usará para validar pedidos no portal.
                  Se perdido, use o botão "Regenerar Código" para criar um novo.
                </p>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setCodigoCriado(null)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Entendido — Anotei o Código
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Código do Encarregado (uma única vez) ── */}
      <Dialog open={!!codigoEncCriado} onOpenChange={(v) => !v && setCodigoEncCriado(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-700">
              <KeyRound className="w-5 h-5" />
              Código de Acesso do Encarregado
            </DialogTitle>
            <DialogDescription>
              <strong>Guarde este código agora</strong> — ele não será exibido novamente.
              Entregue pessoalmente ao encarregado.
            </DialogDescription>
          </DialogHeader>

          {codigoEncCriado && (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">
                  Encarregado: <strong>{codigoEncCriado.encarregado.nome}</strong>
                </p>
                <div className="inline-flex items-center gap-3 bg-blue-50 border-2 border-blue-300 rounded-2xl px-8 py-5">
                  <span className="text-4xl font-mono font-bold tracking-[0.3em] text-blue-800">
                    {codigoEncCriado.codigo}
                  </span>
                </div>
              </div>

              <Button className="w-full" variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(codigoEncCriado.codigo)
                  toast({ title: 'Código copiado!' })
                }}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar Código
              </Button>

              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Este código é <strong>único e secreto</strong>. O encarregado o usará para fazer login no Portal Operacional.
                  Se perdido, clique no ícone de chave <KeyRound className="inline w-3 h-3" /> ao lado do nome dele para gerar um novo.
                </p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setCodigoEncCriado(null)}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Entendido — Anotei o Código
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Adicionar Encarregado ── */}
      <Dialog open={!!supAlvo} onOpenChange={(v) => !v && setSupAlvo(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Adicionar Encarregado
            </DialogTitle>
            <DialogDescription>
              Vinculado ao supervisor: <strong>{supAlvo?.nome}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="enc-nome">Nome Completo *</Label>
              <Input id="enc-nome" placeholder="Ex.: Maria Souza" value={formEnc.nome}
                onChange={(e) => setFormEnc((p) => ({ ...p, nome: e.target.value }))}
                disabled={submetendoEnc} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enc-setor">Setor / Contrato</Label>
              <Input id="enc-setor" placeholder="Ex.: Limpeza — Contrato XYZ" value={formEnc.setor}
                onChange={(e) => setFormEnc((p) => ({ ...p, setor: e.target.value }))}
                disabled={submetendoEnc} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="enc-tel">Telefone</Label>
              <Input id="enc-tel" placeholder="Ex.: (11) 99999-9999" value={formEnc.telefone}
                onChange={(e) => setFormEnc((p) => ({ ...p, telefone: e.target.value }))}
                disabled={submetendoEnc} />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSupAlvo(null)} disabled={submetendoEnc}>Cancelar</Button>
            <Button onClick={handleAdicionarEncarregado} disabled={submetendoEnc}>
              {submetendoEnc ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adicionando...</> : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

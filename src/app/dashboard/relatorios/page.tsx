"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText, Download, Calendar, BarChart3, Plus, Eye, Loader2,
  Trash2, FileX, CheckCircle2, AlertCircle, Clock, RefreshCw,
  Truck, Users, ShoppingCart, DollarSign, Wrench, FileCheck,
  X, CalendarClock,
} from 'lucide-react'
import * as XLSX from 'xlsx'
import {
  gerarRelatorioDashboard,
  gerarRelatorioCustos,
  gerarRelatorioManutencoes,
  gerarRelatorioPedidos,
  gerarRelatorioFrota,
  gerarRelatorioMotoristas,
  gerarRelatorioContratos,
  gerarRelatorioFinanceiro,
} from '@/lib/services/relatorios-service'
import { useToast } from '@/hooks/use-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type TipoRelatorio =
  | 'Dashboard' | 'Financeiro' | 'Custos' | 'Pedidos'
  | 'Manutenções' | 'Frota' | 'Motoristas' | 'Contratos'

type StatusRelatorio = 'concluido' | 'processando' | 'erro'
type Frequencia = 'diario' | 'semanal' | 'mensal'

interface RelatorioGerado {
  id: string
  tipo: TipoRelatorio
  nome: string
  periodo?: string
  dataGeracao: string
  status: StatusRelatorio
  dados?: any
  erro?: string
}

interface Agendamento {
  id: string
  tipo: TipoRelatorio
  nome: string
  frequencia: Frequencia
  proximaExecucao: string
  ativo: boolean
}

// ─── Config dos tipos ─────────────────────────────────────────────────────────

const TIPOS: {
  value: TipoRelatorio; label: string; descricao: string
  precisaPeriodo: boolean; icon: any
}[] = [
  { value: 'Dashboard',    label: 'Dashboard Geral',    descricao: 'Resumo consolidado de todos os módulos',   precisaPeriodo: false, icon: BarChart3 },
  { value: 'Financeiro',   label: 'Financeiro',          descricao: 'Receitas, despesas e margem de lucro',    precisaPeriodo: true,  icon: DollarSign },
  { value: 'Custos',       label: 'Custos Operacionais', descricao: 'Detalhamento de custos por categoria',    precisaPeriodo: true,  icon: DollarSign },
  { value: 'Pedidos',      label: 'Pedidos / Entregas',  descricao: 'Performance de pedidos e entregas',       precisaPeriodo: true,  icon: ShoppingCart },
  { value: 'Manutenções',  label: 'Manutenções',         descricao: 'Histórico de manutenções e custos',       precisaPeriodo: true,  icon: Wrench },
  { value: 'Frota',        label: 'Frota (Veículos)',    descricao: 'Status atual de todos os veículos',       precisaPeriodo: false, icon: Truck },
  { value: 'Motoristas',   label: 'Motoristas',          descricao: 'Status e CNH dos motoristas',             precisaPeriodo: false, icon: Users },
  { value: 'Contratos',    label: 'Contratos',           descricao: 'Status e valores dos contratos',          precisaPeriodo: false, icon: FileCheck },
]

const FREQ_LABEL: Record<Frequencia, string> = { diario: 'Diário', semanal: 'Semanal', mensal: 'Mensal' }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtBRL = (n: number) =>
  (n ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtNum = (n: number) => (n ?? 0).toLocaleString('pt-BR')

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })

const uid = () => Math.random().toString(36).substring(2, 10)

// ─── Geração real do relatório ────────────────────────────────────────────────

async function gerarDados(
  tipo: TipoRelatorio,
  dataInicio: string,
  dataFim: string,
): Promise<any> {
  switch (tipo) {
    case 'Dashboard':   return gerarRelatorioDashboard()
    case 'Custos':      return gerarRelatorioCustos(dataInicio, dataFim)
    case 'Manutenções': return gerarRelatorioManutencoes(dataInicio, dataFim)
    case 'Pedidos':     return gerarRelatorioPedidos(dataInicio, dataFim)
    case 'Frota':       return gerarRelatorioFrota()
    case 'Motoristas':  return gerarRelatorioMotoristas()
    case 'Contratos':   return gerarRelatorioContratos()
    case 'Financeiro': {
      const [ano, mes] = dataInicio.split('-')
      return gerarRelatorioFinanceiro(parseInt(ano), parseInt(mes))
    }
  }
}

// ─── Download XLSX ────────────────────────────────────────────────────────────

function baixarXLSX(relatorio: RelatorioGerado) {
  const d = relatorio.dados
  if (!d) return
  const wb = XLSX.utils.book_new()
  const addSheet = (rows: any[], name: string) => {
    if (!rows?.length) return
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name.substring(0, 31))
  }
  switch (relatorio.tipo) {
    case 'Dashboard':
      addSheet([d.resumo?.veiculos ?? {}],    'Veículos')
      addSheet([d.resumo?.motoristas ?? {}],  'Motoristas')
      addSheet([d.resumo?.pedidos ?? {}],     'Pedidos')
      addSheet([d.resumo?.custos ?? {}],      'Custos')
      addSheet([d.resumo?.manutencoes ?? {}], 'Manutenções')
      addSheet([d.resumo?.contratos ?? {}],   'Contratos')
      break
    case 'Financeiro':
      addSheet([d.resumo ?? {}], 'Resumo')
      addSheet(
        Object.entries(d.detalhes?.custos ?? {}).map(([k, v]) => ({ categoria: k, total: v })),
        'Custos por Categoria',
      )
      break
    case 'Custos':
      addSheet(d.custos ?? [], 'Custos')
      addSheet(
        Object.entries(d.total_por_categoria ?? {}).map(([k, v]) => ({ categoria: k, total: v })),
        'Por Categoria',
      )
      break
    case 'Pedidos':    addSheet(d.pedidos ?? [], 'Pedidos'); break
    case 'Manutenções': addSheet(d.manutencoes ?? [], 'Manutenções'); break
    case 'Frota':      addSheet(d.veiculos ?? [], 'Veículos'); break
    case 'Motoristas':
      addSheet(d.motoristas ?? [], 'Motoristas')
      addSheet(d.motoristas_cnh_vencendo ?? [], 'CNH Vencendo')
      break
    case 'Contratos':  addSheet(d.contratos ?? [], 'Contratos'); break
  }
  if (!wb.SheetNames.length)
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([d]), 'Dados')

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `relatorio_${relatorio.tipo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StatusRelatorio }) {
  const cfg = {
    concluido:    { cls: 'bg-green-100 text-green-800',  label: 'Concluído' },
    processando:  { cls: 'bg-blue-100 text-blue-800',    label: 'Processando' },
    erro:         { cls: 'bg-red-100 text-red-800',      label: 'Erro' },
  }[status]
  return <Badge className={cfg.cls}>{cfg.label}</Badge>
}

// ─── Detalhes por tipo ────────────────────────────────────────────────────────

function DetalhesDashboard({ d }: { d: any }) {
  const blocos = [
    { label: 'Veículos',     icon: Truck,        dados: d?.resumo?.veiculos },
    { label: 'Motoristas',   icon: Users,        dados: d?.resumo?.motoristas },
    { label: 'Pedidos',      icon: ShoppingCart, dados: d?.resumo?.pedidos },
    { label: 'Custos',       icon: DollarSign,   dados: d?.resumo?.custos },
    { label: 'Manutenções',  icon: Wrench,       dados: d?.resumo?.manutencoes },
    { label: 'Contratos',    icon: FileCheck,    dados: d?.resumo?.contratos },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {blocos.map(({ label, icon: Icon, dados: bloco }) => (
        <div key={label} className="border rounded-lg p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm">{label}</span>
          </div>
          <div className="space-y-1 text-xs text-gray-600">
            {Object.entries(bloco ?? {}).map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="capitalize">{k.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function DetalhesFinanceiro({ d }: { d: any }) {
  const r = d?.resumo ?? {}
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Receita Total',  val: fmtBRL(r.receita_total ?? 0),  cls: 'text-green-700' },
          { label: 'Despesas',       val: fmtBRL(r.despesas_totais ?? 0), cls: 'text-red-700' },
          { label: 'Lucro Líquido',  val: fmtBRL(r.lucro_liquido ?? 0),  cls: r.lucro_liquido >= 0 ? 'text-green-700' : 'text-red-700' },
          { label: 'Margem de Lucro',val: `${(r.margem_lucro ?? 0).toFixed(1)}%`, cls: 'text-blue-700' },
        ].map(({ label, val, cls }) => (
          <div key={label} className="border rounded-lg p-3 bg-gray-50">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-lg font-bold mt-1 ${cls}`}>{val}</p>
          </div>
        ))}
      </div>
      {d?.detalhes?.custos && (
        <div>
          <p className="font-semibold text-sm mb-2">Custos por Categoria</p>
          <div className="space-y-1">
            {Object.entries(d.detalhes.custos).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span>{k}</span><span className="font-medium">{fmtBRL(v as number)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DetalhesGenerico({ d, tipo }: { d: any; tipo: TipoRelatorio }) {
  const linhas: { label: string; val: string }[] = []
  if (tipo === 'Custos') {
    linhas.push({ label: 'Total Geral', val: fmtBRL(d?.total_geral ?? 0) })
    if (d?.total_por_categoria)
      Object.entries(d.total_por_categoria).forEach(([k, v]) =>
        linhas.push({ label: k, val: fmtBRL(v as number) })
      )
  } else if (tipo === 'Pedidos') {
    linhas.push(
      { label: 'Total de Pedidos',      val: fmtNum(d?.total ?? 0) },
      { label: 'Valor Total',           val: fmtBRL(d?.valor_total ?? 0) },
      { label: 'Taxa Entrega no Prazo', val: `${(d?.taxa_entrega_no_prazo ?? 0).toFixed(1)}%` },
    )
    if (d?.total_por_status)
      Object.entries(d.total_por_status).forEach(([k, v]) =>
        linhas.push({ label: `Status: ${k}`, val: String(v) })
      )
  } else if (tipo === 'Manutenções') {
    linhas.push(
      { label: 'Total',       val: fmtNum(d?.total ?? 0) },
      { label: 'Custo Total', val: fmtBRL(d?.custo_total ?? 0) },
    )
    if (d?.total_por_tipo)
      Object.entries(d.total_por_tipo).forEach(([k, v]) =>
        linhas.push({ label: `Tipo: ${k}`, val: String(v) })
      )
  } else if (tipo === 'Frota') {
    linhas.push({ label: 'Total de Veículos', val: fmtNum(d?.total ?? 0) })
    if (d?.total_por_status)
      Object.entries(d.total_por_status).forEach(([k, v]) =>
        linhas.push({ label: `Status: ${k}`, val: String(v) })
      )
  } else if (tipo === 'Motoristas') {
    linhas.push(
      { label: 'Total de Motoristas',     val: fmtNum(d?.total ?? 0) },
      { label: 'CNH vencendo (30 dias)',  val: fmtNum(d?.cnh_vencendo_30_dias ?? 0) },
    )
    if (d?.total_por_status)
      Object.entries(d.total_por_status).forEach(([k, v]) =>
        linhas.push({ label: `Status: ${k}`, val: String(v) })
      )
  } else if (tipo === 'Contratos') {
    linhas.push(
      { label: 'Total de Contratos',  val: fmtNum(d?.total ?? 0) },
      { label: 'Valor Total Ativos',  val: fmtBRL(d?.valor_total_ativos ?? 0) },
      { label: 'Valor Mensal Total',  val: fmtBRL(d?.valor_mensal_total ?? 0) },
    )
    if (d?.total_por_status)
      Object.entries(d.total_por_status).forEach(([k, v]) =>
        linhas.push({ label: `Status: ${k}`, val: String(v) })
      )
  }
  return (
    <div className="space-y-2">
      {linhas.map(({ label, val }) => (
        <div key={label} className="flex justify-between border-b pb-1 text-sm">
          <span className="text-gray-600">{label}</span>
          <span className="font-semibold text-gray-900">{val}</span>
        </div>
      ))}
      {linhas.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Nenhum dado disponível</p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState<RelatorioGerado[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [gerandoId, setGerandoId] = useState<string | null>(null)

  // Modal estados
  const [novoOpen, setNovoOpen] = useState(false)
  const [detalhesOpen, setDetalhesOpen] = useState(false)
  const [agendarOpen, setAgendarOpen] = useState(false)
  const [relSelecionado, setRelSelecionado] = useState<RelatorioGerado | null>(null)

  // Form: novo relatório
  const [tipoSel, setTipoSel] = useState<TipoRelatorio>('Dashboard')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [gerando, setGerando] = useState(false)

  // Form: agendamento
  const [agTipo, setAgTipo] = useState<TipoRelatorio>('Dashboard')
  const [agFreq, setAgFreq] = useState<Frequencia>('mensal')

  const { toast } = useToast()

  // Inicializar datas padrão e carregar agendamentos do localStorage
  useEffect(() => {
    const hoje = new Date()
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    setDataFim(hoje.toISOString().split('T')[0])
    setDataInicio(inicio.toISOString().split('T')[0])

    try {
      const saved = localStorage.getItem('pegasus_agendamentos')
      if (saved) setAgendamentos(JSON.parse(saved))
    } catch { /* ignore */ }
  }, [])

  const saveAgendamentos = (list: Agendamento[]) => {
    setAgendamentos(list)
    localStorage.setItem('pegasus_agendamentos', JSON.stringify(list))
  }

  const tipoConfig = TIPOS.find(t => t.value === tipoSel)

  // ─── Gerar Relatório ──────────────────────────────────────────────────────

  const handleGerar = async () => {
    if (!tipoSel) return
    setGerando(true)

    const id = uid()
    const config = TIPOS.find(t => t.value === tipoSel)!
    const placeholder: RelatorioGerado = {
      id,
      tipo: tipoSel,
      nome: config.label,
      periodo: config.precisaPeriodo ? `${dataInicio} → ${dataFim}` : undefined,
      dataGeracao: new Date().toISOString(),
      status: 'processando',
    }

    setRelatorios(prev => [placeholder, ...prev])
    setNovoOpen(false)
    setGerando(false)
    setGerandoId(id)

    try {
      const dados = await gerarDados(tipoSel, dataInicio, dataFim)
      setRelatorios(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'concluido', dados } : r)
      )
      toast({ title: 'Relatório gerado', description: `"${config.label}" está pronto.` })
    } catch (err: any) {
      setRelatorios(prev =>
        prev.map(r => r.id === id ? { ...r, status: 'erro', erro: err?.message ?? 'Erro desconhecido' } : r)
      )
      toast({ title: 'Erro ao gerar', description: err?.message ?? 'Tente novamente.', variant: 'destructive' })
    } finally {
      setGerandoId(null)
    }
  }

  const handleRetry = async (rel: RelatorioGerado) => {
    setRelatorios(prev => prev.map(r => r.id === rel.id ? { ...r, status: 'processando', erro: undefined } : r))
    setGerandoId(rel.id)
    try {
      const [inicio, fim] = rel.periodo?.split(' → ') ?? ['', '']
      const dados = await gerarDados(rel.tipo, inicio, fim)
      setRelatorios(prev => prev.map(r => r.id === rel.id ? { ...r, status: 'concluido', dados } : r))
      toast({ title: 'Relatório atualizado', description: rel.nome })
    } catch (err: any) {
      setRelatorios(prev => prev.map(r => r.id === rel.id ? { ...r, status: 'erro', erro: err?.message } : r))
      toast({ title: 'Erro', description: err?.message, variant: 'destructive' })
    } finally {
      setGerandoId(null)
    }
  }

  // ─── Agendar ──────────────────────────────────────────────────────────────

  const handleSalvarAgendamento = () => {
    const agConfig = TIPOS.find(t => t.value === agTipo)!
    const proximaExecucao = (() => {
      const d = new Date()
      if (agFreq === 'diario') d.setDate(d.getDate() + 1)
      else if (agFreq === 'semanal') d.setDate(d.getDate() + 7)
      else d.setMonth(d.getMonth() + 1)
      return d.toISOString()
    })()
    const novoAg: Agendamento = {
      id: uid(),
      tipo: agTipo,
      nome: agConfig.label,
      frequencia: agFreq,
      proximaExecucao,
      ativo: true,
    }
    saveAgendamentos([novoAg, ...agendamentos])
    setAgendarOpen(false)
    toast({ title: 'Agendamento criado', description: `"${agConfig.label}" — ${FREQ_LABEL[agFreq]}` })
  }

  const handleToggleAgendamento = (id: string) => {
    saveAgendamentos(agendamentos.map(a => a.id === id ? { ...a, ativo: !a.ativo } : a))
  }

  const handleDeleteAgendamento = (id: string) => {
    saveAgendamentos(agendamentos.filter(a => a.id !== id))
  }

  // ─── Baixar ───────────────────────────────────────────────────────────────

  const handleDownload = (rel: RelatorioGerado) => {
    baixarXLSX(rel)
    toast({ title: 'Download iniciado', description: `${rel.nome}.xlsx` })
  }

  // ─── Detalhes ─────────────────────────────────────────────────────────────

  const handleVerDetalhes = (rel: RelatorioGerado) => {
    setRelSelecionado(rel)
    setDetalhesOpen(true)
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  const concluidos   = relatorios.filter(r => r.status === 'concluido').length
  const processando  = relatorios.filter(r => r.status === 'processando').length

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">Geração e gerenciamento de relatórios com dados reais</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setAgendarOpen(true)}>
            <CalendarClock className="w-4 h-4 mr-2" />
            Agendar
          </Button>
          <Button onClick={() => setNovoOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gerados nesta sessão', val: relatorios.length, icon: FileText,     cls: 'text-blue-600' },
          { label: 'Concluídos',           val: concluidos,        icon: CheckCircle2, cls: 'text-green-600' },
          { label: 'Em Processamento',     val: processando,       icon: Clock,        cls: 'text-yellow-600' },
          { label: 'Agendamentos Ativos',  val: agendamentos.filter(a => a.ativo).length, icon: CalendarClock, cls: 'text-purple-600' },
        ].map(({ label, val, icon: Icon, cls }) => (
          <Card key={label}>
            <CardContent className="p-5 flex items-center gap-4">
              <Icon className={`w-8 h-8 ${cls}`} />
              <div>
                <p className="text-2xl font-bold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de relatórios gerados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatórios Gerados
            {relatorios.length > 0 && (
              <span className="text-sm font-normal text-gray-500">({relatorios.length})</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatorios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <FileX className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-medium">Nenhum relatório gerado ainda</p>
              <p className="text-xs mt-1">Clique em "Novo Relatório" para começar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {relatorios.map(rel => {
                const cfg = TIPOS.find(t => t.value === rel.tipo)
                const Icon = cfg?.icon ?? FileText
                const isProcessando = rel.status === 'processando'
                return (
                  <div key={rel.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-md border border-blue-100 shrink-0">
                          {isProcessando
                            ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            : <Icon className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{rel.nome}</span>
                            <StatusBadge status={rel.status} />
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {fmtDate(rel.dataGeracao)}
                            </span>
                            {rel.periodo && (
                              <span>Período: {rel.periodo}</span>
                            )}
                            {rel.erro && (
                              <span className="text-red-500">Erro: {rel.erro}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {rel.status === 'concluido' && (
                          <>
                            <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => handleVerDetalhes(rel)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Baixar XLSX" onClick={() => handleDownload(rel)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {rel.status === 'erro' && (
                          <Button variant="ghost" size="sm" title="Tentar novamente" onClick={() => handleRetry(rel)} className="text-orange-600">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-600"
                          title="Remover da lista"
                          disabled={isProcessando}
                          onClick={() => setRelatorios(prev => prev.filter(r => r.id !== rel.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agendamentos */}
      {agendamentos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5" />
              Agendamentos ({agendamentos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {agendamentos.map(ag => (
                <div key={ag.id} className="flex items-center justify-between border rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ag.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <p className="font-medium text-sm">{ag.nome}</p>
                      <p className="text-xs text-gray-500">
                        {FREQ_LABEL[ag.frequencia]} · Próxima: {fmtDate(ag.proximaExecucao)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAgendamento(ag.id)}
                      className={`text-xs px-2 py-1 rounded-full border transition-colors ${ag.ativo ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100' : 'border-gray-300 text-gray-500 bg-gray-50 hover:bg-gray-100'}`}
                    >
                      {ag.ativo ? 'Ativo' : 'Pausado'}
                    </button>
                    <Button variant="ghost" size="sm" className="text-red-500 h-7 w-7 p-0" onClick={() => handleDeleteAgendamento(ag.id)}>
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Modal: Novo Relatório ──────────────────────────────────────────── */}
      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Relatório</DialogTitle>
            <DialogDescription>Selecione o tipo e o período para gerar o relatório com dados reais do banco.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={tipoSel} onValueChange={v => setTipoSel(v as TipoRelatorio)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-gray-500">{t.descricao}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {tipoConfig?.precisaPeriodo && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Data Início</Label>
                  <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Data Fim</Label>
                  <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Fonte:</strong> dados em tempo real do banco de dados Supabase.<br />
                O relatório será gerado em instantes e ficará disponível para visualização e download.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button onClick={handleGerar} disabled={gerando}>
              {gerando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
              Gerar Relatório
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Ver Detalhes ───────────────────────────────────────────── */}
      <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              {relSelecionado?.nome}
            </DialogTitle>
            <DialogDescription>
              Gerado em {relSelecionado ? fmtDate(relSelecionado.dataGeracao) : ''}
              {relSelecionado?.periodo && ` · Período: ${relSelecionado.periodo}`}
            </DialogDescription>
          </DialogHeader>

          {relSelecionado?.dados ? (
            <div className="py-2">
              {relSelecionado.tipo === 'Dashboard'   && <DetalhesDashboard d={relSelecionado.dados} />}
              {relSelecionado.tipo === 'Financeiro'  && <DetalhesFinanceiro d={relSelecionado.dados} />}
              {!['Dashboard', 'Financeiro'].includes(relSelecionado.tipo) && (
                <DetalhesGenerico d={relSelecionado.dados} tipo={relSelecionado.tipo} />
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">Sem dados para exibir.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetalhesOpen(false)}>Fechar</Button>
            {relSelecionado && (
              <Button onClick={() => { handleDownload(relSelecionado); setDetalhesOpen(false) }}>
                <Download className="w-4 h-4 mr-2" />
                Baixar XLSX
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Agendar ────────────────────────────────────────────────── */}
      <Dialog open={agendarOpen} onOpenChange={setAgendarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendar Relatório</DialogTitle>
            <DialogDescription>Configure a geração automática de um relatório.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={agTipo} onValueChange={v => setAgTipo(v as TipoRelatorio)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Select value={agFreq} onValueChange={v => setAgFreq(v as Frequencia)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
              <p className="text-xs text-yellow-800">
                O agendamento é salvo localmente neste navegador. Quando a data de execução chegar, acesse esta página e o agendamento será exibido como pendente.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAgendarOpen(false)}>Cancelar</Button>
            <Button onClick={handleSalvarAgendamento}>
              <CalendarClock className="w-4 h-4 mr-2" />
              Salvar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

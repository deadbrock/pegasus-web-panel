"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  BarChart3,
  DollarSign,
  Settings,
  Building,
  Car,
  Plane,
  Cog,
  FileText,
  Shield,
  Phone,
  Wifi,
  Target,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  Receipt,
  List,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  History,
  Filter,
  ArrowUpDown,
  X
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CentroCusto {
  id?: number
  nome: string
  tipo: 'predefinido' | 'personalizado'
  codigo: string
  descricao?: string
  ativo: boolean
  cor_hex: string
  created_at?: string
  updated_at?: string
  total_gastos?: number
  transacoes_mes?: number
}

interface FormData {
  nome: string
  codigo: string
  descricao: string
  cor_hex: string
  ativo: boolean
  tipo: 'predefinido' | 'personalizado'
}

interface Lancamento {
  id: string
  descricao: string
  valor: number
  data: string
  categoria?: string
  forma_pagamento?: string
  status_pagamento?: string
  fornecedor?: string
  numero_documento?: string
  observacoes?: string
  created_at: string
}

interface LancamentoForm {
  descricao: string
  valor: string
  data: string
  categoria: string
  forma_pagamento: string
  status_pagamento: string
  fornecedor: string
  numero_documento: string
  observacoes: string
}

const lancamentoFormInicial: LancamentoForm = {
  descricao: '',
  valor: '',
  data: new Date().toISOString().split('T')[0],
  categoria: 'Outros',
  forma_pagamento: 'PIX',
  status_pagamento: 'Pago',
  fornecedor: '',
  numero_documento: '',
  observacoes: '',
}

const iconMap = {
  'SEDE': Building,
  'FILIAL': Building,
  'DIARIAS': Plane,
  'VEICULOS': Car,
  'MAQUINAS': Cog,
  'CONTRATOS': FileText,
  'SEGUROS': Shield,
  'TELEFONIA': Phone,
  'INTERNET': Wifi,
  'DEFAULT': Target
}

export default function CentroCustosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCentro, setEditingCentro] = useState<CentroCusto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    codigo: '',
    descricao: '',
    cor_hex: '#3B82F6',
    ativo: true,
    tipo: 'personalizado'
  })

  // Estados para lançamento de custos
  const [registrandoCusto, setRegistrandoCusto] = useState<CentroCusto | null>(null)
  const [lancamentoForm, setLancamentoForm] = useState<LancamentoForm>(lancamentoFormInicial)
  const [savingLancamento, setSavingLancamento] = useState(false)
  const [statsLancamentos, setStatsLancamentos] = useState<Record<string, { total: number; count: number }>>({})
  const [lancamentosRecentes, setLancamentosRecentes] = useState<Record<string, Lancamento[]>>({})
  const [expandidoId, setExpandidoId] = useState<string | number | null>(null)

  // Estados para histórico
  const [historicoLancamentos, setHistoricoLancamentos] = useState<(Lancamento & { centro_custo_nome?: string })[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [filtroMes, setFiltroMes] = useState<number>(new Date().getMonth() + 1)
  const [filtroAno, setFiltroAno] = useState<number>(new Date().getFullYear())
  const [filtroCentro, setFiltroCentro] = useState<string>('todos')
  const [ordenacaoHistorico, setOrdenacaoHistorico] = useState<'data_desc' | 'data_asc' | 'valor_desc' | 'valor_asc'>('data_desc')

  // Estados para o diálogo de diárias
  const [isDiariasDialogOpen, setIsDiariasDialogOpen] = useState(false)
  const [diariasFormData, setDiariasFormData] = useState({
    funcionario: '',
    cpf: '',
    cargo: '',
    periodo_inicio: new Date().toISOString().split('T')[0],
    periodo_fim: new Date().toISOString().split('T')[0],
    destino: '',
    proposito: '',
    valor_diaria: '',
    quantidade_dias: '',
    observacoes: ''
  })

  // API Functions
  const fetchCentrosCusto = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/backend/centro-custo/centros-custo')
      if (!response.ok) throw new Error('Erro ao carregar centros de custo')
      
      const data = await response.json()
      setCentrosCusto(data)
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error)
      setCentrosCusto([])
      toast({
        title: "Erro",
        description: "Não foi possível carregar os centros de custo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveCentroCusto = async () => {
    try {
      setSaving(true)
      
      const url = editingCentro 
        ? `/api/backend/centro-custo/centros-custo/${editingCentro.id}` 
        : '/api/backend/centro-custo/centros-custo'
      
      const method = editingCentro ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result?.error || 'Erro ao salvar centro de custo')
      }

      if (editingCentro) {
        setCentrosCusto(prev => prev.map(c =>
          c.id === editingCentro.id ? result : c
        ))
        toast({
          title: "Sucesso!",
          description: "Centro de custo atualizado com sucesso.",
        })
      } else {
        setCentrosCusto(prev => [...prev, result])
        toast({
          title: "Sucesso!",
          description: "Centro de custo criado com sucesso.",
        })
      }

      setIsDialogOpen(false)
      resetForm()

    } catch (error: any) {
      console.error('Erro ao salvar centro de custo:', error)
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível salvar o centro de custo.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteCentroCusto = async (id: number) => {
    try {
      const response = await fetch(`/api/backend/centro-custo/centros-custo/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.error || 'Erro ao excluir centro de custo')

      setCentrosCusto(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Sucesso!",
        description: "Centro de custo excluído com sucesso.",
      })
    } catch (error: any) {
      console.error('Erro ao excluir centro de custo:', error)
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível excluir o centro de custo.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      descricao: '',
      cor_hex: '#3B82F6',
      ativo: true,
      tipo: 'personalizado'
    })
    setEditingCentro(null)
  }

  // Carrega stats de lançamentos para todos os centros
  const fetchStatsLancamentos = async (centros: CentroCusto[]) => {
    if (centros.length === 0) return
    const inicioMes = new Date()
    inicioMes.setDate(1)
    const inicioStr = inicioMes.toISOString().split('T')[0]

    const { data } = await supabase
      .from('lancamentos_centro_custo')
      .select('centro_custo_id, valor, data')
      .gte('data', inicioStr)

    if (!data) return

    const map: Record<string, { total: number; count: number }> = {}
    for (const row of data) {
      const key = row.centro_custo_id
      if (!map[key]) map[key] = { total: 0, count: 0 }
      map[key].total += Number(row.valor)
      map[key].count += 1
    }
    setStatsLancamentos(map)
  }

  // Carrega lançamentos recentes de um centro específico
  const fetchLancamentosRecentes = async (centroId: string) => {
    const { data } = await supabase
      .from('lancamentos_centro_custo')
      .select('*')
      .eq('centro_custo_id', centroId)
      .order('data', { ascending: false })
      .limit(5)
    if (data) {
      setLancamentosRecentes(prev => ({ ...prev, [centroId]: data }))
    }
  }

  const handleRegistrarCusto = (centro: CentroCusto) => {
    setRegistrandoCusto(centro)
    setLancamentoForm(lancamentoFormInicial)
  }

  const saveLancamento = async () => {
    if (!registrandoCusto) return
    if (!lancamentoForm.descricao || !lancamentoForm.valor || !lancamentoForm.data) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    const valor = parseFloat(lancamentoForm.valor.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' })
      return
    }
    try {
      setSavingLancamento(true)
      const { error } = await supabase
        .from('lancamentos_centro_custo')
        .insert({
          centro_custo_id: registrandoCusto.id,
          centro_custo_codigo: registrandoCusto.codigo,
          descricao: lancamentoForm.descricao,
          valor,
          data: lancamentoForm.data,
          categoria: lancamentoForm.categoria,
          forma_pagamento: lancamentoForm.forma_pagamento,
          status_pagamento: lancamentoForm.status_pagamento,
          fornecedor: lancamentoForm.fornecedor || null,
          numero_documento: lancamentoForm.numero_documento || null,
          observacoes: lancamentoForm.observacoes || null,
        })
      if (error) {
        toast({ title: 'Erro ao registrar custo', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Custo registrado!', description: `${lancamentoForm.descricao} — R$ ${valor.toFixed(2)}` })
      setRegistrandoCusto(null)
      // Atualiza stats do centro salvo
      const centroId = registrandoCusto.id as string
      if (centroId) {
        fetchLancamentosRecentes(centroId)
        // Recarrega stats gerais
        fetchStatsLancamentos(centrosCusto)
      }
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message, variant: 'destructive' })
    } finally {
      setSavingLancamento(false)
    }
  }

  useEffect(() => {
    fetchCentrosCusto()
  }, [])

  // Quando centros carregam, busca stats de lançamentos
  useEffect(() => {
    if (centrosCusto.length > 0) {
      fetchStatsLancamentos(centrosCusto)
    }
  }, [centrosCusto])

  const fetchHistorico = async () => {
    setLoadingHistorico(true)
    try {
      const primeiroDia = `${filtroAno}-${String(filtroMes).padStart(2, '0')}-01`
      const ultimoDia = new Date(filtroAno, filtroMes, 0).toISOString().split('T')[0]

      let query = supabase
        .from('lancamentos_centro_custo')
        .select('*, centros_custo(nome)')
        .gte('data', primeiroDia)
        .lte('data', ultimoDia)

      if (filtroCentro !== 'todos') {
        query = query.eq('centro_custo_id', filtroCentro)
      }

      const [coluna, direcao] = ordenacaoHistorico.split('_')
      query = query.order(coluna === 'data' ? 'data' : 'valor', { ascending: direcao === 'asc' })

      const { data, error } = await query
      if (error) throw error

      const lista = (data || []).map((l: any) => ({
        ...l,
        centro_custo_nome: l.centros_custo?.nome ?? l.centro_custo_codigo ?? '—',
      }))
      setHistoricoLancamentos(lista)
    } catch (e: any) {
      console.error('Erro ao buscar histórico:', e)
      setHistoricoLancamentos([])
    } finally {
      setLoadingHistorico(false)
    }
  }

  // Recarrega histórico quando filtros mudam
  useEffect(() => {
    fetchHistorico()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroMes, filtroAno, filtroCentro, ordenacaoHistorico])

  const filteredCentros = centrosCusto.filter(centro =>
    centro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCentro = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditCentro = (centro: CentroCusto) => {
    setEditingCentro(centro)
    setFormData({
      nome: centro.nome,
      codigo: centro.codigo,
      descricao: centro.descricao || '',
      cor_hex: centro.cor_hex,
      ativo: centro.ativo,
      tipo: centro.tipo
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCentro = async (centro: CentroCusto) => {
    if (centro.tipo === 'predefinido') {
      toast({
        title: "Ação não permitida",
        description: "Centros de custo predefinidos não podem ser excluídos.",
        variant: "destructive"
      })
      return
    }

    if (confirm(`Tem certeza que deseja excluir o centro "${centro.nome}"?`)) {
      await deleteCentroCusto(centro.id!)
    }
  }

  const handleDiariasClick = (centro: CentroCusto) => {
    if (centro.codigo === 'DIARIAS') {
      setIsDiariasDialogOpen(true)
    } else {
      handleEditCentro(centro)
    }
  }

  const handleSaveDiarias = () => {
    if (!diariasFormData.funcionario || !diariasFormData.valor_diaria) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    // Simular salvamento da diária
    const valorTotal = parseFloat(diariasFormData.valor_diaria) * parseInt(diariasFormData.quantidade_dias || '1')
    
    toast({
      title: "Diária registrada!",
      description: `Diária de ${diariasFormData.funcionario} no valor de ${formatCurrency(valorTotal)} foi registrada.`,
    })

    // Reset form
    setDiariasFormData({
      funcionario: '',
      cpf: '',
      cargo: '',
      periodo_inicio: new Date().toISOString().split('T')[0],
      periodo_fim: new Date().toISOString().split('T')[0],
      destino: '',
      proposito: '',
      valor_diaria: '',
      quantidade_dias: '',
      observacoes: ''
    })

    setIsDiariasDialogOpen(false)
  }

  const getIcon = (codigo: string) => {
    const IconComponent = iconMap[codigo as keyof typeof iconMap] || iconMap.DEFAULT
    return IconComponent
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
  }

  // Soma de lançamentos do mês (dados reais da tabela lancamentos_centro_custo)
  const totalGastos = Object.values(statsLancamentos).reduce((acc, s) => acc + s.total, 0)
  const totalLancamentos = Object.values(statsLancamentos).reduce((acc, s) => acc + s.count, 0)
  const centrosAtivos = centrosCusto.filter(c => c.ativo).length
  const centrosPersonalizados = centrosCusto.filter(c => c.tipo === 'personalizado').length
  // Centro com maior gasto
  const maiorGastoEntry = Object.entries(statsLancamentos).sort((a, b) => b[1].total - a[1].total)[0]
  const maiorGastoCentro = maiorGastoEntry
    ? centrosCusto.find(c => String(c.id) === maiorGastoEntry[0])?.nome ?? '—'
    : '—'
  const maiorGastoValor = maiorGastoEntry ? maiorGastoEntry[1].total : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Carregando centros de custo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Centro de Custos</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gestão e alocação estratégica de despesas por centro</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="pg-btn-ghost text-xs h-8 px-3">
            <BarChart3 className="w-3.5 h-3.5" />
            Relatórios
          </button>
          <Link href="/dashboard/centro-custos/diarias">
            <button className="pg-btn-secondary text-xs h-8 px-3">
              <Plane className="w-3.5 h-3.5" />
              Diárias
            </button>
          </Link>
          <button className="pg-btn-primary text-xs h-8 px-3" onClick={handleCreateCentro}>
            <Plus className="w-3.5 h-3.5" />
            Novo Centro
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="pg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="pg-kpi-label mb-2">Total de Gastos</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{formatCurrency(totalGastos)}</p>
              <p className="text-xs text-slate-400 mt-1">{totalLancamentos} lançamento{totalLancamentos !== 1 ? 's' : ''} este mês</p>
            </div>
            <div className="pg-icon-rose flex-shrink-0"><DollarSign className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="pg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="pg-kpi-label mb-2">Centros Ativos</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{centrosAtivos}</p>
              <p className="text-xs text-slate-400 mt-1">de {centrosCusto.length} total</p>
            </div>
            <div className="pg-icon-blue flex-shrink-0"><Target className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="pg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="pg-kpi-label mb-2">Personalizados</p>
              <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{centrosPersonalizados}</p>
              <p className="text-xs text-slate-400 mt-1">Criados pela equipe</p>
            </div>
            <div className="pg-icon-violet flex-shrink-0"><Settings className="w-4 h-4" /></div>
          </div>
        </div>
        <div className="pg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="pg-kpi-label mb-2">Maior Gasto</p>
              <p className="text-lg font-bold tracking-tight text-slate-900 truncate" title={maiorGastoCentro}>{maiorGastoCentro}</p>
              <p className="text-xs text-slate-400 mt-1">{formatCurrency(maiorGastoValor)} este mês</p>
            </div>
            <div className="pg-icon-amber flex-shrink-0"><BarChart3 className="w-4 h-4" /></div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="centros" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 shadow-card p-1 h-9">
          <TabsTrigger value="centros" className="flex items-center gap-1.5 text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
            <Target className="w-3.5 h-3.5" />
            Centros de Custo
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-1.5 text-xs h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
            <History className="w-3.5 h-3.5" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* ABA: Centros */}
        <TabsContent value="centros" className="space-y-4">
      {/* Busca */}
      <div className="pg-card">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Lista de Centros de Custo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentros.map((centro) => {
          const IconComponent = getIcon(centro.codigo)
          
          return (
            <div key={centro.id} className="pg-card hover:shadow-elevated transition-all duration-200 group">
              <div className="p-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${centro.cor_hex}18`, color: centro.cor_hex }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm leading-tight">{centro.nome}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{centro.codigo}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className={centro.tipo === 'predefinido' ? 'pg-badge-info' : 'pg-badge-neutral'}>
                      {centro.tipo === 'predefinido' ? 'Padrão' : 'Custom'}
                    </span>
                    {!centro.ativo && <span className="pg-badge-danger">Inativo</span>}
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
                {centro.descricao && (
                  <p className="text-xs text-slate-400 line-clamp-1">{centro.descricao}</p>
                )}

                {/* Stats do mês */}
                {(() => {
                  const centroId = centro.id as string
                  const stats = centroId ? statsLancamentos[centroId] : null
                  return (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Gasto este mês</p>
                        <p className="font-bold text-sm tabular-nums" style={{ color: centro.cor_hex }}>
                          {formatCurrency(stats?.total || 0)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-2.5 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Lançamentos</p>
                        <p className="font-bold text-sm text-slate-700 tabular-nums">
                          {stats?.count || 0}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Botão principal: Registrar Custo */}
                <button
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 active:opacity-80 transition-opacity"
                  style={{ backgroundColor: centro.cor_hex }}
                  onClick={() => handleRegistrarCusto(centro)}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  Registrar Custo
                </button>

                {/* Lançamentos recentes (expandível) */}
                {(() => {
                  const centroId = centro.id as string
                  const recentes = centroId ? (lancamentosRecentes[centroId] || []) : []
                  const aberto = expandidoId === centro.id
                  return (
                    <div className="border-t border-slate-100 pt-2.5">
                      <button
                        className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => {
                          if (!aberto && centroId) fetchLancamentosRecentes(centroId)
                          setExpandidoId(aberto ? null : (centro.id ?? null))
                        }}
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <List className="w-3 h-3" />
                          Lançamentos recentes
                        </span>
                        {aberto ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {aberto && (
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {recentes.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-3">Nenhum lançamento ainda.</p>
                          ) : recentes.map(l => (
                            <div key={l.id} className="flex justify-between items-start text-xs bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
                              <div className="flex-1 min-w-0 mr-2">
                                <p className="font-medium text-slate-700 truncate">{l.descricao}</p>
                                <p className="text-slate-400 mt-0.5">{new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')} · {l.status_pagamento}</p>
                              </div>
                              <span className="font-semibold whitespace-nowrap tabular-nums" style={{ color: centro.cor_hex }}>
                                {formatCurrency(l.valor)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}

                {/* Rodapé com editar/excluir */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                  <span className="text-xs text-gray-400">
                    {centro.created_at ? new Date(centro.created_at).toLocaleDateString('pt-BR') : ''}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => centro.codigo === 'DIARIAS' ? handleDiariasClick(centro) : handleEditCentro(centro)}
                      title={centro.codigo === 'DIARIAS' ? 'Registrar Nova Diária' : 'Editar Centro'}
                    >
                      {centro.codigo === 'DIARIAS' ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                    {centro.tipo === 'personalizado' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDeleteCentro(centro)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Dialog para Criar/Editar Centro */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {editingCentro ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{editingCentro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingCentro 
                ? 'Modifique as informações do centro de custo.' 
                : 'Configure um novo centro de custo para organização financeira.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Nome */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right font-medium">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="col-span-3"
                placeholder="Ex: Projeto Especial"
                required
              />
            </div>

            {/* Código */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right font-medium">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') 
                }))}
                className="col-span-3"
                placeholder="Ex: PROJ_ESP"
                required
              />
            </div>

            {/* Tipo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right font-medium">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'predefinido' | 'personalizado') => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                  <SelectItem value="predefinido">Predefinido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cor */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cor" className="text-right font-medium">Cor</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor_hex}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_hex: e.target.value }))}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={formData.cor_hex}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_hex: e.target.value }))}
                  className="flex-1"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ativo" className="text-right font-medium">Ativo</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <span className="text-sm text-gray-600">
                  {formData.ativo ? 'Centro ativo' : 'Centro inativo'}
                </span>
              </div>
            </div>

            {/* Descrição */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="descricao" className="text-right font-medium pt-2">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="col-span-3"
                placeholder="Descrição detalhada do centro de custo..."
                rows={3}
              />
            </div>

            {/* Preview */}
            {(formData.nome || formData.codigo) && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-medium pt-2">Preview</Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${formData.cor_hex}20`, color: formData.cor_hex }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{formData.nome || 'Nome do Centro'}</p>
                      <p className="text-sm text-gray-500">{formData.codigo || 'CODIGO'}</p>
                    </div>
                    <Badge variant={formData.tipo === 'predefinido' ? 'default' : 'secondary'}>
                      {formData.tipo === 'predefinido' ? 'Padrão' : 'Personalizado'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              onClick={saveCentroCusto} 
              disabled={saving || !formData.nome || !formData.codigo}
              className="min-w-[100px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingCentro ? 'Salvar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog específico para Diárias */}
      <Dialog open={isDiariasDialogOpen} onOpenChange={setIsDiariasDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-amber-600" />
              <span>Registrar Nova Diária</span>
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar uma nova diária para funcionário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Dados do Funcionário */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Dados do Funcionário
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funcionario">Nome Completo *</Label>
                  <Input
                    id="funcionario"
                    value={diariasFormData.funcionario}
                    onChange={(e) => setDiariasFormData({...diariasFormData, funcionario: e.target.value})}
                    placeholder="Digite o nome do funcionário"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={diariasFormData.cpf}
                    onChange={(e) => setDiariasFormData({...diariasFormData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cargo">Cargo/Função</Label>
                <Select 
                  value={diariasFormData.cargo} 
                  onValueChange={(value) => setDiariasFormData({...diariasFormData, cargo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorista">Motorista</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                    <SelectItem value="consultor">Consultor</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Período e Destino */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Período da Viagem
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodo_inicio">Data Início</Label>
                  <Input
                    id="periodo_inicio"
                    type="date"
                    value={diariasFormData.periodo_inicio}
                    onChange={(e) => setDiariasFormData({...diariasFormData, periodo_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="periodo_fim">Data Fim</Label>
                  <Input
                    id="periodo_fim"
                    type="date"
                    value={diariasFormData.periodo_fim}
                    onChange={(e) => setDiariasFormData({...diariasFormData, periodo_fim: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={diariasFormData.destino}
                  onChange={(e) => setDiariasFormData({...diariasFormData, destino: e.target.value})}
                  placeholder="Cidade/Estado de destino"
                />
              </div>
              <div>
                <Label htmlFor="proposito">Propósito da Viagem</Label>
                <Select 
                  value={diariasFormData.proposito} 
                  onValueChange={(value) => setDiariasFormData({...diariasFormData, proposito: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o propósito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="coleta">Coleta</SelectItem>
                    <SelectItem value="visita_cliente">Visita a Cliente</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valores */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Valores da Diária
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_diaria">Valor por Dia *</Label>
                  <Input
                    id="valor_diaria"
                    type="number"
                    step="0.01"
                    value={diariasFormData.valor_diaria}
                    onChange={(e) => setDiariasFormData({...diariasFormData, valor_diaria: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade_dias">Quantidade de Dias</Label>
                  <Input
                    id="quantidade_dias"
                    type="number"
                    value={diariasFormData.quantidade_dias}
                    onChange={(e) => setDiariasFormData({...diariasFormData, quantidade_dias: e.target.value})}
                    placeholder="1"
                  />
                </div>
              </div>
              {diariasFormData.valor_diaria && diariasFormData.quantidade_dias && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Valor Total: </strong>
                    {formatCurrency(parseFloat(diariasFormData.valor_diaria) * parseInt(diariasFormData.quantidade_dias))}
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={diariasFormData.observacoes}
                onChange={(e) => setDiariasFormData({...diariasFormData, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre a diária..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDiariasDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveDiarias}>
                <Save className="w-4 h-4 mr-2" />
                Registrar Diária
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Dialog: Registrar Custo ===== */}
      <Dialog open={!!registrandoCusto} onOpenChange={(open) => { if (!open) setRegistrandoCusto(null) }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {registrandoCusto && (
                <div
                  className="w-7 h-7 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${registrandoCusto.cor_hex}20`, color: registrandoCusto.cor_hex }}
                >
                  <Receipt className="w-4 h-4" />
                </div>
              )}
              Registrar Custo — {registrandoCusto?.nome}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do lançamento. Ele será vinculado a este centro de custo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Linha 1: Descrição */}
            <div className="space-y-1">
              <Label htmlFor="lc-descricao">Descrição *</Label>
              <Input
                id="lc-descricao"
                placeholder="Ex: Abastecimento veículo, Aluguel sala..."
                value={lancamentoForm.descricao}
                onChange={e => setLancamentoForm(p => ({ ...p, descricao: e.target.value }))}
              />
            </div>

            {/* Linha 2: Valor + Data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="lc-valor">Valor (R$) *</Label>
                <Input
                  id="lc-valor"
                  placeholder="0,00"
                  value={lancamentoForm.valor}
                  onChange={e => setLancamentoForm(p => ({ ...p, valor: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lc-data">Data *</Label>
                <Input
                  id="lc-data"
                  type="date"
                  value={lancamentoForm.data}
                  onChange={e => setLancamentoForm(p => ({ ...p, data: e.target.value }))}
                />
              </div>
            </div>

            {/* Linha 3: Categoria + Forma Pagamento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Categoria</Label>
                <Select value={lancamentoForm.categoria} onValueChange={v => setLancamentoForm(p => ({ ...p, categoria: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Combustível','Manutenção','Salário','Aluguel','Material','Serviço','Pedágio','Seguro','Impostos','Outros'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Forma de Pagamento</Label>
                <Select value={lancamentoForm.forma_pagamento} onValueChange={v => setLancamentoForm(p => ({ ...p, forma_pagamento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['PIX','Dinheiro','Cartão','Boleto','Transferência'].map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 4: Status + Fornecedor */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={lancamentoForm.status_pagamento} onValueChange={v => setLancamentoForm(p => ({ ...p, status_pagamento: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="lc-fornecedor">Fornecedor</Label>
                <Input
                  id="lc-fornecedor"
                  placeholder="Nome do fornecedor"
                  value={lancamentoForm.fornecedor}
                  onChange={e => setLancamentoForm(p => ({ ...p, fornecedor: e.target.value }))}
                />
              </div>
            </div>

            {/* Linha 5: Nº Documento + Observações */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="lc-doc">Nº Documento</Label>
                <Input
                  id="lc-doc"
                  placeholder="NF, Recibo, etc."
                  value={lancamentoForm.numero_documento}
                  onChange={e => setLancamentoForm(p => ({ ...p, numero_documento: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lc-obs">Observações</Label>
                <Input
                  id="lc-obs"
                  placeholder="Informações adicionais"
                  value={lancamentoForm.observacoes}
                  onChange={e => setLancamentoForm(p => ({ ...p, observacoes: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setRegistrandoCusto(null)} disabled={savingLancamento}>
              Cancelar
            </Button>
            <Button
              onClick={saveLancamento}
              disabled={savingLancamento || !lancamentoForm.descricao || !lancamentoForm.valor || !lancamentoForm.data}
              style={registrandoCusto ? { backgroundColor: registrandoCusto.cor_hex } : {}}
            >
              {savingLancamento ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</>
              ) : (
                <><Receipt className="w-4 h-4 mr-2" />Registrar</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {filteredCentros.length === 0 && (
        <div className="pg-card">
          <div className="pg-empty py-16">
            <div className="pg-empty-icon w-14 h-14"><Target className="w-6 h-6" /></div>
            <p className="pg-empty-title">Nenhum centro de custo encontrado</p>
            <p className="pg-empty-description">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro centro de custo personalizado'}
            </p>
            {!searchTerm && (
              <button className="pg-btn-primary mt-4" onClick={handleCreateCentro}>
                <Plus className="w-3.5 h-3.5" />
                Criar Centro de Custo
              </button>
            )}
          </div>
        </div>
      )}
        </TabsContent>

        {/* ABA: Histórico */}
        <TabsContent value="historico" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Mês</label>
                  <select
                    value={filtroMes}
                    onChange={(e) => setFiltroMes(Number(e.target.value))}
                    className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Ano</label>
                  <select
                    value={filtroAno}
                    onChange={(e) => setFiltroAno(Number(e.target.value))}
                    className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Centro</label>
                  <select
                    value={filtroCentro}
                    onChange={(e) => setFiltroCentro(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                  >
                    <option value="todos">Todos os centros</option>
                    {centrosCusto.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Ordenar por</label>
                  <select
                    value={ordenacaoHistorico}
                    onChange={(e) => setOrdenacaoHistorico(e.target.value as any)}
                    className="border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="data_desc">Data (mais recente)</option>
                    <option value="data_asc">Data (mais antiga)</option>
                    <option value="valor_desc">Valor (maior)</option>
                    <option value="valor_asc">Valor (menor)</option>
                  </select>
                </div>
                <div className="ml-auto flex items-end">
                  <div className="text-sm text-gray-500">
                    {loadingHistorico ? (
                      <span className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</span>
                    ) : (
                      <span>{historicoLancamentos.length} lançamento{historicoLancamentos.length !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo do período */}
          {!loadingHistorico && historicoLancamentos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-blue-100 bg-blue-50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-blue-600 font-medium">Total do período</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatCurrency(historicoLancamentos.reduce((s, l) => s + Number(l.valor), 0))}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-green-100 bg-green-50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-green-600 font-medium">Pagos</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatCurrency(historicoLancamentos.filter(l => l.status_pagamento === 'Pago').reduce((s, l) => s + Number(l.valor), 0))}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-amber-100 bg-amber-50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-amber-600 font-medium">Pendentes</p>
                  <p className="text-xl font-bold text-amber-700">
                    {formatCurrency(historicoLancamentos.filter(l => l.status_pagamento === 'Pendente').reduce((s, l) => s + Number(l.valor), 0))}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-red-100 bg-red-50">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-red-600 font-medium">Vencidos</p>
                  <p className="text-xl font-bold text-red-700">
                    {formatCurrency(historicoLancamentos.filter(l => l.status_pagamento === 'Vencido').reduce((s, l) => s + Number(l.valor), 0))}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabela de lançamentos */}
          <Card>
            <CardContent className="p-0">
              {loadingHistorico ? (
                <div className="flex items-center justify-center py-16 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Carregando histórico...
                </div>
              ) : historicoLancamentos.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">Nenhum lançamento encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar os filtros ou registre um custo nos cards.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Centro</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Descrição</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Categoria</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Forma Pgto.</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Valor</th>
                        <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Fornecedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historicoLancamentos.map((l) => (
                        <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                            {new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const centro = centrosCusto.find(c => String(c.id) === String(l.centro_custo_id))
                                return centro ? (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: centro.cor_hex }}
                                  />
                                ) : null
                              })()}
                              <span className="text-gray-700 font-medium truncate max-w-[130px]" title={l.centro_custo_nome}>
                                {l.centro_custo_nome}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                            <span className="truncate block" title={l.descricao}>{l.descricao}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500">{l.categoria}</td>
                          <td className="px-4 py-3 text-gray-500">{l.forma_pagamento}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(Number(l.valor))}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              l.status_pagamento === 'Pago'
                                ? 'bg-green-100 text-green-700'
                                : l.status_pagamento === 'Pendente'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {l.status_pagamento}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 max-w-[150px]">
                            <span className="truncate block" title={l.fornecedor ?? ''}>{l.fornecedor || '—'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

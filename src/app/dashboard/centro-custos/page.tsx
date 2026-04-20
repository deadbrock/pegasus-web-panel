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
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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

  const totalGastos = centrosCusto.reduce((acc, centro) => acc + (centro.total_gastos || 0), 0)
  const centrosAtivos = centrosCusto.filter(c => c.ativo).length
  const centrosPersonalizados = centrosCusto.filter(c => c.tipo === 'personalizado').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando centros de custo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Custos</h1>
          <p className="text-gray-600">Gestão e alocação de despesas por centro</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
          <Link href="/dashboard/centro-custos/diarias">
            <Button variant="outline" size="sm">
              <Plane className="w-4 h-4 mr-2" />
              Gerenciar Diárias
            </Button>
          </Link>
          <Button size="sm" onClick={handleCreateCentro}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Centro
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGastos)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centrosAtivos}</div>
            <p className="text-xs text-muted-foreground">de {centrosCusto.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personalizados</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centrosPersonalizados}</div>
            <p className="text-xs text-muted-foreground">Criados pela equipe</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Gasto</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sede</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(125000)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Centros de Custo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentros.map((centro) => {
          const IconComponent = getIcon(centro.codigo)
          
          return (
            <Card key={centro.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${centro.cor_hex}20`, color: centro.cor_hex }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{centro.nome}</CardTitle>
                      <p className="text-sm text-gray-500">{centro.codigo}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Badge variant={centro.tipo === 'predefinido' ? 'default' : 'secondary'}>
                      {centro.tipo === 'predefinido' ? 'Padrão' : 'Personalizado'}
                    </Badge>
                    {!centro.ativo && <Badge variant="destructive">Inativo</Badge>}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {centro.descricao && (
                  <p className="text-sm text-gray-500 line-clamp-1">{centro.descricao}</p>
                )}

                {/* Stats do mês */}
                {(() => {
                  const centroId = centro.id as string
                  const stats = centroId ? statsLancamentos[centroId] : null
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Gasto este mês</p>
                        <p className="font-bold text-base" style={{ color: centro.cor_hex }}>
                          {formatCurrency(stats?.total || 0)}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-gray-500 mb-0.5">Lançamentos</p>
                        <p className="font-bold text-base text-gray-700">
                          {stats?.count || 0}
                        </p>
                      </div>
                    </div>
                  )
                })()}

                {/* Botão principal: Registrar Custo */}
                <Button
                  className="w-full"
                  size="sm"
                  style={{ backgroundColor: centro.cor_hex, borderColor: centro.cor_hex }}
                  onClick={() => handleRegistrarCusto(centro)}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Registrar Custo
                </Button>

                {/* Lançamentos recentes (expandível) */}
                {(() => {
                  const centroId = centro.id as string
                  const recentes = centroId ? (lancamentosRecentes[centroId] || []) : []
                  const aberto = expandidoId === centro.id
                  return (
                    <div className="border-t pt-2">
                      <button
                        className="flex items-center justify-between w-full text-xs text-gray-500 hover:text-gray-700"
                        onClick={() => {
                          if (!aberto && centroId) fetchLancamentosRecentes(centroId)
                          setExpandidoId(aberto ? null : (centro.id ?? null))
                        }}
                      >
                        <span className="flex items-center gap-1">
                          <List className="w-3 h-3" />
                          Lançamentos recentes
                        </span>
                        {aberto ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {aberto && (
                        <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                          {recentes.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2">Nenhum lançamento ainda.</p>
                          ) : recentes.map(l => (
                            <div key={l.id} className="flex justify-between items-start text-xs bg-gray-50 rounded px-2 py-1.5">
                              <div className="flex-1 min-w-0 mr-2">
                                <p className="font-medium text-gray-700 truncate">{l.descricao}</p>
                                <p className="text-gray-400">{new Date(l.data + 'T12:00:00').toLocaleDateString('pt-BR')} · {l.status_pagamento}</p>
                              </div>
                              <span className="font-semibold text-gray-800 whitespace-nowrap" style={{ color: centro.cor_hex }}>
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
                <div className="flex justify-between items-center pt-1 border-t">
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
              </CardContent>
            </Card>
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
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum centro de custo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro centro de custo personalizado'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateCentro}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Centro de Custo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

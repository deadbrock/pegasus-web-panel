"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  Target,
  PieChart,
  BarChart3,
  DollarSign,
  AlertCircle,
  Download,
  FileText,
  Trash2,
  Edit,
  RefreshCw
} from 'lucide-react'
import {
  fetchMetasFinanceiras,
  createMeta,
  updateMetaProgresso,
  deleteMeta,
  fetchMetasEstatisticas,
  type MetaFinanceira
} from '@/lib/services/metas-service'
import { useToast } from '@/hooks/use-toast'

export default function PlanejamentoPage() {
  const { toast } = useToast()
  const [selectedPeriod, setSelectedPeriod] = useState('2025')
  const [isMetaDialogOpen, setIsMetaDialogOpen] = useState(false)
  const [metas, setMetas] = useState<MetaFinanceira[]>([])
  const [loading, setLoading] = useState(true)
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [novaMetaData, setNovaMetaData] = useState({
    categoria: '',
    metaAnual: '',
    periodo: '',
    descricao: ''
  })

  // Carregar metas do Supabase
  useEffect(() => {
    loadMetas()
  }, [selectedPeriod])

  const loadMetas = async () => {
    setLoading(true)
    try {
      const [metasData, statsData] = await Promise.all([
        fetchMetasFinanceiras(selectedPeriod),
        fetchMetasEstatisticas(selectedPeriod)
      ])
      setMetas(metasData)
      setEstatisticas(statsData)
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
      toast({
        title: 'Erro ao carregar metas',
        description: 'Não foi possível carregar as metas financeiras',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para exportar relatório
  const handleExportRelatorio = () => {
    const relatorioData = {
      periodo: selectedPeriod,
      metas: metas,
      estatisticas: estatisticas,
      gerado_em: new Date().toLocaleString('pt-BR')
    }
    
    const dataStr = JSON.stringify(relatorioData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-planejamento-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Relatório exportado!',
      description: 'O relatório foi baixado com sucesso'
    })
  }

  // Função para criar nova meta
  const handleCriarNovaMeta = async () => {
    try {
      const result = await createMeta({
        categoria: novaMetaData.categoria,
        meta_anual: Number(novaMetaData.metaAnual),
        periodo: novaMetaData.periodo,
        ano: selectedPeriod,
        descricao: novaMetaData.descricao
      })

      if (result) {
        toast({
          title: 'Meta criada!',
          description: `Meta "${novaMetaData.categoria}" foi criada com sucesso`
        })
        setIsMetaDialogOpen(false)
        setNovaMetaData({ categoria: '', metaAnual: '', periodo: '', descricao: '' })
        loadMetas() // Recarregar metas
      } else {
        throw new Error('Falha ao criar meta')
      }
    } catch (error) {
      console.error('Erro ao criar meta:', error)
      toast({
        title: 'Erro ao criar meta',
        description: 'Não foi possível criar a meta',
        variant: 'destructive'
      })
    }
  }

  // Função para deletar meta
  const handleDeletarMeta = async (id: string, categoria: string) => {
    if (!confirm(`Deseja realmente deletar a meta "${categoria}"?`)) {
      return
    }

    try {
      const success = await deleteMeta(id)
      if (success) {
        toast({
          title: 'Meta deletada!',
          description: `Meta "${categoria}" foi removida`
        })
        loadMetas()
      }
    } catch (error) {
      console.error('Erro ao deletar meta:', error)
      toast({
        title: 'Erro ao deletar meta',
        description: 'Não foi possível deletar a meta',
        variant: 'destructive'
      })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      no_prazo: 'bg-green-100 text-green-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      atrasado: 'bg-red-100 text-red-800',
      concluido: 'bg-gray-100 text-gray-800',
      cancelado: 'bg-red-200 text-red-900'
    }
    const labels = {
      no_prazo: 'No Prazo',
      em_andamento: 'Em Andamento',
      atrasado: 'Atrasado',
      concluido: 'Concluído',
      cancelado: 'Cancelado'
    }
    return <Badge className={colors[status as keyof typeof colors]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Carregando metas...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planejamento Financeiro</h1>
          <p className="text-gray-600">Metas, projeções e análise estratégica</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportRelatorio}
          >
            <Download className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
          
          <Dialog open={isMetaDialogOpen} onOpenChange={setIsMetaDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Meta</DialogTitle>
                <DialogDescription>
                  Defina uma nova meta financeira para acompanhamento
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Categoria */}
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria da Meta *</Label>
                  <Select 
                    value={novaMetaData.categoria} 
                    onValueChange={(value) => setNovaMetaData({...novaMetaData, categoria: value})}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Receita Operacional">Receita Operacional</SelectItem>
                      <SelectItem value="Redução de Custos">Redução de Custos</SelectItem>
                      <SelectItem value="Investimentos">Investimentos</SelectItem>
                      <SelectItem value="Margem de Lucro">Margem de Lucro</SelectItem>
                      <SelectItem value="Expansão">Expansão</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Inovação">Inovação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Valor da Meta */}
                <div className="space-y-2">
                  <Label htmlFor="metaAnual">Valor da Meta Anual (R$) *</Label>
                  <Input
                    id="metaAnual"
                    type="number"
                    placeholder="Ex: 500000"
                    value={novaMetaData.metaAnual}
                    onChange={(e) => setNovaMetaData({...novaMetaData, metaAnual: e.target.value})}
                  />
                </div>

                {/* Período */}
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período *</Label>
                  <Select 
                    value={novaMetaData.periodo} 
                    onValueChange={(value) => setNovaMetaData({...novaMetaData, periodo: value})}
                  >
                    <SelectTrigger id="periodo">
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1 2025">Q1 2025 (Jan-Mar)</SelectItem>
                      <SelectItem value="Q2 2025">Q2 2025 (Abr-Jun)</SelectItem>
                      <SelectItem value="Q3 2025">Q3 2025 (Jul-Set)</SelectItem>
                      <SelectItem value="Q4 2025">Q4 2025 (Out-Dez)</SelectItem>
                      <SelectItem value="Anual 2025">Anual 2025</SelectItem>
                      <SelectItem value="Anual 2026">Anual 2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição (Opcional)</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva os objetivos e estratégias desta meta..."
                    value={novaMetaData.descricao}
                    onChange={(e) => setNovaMetaData({...novaMetaData, descricao: e.target.value})}
                    rows={3}
                  />
                </div>

                {/* Preview */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 font-medium">Preview da Meta:</p>
                      <p className="text-sm font-bold text-blue-900">
                        {novaMetaData.categoria || 'Categoria'} - 
                        {novaMetaData.metaAnual ? ` R$ ${Number(novaMetaData.metaAnual).toLocaleString('pt-BR')}` : ' R$ 0,00'}
                      </p>
                      <p className="text-xs text-blue-700">{novaMetaData.periodo || 'Período não definido'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsMetaDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCriarNovaMeta}
                  disabled={!novaMetaData.categoria || !novaMetaData.metaAnual || !novaMetaData.periodo}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Meta
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estatisticas?.meta_total || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{selectedPeriod}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Realizado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estatisticas?.realizado_total || 0)}
            </div>
            <p className="text-xs text-blue-600">{estatisticas?.progresso_medio || 0}% concluído</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {estatisticas?.concluidas || 0} concluídas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas?.taxa_conclusao || 0}%</div>
            <p className="text-xs text-green-600">
              {estatisticas?.no_prazo || 0} no prazo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de Período */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Período:</span>
            <div className="flex flex-wrap gap-2">
              {['2025', '2026', '2027', '2028', '2029', '2030'].map((year) => (
                <Button
                  key={year}
                  variant={selectedPeriod === year ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metas Financeiras */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Metas Financeiras {selectedPeriod}</CardTitle>
            <Button variant="outline" size="sm" onClick={loadMetas}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {metas.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma meta cadastrada
              </h3>
              <p className="text-gray-600 mb-4">
                Crie sua primeira meta financeira para {selectedPeriod}
              </p>
              <Button onClick={() => setIsMetaDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {metas.map((meta) => (
                <div key={meta.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{meta.categoria}</h3>
                      <p className="text-sm text-gray-500">{meta.periodo}</p>
                      {meta.descricao && (
                        <p className="text-xs text-gray-400 mt-1">{meta.descricao}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(meta.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletarMeta(meta.id, meta.categoria)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Meta Anual</p>
                      <p className="font-semibold">
                        {formatCurrency(Number(meta.meta_anual))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Realizado</p>
                      <p className="font-semibold">
                        {formatCurrency(Number(meta.realizado_atual))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Progresso</p>
                      <p className="font-semibold">{meta.progresso}%</p>
                    </div>
                  </div>
                  
                  {/* Barra de Progresso */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        meta.status === 'atrasado' ? 'bg-red-500' :
                        meta.status === 'no_prazo' ? 'bg-green-500' :
                        meta.status === 'concluido' ? 'bg-gray-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${meta.progresso}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

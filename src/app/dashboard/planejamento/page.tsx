"use client"

import { useState } from 'react'
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
  FileText
} from 'lucide-react'

export default function PlanejamentoPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024')
  const [isMetaDialogOpen, setIsMetaDialogOpen] = useState(false)
  const [novaMetaData, setNovaMetaData] = useState({
    categoria: '',
    metaAnual: '',
    periodo: '',
    descricao: ''
  })

  // Função para exportar relatório
  const handleExportRelatorio = () => {
    const relatorioData = {
      periodo: selectedPeriod,
      metas: metasFinanceiras,
      projecoes: projecoes,
      resumo: {
        receita_prevista: 320000,
        custos_previstos: 249000,
        lucro_projetado: 71000,
        metas_atingidas: '75%'
      },
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
  }

  // Função para criar nova meta
  const handleCriarNovaMeta = () => {
    console.log('Nova Meta:', novaMetaData)
    // Aqui você pode adicionar a lógica para salvar no Supabase
    alert(`Meta "${novaMetaData.categoria}" criada com sucesso!\nValor: R$ ${novaMetaData.metaAnual}`)
    setIsMetaDialogOpen(false)
    setNovaMetaData({ categoria: '', metaAnual: '', periodo: '', descricao: '' })
  }

  // Dados simulados de planejamento financeiro
  const metasFinanceiras = [
    {
      id: 1,
      categoria: 'Receita Operacional',
      metaAnual: 500000,
      realizadoAtual: 125000,
      periodo: 'Q1 2024',
      status: 'em_andamento',
      progresso: 25
    },
    {
      id: 2,
      categoria: 'Redução de Custos',
      metaAnual: 50000,
      realizadoAtual: 15000,
      periodo: 'Q1 2024',
      status: 'atrasado',
      progresso: 30
    },
    {
      id: 3,
      categoria: 'Investimentos',
      metaAnual: 100000,
      realizadoAtual: 35000,
      periodo: 'Q1 2024',
      status: 'no_prazo',
      progresso: 35
    },
    {
      id: 4,
      categoria: 'Margem de Lucro',
      metaAnual: 15, // percentual
      realizadoAtual: 12,
      periodo: 'Q1 2024',
      status: 'em_andamento',
      progresso: 80
    }
  ]

  const projecoes = [
    { mes: 'Jan', receita: 45000, despesa: 38000, lucro: 7000 },
    { mes: 'Fev', receita: 52000, despesa: 41000, lucro: 11000 },
    { mes: 'Mar', receita: 48000, despesa: 39000, lucro: 9000 },
    { mes: 'Abr', receita: 55000, despesa: 42000, lucro: 13000 },
    { mes: 'Mai', receita: 58000, despesa: 44000, lucro: 14000 },
    { mes: 'Jun', receita: 62000, despesa: 45000, lucro: 17000 }
  ]

  const getStatusBadge = (status: string) => {
    const colors = {
      no_prazo: 'bg-green-100 text-green-800',
      em_andamento: 'bg-blue-100 text-blue-800',
      atrasado: 'bg-red-100 text-red-800',
      concluido: 'bg-gray-100 text-gray-800'
    }
    const labels = {
      no_prazo: 'No Prazo',
      em_andamento: 'Em Andamento',
      atrasado: 'Atrasado',
      concluido: 'Concluído'
    }
    return <Badge className={colors[status as keyof typeof colors]}>
      {labels[status as keyof typeof labels]}
    </Badge>
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
            <CardTitle className="text-sm font-medium">Receita Prevista</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 320.000</div>
            <p className="text-xs text-green-600">+15% vs planejado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custos Previstos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 249.000</div>
            <p className="text-xs text-red-600">+8% vs planejado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Projetado</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 71.000</div>
            <p className="text-xs text-green-600">22.2% margem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Atingidas</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">3 de 4 metas</p>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de Período */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Período:</span>
            <div className="flex space-x-2">
              {['2024', '2023', '2022'].map((year) => (
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
          <CardTitle>Metas Financeiras {selectedPeriod}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {metasFinanceiras.map((meta) => (
              <div key={meta.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{meta.categoria}</h3>
                    <p className="text-sm text-gray-500">{meta.periodo}</p>
                  </div>
                  {getStatusBadge(meta.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Meta Anual</p>
                    <p className="font-semibold">
                      {meta.categoria === 'Margem de Lucro' 
                        ? `${meta.metaAnual}%` 
                        : meta.metaAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Realizado</p>
                    <p className="font-semibold">
                      {meta.categoria === 'Margem de Lucro' 
                        ? `${meta.realizadoAtual}%` 
                        : meta.realizadoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      }
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
                    className={`h-2 rounded-full ${
                      meta.status === 'atrasado' ? 'bg-red-500' :
                      meta.status === 'no_prazo' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${meta.progresso}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projeções Mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Projeções Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-blue-700">
                  {projecoes.reduce((acc, p) => acc + p.receita, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Despesas Total</p>
                <p className="text-2xl font-bold text-red-700">
                  {projecoes.reduce((acc, p) => acc + p.despesa, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Lucro Total</p>
                <p className="text-2xl font-bold text-green-700">
                  {projecoes.reduce((acc, p) => acc + p.lucro, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Mês</th>
                    <th className="text-right p-2">Receita</th>
                    <th className="text-right p-2">Despesas</th>
                    <th className="text-right p-2">Lucro</th>
                    <th className="text-right p-2">Margem</th>
                  </tr>
                </thead>
                <tbody>
                  {projecoes.map((proj, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{proj.mes}</td>
                      <td className="p-2 text-right">{proj.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-2 text-right">{proj.despesa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-2 text-right font-semibold text-green-600">{proj.lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                      <td className="p-2 text-right">{((proj.lucro / proj.receita) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

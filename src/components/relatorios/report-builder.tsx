'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings,
  Plus,
  Minus,
  Eye,
  Download,
  Save,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  FileText,
  Calendar,
  Filter,
  DollarSign,
  Users,
  Truck,
  Package,
  Shield
} from 'lucide-react'

// Mock data para campos disponíveis
const availableFields = {
  operacional: [
    { id: 'entregas_realizadas', nome: 'Entregas Realizadas', tipo: 'numero' },
    { id: 'tempo_medio_entrega', nome: 'Tempo Médio de Entrega', tipo: 'tempo' },
    { id: 'rotas_completadas', nome: 'Rotas Completadas', tipo: 'numero' },
    { id: 'distancia_percorrida', nome: 'Distância Percorrida', tipo: 'numero' },
    { id: 'eficiencia_operacional', nome: 'Eficiência Operacional', tipo: 'percentual' }
  ],
  financeiro: [
    { id: 'custos_combustivel', nome: 'Custos de Combustível', tipo: 'moeda' },
    { id: 'custos_manutencao', nome: 'Custos de Manutenção', tipo: 'moeda' },
    { id: 'receita_total', nome: 'Receita Total', tipo: 'moeda' },
    { id: 'margem_lucro', nome: 'Margem de Lucro', tipo: 'percentual' },
    { id: 'roi', nome: 'ROI', tipo: 'percentual' }
  ],
  rh: [
    { id: 'total_motoristas', nome: 'Total de Motoristas', tipo: 'numero' },
    { id: 'performance_media', nome: 'Performance Média', tipo: 'percentual' },
    { id: 'horas_trabalhadas', nome: 'Horas Trabalhadas', tipo: 'numero' },
    { id: 'pontos_gamificacao', nome: 'Pontos de Gamificação', tipo: 'numero' },
    { id: 'conquistas_obtidas', nome: 'Conquistas Obtidas', tipo: 'numero' }
  ],
  frota: [
    { id: 'veiculos_ativos', nome: 'Veículos Ativos', tipo: 'numero' },
    { id: 'km_rodados', nome: 'KM Rodados', tipo: 'numero' },
    { id: 'manutencoes_realizadas', nome: 'Manutenções Realizadas', tipo: 'numero' },
    { id: 'consumo_combustivel', nome: 'Consumo de Combustível', tipo: 'numero' },
    { id: 'ocupacao_frota', nome: 'Ocupação da Frota', tipo: 'percentual' }
  ]
}

const chartTypes = [
  { id: 'bar', nome: 'Gráfico de Barras', icon: BarChart3 },
  { id: 'pie', nome: 'Gráfico de Pizza', icon: PieChart },
  { id: 'line', nome: 'Gráfico de Linha', icon: LineChart },
  { id: 'table', nome: 'Tabela', icon: Table }
]

const formatTypes = [
  { id: 'pdf', nome: 'PDF' },
  { id: 'excel', nome: 'Excel' },
  { id: 'csv', nome: 'CSV' },
  { id: 'json', nome: 'JSON' }
]

export function ReportBuilder() {
  const [reportData, setReportData] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    periodo: 'mensal',
    formato: 'pdf',
    campos: [] as any[],
    filtros: [] as any[],
    visualizacoes: [] as any[]
  })

  const [selectedCategory, setSelectedCategory] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const handleAddField = (field: any) => {
    const newField = {
      ...field,
      id: `${field.id}_${Date.now()}`,
      categoria: selectedCategory
    }
    setReportData(prev => ({
      ...prev,
      campos: [...prev.campos, newField]
    }))
  }

  const handleRemoveField = (fieldId: string) => {
    setReportData(prev => ({
      ...prev,
      campos: prev.campos.filter(f => f.id !== fieldId)
    }))
  }

  const handleAddVisualization = () => {
    const newViz = {
      id: `viz_${Date.now()}`,
      tipo: 'bar',
      titulo: 'Nova Visualização',
      campos: []
    }
    setReportData(prev => ({
      ...prev,
      visualizacoes: [...prev.visualizacoes, newViz]
    }))
  }

  const handleSaveReport = () => {
    console.log('Salvando relatório:', reportData)
  }

  const handleGeneratePreview = () => {
    setPreviewMode(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Construtor de Relatórios</h2>
          <p className="text-gray-600">Crie relatórios personalizados com campos e visualizações específicas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGeneratePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button variant="outline" onClick={handleSaveReport}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      <Tabs defaultValue="configuracao" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="campos">Campos</TabsTrigger>
          <TabsTrigger value="visualizacoes">Visualizações</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* Configuração Básica */}
        <TabsContent value="configuracao" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Relatório *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Relatório de Performance Mensal"
                    value={reportData.nome}
                    onChange={(e) => setReportData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select 
                    value={reportData.categoria} 
                    onValueChange={(value) => setReportData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                      <SelectItem value="frota">Frota</SelectItem>
                      <SelectItem value="estoque">Estoque</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Select 
                    value={reportData.periodo} 
                    onValueChange={(value) => setReportData(prev => ({ ...prev, periodo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato">Formato de Saída</Label>
                  <Select 
                    value={reportData.formato} 
                    onValueChange={(value) => setReportData(prev => ({ ...prev, formato: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatTypes.map((format) => (
                        <SelectItem key={format.id} value={format.id}>
                          {format.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o objetivo e conteúdo do relatório..."
                  value={reportData.descricao}
                  onChange={(e) => setReportData(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seleção de Campos */}
        <TabsContent value="campos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campos Disponíveis */}
            <Card>
              <CardHeader>
                <CardTitle>Campos Disponíveis</CardTitle>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="rh">Recursos Humanos</SelectItem>
                      <SelectItem value="frota">Frota</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {selectedCategory && (
                  <div className="space-y-2">
                    {availableFields[selectedCategory as keyof typeof availableFields]?.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{field.nome}</p>
                          <p className="text-xs text-gray-600">{field.tipo}</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleAddField(field)}
                          disabled={reportData.campos.some(c => c.nome === field.nome)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {!selectedCategory && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Selecione uma categoria para ver os campos disponíveis</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Campos Selecionados */}
            <Card>
              <CardHeader>
                <CardTitle>Campos Selecionados ({reportData.campos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {reportData.campos.length > 0 ? (
                  <div className="space-y-2">
                    {reportData.campos.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{field.nome}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {field.categoria}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {field.tipo}
                            </Badge>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRemoveField(field.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum campo selecionado</p>
                    <p className="text-sm">Adicione campos da categoria ao lado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Visualizações */}
        <TabsContent value="visualizacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Visualizações e Gráficos</CardTitle>
                <Button onClick={handleAddVisualization}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Visualização
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData.visualizacoes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {reportData.visualizacoes.map((viz, index) => (
                    <Card key={viz.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Input
                            placeholder="Título da visualização"
                            value={viz.titulo}
                            onChange={(e) => {
                              const newViz = [...reportData.visualizacoes]
                              newViz[index].titulo = e.target.value
                              setReportData(prev => ({ ...prev, visualizacoes: newViz }))
                            }}
                            className="font-medium"
                          />
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setReportData(prev => ({
                                ...prev,
                                visualizacoes: prev.visualizacoes.filter(v => v.id !== viz.id)
                              }))
                            }}
                            className="text-red-600"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label>Tipo de Gráfico</Label>
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {chartTypes.map((chart) => {
                                const Icon = chart.icon
                                return (
                                  <Button
                                    key={chart.id}
                                    variant={viz.tipo === chart.id ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                      const newViz = [...reportData.visualizacoes]
                                      newViz[index].tipo = chart.id
                                      setReportData(prev => ({ ...prev, visualizacoes: newViz }))
                                    }}
                                    className="justify-start"
                                  >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {chart.nome}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>

                          <div>
                            <Label>Campos para esta visualização</Label>
                            <div className="text-sm text-gray-600 mt-1">
                              {reportData.campos.length > 0 
                                ? `${reportData.campos.length} campos disponíveis`
                                : 'Adicione campos na aba anterior'
                              }
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma visualização configurada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Adicione gráficos e tabelas para tornar seu relatório mais visual
                  </p>
                  <Button onClick={handleAddVisualization}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Visualização
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview do Relatório</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData.nome ? (
                <div className="space-y-6">
                  {/* Header do Preview */}
                  <div className="border-b pb-4">
                    <h1 className="text-2xl font-bold">{reportData.nome}</h1>
                    {reportData.descricao && (
                      <p className="text-gray-600 mt-2">{reportData.descricao}</p>
                    )}
                    <div className="flex gap-4 mt-3 text-sm text-gray-500">
                      <span>Categoria: {reportData.categoria}</span>
                      <span>Período: {reportData.periodo}</span>
                      <span>Formato: {reportData.formato.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Campos Selecionados */}
                  {reportData.campos.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Métricas Incluídas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {reportData.campos.map((field) => (
                          <div key={field.id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm">{field.nome}</p>
                            <p className="text-xs text-gray-600">{field.tipo}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visualizações */}
                  {reportData.visualizacoes.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Gráficos e Visualizações</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {reportData.visualizacoes.map((viz) => {
                          const ChartIcon = chartTypes.find(c => c.id === viz.tipo)?.icon || BarChart3
                          return (
                            <div key={viz.id} className="p-4 border-2 border-dashed rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <ChartIcon className="w-5 h-5" />
                                <span className="font-medium">{viz.titulo}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Tipo: {chartTypes.find(c => c.id === viz.tipo)?.nome}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Preview não disponível
                  </h3>
                  <p className="text-gray-600">
                    Configure as informações básicas do relatório para ver o preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
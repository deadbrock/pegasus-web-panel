'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Eye, Download, Copy, FileText, BarChart3, PieChart } from 'lucide-react'

// Mock data para templates de relatórios
const templatesData = [
  {
    id: 1,
    nome: 'Dashboard Executivo Completo',
    descricao: 'Template para relatório executivo com todos os KPIs principais da operação',
    categoria: 'Executivo',
    campos: ['Entregas realizadas', 'Custos totais', 'Performance da frota', 'ROI', 'Eficiência operacional'],
    visualizacoes: ['Gráfico de barras', 'Gráfico de pizza', 'Tabela de métricas'],
    popularidade: 4.9,
    downloads: 234,
    autor: 'Pegasus Team',
    data_criacao: '2024-01-01',
    preview_url: '/templates/dashboard-executivo.png',
    cor: 'bg-purple-500'
  },
  {
    id: 2,
    nome: 'Análise Financeira Mensal',
    descricao: 'Relatório detalhado de custos, receitas e análise financeira mensal',
    categoria: 'Financeiro',
    campos: ['Custos por categoria', 'Receitas', 'Margem de lucro', 'ROI', 'Previsões'],
    visualizacoes: ['Gráfico de linha', 'Gráfico de barras', 'Tabela financeira'],
    popularidade: 4.7,
    downloads: 189,
    autor: 'Pegasus Team',
    data_criacao: '2024-01-05',
    preview_url: '/templates/analise-financeira.png',
    cor: 'bg-green-500'
  },
  {
    id: 3,
    nome: 'Performance de Motoristas',
    descricao: 'Análise individual e comparativa da performance dos motoristas',
    categoria: 'RH',
    campos: ['Ranking de motoristas', 'Pontos gamificação', 'Eficiência', 'Entregas no prazo'],
    visualizacoes: ['Ranking visual', 'Gráfico de performance', 'Métricas individuais'],
    popularidade: 4.8,
    downloads: 156,
    autor: 'Pegasus Team',
    data_criacao: '2024-01-08',
    preview_url: '/templates/performance-motoristas.png',
    cor: 'bg-blue-500'
  },
  {
    id: 4,
    nome: 'Status da Frota',
    descricao: 'Relatório completo do status da frota, manutenções e disponibilidade',
    categoria: 'Frota',
    campos: ['Veículos ativos', 'Manutenções pendentes', 'KM rodados', 'Consumo combustível'],
    visualizacoes: ['Status visual', 'Gráfico de manutenções', 'Métricas da frota'],
    popularidade: 4.5,
    downloads: 124,
    autor: 'Pegasus Team',
    data_criacao: '2024-01-10',
    preview_url: '/templates/status-frota.png',
    cor: 'bg-orange-500'
  },
  {
    id: 5,
    nome: 'Controle de Estoque',
    descricao: 'Relatório de movimentação de estoque, alertas e inventário',
    categoria: 'Estoque',
    campos: ['Produtos em estoque', 'Movimentações', 'Alertas críticos', 'Valor do inventário'],
    visualizacoes: ['Alertas visuais', 'Gráfico de movimentação', 'Tabela de produtos'],
    popularidade: 4.4,
    downloads: 98,
    autor: 'Pegasus Team',
    data_criacao: '2024-01-12',
    preview_url: '/templates/controle-estoque.png',
    cor: 'bg-cyan-500'
  },
  {
    id: 6,
    nome: 'Compliance e Auditoria',
    descricao: 'Relatório de conformidade, documentos vencendo e auditoria',
    categoria: 'Compliance',
    campos: ['Score de conformidade', 'Documentos vencendo', 'Não conformidades', 'Ações corretivas'],
    visualizacoes: ['Score visual', 'Alertas de vencimento', 'Status de conformidade'],
    popularidade: 4.6,
    downloads: 87,
    autor: 'Pegasus Team',
    data_criacao: '2024-01-14',
    preview_url: '/templates/compliance-auditoria.png',
    cor: 'bg-red-500'
  }
]

export function ReportTemplates() {
  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Executivo': 'bg-purple-100 text-purple-800 border-purple-200',
      'Financeiro': 'bg-green-100 text-green-800 border-green-200',
      'RH': 'bg-blue-100 text-blue-800 border-blue-200',
      'Frota': 'bg-orange-100 text-orange-800 border-orange-200',
      'Estoque': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Compliance': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const handleUseTemplate = (template: any) => {
    console.log('Usando template:', template.nome)
  }

  const handlePreviewTemplate = (template: any) => {
    console.log('Visualizando template:', template.nome)
  }

  const handleDownloadTemplate = (template: any) => {
    console.log('Download template:', template.nome)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Templates de Relatórios</h2>
          <p className="text-gray-600">Modelos pré-configurados para diferentes tipos de relatórios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Por Popularidade
          </Button>
          <Button variant="outline">
            <PieChart className="w-4 h-4 mr-2" />
            Por Categoria
          </Button>
        </div>
      </div>

      {/* Estatísticas dos Templates */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{templatesData.length}</p>
            <p className="text-sm text-gray-600">Templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">
              {templatesData.reduce((sum, t) => sum + t.downloads, 0)}
            </p>
            <p className="text-sm text-gray-600">Downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-gray-900">
              {(templatesData.reduce((sum, t) => sum + t.popularidade, 0) / templatesData.length).toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">Avaliação Média</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Copy className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">6</p>
            <p className="text-sm text-gray-600">Categorias</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templatesData.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Header do Template */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${template.cor} flex items-center justify-center`}>
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{template.nome}</h3>
                      <Badge variant="outline" className={getCategoryColor(template.categoria)}>
                        {template.categoria}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{template.descricao}</p>
                    
                    {/* Avaliação e Downloads */}
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {renderStars(template.popularidade)}
                        <span className="text-gray-600 ml-1">{template.popularidade}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{template.downloads}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campos Incluídos */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Campos incluídos:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.campos.slice(0, 3).map((campo, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {campo}
                    </Badge>
                  ))}
                  {template.campos.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.campos.length - 3} mais
                    </Badge>
                  )}
                </div>
              </div>

              {/* Visualizações */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Visualizações:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.visualizacoes.map((viz, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {viz}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metadados */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>Por: {template.autor}</span>
                <span>{new Date(template.data_criacao).toLocaleDateString('pt-BR')}</span>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Usar Template
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreviewTemplate(template)}
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadTemplate(template)}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Templates Mais Populares */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            Templates Mais Populares
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templatesData
              .sort((a, b) => b.popularidade - a.popularidade)
              .slice(0, 3)
              .map((template, index) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center text-xs font-bold text-yellow-800">
                      {index + 1}
                    </div>
                    <div className={`w-8 h-8 rounded ${template.cor} flex items-center justify-center`}>
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{template.nome}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getCategoryColor(template.categoria)}>
                          {template.categoria}
                        </Badge>
                        <div className="flex items-center gap-1">
                          {renderStars(template.popularidade)}
                          <span className="text-xs text-gray-600 ml-1">{template.popularidade}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{template.downloads} downloads</span>
                    <Button size="sm" variant="outline">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorias Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Templates por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              templatesData.reduce((acc, template) => {
                if (!acc[template.categoria]) {
                  acc[template.categoria] = []
                }
                acc[template.categoria].push(template)
                return acc
              }, {} as Record<string, typeof templatesData>)
            ).map(([categoria, templates]) => (
              <div key={categoria} className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{categoria}</h4>
                <p className="text-sm text-gray-600 mb-3">
                  {templates.length} template{templates.length !== 1 ? 's' : ''} disponível{templates.length !== 1 ? 'is' : ''}
                </p>
                <div className="space-y-2">
                  {templates.map((template) => (
                    <div key={template.id} className="text-xs">
                      <span className="font-medium">{template.nome}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(template.popularidade)}
                        <span className="text-gray-500 ml-1">({template.downloads})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
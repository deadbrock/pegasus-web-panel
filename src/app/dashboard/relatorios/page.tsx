"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Eye,
  Share2,
  Clock
} from 'lucide-react'

export default function RelatoriosPage() {
  const [selectedCategory, setSelectedCategory] = useState('todos')

  // Dados simulados de relatórios
  const relatorios = [
    {
      id: 1,
      nome: 'Relatório Financeiro Mensal',
      categoria: 'Financeiro',
      tipo: 'PDF',
      dataGeracao: '2024-01-15',
      status: 'concluido',
      tamanho: '2.3 MB',
      downloads: 12,
      descricao: 'Análise completa das receitas e despesas do mês'
    },
    {
      id: 2,
      nome: 'Análise de Custos Operacionais',
      categoria: 'Custos',
      tipo: 'Excel',
      dataGeracao: '2024-01-14',
      status: 'concluido',
      tamanho: '1.8 MB',
      downloads: 8,
      descricao: 'Detalhamento dos custos por centro de custo'
    },
    {
      id: 3,
      nome: 'Auditoria de Acessos',
      categoria: 'Auditoria',
      tipo: 'PDF',
      dataGeracao: '2024-01-13',
      status: 'processando',
      tamanho: '-',
      downloads: 0,
      descricao: 'Log de acessos e atividades do sistema'
    },
    {
      id: 4,
      nome: 'Documentos Fiscais - Janeiro',
      categoria: 'Fiscal',
      tipo: 'PDF',
      dataGeracao: '2024-01-12',
      status: 'concluido',
      tamanho: '5.1 MB',
      downloads: 15,
      descricao: 'Compilação de todas as notas fiscais do período'
    },
    {
      id: 5,
      nome: 'Dashboard Executivo',
      categoria: 'Executivo',
      tipo: 'PDF',
      dataGeracao: '2024-01-11',
      status: 'concluido',
      tamanho: '3.2 MB',
      downloads: 25,
      descricao: 'Indicadores e métricas principais para diretoria'
    },
    {
      id: 6,
      nome: 'Planejamento vs Realizado',
      categoria: 'Planejamento',
      tipo: 'Excel',
      dataGeracao: '2024-01-10',
      status: 'erro',
      tamanho: '-',
      downloads: 0,
      descricao: 'Comparativo entre metas e resultados obtidos'
    }
  ]

  const categorias = [
    { id: 'todos', nome: 'Todos', count: relatorios.length },
    { id: 'Financeiro', nome: 'Financeiro', count: relatorios.filter(r => r.categoria === 'Financeiro').length },
    { id: 'Fiscal', nome: 'Fiscal', count: relatorios.filter(r => r.categoria === 'Fiscal').length },
    { id: 'Auditoria', nome: 'Auditoria', count: relatorios.filter(r => r.categoria === 'Auditoria').length },
    { id: 'Planejamento', nome: 'Planejamento', count: relatorios.filter(r => r.categoria === 'Planejamento').length },
    { id: 'Executivo', nome: 'Executivo', count: relatorios.filter(r => r.categoria === 'Executivo').length }
  ]

  const getStatusBadge = (status: string) => {
    const colors = {
      concluido: 'bg-green-100 text-green-800',
      processando: 'bg-blue-100 text-blue-800',
      erro: 'bg-red-100 text-red-800',
      agendado: 'bg-yellow-100 text-yellow-800'
    }
    const labels = {
      concluido: 'Concluído',
      processando: 'Processando',
      erro: 'Erro',
      agendado: 'Agendado'
    }
    return <Badge className={colors[status as keyof typeof colors]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'PDF' ? <FileText className="w-4 h-4 text-red-500" /> : <BarChart3 className="w-4 h-4 text-green-500" />
  }

  const filteredRelatorios = selectedCategory === 'todos' 
    ? relatorios 
    : relatorios.filter(r => r.categoria === selectedCategory)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Geração e gerenciamento de relatórios do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Agendar
          </Button>
          <Button size="sm">
            <FileText className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Relatórios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relatorios.length}</div>
            <p className="text-xs text-muted-foreground">+3 esta semana</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relatorios.reduce((acc, r) => acc + r.downloads, 0)}</div>
            <p className="text-xs text-muted-foreground">+15% este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Processamento</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relatorios.filter(r => r.status === 'processando').length}</div>
            <p className="text-xs text-muted-foreground">Aguardando conclusão</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4 MB</div>
            <p className="text-xs text-muted-foreground">Armazenamento usado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Categoria */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={selectedCategory === categoria.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(categoria.id)}
                className="flex items-center space-x-1"
              >
                <span>{categoria.nome}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {categoria.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedCategory === 'todos' ? 'Todos os Relatórios' : `Relatórios - ${selectedCategory}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRelatorios.map((relatorio) => (
              <div key={relatorio.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getTipoIcon(relatorio.tipo)}
                      <span className="font-semibold text-gray-900">{relatorio.nome}</span>
                      {getStatusBadge(relatorio.status)}
                    </div>
                    <p className="text-gray-600 mb-2">{relatorio.descricao}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {relatorio.dataGeracao}
                      </span>
                      <span>Tipo: {relatorio.tipo}</span>
                      {relatorio.tamanho !== '-' && (
                        <span>Tamanho: {relatorio.tamanho}</span>
                      )}
                      <span className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {relatorio.downloads} downloads
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {relatorio.status === 'concluido' && (
                      <>
                        <Button variant="ghost" size="sm" title="Visualizar">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Compartilhar">
                          <Share2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Download">
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {relatorio.status === 'processando' && (
                      <div className="flex items-center text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                    {relatorio.status === 'erro' && (
                      <Button variant="ghost" size="sm" title="Tentar novamente" className="text-red-600">
                        <TrendingUp className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
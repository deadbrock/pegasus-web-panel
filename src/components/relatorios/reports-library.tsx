'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Calendar,
  BarChart3,
  DollarSign,
  Users,
  Truck,
  Package,
  Shield,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'

interface ReportsLibraryProps {
  category: string
}

// Mock data para biblioteca de relatórios
const reportsData = [
  {
    id: 1,
    nome: 'Performance Operacional Mensal',
    descricao: 'Análise completa de performance operacional com KPIs e métricas',
    categoria: 'operacional',
    tipo: 'mensal',
    tamanho: '2.4 MB',
    downloads: 156,
    avaliacao: 4.8,
    ultima_atualizacao: '2024-01-15',
    tags: ['KPIs', 'Entregas', 'Performance'],
    popularidade: 'alta'
  },
  {
    id: 2,
    nome: 'Análise de Custos por Rota',
    descricao: 'Detalhamento de custos operacionais por rota com otimizações',
    categoria: 'financeiro',
    tipo: 'personalizado',
    tamanho: '1.8 MB',
    downloads: 89,
    avaliacao: 4.6,
    ultima_atualizacao: '2024-01-14',
    tags: ['Custos', 'Rotas', 'Otimização'],
    popularidade: 'alta'
  },
  {
    id: 3,
    nome: 'Ranking de Motoristas',
    descricao: 'Classificação de motoristas por performance e gamificação',
    categoria: 'rh',
    tipo: 'semanal',
    tamanho: '1.2 MB',
    downloads: 134,
    avaliacao: 4.9,
    ultima_atualizacao: '2024-01-13',
    tags: ['Motoristas', 'Ranking', 'Gamificação'],
    popularidade: 'muito_alta'
  },
  {
    id: 4,
    nome: 'Status da Frota',
    descricao: 'Relatório completo do status da frota com manutenções',
    categoria: 'frota',
    tipo: 'diario',
    tamanho: '3.1 MB',
    downloads: 78,
    avaliacao: 4.5,
    ultima_atualizacao: '2024-01-15',
    tags: ['Frota', 'Manutenção', 'Status'],
    popularidade: 'media'
  },
  {
    id: 5,
    nome: 'Alertas de Estoque',
    descricao: 'Monitoramento de estoque com alertas e recomendações',
    categoria: 'estoque',
    tipo: 'tempo_real',
    tamanho: '0.9 MB',
    downloads: 102,
    avaliacao: 4.7,
    ultima_atualizacao: '2024-01-15',
    tags: ['Estoque', 'Alertas', 'Inventário'],
    popularidade: 'alta'
  },
  {
    id: 6,
    nome: 'Compliance Score',
    descricao: 'Índice de conformidade com auditoria e documentação',
    categoria: 'compliance',
    tipo: 'mensal',
    tamanho: '2.7 MB',
    downloads: 67,
    avaliacao: 4.4,
    ultima_atualizacao: '2024-01-12',
    tags: ['Compliance', 'Auditoria', 'Documentos'],
    popularidade: 'media'
  },
  {
    id: 7,
    nome: 'Dashboard Executivo Completo',
    descricao: 'Visão executiva com todos os KPIs consolidados',
    categoria: 'operacional',
    tipo: 'executivo',
    tamanho: '4.2 MB',
    downloads: 189,
    avaliacao: 4.9,
    ultima_atualizacao: '2024-01-14',
    tags: ['Executivo', 'KPIs', 'Consolidado'],
    popularidade: 'muito_alta'
  },
  {
    id: 8,
    nome: 'Análise de Combustível',
    descricao: 'Detalhamento de consumo e economia de combustível',
    categoria: 'financeiro',
    tipo: 'mensal',
    tamanho: '1.6 MB',
    downloads: 95,
    avaliacao: 4.3,
    ultima_atualizacao: '2024-01-11',
    tags: ['Combustível', 'Economia', 'Consumo'],
    popularidade: 'alta'
  },
  {
    id: 9,
    nome: 'Performance Individual',
    descricao: 'Análise detalhada de performance por motorista',
    categoria: 'rh',
    tipo: 'personalizado',
    tamanho: '2.1 MB',
    downloads: 123,
    avaliacao: 4.6,
    ultima_atualizacao: '2024-01-13',
    tags: ['Individual', 'Performance', 'Análise'],
    popularidade: 'alta'
  },
  {
    id: 10,
    nome: 'Manutenção Preventiva',
    descricao: 'Agenda e status de manutenções preventivas da frota',
    categoria: 'frota',
    tipo: 'quinzenal',
    tamanho: '1.9 MB',
    downloads: 56,
    avaliacao: 4.2,
    ultima_atualizacao: '2024-01-10',
    tags: ['Manutenção', 'Preventiva', 'Agenda'],
    popularidade: 'media'
  }
]

export function ReportsLibrary({ category }: ReportsLibraryProps) {
  const filteredReports = category === 'todos' 
    ? reportsData 
    : reportsData.filter(report => report.categoria === category)

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case 'operacional': return Truck
      case 'financeiro': return DollarSign
      case 'rh': return Users
      case 'frota': return Truck
      case 'estoque': return Package
      case 'compliance': return Shield
      default: return FileText
    }
  }

  const getCategoryColor = (categoria: string) => {
    switch (categoria) {
      case 'operacional': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'financeiro': return 'bg-green-100 text-green-800 border-green-200'
      case 'rh': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'frota': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'estoque': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'compliance': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'tempo_real': return 'bg-green-500'
      case 'diario': return 'bg-blue-500'
      case 'semanal': return 'bg-purple-500'
      case 'quinzenal': return 'bg-orange-500'
      case 'mensal': return 'bg-red-500'
      case 'executivo': return 'bg-yellow-500'
      case 'personalizado': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  const getPopularidadeIcon = (popularidade: string) => {
    switch (popularidade) {
      case 'muito_alta': return '🔥'
      case 'alta': return '⭐'
      case 'media': return '📊'
      default: return '📄'
    }
  }

  const handleDownload = (report: any) => {
    console.log('Download relatório:', report.nome)
  }

  const handleView = (report: any) => {
    console.log('Visualizar relatório:', report.nome)
  }

  const handleShare = (report: any) => {
    console.log('Compartilhar relatório:', report.nome)
  }

  return (
    <div className="space-y-4">
      {/* Header com contadores */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {category === 'todos' ? 'Todos os Relatórios' : `Relatórios - ${category.charAt(0).toUpperCase() + category.slice(1)}`}
          </h3>
          <p className="text-sm text-gray-600">
            {filteredReports.length} relatórios disponíveis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Mais Populares
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Mais Recentes
          </Button>
        </div>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReports.map((report) => {
          const CategoryIcon = getCategoryIcon(report.categoria)
          
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{report.nome}</h4>
                        <span className="text-lg">
                          {getPopularidadeIcon(report.popularidade)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {report.descricao}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Badges e Informações */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className={getCategoryColor(report.categoria)}>
                    {report.categoria}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${getTipoColor(report.tipo)}`}></div>
                    <span className="text-xs text-gray-600">{report.tipo}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {report.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 mb-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" />
                      <span className="font-medium">{report.downloads}</span>
                    </div>
                    <p className="text-gray-500">Downloads</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium">{report.avaliacao}</span>
                    </div>
                    <p className="text-gray-500">Avaliação</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span className="font-medium">{report.tamanho}</span>
                    </div>
                    <p className="text-gray-500">Tamanho</p>
                  </div>
                </div>

                {/* Última Atualização */}
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>Atualizado em {new Date(report.ultima_atualizacao).toLocaleDateString('pt-BR')}</span>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Baixar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleView(report)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleShare(report)}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Footer com estatísticas */}
      {filteredReports.length > 0 && (
        <div className="pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p className="font-medium text-gray-900">
                {filteredReports.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()}
              </p>
              <p className="text-gray-600">Total Downloads</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {(filteredReports.reduce((sum, r) => sum + r.avaliacao, 0) / filteredReports.length).toFixed(1)}
              </p>
              <p className="text-gray-600">Avaliação Média</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {filteredReports.filter(r => r.popularidade === 'muito_alta' || r.popularidade === 'alta').length}
              </p>
              <p className="text-gray-600">Populares</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {filteredReports.length}
              </p>
              <p className="text-gray-600">Disponíveis</p>
            </div>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum relatório encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Não há relatórios disponíveis para esta categoria.
          </p>
          <Button variant="outline">
            Ver Todos os Relatórios
          </Button>
        </div>
      )}
    </div>
  )
}
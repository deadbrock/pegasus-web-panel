'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Filter,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Search,
  Trash2
} from 'lucide-react'

// Mock data para histórico de relatórios
const historyData = [
  {
    id: 1,
    nome: 'Dashboard Executivo - Janeiro 2024',
    tipo: 'Executivo',
    formato: 'PDF',
    tamanho: '2.3 MB',
    data_geracao: '2024-01-22T09:30:00',
    usuario: 'Admin System',
    status: 'sucesso',
    downloads: 12,
    origem: 'agendado',
    tempo_geracao: '2.1s',
    destinatarios: ['admin@empresa.com', 'gestor@empresa.com']
  },
  {
    id: 2,
    nome: 'Performance de Motoristas - Semana 3',
    tipo: 'RH',
    formato: 'Excel',
    tamanho: '1.8 MB',
    data_geracao: '2024-01-21T14:20:00',
    usuario: 'Maria Silva (RH)',
    status: 'sucesso',
    downloads: 8,
    origem: 'manual',
    tempo_geracao: '1.7s',
    destinatarios: ['rh@empresa.com']
  },
  {
    id: 3,
    nome: 'Análise de Custos - Dezembro 2023',
    tipo: 'Financeiro',
    formato: 'PDF',
    tamanho: '3.1 MB',
    data_geracao: '2024-01-20T11:15:00',
    usuario: 'João Santos (Financeiro)',
    status: 'erro',
    downloads: 0,
    origem: 'manual',
    tempo_geracao: '0s',
    destinatarios: []
  },
  {
    id: 4,
    nome: 'Status da Frota Diário',
    tipo: 'Frota',
    formato: 'CSV',
    tamanho: '0.9 MB',
    data_geracao: '2024-01-19T07:00:00',
    usuario: 'Sistema Automático',
    status: 'sucesso',
    downloads: 3,
    origem: 'agendado',
    tempo_geracao: '0.8s',
    destinatarios: ['manutencao@empresa.com']
  },
  {
    id: 5,
    nome: 'Alertas de Estoque',
    tipo: 'Estoque',
    formato: 'PDF',
    tamanho: '1.2 MB',
    data_geracao: '2024-01-18T16:45:00',
    usuario: 'Ana Costa (Estoque)',
    status: 'sucesso',
    downloads: 15,
    origem: 'manual',
    tempo_geracao: '1.3s',
    destinatarios: ['estoque@empresa.com', 'operacoes@empresa.com']
  },
  {
    id: 6,
    nome: 'Compliance Score - Janeiro',
    tipo: 'Compliance',
    formato: 'PDF',
    tamanho: '2.7 MB',
    data_geracao: '2024-01-17T13:20:00',
    usuario: 'Carlos Lima (Compliance)',
    status: 'processando',
    downloads: 0,
    origem: 'manual',
    tempo_geracao: '0s',
    destinatarios: ['compliance@empresa.com']
  },
  {
    id: 7,
    nome: 'Ranking de Motoristas - Mensal',
    tipo: 'RH',
    formato: 'Excel',
    tamanho: '2.1 MB',
    data_geracao: '2024-01-16T10:30:00',
    usuario: 'Sistema Automático',
    status: 'sucesso',
    downloads: 22,
    origem: 'agendado',
    tempo_geracao: '1.9s',
    destinatarios: ['rh@empresa.com', 'diretoria@empresa.com']
  },
  {
    id: 8,
    nome: 'Custos por Rota - Semana 2',
    tipo: 'Financeiro',
    formato: 'Excel',
    tamanho: '1.6 MB',
    data_geracao: '2024-01-15T15:10:00',
    usuario: 'Pedro Oliveira (Operações)',
    status: 'sucesso',
    downloads: 6,
    origem: 'manual',
    tempo_geracao: '2.3s',
    destinatarios: []
  }
]

export function ReportsHistory() {
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroOrigem, setFiltroOrigem] = useState('todos')

  const filteredReports = historyData.filter(report => {
    if (filtroStatus !== 'todos' && report.status !== filtroStatus) return false
    if (filtroTipo !== 'todos' && report.tipo !== filtroTipo) return false
    if (filtroOrigem !== 'todos' && report.origem !== filtroOrigem) return false
    return true
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <Badge className="bg-green-500">Sucesso</Badge>
      case 'erro':
        return <Badge variant="destructive">Erro</Badge>
      case 'processando':
        return <Badge className="bg-blue-500">Processando</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      'Executivo': 'bg-purple-100 text-purple-800',
      'Financeiro': 'bg-green-100 text-green-800',
      'RH': 'bg-blue-100 text-blue-800',
      'Frota': 'bg-orange-100 text-orange-800',
      'Estoque': 'bg-cyan-100 text-cyan-800',
      'Compliance': 'bg-red-100 text-red-800'
    }
    return colors[tipo] || 'bg-gray-100 text-gray-800'
  }

  const getOrigemIcon = (origem: string) => {
    return origem === 'agendado' ? <Calendar className="w-3 h-3" /> : <User className="w-3 h-3" />
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

  const handleDelete = (reportId: number) => {
    console.log('Deletar relatório:', reportId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const formatFileSize = (size: string) => {
    return size
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Histórico de Relatórios</h2>
          <p className="text-gray-600">Histórico completo de todos os relatórios gerados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar Histórico
          </Button>
        </div>
      </div>

      {/* Estatísticas do Histórico */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">{historyData.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">
              {historyData.filter(r => r.status === 'sucesso').length}
            </p>
            <p className="text-sm text-gray-600">Sucessos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
            <p className="text-2xl font-bold text-gray-900">
              {historyData.filter(r => r.status === 'erro').length}
            </p>
            <p className="text-sm text-gray-600">Erros</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Download className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">
              {historyData.reduce((sum, r) => sum + r.downloads, 0)}
            </p>
            <p className="text-sm text-gray-600">Downloads</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-gray-900">
              {(historyData.filter(r => r.tempo_geracao !== '0s').reduce((sum, r) => 
                sum + parseFloat(r.tempo_geracao.replace('s', '')), 0) / 
                historyData.filter(r => r.tempo_geracao !== '0s').length).toFixed(1)}s
            </p>
            <p className="text-sm text-gray-600">Tempo Médio</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="sucesso">Sucesso</SelectItem>
                  <SelectItem value="erro">Erro</SelectItem>
                  <SelectItem value="processando">Processando</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Executivo">Executivo</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="RH">RH</SelectItem>
                  <SelectItem value="Frota">Frota</SelectItem>
                  <SelectItem value="Estoque">Estoque</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Origem</label>
              <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Ícone e Status */}
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    {report.status === 'processando' && (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>

                  {/* Informações do Relatório */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{report.nome}</h3>
                      {getStatusBadge(report.status)}
                      <Badge variant="outline" className={getTipoColor(report.tipo)}>
                        {report.tipo}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(report.data_geracao)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {getOrigemIcon(report.origem)}
                        <span>{report.usuario}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{report.formato} • {formatFileSize(report.tamanho)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        <span>{report.downloads} downloads</span>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Tempo: {report.tempo_geracao}</span>
                      {report.destinatarios.length > 0 && (
                        <span>Enviado para: {report.destinatarios.length} destinatário(s)</span>
                      )}
                      <span>Origem: {report.origem}</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2 ml-4">
                  {report.status === 'sucesso' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleView(report)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownload(report)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleShare(report)}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(report.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resultados da Busca */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Mostrando {filteredReports.length} de {historyData.length} relatórios
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Próximo
          </Button>
        </div>
      </div>

      {/* Estado vazio */}
      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum relatório encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Não há relatórios que correspondam aos filtros selecionados.
          </p>
          <Button 
            variant="outline"
            onClick={() => {
              setFiltroStatus('todos')
              setFiltroTipo('todos')
              setFiltroOrigem('todos')
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  )
}
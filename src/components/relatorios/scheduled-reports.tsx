'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Calendar,
  Clock,
  Play,
  Pause,
  Edit,
  Trash2,
  Plus,
  Mail,
  Users,
  Download,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

// Mock data para relatórios agendados
const scheduledReportsData = [
  {
    id: 1,
    nome: 'Dashboard Executivo Semanal',
    descricao: 'Relatório executivo consolidado com todos os KPIs',
    frequencia: 'Semanal',
    proximo_agendamento: '2024-01-22T08:00:00',
    ultimo_envio: '2024-01-15T08:00:00',
    status: 'ativo',
    formato: 'PDF',
    destinatarios: ['admin@empresa.com', 'gestor@empresa.com'],
    categoria: 'Executivo',
    hora_execucao: '08:00',
    dia_semana: 'Segunda-feira',
    sucesso_ultimo: true,
    total_envios: 52
  },
  {
    id: 2,
    nome: 'Performance de Motoristas',
    descricao: 'Análise individual de performance e rankings',
    frequencia: 'Quinzenal',
    proximo_agendamento: '2024-01-25T09:30:00',
    ultimo_envio: '2024-01-11T09:30:00',
    status: 'ativo',
    formato: 'Excel',
    destinatarios: ['rh@empresa.com', 'operacoes@empresa.com'],
    categoria: 'RH',
    hora_execucao: '09:30',
    dia_mes: '11 e 25',
    sucesso_ultimo: true,
    total_envios: 24
  },
  {
    id: 3,
    nome: 'Análise de Custos Mensal',
    descricao: 'Detalhamento completo de custos operacionais',
    frequencia: 'Mensal',
    proximo_agendamento: '2024-02-01T10:00:00',
    ultimo_envio: '2024-01-01T10:00:00',
    status: 'ativo',
    formato: 'PDF',
    destinatarios: ['financeiro@empresa.com', 'diretoria@empresa.com'],
    categoria: 'Financeiro',
    hora_execucao: '10:00',
    dia_mes: '1º dia do mês',
    sucesso_ultimo: false,
    total_envios: 12
  },
  {
    id: 4,
    nome: 'Status da Frota Diário',
    descricao: 'Relatório diário de status e manutenções',
    frequencia: 'Diário',
    proximo_agendamento: '2024-01-16T07:00:00',
    ultimo_envio: '2024-01-15T07:00:00',
    status: 'pausado',
    formato: 'CSV',
    destinatarios: ['manutencao@empresa.com'],
    categoria: 'Frota',
    hora_execucao: '07:00',
    dia_semana: 'Todos os dias',
    sucesso_ultimo: true,
    total_envios: 365
  },
  {
    id: 5,
    nome: 'Alertas de Compliance',
    descricao: 'Relatório de documentos vencendo e não conformidades',
    frequencia: 'Semanal',
    proximo_agendamento: '2024-01-19T16:00:00',
    ultimo_envio: '2024-01-12T16:00:00',
    status: 'ativo',
    formato: 'PDF',
    destinatarios: ['compliance@empresa.com', 'juridico@empresa.com'],
    categoria: 'Compliance',
    hora_execucao: '16:00',
    dia_semana: 'Sexta-feira',
    sucesso_ultimo: true,
    total_envios: 48
  }
]

export function ScheduledReports() {
  const [reports, setReports] = useState(scheduledReportsData)

  const toggleReportStatus = (reportId: number) => {
    setReports(prev => 
      prev.map(report => 
        report.id === reportId 
          ? { ...report, status: report.status === 'ativo' ? 'pausado' : 'ativo' }
          : report
      )
    )
  }

  const runReportNow = (reportId: number) => {
    console.log('Executando relatório agora:', reportId)
  }

  const editReport = (reportId: number) => {
    console.log('Editando relatório:', reportId)
  }

  const deleteReport = (reportId: number) => {
    setReports(prev => prev.filter(report => report.id !== reportId))
  }

  const getStatusBadge = (status: string) => {
    return status === 'ativo' 
      ? <Badge className="bg-green-500">Ativo</Badge>
      : <Badge variant="outline" className="text-orange-600 border-orange-600">Pausado</Badge>
  }

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Executivo': 'bg-purple-100 text-purple-800',
      'RH': 'bg-blue-100 text-blue-800',
      'Financeiro': 'bg-green-100 text-green-800',
      'Frota': 'bg-orange-100 text-orange-800',
      'Compliance': 'bg-red-100 text-red-800'
    }
    return colors[categoria] || 'bg-gray-100 text-gray-800'
  }

  const formatNextRun = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    if (diffDays < 7) return `Em ${diffDays} dias`
    return date.toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Relatórios Agendados</h2>
          <p className="text-gray-600">Geração automática de relatórios em intervalos definidos</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-900">
              {reports.filter(r => r.status === 'ativo').length}
            </p>
            <p className="text-sm text-gray-600">Ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Pause className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-gray-900">
              {reports.filter(r => r.status === 'pausado').length}
            </p>
            <p className="text-sm text-gray-600">Pausados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-gray-900">
              {reports.filter(r => r.sucesso_ultimo).length}
            </p>
            <p className="text-sm text-gray-600">Sucessos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Mail className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-gray-900">
              {reports.reduce((sum, r) => sum + r.total_envios, 0)}
            </p>
            <p className="text-sm text-gray-600">Total Envios</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Relatórios Agendados */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header do Relatório */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{report.nome}</h3>
                        {getStatusBadge(report.status)}
                        <Badge variant="outline" className={getCategoryColor(report.categoria)}>
                          {report.categoria}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{report.descricao}</p>
                    </div>
                  </div>

                  {/* Informações de Agendamento */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Frequência</p>
                        <p className="text-gray-600">{report.frequencia} às {report.hora_execucao}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Próxima Execução</p>
                        <p className="text-gray-600">{formatNextRun(report.proximo_agendamento)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium">Destinatários</p>
                        <p className="text-gray-600">{report.destinatarios.length} pessoa(s)</p>
                      </div>
                    </div>
                  </div>

                  {/* Status da Última Execução */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      {report.sucesso_ultimo ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span>
                        Último envio: {new Date(report.ultimo_envio).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <span>•</span>
                    <span>Formato: {report.formato}</span>
                    <span>•</span>
                    <span>{report.total_envios} envios realizados</span>
                  </div>

                  {/* Destinatários */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Destinatários:</p>
                    <div className="flex flex-wrap gap-2">
                      {report.destinatarios.map((email, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Controles */}
                <div className="flex flex-col gap-2 ml-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Switch 
                      checked={report.status === 'ativo'}
                      onCheckedChange={() => toggleReportStatus(report.id)}
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => runReportNow(report.id)}
                      disabled={report.status === 'pausado'}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => editReport(report.id)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deleteReport(report.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Próximos Agendamentos (7 dias)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports
              .filter(r => r.status === 'ativo')
              .sort((a, b) => new Date(a.proximo_agendamento).getTime() - new Date(b.proximo_agendamento).getTime())
              .slice(0, 5)
              .map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{report.nome}</p>
                      <p className="text-xs text-gray-600">{report.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatNextRun(report.proximo_agendamento)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(report.proximo_agendamento).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, Edit, ArrowUpRight } from 'lucide-react'

// Mock data para apontamentos baseado no audit_engine.py
const findingsData = [
  {
    id: 1,
    area: 'Manutenção',
    descricao: 'Veículo ABC-1234 com manutenção preventiva vencida há 15 dias',
    severidade: 'Crítica',
    status: 'Pendente',
    data_criacao: '2024-01-15T10:30:00',
    data_ultima_ocorrencia: '2024-01-22T08:15:00',
    dados_referencia: { veiculo_id: 'ABC-1234', dias_atraso: 15 }
  },
  {
    id: 2,
    area: 'Entregas',
    descricao: 'Rota SP-RJ concluída 3 horas após o prazo previsto',
    severidade: 'Média',
    status: 'Em Análise',
    data_criacao: '2024-01-20T14:20:00',
    data_ultima_ocorrencia: '2024-01-20T14:20:00',
    dados_referencia: { rota_id: 'SP-RJ-001', atraso_horas: 3 }
  },
  {
    id: 3,
    area: 'Custos',
    descricao: 'Orçamento de combustível ultrapassado em 25% no período',
    severidade: 'Alta',
    status: 'Pendente',
    data_criacao: '2024-01-18T11:45:00',
    data_ultima_ocorrencia: '2024-01-22T09:30:00',
    dados_referencia: { categoria: 'combustivel', percentual_excesso: 25 }
  },
  {
    id: 4,
    area: 'Estoque',
    descricao: 'Item "Óleo Motor 15W40" com estoque negativo (-5 unidades)',
    severidade: 'Alta',
    status: 'Resolvido',
    data_criacao: '2024-01-19T16:10:00',
    data_ultima_ocorrencia: '2024-01-19T16:10:00',
    dados_referencia: { item_id: 'OIL001', quantidade_negativa: -5 }
  },
  {
    id: 5,
    area: 'Pedidos',
    descricao: 'Pedido PED-2024-001 está pendente há 8 dias sem processamento',
    severidade: 'Alta',
    status: 'Em Análise',
    data_criacao: '2024-01-14T09:15:00',
    data_ultima_ocorrencia: '2024-01-22T10:00:00',
    dados_referencia: { pedido_id: 'PED-2024-001', dias_pendente: 8 }
  },
  {
    id: 6,
    area: 'Documentos',
    descricao: 'CNH do motorista João Silva vencida há 5 dias',
    severidade: 'Crítica',
    status: 'Pendente',
    data_criacao: '2024-01-17T13:20:00',
    data_ultima_ocorrencia: '2024-01-22T07:45:00',
    dados_referencia: { motorista: 'João Silva', documento: 'CNH', dias_vencido: 5 }
  },
  {
    id: 7,
    area: 'Rotas',
    descricao: 'Rota para entrega de amanhã sem motorista atribuído',
    severidade: 'Média',
    status: 'Pendente',
    data_criacao: '2024-01-21T15:30:00',
    data_ultima_ocorrencia: '2024-01-21T15:30:00',
    dados_referencia: { rota_id: 'RTA-2024-045', data_entrega: '2024-01-23' }
  },
  {
    id: 8,
    area: 'Combustível',
    descricao: 'Veículo BRA-5678 com consumo 35% acima da média da frota',
    severidade: 'Média',
    status: 'Em Análise',
    data_criacao: '2024-01-16T12:00:00',
    data_ultima_ocorrencia: '2024-01-22T11:15:00',
    dados_referencia: { veiculo_id: 'BRA-5678', excesso_consumo: 35 }
  }
]

export function AuditFindingsTable() {
  const getSeverityBadge = (severidade: string) => {
    switch (severidade) {
      case 'Crítica':
        return <Badge variant="destructive">Crítica</Badge>
      case 'Alta':
        return <Badge className="bg-orange-500">Alta</Badge>
      case 'Média':
        return <Badge className="bg-yellow-500">Média</Badge>
      case 'Baixa':
        return <Badge variant="outline">Baixa</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Badge variant="outline" className="text-red-600 border-red-300">Pendente</Badge>
      case 'Em Análise':
        return <Badge className="bg-blue-500">Em Análise</Badge>
      case 'Resolvido':
        return <Badge className="bg-green-500">Resolvido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'Manutenção':
        return '🔧'
      case 'Entregas':
        return '📦'
      case 'Custos':
        return '💰'
      case 'Estoque':
        return '📊'
      case 'Pedidos':
        return '📋'
      case 'Documentos':
        return '📄'
      case 'Rotas':
        return '🗺️'
      case 'Combustível':
        return '⛽'
      default:
        return '📌'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Ontem'
    return `${diffDays} dias atrás`
  }

  const handleAnalyze = (finding: any) => {
    console.log('Analisar apontamento:', finding)
  }

  const handleView = (finding: any) => {
    console.log('Visualizar detalhes:', finding)
  }

  const handleNavigate = (finding: any) => {
    console.log('Navegar para origem:', finding)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Área</TableHead>
            <TableHead>Descrição do Apontamento</TableHead>
            <TableHead>Severidade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Primeira Ocorrência</TableHead>
            <TableHead>Última Ocorrência</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findingsData.map((finding) => (
            <TableRow key={finding.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getAreaIcon(finding.area)}</span>
                  <span className="font-medium">{finding.area}</span>
                </div>
              </TableCell>
              
              <TableCell className="max-w-md">
                <p className="text-sm">{finding.descricao}</p>
                {finding.dados_referencia && (
                  <div className="flex gap-2 mt-1">
                    {Object.entries(finding.dados_referencia).slice(0, 2).map(([key, value]) => (
                      <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              
              <TableCell>
                {getSeverityBadge(finding.severidade)}
              </TableCell>
              
              <TableCell>
                {getStatusBadge(finding.status)}
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <p>{formatDate(finding.data_criacao)}</p>
                  <p className="text-xs text-gray-500">{getDaysAgo(finding.data_criacao)}</p>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm">
                  <p>{formatDate(finding.data_ultima_ocorrencia)}</p>
                  <p className="text-xs text-gray-500">{getDaysAgo(finding.data_ultima_ocorrencia)}</p>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(finding)}
                    title="Visualizar Detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  
                  {finding.status === 'Pendente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAnalyze(finding)}
                      title="Analisar"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(finding)}
                    title="Ir para Origem"
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Resumo na parte inferior */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Total: {findingsData.length} apontamentos
            </span>
            <span className="text-red-600">
              Críticos: {findingsData.filter(f => f.severidade === 'Crítica').length}
            </span>
            <span className="text-orange-600">
              Alta: {findingsData.filter(f => f.severidade === 'Alta').length}
            </span>
            <span className="text-yellow-600">
              Média: {findingsData.filter(f => f.severidade === 'Média').length}
            </span>
            <span className="text-blue-600">
              Em Análise: {findingsData.filter(f => f.status === 'Em Análise').length}
            </span>
            <span className="text-green-600">
              Resolvidos: {findingsData.filter(f => f.status === 'Resolvido').length}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  User,
  Activity
} from 'lucide-react'

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Dados simulados de auditoria com foco financeiro
  const auditoriaLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      usuario: 'financeiro@pegasus.com',
      acao: 'IMPORT_OFX',
      modulo: 'Financeiro',
      descricao: 'Importou extrato OFX - Caixa Econômica (47 transações)',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { arquivo: 'extrato_janeiro_2024.ofx', transacoes: 47 }
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:10',
      usuario: 'financeiro@pegasus.com',
      acao: 'ALLOCATE_COST',
      modulo: 'Centro de Custos',
      descricao: 'Alocou despesa R$ 2.500,00 para centro "Veículos"',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { valor: 2500, centro: 'Veículos', transacao_id: 'TXN-001234' }
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:45',
      usuario: 'financeiro@pegasus.com',
      acao: 'CREATE_COST_CENTER',
      modulo: 'Centro de Custos',
      descricao: 'Criou novo centro de custo personalizado: "Projeto Alpha"',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { centro: 'Projeto Alpha', tipo: 'personalizado' }
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:30',
      usuario: 'admin@pegasus.com',
      acao: 'EXPORT_ACCOUNTING',
      modulo: 'Financeiro',
      descricao: 'Exportou dados contábeis para sistema externo (formato XML)',
      ip: '192.168.1.100',
      status: 'sucesso',
      detalhes: { formato: 'XML', registros: 156, periodo: 'Janeiro 2024' }
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:15',
      usuario: 'financeiro@pegasus.com',
      acao: 'RECONCILE_BANK',
      modulo: 'Conciliação',
      descricao: 'Executou conciliação bancária - Caixa Econômica',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { conta: 'Caixa Principal', divergencias: 2, conciliados: 45 }
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:05:22',
      usuario: 'diretor@pegasus.com',
      acao: 'APPROVE_EXPENSE',
      modulo: 'Aprovação',
      descricao: 'Aprovou despesa de R$ 15.000,00 - Contrato de Manutenção',
      ip: '192.168.1.120',
      status: 'sucesso',
      detalhes: { valor: 15000, categoria: 'Contratos', aprovador: 'diretor' }
    },
    {
      id: 7,
      timestamp: '2024-01-15 13:58:17',
      usuario: 'financeiro@pegasus.com',
      acao: 'BULK_ALLOCATE',
      modulo: 'Centro de Custos',
      descricao: 'Alocação em lote: 12 transações para diversos centros',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { transacoes: 12, centros: ['Sede', 'Veículos', 'Filiais'] }
    },
    {
      id: 8,
      timestamp: '2024-01-15 13:45:33',
      usuario: 'financeiro@pegasus.com',
      acao: 'UPDATE_CATEGORY',
      modulo: 'Categorização',
      descricao: 'Alterou categoria de "Combustível" para "Manutenção Veículos"',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { transacao_id: 'TXN-001235', categoria_anterior: 'Combustível', categoria_nova: 'Manutenção Veículos' }
    },
    {
      id: 9,
      timestamp: '2024-01-15 13:30:44',
      usuario: 'gestor@pegasus.com',
      acao: 'ACCESS_DENIED',
      modulo: 'Segurança',
      descricao: 'Tentativa de acesso negada ao módulo Financeiro',
      ip: '192.168.1.110',
      status: 'falha',
      detalhes: { modulo_tentativa: 'Financeiro', perfil: 'gestor' }
    },
    {
      id: 10,
      timestamp: '2024-01-15 13:25:12',
      usuario: 'financeiro@pegasus.com',
      acao: 'GENERATE_REPORT',
      modulo: 'Relatórios',
      descricao: 'Gerou relatório de despesas por centro de custo (Janeiro)',
      ip: '192.168.1.105',
      status: 'sucesso',
      detalhes: { tipo: 'centro_custos', periodo: 'Janeiro 2024', formato: 'PDF' }
    }
  ]

  const getStatusBadge = (status: string) => {
    return status === 'sucesso' 
      ? <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      : <Badge className="bg-red-100 text-red-800">Falha</Badge>
  }

  const getAcaoBadge = (acao: string) => {
    const colors = {
      CREATE: 'bg-blue-100 text-blue-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      READ: 'bg-green-100 text-green-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      IMPORT_OFX: 'bg-indigo-100 text-indigo-800',
      ALLOCATE_COST: 'bg-orange-100 text-orange-800',
      CREATE_COST_CENTER: 'bg-cyan-100 text-cyan-800',
      EXPORT_ACCOUNTING: 'bg-emerald-100 text-emerald-800',
      RECONCILE_BANK: 'bg-teal-100 text-teal-800',
      APPROVE_EXPENSE: 'bg-green-100 text-green-800',
      BULK_ALLOCATE: 'bg-amber-100 text-amber-800',
      UPDATE_CATEGORY: 'bg-lime-100 text-lime-800',
      ACCESS_DENIED: 'bg-red-100 text-red-800',
      GENERATE_REPORT: 'bg-slate-100 text-slate-800'
    }
    return <Badge className={colors[acao as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{acao}</Badge>
  }

  const filteredLogs = auditoriaLogs.filter(log =>
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Auditoria</h1>
          <p className="text-gray-600">Monitoramento de atividades do sistema</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Financeiras</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">347</div>
            <p className="text-xs text-muted-foreground">+15.2% desde ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Importações OFX</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alocações Centro</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">47 automáticas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas Negadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">1 nas últimas 24h</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por usuário, módulo ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs de Auditoria */}
      <Card>
        <CardHeader>
          <CardTitle>Logs de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getAcaoBadge(log.acao)}
                      <span className="text-sm font-medium text-gray-900">{log.modulo}</span>
                      {getStatusBadge(log.status)}
                    </div>
                    <p className="text-gray-700 mb-2">{log.descricao}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {log.usuario}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {log.timestamp}
                      </span>
                      <span>IP: {log.ip}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
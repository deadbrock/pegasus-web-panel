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

  // Dados simulados de auditoria
  const auditoriaLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      usuario: 'admin@pegasus.com',
      acao: 'CREATE',
      modulo: 'Financeiro',
      descricao: 'Criou nova despesa: Combustível - R$ 250,00',
      ip: '192.168.1.100',
      status: 'sucesso'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:10',
      usuario: 'financeiro@pegasus.com',
      acao: 'UPDATE',
      modulo: 'Documentos',
      descricao: 'Atualizou documento: NF-001234',
      ip: '192.168.1.105',
      status: 'sucesso'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:45',
      usuario: 'gestor@pegasus.com',
      acao: 'DELETE',
      modulo: 'Pedidos',
      descricao: 'Tentativa de exclusão de pedido #PED-2024-001',
      ip: '192.168.1.110',
      status: 'falha'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:30',
      usuario: 'financeiro@pegasus.com',
      acao: 'READ',
      modulo: 'Relatórios',
      descricao: 'Gerou relatório financeiro mensal',
      ip: '192.168.1.105',
      status: 'sucesso'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:15',
      usuario: 'admin@pegasus.com',
      acao: 'LOGIN',
      modulo: 'Autenticação',
      descricao: 'Login realizado com sucesso',
      ip: '192.168.1.100',
      status: 'sucesso'
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
      LOGIN: 'bg-purple-100 text-purple-800'
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
            <CardTitle className="text-sm font-medium">Total de Ações</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% desde ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+3 novos hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas de Acesso</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">+12% desde ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas de Segurança</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">2 nas últimas 24h</p>
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
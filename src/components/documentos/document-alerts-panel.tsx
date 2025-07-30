'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, Shield, FileText, Calendar, User, Bell, CheckCircle } from 'lucide-react'

// Mock data para alertas
const alertsData = [
  {
    id: 1,
    tipo: 'CNH',
    numero: '987654321',
    responsavel: 'Maria Santos',
    dataVencimento: '2024-01-18',
    diasRestantes: -5,
    prioridade: 'urgente',
    status: 'vencido'
  },
  {
    id: 2,
    tipo: 'CRLV',
    numero: 'BRA-2024',
    responsavel: 'Luis Fernando',
    dataVencimento: '2024-01-25',
    diasRestantes: 3,
    prioridade: 'alta',
    status: 'vencendo'
  },
  {
    id: 3,
    tipo: 'CNH',
    numero: '555444333',
    responsavel: 'Fernanda Oliveira',
    dataVencimento: '2024-02-15',
    diasRestantes: 25,
    prioridade: 'media',
    status: 'renovacao'
  },
  {
    id: 4,
    tipo: 'Seguro',
    numero: 'SEG-2024-002',
    responsavel: 'Roberto Silva',
    dataVencimento: '2024-02-01',
    diasRestantes: 15,
    prioridade: 'alta',
    status: 'vencendo'
  },
  {
    id: 5,
    tipo: 'CRLV',
    numero: 'BRA-2025',
    responsavel: 'Ana Costa',
    dataVencimento: '2024-02-28',
    diasRestantes: 42,
    prioridade: 'baixa',
    status: 'atencao'
  }
]

export function DocumentAlertsPanel() {
  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return <Badge variant="destructive">Urgente</Badge>
      case 'alta':
        return <Badge className="bg-orange-500">Alta</Badge>
      case 'media':
        return <Badge className="bg-yellow-500">Média</Badge>
      case 'baixa':
        return <Badge variant="outline">Baixa</Badge>
      default:
        return <Badge variant="secondary">Normal</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'vencido':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'vencendo':
        return <Clock className="w-5 h-5 text-orange-600" />
      case 'renovacao':
        return <Bell className="w-5 h-5 text-blue-600" />
      case 'atencao':
        return <CheckCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'CNH':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'CRLV':
        return <FileText className="w-4 h-4 text-green-600" />
      case 'Seguro':
        return <Shield className="w-4 h-4 text-purple-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getCardBackground = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return 'bg-red-50 border-red-200'
      case 'alta':
        return 'bg-orange-50 border-orange-200'
      case 'media':
        return 'bg-yellow-50 border-yellow-200'
      case 'baixa':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatDaysRemaining = (dias: number) => {
    if (dias < 0) {
      return `Vencido há ${Math.abs(dias)} dias`
    }
    if (dias === 0) {
      return 'Vence hoje'
    }
    if (dias === 1) {
      return 'Vence amanhã'
    }
    return `${dias} dias restantes`
  }

  const handleAction = (alert: any, action: string) => {
    console.log(`Ação: ${action} para documento:`, alert)
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {alertsData.filter(a => a.prioridade === 'urgente').length}
                </p>
                <p className="text-sm text-gray-600">Urgentes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {alertsData.filter(a => a.prioridade === 'alta').length}
                </p>
                <p className="text-sm text-gray-600">Alta Prioridade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {alertsData.filter(a => a.prioridade === 'media').length}
                </p>
                <p className="text-sm text-gray-600">Média Prioridade</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {alertsData.filter(a => a.prioridade === 'baixa').length}
                </p>
                <p className="text-sm text-gray-600">Baixa Prioridade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Vencimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsData.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getCardBackground(alert.prioridade)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(alert.status)}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(alert.tipo)}
                        <span className="font-medium">{alert.tipo}</span>
                        <span className="text-sm text-gray-600">#{alert.numero}</span>
                        {getPriorityBadge(alert.prioridade)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{alert.responsavel}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{new Date(alert.dataVencimento).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className={`font-medium ${
                          alert.diasRestantes < 0 ? 'text-red-600' :
                          alert.diasRestantes <= 7 ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {formatDaysRemaining(alert.diasRestantes)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {alert.status === 'vencido' && (
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleAction(alert, 'renovar')}
                      >
                        Renovar Urgente
                      </Button>
                    )}
                    
                    {alert.status === 'vencendo' && (
                      <Button 
                        size="sm" 
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => handleAction(alert, 'agendar')}
                      >
                        Agendar Renovação
                      </Button>
                    )}
                    
                    {alert.status === 'renovacao' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction(alert, 'acompanhar')}
                      >
                        Acompanhar
                      </Button>
                    )}
                    
                    {alert.status === 'atencao' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAction(alert, 'verificar')}
                      >
                        Verificar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex flex-col items-start gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium">Renovar Documentos Vencidos</p>
                  <p className="text-sm text-gray-600">
                    {alertsData.filter(a => a.diasRestantes < 0).length} documentos
                  </p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex flex-col items-start gap-2">
                <Calendar className="w-6 h-6 text-orange-600" />
                <div>
                  <p className="font-medium">Agendar Renovações</p>
                  <p className="text-sm text-gray-600">
                    {alertsData.filter(a => a.diasRestantes <= 30 && a.diasRestantes > 0).length} documentos
                  </p>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4 justify-start">
              <div className="flex flex-col items-start gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium">Configurar Lembretes</p>
                  <p className="text-sm text-gray-600">
                    Automatizar notificações
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
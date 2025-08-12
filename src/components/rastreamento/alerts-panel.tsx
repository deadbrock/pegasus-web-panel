'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AlertTriangle, 
  Clock, 
  Fuel, 
  Thermometer, 
  MapPin, 
  Truck, 
  CheckCircle, 
  X,
  Search,
  Filter,
  Bell,
  Settings
} from 'lucide-react'

// Mock data para alertas
const alertsData = [
  {
    id: 1,
    tipo: 'Combustível',
    prioridade: 'Alta',
    veiculo: 'BRA-2025',
    motorista: 'João Silva',
    descricao: 'Nível de combustível baixo (30%)',
    localizacao: 'Belo Horizonte - Centro',
    timestamp: '2024-01-15T14:23:45',
    status: 'Ativo',
    categoria: 'Operacional'
  },
  {
    id: 2,
    tipo: 'Temperatura',
    prioridade: 'Média',
    veiculo: 'BRA-2024',
    motorista: 'Ana Oliveira',
    descricao: 'Temperatura do motor elevada (95°C)',
    localizacao: 'Rio de Janeiro - Zona Sul',
    timestamp: '2024-01-15T14:18:32',
    status: 'Ativo',
    categoria: 'Manutenção'
  },
  {
    id: 3,
    tipo: 'Velocidade',
    prioridade: 'Alta',
    veiculo: 'BRA-2023',
    motorista: 'Carlos Lima',
    descricao: 'Excesso de velocidade (85 km/h em zona 60)',
    localizacao: 'Santos - Via Anchieta',
    timestamp: '2024-01-15T14:15:12',
    status: 'Resolvido',
    categoria: 'Segurança'
  },
  {
    id: 4,
    tipo: 'Rota',
    prioridade: 'Baixa',
    veiculo: 'BRA-2026',
    motorista: 'Maria Santos',
    descricao: 'Desvio da rota programada',
    localizacao: 'Curitiba - BR-277',
    timestamp: '2024-01-15T14:10:05',
    status: 'Ativo',
    categoria: 'Operacional'
  },
  {
    id: 5,
    tipo: 'Comunicação',
    prioridade: 'Média',
    veiculo: 'BRA-2027',
    motorista: 'Pedro Costa',
    descricao: 'Perda de sinal GPS há 15 minutos',
    localizacao: 'Última: Porto Alegre - Centro',
    timestamp: '2024-01-15T13:45:23',
    status: 'Ativo',
    categoria: 'Técnico'
  },
  {
    id: 6,
    tipo: 'Manutenção',
    prioridade: 'Média',
    veiculo: 'BRA-2025',
    motorista: 'João Silva',
    descricao: 'Manutenção preventiva vencida há 3 dias',
    localizacao: 'Belo Horizonte - Garagem',
    timestamp: '2024-01-15T08:00:00',
    status: 'Pendente',
    categoria: 'Manutenção'
  }
]

export function AlertsPanel() {
  const [filterType, setFilterType] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAlerts = alertsData.filter(alert => {
    if (filterType && alert.categoria !== filterType) return false
    if (filterPriority && alert.prioridade !== filterPriority) return false
    if (filterStatus && alert.status !== filterStatus) return false
    if (searchTerm && !alert.veiculo.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !alert.motorista.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !alert.descricao.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const activeAlerts = alertsData.filter(alert => alert.status === 'Ativo')
  const criticalAlerts = alertsData.filter(alert => alert.prioridade === 'Alta' && alert.status === 'Ativo')

  const getPriorityBadge = (prioridade: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Alta': { variant: 'destructive', color: 'bg-red-500' },
      'Média': { variant: 'default', color: 'bg-orange-500' },
      'Baixa': { variant: 'outline', color: 'bg-blue-500' }
    }

    return (
      <Badge 
        variant={variants[prioridade]?.variant || 'secondary'}
        className={variants[prioridade]?.color}
      >
        {prioridade}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Ativo': { variant: 'destructive', color: 'bg-red-500' },
      'Resolvido': { variant: 'default', color: 'bg-green-500' },
      'Pendente': { variant: 'default', color: 'bg-yellow-500' }
    }

    return (
      <Badge 
        variant={variants[status]?.variant || 'secondary'}
        className={variants[status]?.color}
      >
        {status}
      </Badge>
    )
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'Combustível':
        return <Fuel className="w-5 h-5 text-orange-600" />
      case 'Temperatura':
        return <Thermometer className="w-5 h-5 text-red-600" />
      case 'Velocidade':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'Rota':
        return <MapPin className="w-5 h-5 text-blue-600" />
      case 'Comunicação':
        return <Bell className="w-5 h-5 text-purple-600" />
      case 'Manutenção':
        return <Settings className="w-5 h-5 text-gray-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora'
    if (diffMinutes < 60) return `${diffMinutes}min atrás`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  const handleResolveAlert = (alertId: number) => {
    // Aqui seria feita a integração para resolver o alerta
    console.log('Resolvendo alerta:', alertId)
  }

  const handleDismissAlert = (alertId: number) => {
    // Aqui seria feita a integração para dispensar o alerta
    console.log('Dispensando alerta:', alertId)
  }

  return (
    <div className="space-y-6">
      {/* Resumo de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-orange-600">{criticalAlerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolvidos Hoje</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visões */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="critical">Críticos</TabsTrigger>
          <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
        </TabsList>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4" />
              <span className="font-medium text-sm">Filtros</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar veículo, motorista..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Categoria */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Operacional">Operacional</SelectItem>
                  <SelectItem value="Manutenção">Manutenção</SelectItem>
                  <SelectItem value="Segurança">Segurança</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                </SelectContent>
              </Select>

              {/* Prioridade */}
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Resolvido">Resolvido</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botão para limpar filtros */}
            {(filterType || filterPriority || filterStatus || searchTerm) && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setFilterType('')
                    setFilterPriority('')
                    setFilterStatus('')
                    setSearchTerm('')
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Alertas para cada tab */}
        <TabsContent value="all">
          <AlertsList alerts={filteredAlerts} onResolve={handleResolveAlert} onDismiss={handleDismissAlert} />
        </TabsContent>

        <TabsContent value="active">
          <AlertsList 
            alerts={filteredAlerts.filter(alert => alert.status === 'Ativo')} 
            onResolve={handleResolveAlert} 
            onDismiss={handleDismissAlert} 
          />
        </TabsContent>

        <TabsContent value="critical">
          <AlertsList 
            alerts={filteredAlerts.filter(alert => alert.prioridade === 'Alta' && alert.status === 'Ativo')} 
            onResolve={handleResolveAlert} 
            onDismiss={handleDismissAlert} 
          />
        </TabsContent>

        <TabsContent value="resolved">
          <AlertsList 
            alerts={filteredAlerts.filter(alert => alert.status === 'Resolvido')} 
            onResolve={handleResolveAlert} 
            onDismiss={handleDismissAlert} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Componente para lista de alertas
interface AlertsListProps {
  alerts: any[]
  onResolve: (id: number) => void
  onDismiss: (id: number) => void
}

function AlertsList({ alerts, onResolve, onDismiss }: AlertsListProps) {
  const getPriorityBadge = (prioridade: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Alta': { variant: 'destructive', color: 'bg-red-500' },
      'Média': { variant: 'default', color: 'bg-orange-500' },
      'Baixa': { variant: 'outline', color: 'bg-blue-500' }
    }

    return (
      <Badge 
        variant={variants[prioridade]?.variant || 'secondary'}
        className={variants[prioridade]?.color}
      >
        {prioridade}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Ativo': { variant: 'destructive', color: 'bg-red-500' },
      'Resolvido': { variant: 'default', color: 'bg-green-500' },
      'Pendente': { variant: 'default', color: 'bg-yellow-500' }
    }

    return (
      <Badge 
        variant={variants[status]?.variant || 'secondary'}
        className={variants[status]?.color}
      >
        {status}
      </Badge>
    )
  }

  const getAlertIcon = (tipo: string) => {
    switch (tipo) {
      case 'Combustível':
        return <Fuel className="w-5 h-5 text-orange-600" />
      case 'Temperatura':
        return <Thermometer className="w-5 h-5 text-red-600" />
      case 'Velocidade':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'Rota':
        return <MapPin className="w-5 h-5 text-blue-600" />
      case 'Comunicação':
        return <Bell className="w-5 h-5 text-purple-600" />
      case 'Manutenção':
        return <Settings className="w-5 h-5 text-gray-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 1) return 'Agora'
    if (diffMinutes < 60) return `${diffMinutes}min atrás`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h atrás`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d atrás`
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Nenhum alerta encontrado</p>
          <p className="text-sm text-gray-400 mt-1">
            Ajuste os filtros para ver mais resultados
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Card key={alert.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                {getAlertIcon(alert.tipo)}
                
                <div className="space-y-2 flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{alert.descricao}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getPriorityBadge(alert.prioridade)}
                        {getStatusBadge(alert.status)}
                        <Badge variant="outline">{alert.categoria}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Veículo:</span>
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{alert.veiculo}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Motorista:</span>
                      <p className="font-medium">{alert.motorista}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Localização:</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{alert.localizacao}</span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(alert.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              {alert.status === 'Ativo' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResolve(alert.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  User,
  Activity,
  Plus,
  FileSearch,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Save,
  Loader2,
  Settings
} from 'lucide-react'

interface NovaAuditoria {
  titulo: string
  tipo: 'financeiro' | 'operacional' | 'seguranca' | 'compliance'
  modulos: string[]
  periodo_inicio: string
  periodo_fim: string
  descricao: string
  automatica: boolean
  notificar_email: boolean
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
}

export default function AuditoriaPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewAuditDialogOpen, setIsNewAuditDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [auditFormData, setAuditFormData] = useState<NovaAuditoria>({
    titulo: '',
    tipo: 'financeiro',
    modulos: [],
    periodo_inicio: '',
    periodo_fim: '',
    descricao: '',
    automatica: false,
    notificar_email: true,
    prioridade: 'media'
  })

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

  const modulosDisponiveis = [
    'Financeiro',
    'Centro de Custos', 
    'Conciliação',
    'Relatórios',
    'Aprovação',
    'Categorização',
    'Documentos',
    'Usuários',
    'Configurações'
  ]

  const handleSaveAuditoria = async () => {
    if (!auditFormData.titulo || !auditFormData.periodo_inicio || !auditFormData.periodo_fim) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      // Simula salvamento da auditoria
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Auditoria criada!",
        description: `A auditoria "${auditFormData.titulo}" foi agendada com sucesso.`,
      })
      
      setIsNewAuditDialogOpen(false)
      resetAuditForm()
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a auditoria. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const resetAuditForm = () => {
    setAuditFormData({
      titulo: '',
      tipo: 'financeiro',
      modulos: [],
      periodo_inicio: '',
      periodo_fim: '',
      descricao: '',
      automatica: false,
      notificar_email: true,
      prioridade: 'media'
    })
  }

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-yellow-100 text-yellow-800', 
      alta: 'bg-orange-100 text-orange-800',
      critica: 'bg-red-100 text-red-800'
    }
    return colors[prioridade as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getTipoIcon = (tipo: string) => {
    const icons = {
      financeiro: Target,
      operacional: Activity,
      seguranca: AlertTriangle,
      compliance: CheckCircle
    }
    return icons[tipo as keyof typeof icons] || FileSearch
  }

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
          <Dialog open={isNewAuditDialogOpen} onOpenChange={(open) => {
            setIsNewAuditDialogOpen(open)
            if (!open) resetAuditForm()
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova Auditoria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileSearch className="w-5 h-5" />
                  <span>Nova Auditoria</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Informações Básicas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="titulo">Título da Auditoria *</Label>
                      <Input
                        id="titulo"
                        value={auditFormData.titulo}
                        onChange={(e) => setAuditFormData(prev => ({ ...prev, titulo: e.target.value }))}
                        placeholder="Ex: Auditoria Financeira Janeiro"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tipo">Tipo de Auditoria</Label>
                      <Select
                        value={auditFormData.tipo}
                        onValueChange={(value: 'financeiro' | 'operacional' | 'seguranca' | 'compliance') => 
                          setAuditFormData(prev => ({ ...prev, tipo: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="operacional">Operacional</SelectItem>
                          <SelectItem value="seguranca">Segurança</SelectItem>
                          <SelectItem value="compliance">Compliance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="periodo_inicio">Data Início *</Label>
                      <Input
                        id="periodo_inicio"
                        type="date"
                        value={auditFormData.periodo_inicio}
                        onChange={(e) => setAuditFormData(prev => ({ ...prev, periodo_inicio: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodo_fim">Data Fim *</Label>
                      <Input
                        id="periodo_fim"
                        type="date"
                        value={auditFormData.periodo_fim}
                        onChange={(e) => setAuditFormData(prev => ({ ...prev, periodo_fim: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="prioridade">Prioridade</Label>
                    <Select
                      value={auditFormData.prioridade}
                      onValueChange={(value: 'baixa' | 'media' | 'alta' | 'critica') => 
                        setAuditFormData(prev => ({ ...prev, prioridade: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Escopo da Auditoria */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Escopo da Auditoria</h3>
                  
                  <div>
                    <Label>Módulos a Auditar</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {modulosDisponiveis.map((modulo) => (
                        <div key={modulo} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`modulo-${modulo}`}
                            checked={auditFormData.modulos.includes(modulo)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAuditFormData(prev => ({
                                  ...prev,
                                  modulos: [...prev.modulos, modulo]
                                }))
                              } else {
                                setAuditFormData(prev => ({
                                  ...prev,
                                  modulos: prev.modulos.filter(m => m !== modulo)
                                }))
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={`modulo-${modulo}`} className="text-sm">
                            {modulo}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição e Objetivos</Label>
                    <Textarea
                      id="descricao"
                      value={auditFormData.descricao}
                      onChange={(e) => setAuditFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva os objetivos e escopo específico desta auditoria..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Configurações */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">Configurações</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="automatica">Auditoria Automática</Label>
                        <p className="text-sm text-gray-500">Executar automaticamente no período especificado</p>
                      </div>
                      <Switch
                        id="automatica"
                        checked={auditFormData.automatica}
                        onCheckedChange={(checked) => setAuditFormData(prev => ({ ...prev, automatica: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notificar_email">Notificação por Email</Label>
                        <p className="text-sm text-gray-500">Enviar relatório por email quando concluída</p>
                      </div>
                      <Switch
                        id="notificar_email"
                        checked={auditFormData.notificar_email}
                        onCheckedChange={(checked) => setAuditFormData(prev => ({ ...prev, notificar_email: checked }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {auditFormData.titulo && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium border-b pb-2">Preview</h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-center space-x-3 mb-2">
                        {(() => {
                          const IconComponent = getTipoIcon(auditFormData.tipo)
                          return <IconComponent className="w-5 h-5 text-blue-600" />
                        })()}
                        <h4 className="font-medium">{auditFormData.titulo}</h4>
                        <Badge className={getPrioridadeColor(auditFormData.prioridade)}>
                          {auditFormData.prioridade.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Tipo: {auditFormData.tipo.charAt(0).toUpperCase() + auditFormData.tipo.slice(1)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        Período: {auditFormData.periodo_inicio ? new Date(auditFormData.periodo_inicio).toLocaleDateString('pt-BR') : 'N/A'} até {auditFormData.periodo_fim ? new Date(auditFormData.periodo_fim).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                      {auditFormData.modulos.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Módulos: {auditFormData.modulos.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsNewAuditDialogOpen(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveAuditoria} 
                  disabled={saving || !auditFormData.titulo || !auditFormData.periodo_inicio || !auditFormData.periodo_fim}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Auditoria
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Dialog para Nova Auditoria */}
      <Dialog open={isNewAuditDialogOpen} onOpenChange={setIsNewAuditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileSearch className="w-5 h-5 text-blue-600" />
              <span>Nova Auditoria</span>
            </DialogTitle>
            <DialogDescription>
              Crie uma nova tarefa de auditoria configurando os parâmetros de análise.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título da Auditoria *</Label>
                <Input
                  id="titulo"
                  value={auditFormData.titulo}
                  onChange={(e) => setAuditFormData({...auditFormData, titulo: e.target.value})}
                  placeholder="Ex: Auditoria Financeira Janeiro 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo de Auditoria</Label>
                  <Select 
                    value={auditFormData.tipo} 
                    onValueChange={(value: 'financeiro' | 'operacional' | 'seguranca' | 'compliance') => 
                      setAuditFormData({...auditFormData, tipo: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="operacional">Operacional</SelectItem>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select 
                    value={auditFormData.prioridade} 
                    onValueChange={(value: 'baixa' | 'media' | 'alta' | 'critica') => 
                      setAuditFormData({...auditFormData, prioridade: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Período */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Período da Auditoria
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodo_inicio">Data Início *</Label>
                  <Input
                    id="periodo_inicio"
                    type="date"
                    value={auditFormData.periodo_inicio}
                    onChange={(e) => setAuditFormData({...auditFormData, periodo_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="periodo_fim">Data Fim *</Label>
                  <Input
                    id="periodo_fim"
                    type="date"
                    value={auditFormData.periodo_fim}
                    onChange={(e) => setAuditFormData({...auditFormData, periodo_fim: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Módulos */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700">Módulos a Auditar</h4>
              <div className="grid grid-cols-3 gap-2">
                {modulosDisponiveis.map((modulo) => (
                  <div key={modulo} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`modulo-${modulo}`}
                      checked={auditFormData.modulos.includes(modulo)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAuditFormData({
                            ...auditFormData, 
                            modulos: [...auditFormData.modulos, modulo]
                          })
                        } else {
                          setAuditFormData({
                            ...auditFormData,
                            modulos: auditFormData.modulos.filter(m => m !== modulo)
                          })
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`modulo-${modulo}`} className="text-sm">
                      {modulo}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Configurações */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auditoria Automática</Label>
                    <p className="text-xs text-gray-500">Executar auditoria automaticamente no período definido</p>
                  </div>
                  <Switch
                    checked={auditFormData.automatica}
                    onCheckedChange={(checked) => setAuditFormData({...auditFormData, automatica: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Notificar por Email</Label>
                    <p className="text-xs text-gray-500">Enviar notificação quando a auditoria for concluída</p>
                  </div>
                  <Switch
                    checked={auditFormData.notificar_email}
                    onCheckedChange={(checked) => setAuditFormData({...auditFormData, notificar_email: checked})}
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={auditFormData.descricao}
                onChange={(e) => setAuditFormData({...auditFormData, descricao: e.target.value})}
                placeholder="Descreva os objetivos e escopo da auditoria..."
                rows={3}
              />
            </div>

            {/* Preview da Configuração */}
            {auditFormData.titulo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Preview da Auditoria</h5>
                <div className="space-y-1 text-sm text-blue-800">
                  <p><strong>Título:</strong> {auditFormData.titulo}</p>
                  <p><strong>Tipo:</strong> {auditFormData.tipo}</p>
                  <p><strong>Período:</strong> {auditFormData.periodo_inicio} até {auditFormData.periodo_fim}</p>
                  <p><strong>Módulos:</strong> {auditFormData.modulos.length} selecionados</p>
                  <div className="flex items-center space-x-2">
                    <Badge className={getPrioridadeColor(auditFormData.prioridade)}>
                      {auditFormData.prioridade.toUpperCase()}
                    </Badge>
                    {auditFormData.automatica && <Badge className="bg-green-100 text-green-800">AUTOMÁTICA</Badge>}
                    {auditFormData.notificar_email && <Badge className="bg-purple-100 text-purple-800">EMAIL</Badge>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsNewAuditDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveAuditoria} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Criar Auditoria
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
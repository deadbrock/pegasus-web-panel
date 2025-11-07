"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
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
  Save,
  Loader2,
  Settings
} from 'lucide-react'
import {
  fetchAuditoriaLogs,
  fetchAuditoriaTasks,
  createAuditoriaTask,
  calcularEstatisticasAuditoria,
  subscribeAuditoriaLogs,
  type AuditoriaLog,
  type AuditoriaTask
} from '@/lib/services/auditoria-service'

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
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditoriaLog | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditoriaLog[]>([])
  const [stats, setStats] = useState({
    totalLogs: 0,
    logsHoje: 0,
    logsSucesso: 0,
    logsFalha: 0,
    porModulo: [] as { modulo: string; count: number }[],
    porAcao: [] as { acao: string; count: number }[]
  })
  const { toast } = useToast()

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

  const modulosDisponiveis = [
    'Financeiro',
    'Centro de Custos', 
    'Conciliação',
    'Relatórios',
    'Aprovação',
    'Categorização',
    'Documentos',
    'Usuários',
    'Configurações',
    'Motoristas',
    'Veículos',
    'Manutenção',
    'Pedidos',
    'Rastreamento'
  ]

  // Carregar dados
  const loadData = async () => {
    setLoading(true)
    try {
      const [logsData, statsData] = await Promise.all([
        fetchAuditoriaLogs(),
        calcularEstatisticasAuditoria()
      ])
      
      setLogs(logsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados de auditoria:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados de auditoria',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    
    // Subscribe para atualizações em tempo real
    const unsubscribe = subscribeAuditoriaLogs(() => {
      console.log('[Auditoria] Novo log detectado, recarregando...')
      loadData()
    })
    
    return () => unsubscribe()
  }, [])

  const getStatusBadge = (status: string) => {
    return status === 'sucesso' 
      ? <Badge className="bg-green-100 text-green-800">Sucesso</Badge>
      : <Badge className="bg-red-100 text-red-800">Falha</Badge>
  }

  const getAcaoBadge = (acao: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-blue-100 text-blue-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      READ: 'bg-green-100 text-green-800',
      LOGIN: 'bg-purple-100 text-purple-800',
      IMPORT: 'bg-indigo-100 text-indigo-800',
      EXPORT: 'bg-emerald-100 text-emerald-800',
      ACCESS_DENIED: 'bg-red-100 text-red-800'
    }
    
    const cor = colors[acao] || 'bg-gray-100 text-gray-800'
    return <Badge className={cor}>{acao}</Badge>
  }

  const filteredLogs = logs.filter(log =>
    log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.descricao && log.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleSaveAuditoria = async () => {
    if (!auditFormData.titulo || !auditFormData.periodo_inicio || !auditFormData.periodo_fim) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha título e período.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      const created = await createAuditoriaTask(auditFormData)
      
      if (!created) {
        throw new Error('Falha ao criar auditoria')
      }
      
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

  const handleViewDetails = (log: AuditoriaLog) => {
    setSelectedLog(log)
    setIsDetailsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
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
                <DialogDescription>
                  Configure uma nova tarefa de auditoria com parâmetros específicos.
                </DialogDescription>
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
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">{stats.logsHoje} hoje</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.logsSucesso}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLogs > 0 ? Math.round((stats.logsSucesso / stats.totalLogs) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Falhas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.logsFalha}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLogs > 0 ? Math.round((stats.logsFalha / stats.totalLogs) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos Ativos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.porModulo.length}</div>
            <p className="text-xs text-muted-foreground">Com atividade recente</p>
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
          <CardTitle>Logs de Atividade ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum log encontrado</p>
              <p className="text-sm text-gray-500 mt-1">
                Os logs de auditoria aparecerão aqui conforme as atividades ocorrem
              </p>
            </div>
          ) : (
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
                      <p className="text-gray-700 mb-2">{log.descricao || '-'}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {log.usuario}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                        {log.ip && <span>IP: {log.ip}</span>}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(log)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes do Log */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Detalhes do Log</span>
            </DialogTitle>
            <DialogDescription>
              Informações completas sobre esta atividade
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6 py-4">
              {/* Badges de Status */}
              <div className="flex items-center space-x-2">
                {getAcaoBadge(selectedLog.acao)}
                {getStatusBadge(selectedLog.status)}
              </div>

              {/* Informações Principais */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">ID do Log</Label>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1 break-all">
                      {selectedLog.id}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Módulo</Label>
                    <p className="text-sm font-semibold mt-1">{selectedLog.modulo}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Ação Executada</Label>
                  <p className="text-sm font-semibold mt-1">{selectedLog.acao}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500">Descrição</Label>
                  <p className="text-sm mt-1 bg-gray-50 p-3 rounded">
                    {selectedLog.descricao || 'Sem descrição'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Usuário</Label>
                    <p className="text-sm mt-1 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {selectedLog.usuario}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Endereço IP</Label>
                    <p className="text-sm mt-1 font-mono">
                      {selectedLog.ip || 'Não registrado'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Data/Hora</Label>
                    <p className="text-sm mt-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(selectedLog.timestamp).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Criado em</Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedLog.created_at).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'medium'
                      })}
                    </p>
                  </div>
                </div>

                {/* Detalhes JSON */}
                {selectedLog.detalhes && Object.keys(selectedLog.detalhes).length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Detalhes Adicionais</Label>
                    <div className="mt-2 bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                      <pre>{JSON.stringify(selectedLog.detalhes, null, 2)}</pre>
                    </div>
                  </div>
                )}

                {/* Informações Técnicas */}
                <div className="border-t pt-4 mt-4">
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">
                    Informações Técnicas
                  </Label>
                  <div className="grid grid-cols-1 gap-2 text-xs bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold">{selectedLog.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timestamp Unix:</span>
                      <span className="font-mono">
                        {new Date(selectedLog.timestamp).getTime()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tempo Decorrido:</span>
                      <span>
                        {(() => {
                          const diff = Date.now() - new Date(selectedLog.timestamp).getTime()
                          const minutes = Math.floor(diff / 60000)
                          const hours = Math.floor(minutes / 60)
                          const days = Math.floor(hours / 24)
                          
                          if (days > 0) return `${days} dia(s) atrás`
                          if (hours > 0) return `${hours} hora(s) atrás`
                          if (minutes > 0) return `${minutes} minuto(s) atrás`
                          return 'Agora mesmo'
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsDialogOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


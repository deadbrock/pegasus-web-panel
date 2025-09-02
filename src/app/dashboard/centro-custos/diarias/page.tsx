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
import { toast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  Plane,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Clock,
  Save,
  Loader2,
  ArrowLeft,
  Download,
  Upload
} from 'lucide-react'
import Link from 'next/link'

interface Diaria {
  id?: number
  funcionario: string
  cargo: string
  destino: string
  motivo_viagem: string
  data_inicio: string
  data_fim: string
  dias_diaria: number
  valor_diario: number
  valor_total: number
  status: 'solicitada' | 'aprovada' | 'paga' | 'rejeitada'
  observacoes?: string
  created_at?: string
  updated_at?: string
}

interface FormData {
  funcionario: string
  cargo: string
  destino: string
  motivo_viagem: string
  data_inicio: string
  data_fim: string
  valor_diario: string
  observacoes: string
  status: 'solicitada' | 'aprovada' | 'paga' | 'rejeitada'
}

export default function DiariasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [diarias, setDiarias] = useState<Diaria[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDiaria, setEditingDiaria] = useState<Diaria | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('todas')
  const [formData, setFormData] = useState<FormData>({
    funcionario: '',
    cargo: '',
    destino: '',
    motivo_viagem: '',
    data_inicio: '',
    data_fim: '',
    valor_diario: '',
    observacoes: '',
    status: 'solicitada'
  })

  // Dados simulados para demonstração
  const diariasSimuladas: Diaria[] = [
    {
      id: 1,
      funcionario: 'João Silva',
      cargo: 'Motorista',
      destino: 'São Paulo - SP',
      motivo_viagem: 'Entrega de mercadorias especiais',
      data_inicio: '2024-01-15',
      data_fim: '2024-01-17',
      dias_diaria: 3,
      valor_diario: 180.00,
      valor_total: 540.00,
      status: 'aprovada',
      observacoes: 'Viagem para cliente premium',
      created_at: '2024-01-10T14:30:00Z'
    },
    {
      id: 2,
      funcionario: 'Maria Santos',
      cargo: 'Supervisora',
      destino: 'Rio de Janeiro - RJ',
      motivo_viagem: 'Supervisão de filial',
      data_inicio: '2024-01-20',
      data_fim: '2024-01-22',
      dias_diaria: 3,
      valor_diario: 220.00,
      valor_total: 660.00,
      status: 'paga',
      observacoes: 'Auditoria mensal da filial RJ',
      created_at: '2024-01-12T10:15:00Z'
    },
    {
      id: 3,
      funcionario: 'Pedro Costa',
      cargo: 'Técnico',
      destino: 'Belo Horizonte - MG',
      motivo_viagem: 'Manutenção preventiva de equipamentos',
      data_inicio: '2024-01-25',
      data_fim: '2024-01-26',
      dias_diaria: 2,
      valor_diario: 150.00,
      valor_total: 300.00,
      status: 'solicitada',
      observacoes: 'Manutenção urgente do sistema de rastreamento',
      created_at: '2024-01-14T16:45:00Z'
    }
  ]

  useEffect(() => {
    // Simula carregamento
    setTimeout(() => {
      setDiarias(diariasSimuladas)
      setLoading(false)
    }, 1000)
  }, [])

  const calculateDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Incluir o dia de partida
  }

  const saveDiaria = async () => {
    if (!formData.funcionario || !formData.destino || !formData.data_inicio || !formData.data_fim || !formData.valor_diario) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    setSaving(true)
    
    try {
      const dias = calculateDays(formData.data_inicio, formData.data_fim)
      const valorDiario = parseFloat(formData.valor_diario)
      const valorTotal = dias * valorDiario

      const diariaData: Diaria = {
        id: editingDiaria?.id || Math.max(...diarias.map(d => d.id || 0), 0) + 1,
        funcionario: formData.funcionario,
        cargo: formData.cargo,
        destino: formData.destino,
        motivo_viagem: formData.motivo_viagem,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        dias_diaria: dias,
        valor_diario: valorDiario,
        valor_total: valorTotal,
        status: formData.status,
        observacoes: formData.observacoes,
        created_at: editingDiaria?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      if (editingDiaria) {
        setDiarias(prev => prev.map(d => 
          d.id === editingDiaria.id ? diariaData : d
        ))
        toast({
          title: "Sucesso!",
          description: "Diária atualizada com sucesso.",
        })
      } else {
        setDiarias(prev => [diariaData, ...prev])
        toast({
          title: "Sucesso!",
          description: "Diária criada com sucesso.",
        })
      }
      
      setIsDialogOpen(false)
      resetForm()
      
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a diária. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteDiaria = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta diária?')) {
      setDiarias(prev => prev.filter(d => d.id !== id))
      toast({
        title: "Sucesso!",
        description: "Diária excluída com sucesso.",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      funcionario: '',
      cargo: '',
      destino: '',
      motivo_viagem: '',
      data_inicio: '',
      data_fim: '',
      valor_diario: '',
      observacoes: '',
      status: 'solicitada'
    })
    setEditingDiaria(null)
  }

  const handleCreateDiaria = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditDiaria = (diaria: Diaria) => {
    setEditingDiaria(diaria)
    setFormData({
      funcionario: diaria.funcionario,
      cargo: diaria.cargo,
      destino: diaria.destino,
      motivo_viagem: diaria.motivo_viagem,
      data_inicio: diaria.data_inicio,
      data_fim: diaria.data_fim,
      valor_diario: diaria.valor_diario.toString(),
      observacoes: diaria.observacoes || '',
      status: diaria.status
    })
    setIsDialogOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      solicitada: 'bg-yellow-100 text-yellow-800',
      aprovada: 'bg-blue-100 text-blue-800',
      paga: 'bg-green-100 text-green-800',
      rejeitada: 'bg-red-100 text-red-800'
    }
    const labels = {
      solicitada: 'Solicitada',
      aprovada: 'Aprovada',
      paga: 'Paga',
      rejeitada: 'Rejeitada'
    }
    return <Badge className={colors[status as keyof typeof colors]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  }

  const filteredDiarias = diarias.filter(diaria => {
    const matchesSearch = diaria.funcionario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diaria.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diaria.motivo_viagem.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'todas' || diaria.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalDiarias = diarias.reduce((acc, d) => acc + d.valor_total, 0)
  const diariasAprovadas = diarias.filter(d => d.status === 'aprovada').length
  const diariasPagas = diarias.filter(d => d.status === 'paga').length
  const diariasPendentes = diarias.filter(d => d.status === 'solicitada').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando diárias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/centro-custos">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Plane className="w-8 h-8 mr-3 text-orange-600" />
              Centro de Custos - Diárias
            </h1>
            <p className="text-gray-600">Gestão de pagamento de diárias para funcionários</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button size="sm" onClick={handleCreateDiaria}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Diária
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Diárias</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalDiarias)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{diariasPendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{diariasAprovadas}</div>
            <p className="text-xs text-muted-foreground">Prontas para pagamento</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{diariasPagas}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por funcionário, destino ou motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {['todas', 'solicitada', 'aprovada', 'paga', 'rejeitada'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Diárias */}
      <div className="grid grid-cols-1 gap-6">
        {filteredDiarias.map((diaria) => (
          <Card key={diaria.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold">{diaria.funcionario}</h3>
                    <Badge variant="outline">{diaria.cargo}</Badge>
                    {getStatusBadge(diaria.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span><strong>Destino:</strong> {diaria.destino}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span><strong>Período:</strong> {new Date(diaria.data_inicio).toLocaleDateString('pt-BR')} a {new Date(diaria.data_fim).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      <span><strong>Dias:</strong> {diaria.dias_diaria}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600">
                      <strong>Motivo:</strong> {diaria.motivo_viagem}
                    </p>
                  </div>

                  {diaria.observacoes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <strong>Observações:</strong> {diaria.observacoes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        Valor diário: {formatCurrency(diaria.valor_diario)}
                      </span>
                      <span className="text-lg font-bold text-orange-600">
                        Total: {formatCurrency(diaria.valor_total)}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDiaria(diaria)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDiaria(diaria.id!)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiarias.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Plane className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma diária encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'todas'
                ? 'Tente ajustar os filtros de busca'
                : 'Crie a primeira solicitação de diária'
              }
            </p>
            {!searchTerm && filterStatus === 'todas' && (
              <Button onClick={handleCreateDiaria}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Diária
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dialog para Criar/Editar Diária */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plane className="w-5 h-5" />
              <span>{editingDiaria ? 'Editar Diária' : 'Nova Diária'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingDiaria 
                ? 'Modifique os dados da solicitação de diária.' 
                : 'Preencha os dados para registrar uma nova solicitação de diária.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Dados do Funcionário */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Dados do Funcionário</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funcionario">Nome do Funcionário *</Label>
                  <Input
                    id="funcionario"
                    value={formData.funcionario}
                    onChange={(e) => setFormData(prev => ({ ...prev, funcionario: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select
                    value={formData.cargo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cargo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Motorista">Motorista</SelectItem>
                      <SelectItem value="Supervisora">Supervisora</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Diretor">Diretor</SelectItem>
                      <SelectItem value="Analista">Analista</SelectItem>
                      <SelectItem value="Assistente">Assistente</SelectItem>
                      <SelectItem value="Coordenador">Coordenador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dados da Viagem */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Dados da Viagem</h3>
              
              <div>
                <Label htmlFor="destino">Destino *</Label>
                <Input
                  id="destino"
                  value={formData.destino}
                  onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                  placeholder="Ex: São Paulo - SP"
                  required
                />
              </div>

              <div>
                <Label htmlFor="motivo_viagem">Motivo da Viagem *</Label>
                <Textarea
                  id="motivo_viagem"
                  value={formData.motivo_viagem}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivo_viagem: e.target.value }))}
                  placeholder="Descreva o motivo da viagem..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim *</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {formData.data_inicio && formData.data_fim && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Período calculado:</strong> {calculateDays(formData.data_inicio, formData.data_fim)} dias
                  </p>
                </div>
              )}
            </div>

            {/* Valores */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Valores</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_diario">Valor da Diária *</Label>
                  <Input
                    id="valor_diario"
                    type="number"
                    step="0.01"
                    value={formData.valor_diario}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_diario: e.target.value }))}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: 'solicitada' | 'aprovada' | 'paga' | 'rejeitada') => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solicitada">Solicitada</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="paga">Paga</SelectItem>
                      <SelectItem value="rejeitada">Rejeitada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.valor_diario && formData.data_inicio && formData.data_fim && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Valor total calculado:</strong> {formatCurrency(
                      calculateDays(formData.data_inicio, formData.data_fim) * parseFloat(formData.valor_diario || '0')
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              onClick={saveDiaria} 
              disabled={saving || !formData.funcionario || !formData.destino || !formData.data_inicio || !formData.data_fim || !formData.valor_diario}
              className="min-w-[100px]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {editingDiaria ? 'Salvar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { 
  Plus, 
  Search, 
  Edit,
  Trash2,
  BarChart3,
  DollarSign,
  Settings,
  Building,
  Car,
  Plane,
  Cog,
  FileText,
  Shield,
  Phone,
  Wifi,
  Target,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface CentroCusto {
  id?: number
  nome: string
  tipo: 'predefinido' | 'personalizado'
  codigo: string
  descricao?: string
  ativo: boolean
  cor_hex: string
  created_at?: string
  updated_at?: string
  total_gastos?: number
  transacoes_mes?: number
}

interface FormData {
  nome: string
  codigo: string
  descricao: string
  cor_hex: string
  ativo: boolean
  tipo: 'predefinido' | 'personalizado'
}

const iconMap = {
  'SEDE': Building,
  'FILIAL': Building,
  'DIARIAS': Plane,
  'VEICULOS': Car,
  'MAQUINAS': Cog,
  'CONTRATOS': FileText,
  'SEGUROS': Shield,
  'TELEFONIA': Phone,
  'INTERNET': Wifi,
  'DEFAULT': Target
}

export default function CentroCustosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCentro, setEditingCentro] = useState<CentroCusto | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    codigo: '',
    descricao: '',
    cor_hex: '#3B82F6',
    ativo: true,
    tipo: 'personalizado'
  })

  // Estados para o diálogo de diárias
  const [isDiariasDialogOpen, setIsDiariasDialogOpen] = useState(false)
  const [diariasFormData, setDiariasFormData] = useState({
    funcionario: '',
    cpf: '',
    cargo: '',
    periodo_inicio: new Date().toISOString().split('T')[0],
    periodo_fim: new Date().toISOString().split('T')[0],
    destino: '',
    proposito: '',
    valor_diaria: '',
    quantidade_dias: '',
    observacoes: ''
  })

  // API Functions
  const fetchCentrosCusto = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/backend/centro-custo/')
      if (!response.ok) throw new Error('Erro ao carregar centros de custo')
      
      const data = await response.json()
      setCentrosCusto(data)
    } catch (error) {
      console.error('Erro:', error)
      // Fallback para dados simulados
      const centrosCustoSimulados: CentroCusto[] = [
        {
          id: 1,
          nome: 'Sede',
          tipo: 'predefinido',
          codigo: 'SEDE',
          descricao: 'Custos administrativos da sede',
          ativo: true,
          cor_hex: '#3B82F6',
          created_at: '2024-01-01',
          total_gastos: 125000,
          transacoes_mes: 45
        },
        {
          id: 2,
          nome: 'Veículos',
          tipo: 'predefinido',
          codigo: 'VEICULOS',
          descricao: 'Combustível, manutenção e seguro veicular',
          ativo: true,
          cor_hex: '#EF4444',
          created_at: '2024-01-01',
          total_gastos: 98000,
          transacoes_mes: 67
        },
        {
          id: 3,
          nome: 'Filiais',
          tipo: 'predefinido',
          codigo: 'FILIAL',
          descricao: 'Custos das filiais',
          ativo: true,
          cor_hex: '#10B981',
          created_at: '2024-01-01',
          total_gastos: 85000,
          transacoes_mes: 32
        },
        {
          id: 4,
          nome: 'Diárias',
          tipo: 'predefinido',
          codigo: 'DIARIAS',
          descricao: 'Pagamento de diárias para funcionários',
          ativo: true,
          cor_hex: '#F59E0B',
          created_at: '2024-01-01',
          total_gastos: 35000,
          transacoes_mes: 28
        },
        {
          id: 5,
          nome: 'Projeto Alpha',
          tipo: 'personalizado',
          codigo: 'PROJ_ALPHA',
          descricao: 'Projeto especial de expansão',
          ativo: true,
          cor_hex: '#8B5CF6',
          created_at: '2024-01-15',
          total_gastos: 45000,
          transacoes_mes: 12
        }
      ]
      setCentrosCusto(centrosCustoSimulados)
      toast({
        title: "Aviso",
        description: "Usando dados simulados. Verifique a conexão com o backend.",
        variant: "default"
      })
    } finally {
      setLoading(false)
    }
  }

  const saveCentroCusto = async () => {
    try {
      setSaving(true)
      
      const url = editingCentro 
        ? `/api/backend/centro-custo/${editingCentro.id}` 
        : '/api/backend/centro-custo/'
      
      const method = editingCentro ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error('Erro ao salvar centro de custo')

      const savedCentro = await response.json()
      
      if (editingCentro) {
        setCentrosCusto(prev => prev.map(c => 
          c.id === editingCentro.id ? savedCentro : c
        ))
        toast({
          title: "Sucesso!",
          description: "Centro de custo atualizado com sucesso.",
        })
      } else {
        setCentrosCusto(prev => [...prev, savedCentro])
        toast({
          title: "Sucesso!",
          description: "Centro de custo criado com sucesso.",
        })
      }
      
      setIsDialogOpen(false)
      resetForm()
      
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o centro de custo. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteCentroCusto = async (id: number) => {
    try {
      const response = await fetch(`/api/backend/centro-custo/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao excluir centro de custo')

      setCentrosCusto(prev => prev.filter(c => c.id !== id))
      toast({
        title: "Sucesso!",
        description: "Centro de custo excluído com sucesso.",
      })
      
    } catch (error) {
      console.error('Erro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o centro de custo. Tente novamente.",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      descricao: '',
      cor_hex: '#3B82F6',
      ativo: true,
      tipo: 'personalizado'
    })
    setEditingCentro(null)
  }

  useEffect(() => {
    fetchCentrosCusto()
  }, [])

  const filteredCentros = centrosCusto.filter(centro =>
    centro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCentro = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEditCentro = (centro: CentroCusto) => {
    setEditingCentro(centro)
    setFormData({
      nome: centro.nome,
      codigo: centro.codigo,
      descricao: centro.descricao || '',
      cor_hex: centro.cor_hex,
      ativo: centro.ativo,
      tipo: centro.tipo
    })
    setIsDialogOpen(true)
  }

  const handleDeleteCentro = async (centro: CentroCusto) => {
    if (centro.tipo === 'predefinido') {
      toast({
        title: "Ação não permitida",
        description: "Centros de custo predefinidos não podem ser excluídos.",
        variant: "destructive"
      })
      return
    }

    if (confirm(`Tem certeza que deseja excluir o centro "${centro.nome}"?`)) {
      await deleteCentroCusto(centro.id!)
    }
  }

  const handleDiariasClick = (centro: CentroCusto) => {
    if (centro.codigo === 'DIARIAS') {
      setIsDiariasDialogOpen(true)
    } else {
      handleEditCentro(centro)
    }
  }

  const handleSaveDiarias = () => {
    if (!diariasFormData.funcionario || !diariasFormData.valor_diaria) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha os campos obrigatórios.",
        variant: "destructive"
      })
      return
    }

    // Simular salvamento da diária
    const valorTotal = parseFloat(diariasFormData.valor_diaria) * parseInt(diariasFormData.quantidade_dias || '1')
    
    toast({
      title: "Diária registrada!",
      description: `Diária de ${diariasFormData.funcionario} no valor de ${formatCurrency(valorTotal)} foi registrada.`,
    })

    // Reset form
    setDiariasFormData({
      funcionario: '',
      cpf: '',
      cargo: '',
      periodo_inicio: new Date().toISOString().split('T')[0],
      periodo_fim: new Date().toISOString().split('T')[0],
      destino: '',
      proposito: '',
      valor_diaria: '',
      quantidade_dias: '',
      observacoes: ''
    })

    setIsDiariasDialogOpen(false)
  }

  const getIcon = (codigo: string) => {
    const IconComponent = iconMap[codigo as keyof typeof iconMap] || iconMap.DEFAULT
    return IconComponent
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value)
  }

  const totalGastos = centrosCusto.reduce((acc, centro) => acc + (centro.total_gastos || 0), 0)
  const centrosAtivos = centrosCusto.filter(c => c.ativo).length
  const centrosPersonalizados = centrosCusto.filter(c => c.tipo === 'personalizado').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando centros de custo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Centro de Custos</h1>
          <p className="text-gray-600">Gestão e alocação de despesas por centro</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </Button>
          <Link href="/dashboard/centro-custos/diarias">
            <Button variant="outline" size="sm">
              <Plane className="w-4 h-4 mr-2" />
              Gerenciar Diárias
            </Button>
          </Link>
          <Button size="sm" onClick={handleCreateCentro}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Centro
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Gastos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalGastos)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Centros Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centrosAtivos}</div>
            <p className="text-xs text-muted-foreground">de {centrosCusto.length} total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personalizados</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{centrosPersonalizados}</div>
            <p className="text-xs text-muted-foreground">Criados pela equipe</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Gasto</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sede</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(125000)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome, código ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Centros de Custo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentros.map((centro) => {
          const IconComponent = getIcon(centro.codigo)
          
          return (
            <Card key={centro.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${centro.cor_hex}20`, color: centro.cor_hex }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{centro.nome}</CardTitle>
                      <p className="text-sm text-gray-500">{centro.codigo}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Badge variant={centro.tipo === 'predefinido' ? 'default' : 'secondary'}>
                      {centro.tipo === 'predefinido' ? 'Padrão' : 'Personalizado'}
                    </Badge>
                    {!centro.ativo && <Badge variant="destructive">Inativo</Badge>}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {centro.descricao && (
                  <p className="text-sm text-gray-600">{centro.descricao}</p>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Gastos</p>
                    <p className="font-semibold text-lg" style={{ color: centro.cor_hex }}>
                      {formatCurrency(centro.total_gastos || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Transações/Mês</p>
                    <p className="font-semibold text-lg text-gray-700">
                      {centro.transacoes_mes || 0}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    Criado em {centro.created_at ? new Date(centro.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDiariasClick(centro)}
                      title={centro.codigo === 'DIARIAS' ? 'Registrar Nova Diária' : 'Editar Centro'}
                    >
                      {centro.codigo === 'DIARIAS' ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                    </Button>
                    {centro.tipo === 'personalizado' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDeleteCentro(centro)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog para Criar/Editar Centro */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {editingCentro ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              <span>{editingCentro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingCentro 
                ? 'Modifique as informações do centro de custo.' 
                : 'Configure um novo centro de custo para organização financeira.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Nome */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right font-medium">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="col-span-3"
                placeholder="Ex: Projeto Especial"
                required
              />
            </div>

            {/* Código */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right font-medium">Código *</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '') 
                }))}
                className="col-span-3"
                placeholder="Ex: PROJ_ESP"
                required
              />
            </div>

            {/* Tipo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right font-medium">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: 'predefinido' | 'personalizado') => 
                  setFormData(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                  <SelectItem value="predefinido">Predefinido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cor */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cor" className="text-right font-medium">Cor</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Input
                  id="cor"
                  type="color"
                  value={formData.cor_hex}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_hex: e.target.value }))}
                  className="w-16 h-10 p-1 rounded"
                />
                <Input
                  value={formData.cor_hex}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_hex: e.target.value }))}
                  className="flex-1"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ativo" className="text-right font-medium">Ativo</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <span className="text-sm text-gray-600">
                  {formData.ativo ? 'Centro ativo' : 'Centro inativo'}
                </span>
              </div>
            </div>

            {/* Descrição */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="descricao" className="text-right font-medium pt-2">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                className="col-span-3"
                placeholder="Descrição detalhada do centro de custo..."
                rows={3}
              />
            </div>

            {/* Preview */}
            {(formData.nome || formData.codigo) && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right font-medium pt-2">Preview</Label>
                <div className="col-span-3">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${formData.cor_hex}20`, color: formData.cor_hex }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{formData.nome || 'Nome do Centro'}</p>
                      <p className="text-sm text-gray-500">{formData.codigo || 'CODIGO'}</p>
                    </div>
                    <Badge variant={formData.tipo === 'predefinido' ? 'default' : 'secondary'}>
                      {formData.tipo === 'predefinido' ? 'Padrão' : 'Personalizado'}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button 
              onClick={saveCentroCusto} 
              disabled={saving || !formData.nome || !formData.codigo}
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
                  {editingCentro ? 'Salvar' : 'Criar'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog específico para Diárias */}
      <Dialog open={isDiariasDialogOpen} onOpenChange={setIsDiariasDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plane className="w-5 h-5 text-amber-600" />
              <span>Registrar Nova Diária</span>
            </DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar uma nova diária para funcionário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Dados do Funcionário */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Dados do Funcionário
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="funcionario">Nome Completo *</Label>
                  <Input
                    id="funcionario"
                    value={diariasFormData.funcionario}
                    onChange={(e) => setDiariasFormData({...diariasFormData, funcionario: e.target.value})}
                    placeholder="Digite o nome do funcionário"
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={diariasFormData.cpf}
                    onChange={(e) => setDiariasFormData({...diariasFormData, cpf: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="cargo">Cargo/Função</Label>
                <Select 
                  value={diariasFormData.cargo} 
                  onValueChange={(value) => setDiariasFormData({...diariasFormData, cargo: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="motorista">Motorista</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="diretor">Diretor</SelectItem>
                    <SelectItem value="consultor">Consultor</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Período e Destino */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Período da Viagem
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodo_inicio">Data Início</Label>
                  <Input
                    id="periodo_inicio"
                    type="date"
                    value={diariasFormData.periodo_inicio}
                    onChange={(e) => setDiariasFormData({...diariasFormData, periodo_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="periodo_fim">Data Fim</Label>
                  <Input
                    id="periodo_fim"
                    type="date"
                    value={diariasFormData.periodo_fim}
                    onChange={(e) => setDiariasFormData({...diariasFormData, periodo_fim: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="destino">Destino</Label>
                <Input
                  id="destino"
                  value={diariasFormData.destino}
                  onChange={(e) => setDiariasFormData({...diariasFormData, destino: e.target.value})}
                  placeholder="Cidade/Estado de destino"
                />
              </div>
              <div>
                <Label htmlFor="proposito">Propósito da Viagem</Label>
                <Select 
                  value={diariasFormData.proposito} 
                  onValueChange={(value) => setDiariasFormData({...diariasFormData, proposito: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o propósito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="coleta">Coleta</SelectItem>
                    <SelectItem value="visita_cliente">Visita a Cliente</SelectItem>
                    <SelectItem value="treinamento">Treinamento</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="reuniao">Reunião</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Valores */}
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-sm text-gray-700 flex items-center">
                <DollarSign className="w-4 h-4 mr-2" />
                Valores da Diária
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="valor_diaria">Valor por Dia *</Label>
                  <Input
                    id="valor_diaria"
                    type="number"
                    step="0.01"
                    value={diariasFormData.valor_diaria}
                    onChange={(e) => setDiariasFormData({...diariasFormData, valor_diaria: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="quantidade_dias">Quantidade de Dias</Label>
                  <Input
                    id="quantidade_dias"
                    type="number"
                    value={diariasFormData.quantidade_dias}
                    onChange={(e) => setDiariasFormData({...diariasFormData, quantidade_dias: e.target.value})}
                    placeholder="1"
                  />
                </div>
              </div>
              {diariasFormData.valor_diaria && diariasFormData.quantidade_dias && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <strong>Valor Total: </strong>
                    {formatCurrency(parseFloat(diariasFormData.valor_diaria) * parseInt(diariasFormData.quantidade_dias))}
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={diariasFormData.observacoes}
                onChange={(e) => setDiariasFormData({...diariasFormData, observacoes: e.target.value})}
                placeholder="Observações adicionais sobre a diária..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDiariasDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveDiarias}>
                <Save className="w-4 h-4 mr-2" />
                Registrar Diária
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredCentros.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum centro de custo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os filtros de busca'
                : 'Crie seu primeiro centro de custo personalizado'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateCentro}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Centro de Custo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

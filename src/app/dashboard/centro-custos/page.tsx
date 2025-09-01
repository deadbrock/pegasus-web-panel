"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Target
} from 'lucide-react'

interface CentroCusto {
  id: number
  nome: string
  tipo: 'predefinido' | 'personalizado'
  codigo: string
  descricao?: string
  ativo: boolean
  cor_hex: string
  created_at: string
  total_gastos?: number
  transacoes_mes?: number
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

  // Dados simulados - substituir por chamadas à API
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

  useEffect(() => {
    // Simula carregamento
    setTimeout(() => {
      setCentrosCusto(centrosCustoSimulados)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCentros = centrosCusto.filter(centro =>
    centro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centro.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateCentro = () => {
    setEditingCentro(null)
    setIsDialogOpen(true)
  }

  const handleEditCentro = (centro: CentroCusto) => {
    setEditingCentro(centro)
    setIsDialogOpen(true)
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
                    Criado em {new Date(centro.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditCentro(centro)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {centro.tipo === 'personalizado' && (
                      <Button variant="ghost" size="sm" className="text-red-600">
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCentro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">Nome</Label>
              <Input
                id="nome"
                defaultValue={editingCentro?.nome || ''}
                className="col-span-3"
                placeholder="Ex: Projeto Especial"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">Código</Label>
              <Input
                id="codigo"
                defaultValue={editingCentro?.codigo || ''}
                className="col-span-3"
                placeholder="Ex: PROJ_ESP"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cor" className="text-right">Cor</Label>
              <Input
                id="cor"
                type="color"
                defaultValue={editingCentro?.cor_hex || '#3B82F6'}
                className="col-span-3 h-10"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">Descrição</Label>
              <Textarea
                id="descricao"
                defaultValue={editingCentro?.descricao || ''}
                className="col-span-3"
                placeholder="Descrição do centro de custo..."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsDialogOpen(false)}>
              {editingCentro ? 'Salvar' : 'Criar'}
            </Button>
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

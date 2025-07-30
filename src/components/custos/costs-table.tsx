'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, Edit, Trash2, Calendar, User, Truck } from 'lucide-react'

interface CostsTableProps {
  onEdit: (cost: any) => void
}

// Mock data para custos
const costsData = [
  {
    id: 1,
    data: '2024-01-15',
    categoria: 'Combustível',
    descricao: 'Abastecimento - Posto Shell BR-101',
    valor: 450.80,
    veiculo: 'BRA-2023',
    responsavel: 'Carlos Lima',
    observacoes: 'Tanque cheio',
    status: 'Pago'
  },
  {
    id: 2,
    data: '2024-01-14',
    categoria: 'Manutenção',
    descricao: 'Troca de óleo e filtro - Oficina Central',
    valor: 280.50,
    veiculo: 'BRA-2024',
    responsavel: 'Ana Oliveira',
    observacoes: 'Manutenção preventiva',
    status: 'Pendente'
  },
  {
    id: 3,
    data: '2024-01-14',
    categoria: 'Pedágio',
    descricao: 'Pedagio São Paulo - Santos (ida/volta)',
    valor: 45.20,
    veiculo: 'BRA-2025',
    responsavel: 'João Silva',
    observacoes: '',
    status: 'Pago'
  },
  {
    id: 4,
    data: '2024-01-13',
    categoria: 'Multas',
    descricao: 'Multa por excesso de velocidade',
    valor: 195.23,
    veiculo: 'BRA-2026',
    responsavel: 'Maria Santos',
    observacoes: 'Velocidade 80km/h em zona 60km/h',
    status: 'Vencido'
  },
  {
    id: 5,
    data: '2024-01-13',
    categoria: 'Seguro',
    descricao: 'Parcela mensal seguro frota',
    valor: 1250.00,
    veiculo: '',
    responsavel: 'Pedro Costa',
    observacoes: 'Cobertura completa',
    status: 'Pago'
  },
  {
    id: 6,
    data: '2024-01-12',
    categoria: 'Combustível',
    descricao: 'Abastecimento - Posto Ipiranga',
    valor: 380.45,
    veiculo: 'BRA-2027',
    responsavel: 'Luis Fernando',
    observacoes: '',
    status: 'Pago'
  },
  {
    id: 7,
    data: '2024-01-12',
    categoria: 'Manutenção',
    descricao: 'Substituição de pneus traseiros',
    valor: 890.00,
    veiculo: 'BRA-2023',
    responsavel: 'Carlos Lima',
    observacoes: 'Pneus Michelin 275/80R22.5',
    status: 'Pendente'
  },
  {
    id: 8,
    data: '2024-01-11',
    categoria: 'Documentação',
    descricao: 'Renovação CRLV e licenciamento',
    valor: 320.75,
    veiculo: 'BRA-2024',
    responsavel: 'Ana Oliveira',
    observacoes: 'Documentação 2024',
    status: 'Pago'
  },
  {
    id: 9,
    data: '2024-01-11',
    categoria: 'Outros',
    descricao: 'Lavagem e enceramento da frota',
    valor: 120.00,
    veiculo: '',
    responsavel: 'Equipe Limpeza',
    observacoes: 'Serviço mensal',
    status: 'Pago'
  },
  {
    id: 10,
    data: '2024-01-10',
    categoria: 'Estacionamento',
    descricao: 'Estacionamento Shopping Center',
    valor: 25.00,
    veiculo: 'BRA-2025',
    responsavel: 'João Silva',
    observacoes: 'Entrega no shopping',
    status: 'Pago'
  }
]

export function CostsTable({ onEdit }: CostsTableProps) {
  const getCategoryBadge = (categoria: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Combustível': { variant: 'default', color: 'bg-orange-500' },
      'Manutenção': { variant: 'default', color: 'bg-blue-500' },
      'Pedágio': { variant: 'default', color: 'bg-purple-500' },
      'Seguro': { variant: 'default', color: 'bg-green-500' },
      'Documentação': { variant: 'default', color: 'bg-cyan-500' },
      'Multas': { variant: 'destructive', color: 'bg-red-500' },
      'Estacionamento': { variant: 'outline', color: 'bg-gray-500' },
      'Outros': { variant: 'secondary', color: 'bg-gray-500' }
    }

    return (
      <Badge 
        variant={variants[categoria]?.variant || 'secondary'}
        className={variants[categoria]?.color}
      >
        {categoria}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Pago': { variant: 'default', color: 'bg-green-500' },
      'Pendente': { variant: 'default', color: 'bg-yellow-500' },
      'Vencido': { variant: 'destructive', color: 'bg-red-500' }
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleEdit = (cost: any) => {
    onEdit(cost)
  }

  const handleDelete = (costId: number) => {
    // Aqui seria feita a integração para deletar o custo
    console.log('Deletando custo:', costId)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {costsData.map((cost) => (
            <TableRow key={cost.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{formatDate(cost.data)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {getCategoryBadge(cost.categoria)}
              </TableCell>
              
              <TableCell>
                <div>
                  <p className="font-medium">{cost.descricao}</p>
                  {cost.observacoes && (
                    <p className="text-sm text-gray-500 mt-1">{cost.observacoes}</p>
                  )}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">
                    {formatCurrency(cost.valor)}
                  </span>
                </div>
              </TableCell>
              
              <TableCell>
                {cost.veiculo ? (
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{cost.veiculo}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{cost.responsavel}</span>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(cost.status)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cost)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cost.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
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
              Total de registros: {costsData.length}
            </span>
            <span className="text-green-600 font-medium">
              Total gasto: {formatCurrency(costsData.reduce((sum, cost) => sum + cost.valor, 0))}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-green-600">
              Pagos: {costsData.filter(c => c.status === 'Pago').length}
            </span>
            <span className="text-yellow-600">
              Pendentes: {costsData.filter(c => c.status === 'Pendente').length}
            </span>
            <span className="text-red-600">
              Vencidos: {costsData.filter(c => c.status === 'Vencido').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
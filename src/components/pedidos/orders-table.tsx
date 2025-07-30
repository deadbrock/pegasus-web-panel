'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Package, MapPin, Calendar, DollarSign, User, Truck } from 'lucide-react'

// Mock data - substituir por dados do Supabase
const ordersData = [
  {
    id: 1,
    numero: 'P-001234',
    cliente: 'João Silva',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    telefone: '(11) 98765-4321',
    dataPedido: '2024-01-15',
    dataEntrega: '2024-01-18',
    status: 'Em Separação',
    motorista: '',
    veiculo: '',
    valorTotal: 245.90,
    formaPagamento: 'PIX',
    itens: 5,
    observacoes: 'Entrega no período da manhã'
  },
  {
    id: 2,
    numero: 'P-001235',
    cliente: 'Maria Santos',
    endereco: 'Av. Paulista, 456 - São Paulo/SP',
    telefone: '(11) 98765-4322',
    dataPedido: '2024-01-14',
    dataEntrega: '2024-01-17',
    status: 'Em Rota',
    motorista: 'Carlos Lima',
    veiculo: 'BRA-2023',
    valorTotal: 189.50,
    formaPagamento: 'Cartão',
    itens: 3,
    observacoes: ''
  },
  {
    id: 3,
    numero: 'P-001236',
    cliente: 'Pedro Costa',
    endereco: 'Rua Santos Dumont, 789 - Rio de Janeiro/RJ',
    telefone: '(21) 98765-4323',
    dataPedido: '2024-01-13',
    dataEntrega: '2024-01-16',
    status: 'Entregue',
    motorista: 'Ana Oliveira',
    veiculo: 'BRA-2024',
    valorTotal: 320.75,
    formaPagamento: 'Dinheiro',
    itens: 8,
    observacoes: ''
  },
  {
    id: 4,
    numero: 'P-001237',
    cliente: 'Ana Souza',
    endereco: 'Rua da Liberdade, 321 - Belo Horizonte/MG',
    telefone: '(31) 98765-4324',
    dataPedido: '2024-01-12',
    dataEntrega: '2024-01-15',
    status: 'Atrasado',
    motorista: 'João Silva',
    veiculo: 'BRA-2025',
    valorTotal: 156.30,
    formaPagamento: 'Cartão',
    itens: 4,
    observacoes: 'Cliente solicitou reagendamento'
  },
  {
    id: 5,
    numero: 'P-001238',
    cliente: 'Roberto Lima',
    endereco: 'Av. Atlântica, 654 - Salvador/BA',
    telefone: '(71) 98765-4325',
    dataPedido: '2024-01-16',
    dataEntrega: '2024-01-19',
    status: 'Pendente',
    motorista: '',
    veiculo: '',
    valorTotal: 478.20,
    formaPagamento: 'PIX',
    itens: 12,
    observacoes: 'Aguardando confirmação do cliente'
  },
  {
    id: 6,
    numero: 'P-001239',
    cliente: 'Carla Ferreira',
    endereco: 'Rua 7 de Setembro, 987 - Curitiba/PR',
    telefone: '(41) 98765-4326',
    dataPedido: '2024-01-11',
    dataEntrega: '2024-01-14',
    status: 'Cancelado',
    motorista: '',
    veiculo: '',
    valorTotal: 89.90,
    formaPagamento: 'PIX',
    itens: 2,
    observacoes: 'Cancelado pelo cliente'
  }
]

interface OrdersTableProps {
  onEdit: (order: any) => void
}

export function OrdersTable({ onEdit }: OrdersTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      'Pendente': { variant: 'secondary', color: 'bg-gray-500' },
      'Em Separação': { variant: 'default', color: 'bg-blue-500' },
      'Em Rota': { variant: 'default', color: 'bg-yellow-500' },
      'Entregue': { variant: 'default', color: 'bg-green-500' },
      'Atrasado': { variant: 'destructive', color: 'bg-red-500' },
      'Cancelado': { variant: 'outline', color: 'bg-gray-500' }
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

  const getPaymentBadge = (formaPagamento: string) => {
    const colors: Record<string, string> = {
      'PIX': 'bg-green-100 text-green-800',
      'Cartão': 'bg-blue-100 text-blue-800',
      'Dinheiro': 'bg-yellow-100 text-yellow-800',
      'Boleto': 'bg-purple-100 text-purple-800'
    }

    return (
      <Badge variant="outline" className={colors[formaPagamento] || 'bg-gray-100 text-gray-800'}>
        {formaPagamento}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const isDeliveryLate = (status: string, dataEntrega: string) => {
    if (status === 'Entregue' || status === 'Cancelado') return false
    const hoje = new Date()
    const entrega = new Date(dataEntrega)
    return entrega < hoje
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Data Entrega</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordersData.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">{order.numero}</p>
                    <p className="text-sm text-gray-500">{order.itens} itens</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.cliente}</p>
                  <p className="text-sm text-gray-500">{order.telefone}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-start gap-2 max-w-[200px]">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm truncate">{order.endereco}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className={`text-sm font-medium ${
                      isDeliveryLate(order.status, order.dataEntrega) && order.status !== 'Cancelado' 
                        ? 'text-red-600' 
                        : 'text-gray-900'
                    }`}>
                      {formatDate(order.dataEntrega)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Pedido: {formatDate(order.dataPedido)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                {order.motorista ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{order.motorista}</p>
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-500">{order.veiculo}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Não atribuído</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="font-medium">{formatCurrency(order.valorTotal)}</span>
                </div>
              </TableCell>
              <TableCell>
                {getPaymentBadge(order.formaPagamento)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(order)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
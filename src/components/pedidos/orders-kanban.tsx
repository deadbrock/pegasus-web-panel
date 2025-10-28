'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Truck, CheckCircle, AlertTriangle, Package, User, MapPin, DollarSign, Edit } from 'lucide-react'
import { updateOrder } from '@/services/ordersService'
import { useToast } from '@/hooks/use-toast'
// TODO: integrar com Supabase para ler colunas dinamicamente

interface OrdersKanbanProps {
  onEdit: (order: any) => void
  data?: any[]
}

const kanbanData = {
  'Pendente': [
    {
      id: 'P-001238',
      cliente: 'Roberto Lima',
      endereco: 'Salvador/BA',
      valor: 478.20,
      itens: 12,
      prioridade: 'Alta'
    },
    {
      id: 'P-001240',
      cliente: 'Lucia Costa',
      endereco: 'Fortaleza/CE',
      valor: 234.50,
      itens: 6,
      prioridade: 'Normal'
    }
  ],
  'Em Separação': [
    {
      id: 'P-001234',
      cliente: 'João Silva',
      endereco: 'São Paulo/SP',
      valor: 245.90,
      itens: 5,
      prioridade: 'Normal'
    },
    {
      id: 'P-001241',
      cliente: 'Marina Souza',
      endereco: 'Curitiba/PR',
      valor: 189.30,
      itens: 8,
      prioridade: 'Baixa'
    },
    {
      id: 'P-001242',
      cliente: 'Felipe Santos',
      endereco: 'Porto Alegre/RS',
      valor: 345.80,
      itens: 10,
      prioridade: 'Alta'
    }
  ],
  'Em Rota': [
    {
      id: 'P-001235',
      cliente: 'Maria Santos',
      endereco: 'São Paulo/SP',
      valor: 189.50,
      itens: 3,
      motorista: 'Carlos Lima',
      prioridade: 'Normal'
    },
    {
      id: 'P-001243',
      cliente: 'André Lima',
      endereco: 'Rio de Janeiro/RJ',
      valor: 567.20,
      itens: 15,
      motorista: 'Ana Oliveira',
      prioridade: 'Alta'
    }
  ],
  'Atrasado': [
    {
      id: 'P-001237',
      cliente: 'Ana Souza',
      endereco: 'Belo Horizonte/MG',
      valor: 156.30,
      itens: 4,
      motorista: 'João Silva',
      diasAtraso: 2,
      prioridade: 'Crítica'
    }
  ]
}

export function OrdersKanban({ onEdit, data }: OrdersKanbanProps) {
  const { toast } = useToast()
  const grouped = (data || []).reduce((acc: Record<string, any[]>, o) => {
    const key = o.status || 'Pendente'
    acc[key] = acc[key] || []
    acc[key].push({
      id: o.numero || o.id,
      cliente: o.cliente,
      endereco: o.cidade ? `${o.cidade}/${o.estado || ''}` : o.endereco,
      valor: o.valor_total ?? o.valorTotal ?? 0,
      itens: o.itens?.length || o.itens || 0,
      prioridade: 'Normal',
      motorista: o.motorista,
      diasAtraso: o.diasAtraso,
    })
    return acc
  }, {} as Record<string, any[]>)
  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="w-5 h-5 text-gray-600" />
      case 'Em Separação':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'Em Rota':
        return <Truck className="w-5 h-5 text-yellow-600" />
      case 'Atrasado':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />
    }
  }

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'border-t-gray-500'
      case 'Em Separação':
        return 'border-t-blue-500'
      case 'Em Rota':
        return 'border-t-yellow-500'
      case 'Atrasado':
        return 'border-t-red-500'
      default:
        return 'border-t-green-500'
    }
  }

  const getPriorityBadge = (prioridade: string) => {
    const variants: Record<string, { color: string, text: string }> = {
      'Crítica': { color: 'bg-red-100 text-red-800', text: 'Crítica' },
      'Alta': { color: 'bg-orange-100 text-orange-800', text: 'Alta' },
      'Normal': { color: 'bg-blue-100 text-blue-800', text: 'Normal' },
      'Baixa': { color: 'bg-gray-100 text-gray-800', text: 'Baixa' }
    }

    return (
      <Badge variant="outline" className={variants[prioridade]?.color}>
        {variants[prioridade]?.text}
      </Badge>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const statuses = ['Pendente','Em Separação','Em Rota','Atrasado','Entregue']

  const handleMove = async (orderId: any, newStatus: string) => {
    const ok = await updateOrder(String(orderId), { status: newStatus as any })
    toast({ title: ok ? 'Status atualizado' : 'Falha ao atualizar', description: `${orderId} → ${newStatus}` })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
      {statuses.map((status) => {
        const orders = grouped[status] || []
        return (
        <div key={status} className="space-y-4">
          {/* Column Header */}
          <Card className={`border-t-4 ${getColumnColor(status)}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {getColumnIcon(status)}
                  <span>{status}</span>
                </div>
                <Badge variant="secondary">{orders.length}</Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Order Cards */}
          <div className="space-y-3">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-semibold text-gray-900">{order.id}</span>
                      {getPriorityBadge(order.prioridade)}
                    </div>

                    {/* Cliente */}
                    {order.cliente && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 line-clamp-2">{order.cliente}</span>
                      </div>
                    )}

                    {/* Endereço */}
                    {order.endereco && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600 line-clamp-1">{order.endereco}</span>
                      </div>
                    )}

                    {/* Valor e Itens */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">{formatCurrency(order.valor)}</span>
                      </div>
                      {order.itens > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {order.itens} {order.itens === 1 ? 'item' : 'itens'}
                        </span>
                      )}
                    </div>

                    {/* Motorista (se houver) */}
                    {(order as any).motorista && (
                      <div className="flex items-center gap-2 bg-blue-50 p-2 rounded">
                        <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-700 font-medium truncate">{(order as any).motorista}</span>
                      </div>
                    )}

                    {/* Dias de atraso (se houver) */}
                    {(order as any).diasAtraso && (
                      <div className="flex items-center gap-2 bg-red-50 p-2 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-xs font-semibold text-red-700">
                          {(order as any).diasAtraso} {(order as any).diasAtraso === 1 ? 'dia' : 'dias'} de atraso
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onEdit(order)}
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum pedido</p>
              </div>
            )}
          </div>
        </div>
      )})}
    </div>
  )
}
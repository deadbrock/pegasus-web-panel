'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Truck, CheckCircle, AlertTriangle, Package, User, MapPin, DollarSign, Edit, Download, Printer } from 'lucide-react'
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
    
    // Calcular total de itens de forma segura
    let totalItens = 0
    if (Array.isArray(o.itens)) {
      totalItens = o.itens.length
    } else if (typeof o.itens === 'number') {
      totalItens = o.itens
    }
    
    acc[key].push({
      id: o.numero || o.id,
      cliente: o.cliente || 'Cliente não informado',
      endereco: o.cidade ? `${o.cidade}/${o.estado || ''}` : (o.endereco || 'Endereço não informado'),
      valor: o.valor_total ?? o.valorTotal ?? 0,
      itens: totalItens,
      prioridade: o.prioridade || 'Normal',
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

  const handleBaixarPedido = (order: any) => {
    // Abrir janela de impressão para salvar como PDF
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir janela. Verifique se pop-ups estão bloqueados.',
        variant: 'destructive'
      })
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Pedido ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
            }
            .pedido-numero {
              font-size: 22px;
              font-weight: bold;
              margin: 10px 0;
              color: #1f2937;
            }
            .data-emissao {
              font-size: 12px;
              color: #6b7280;
            }
            .section {
              margin: 25px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 15px;
              font-size: 16px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-row {
              display: flex;
              padding: 10px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: 600;
              width: 180px;
              color: #4b5563;
            }
            .info-value {
              flex: 1;
              color: #1f2937;
              font-weight: 500;
            }
            .valor-total {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              text-align: right;
              margin-top: 30px;
              padding: 20px;
              background: #f0fdf4;
              border-radius: 8px;
              border: 2px solid #10b981;
            }
            .footer {
              text-align: center;
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              color: #9ca3af;
              font-size: 11px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              background: #eff6ff;
              color: #3b82f6;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
            @page {
              margin: 20mm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🚚 SISTEMA PEGASUS</div>
            <div class="pedido-numero">PEDIDO Nº ${order.id}</div>
            <div class="data-emissao">Emitido em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</div>
          </div>
          
          <div class="section">
            <div class="section-title">📋 Dados do Cliente</div>
            <div class="info-row">
              <div class="info-label">Nome do Cliente:</div>
              <div class="info-value">${order.cliente}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Endereço de Entrega:</div>
              <div class="info-value">${order.endereco}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📦 Informações do Pedido</div>
            <div class="info-row">
              <div class="info-label">Prioridade:</div>
              <div class="info-value"><span class="badge">${order.prioridade}</span></div>
            </div>
            <div class="info-row">
              <div class="info-label">Quantidade de Itens:</div>
              <div class="info-value">${order.itens} ${order.itens === 1 ? 'item' : 'itens'}</div>
            </div>
            ${order.motorista ? `
            <div class="info-row">
              <div class="info-label">Motorista Responsável:</div>
              <div class="info-value">${order.motorista}</div>
            </div>
            ` : ''}
          </div>

          <div class="valor-total">
            VALOR TOTAL: ${formatCurrency(order.valor)}
          </div>

          <div class="footer">
            Documento gerado automaticamente pelo Sistema Pegasus<br>
            ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - ${new Date().toLocaleTimeString('pt-BR')}<br>
            www.sistempegasus.com.br
          </div>

          <div class="no-print" style="position: fixed; bottom: 20px; right: 20px; background: white; padding: 10px; border: 1px solid #ccc; border-radius: 8px;">
            <p style="margin-bottom: 10px; font-size: 14px;">Para salvar como PDF:</p>
            <p style="font-size: 12px; color: #666;">1. Clique em Ctrl+P</p>
            <p style="font-size: 12px; color: #666;">2. Escolha "Salvar como PDF"</p>
            <p style="font-size: 12px; color: #666;">3. Salve o arquivo</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => window.print(), 100);
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()

    toast({
      title: 'Pedido pronto para impressão!',
      description: 'Use Ctrl+P e escolha "Salvar como PDF" para baixar'
    })
  }

  const handleImprimirPedido = (order: any) => {
    // Criar HTML para impressão
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Não foi possível abrir janela de impressão',
        variant: 'destructive'
      })
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Pedido ${order.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #3b82f6;
            }
            .pedido-numero {
              font-size: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .section {
              margin: 20px 0;
            }
            .section-title {
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .info-row {
              display: flex;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .info-label {
              font-weight: 600;
              width: 150px;
              color: #666;
            }
            .info-value {
              flex: 1;
              color: #333;
            }
            .valor-total {
              font-size: 24px;
              font-weight: bold;
              color: #10b981;
              text-align: right;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 2px solid #3b82f6;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #999;
              font-size: 12px;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🚚 SISTEMA PEGASUS</div>
            <div class="pedido-numero">PEDIDO ${order.id}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Dados do Cliente</div>
            <div class="info-row">
              <div class="info-label">Cliente:</div>
              <div class="info-value">${order.cliente}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Endereço:</div>
              <div class="info-value">${order.endereco}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Informações do Pedido</div>
            <div class="info-row">
              <div class="info-label">Prioridade:</div>
              <div class="info-value">${order.prioridade}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Quantidade de Itens:</div>
              <div class="info-value">${order.itens} ${order.itens === 1 ? 'item' : 'itens'}</div>
            </div>
            ${order.motorista ? `
            <div class="info-row">
              <div class="info-label">Motorista:</div>
              <div class="info-value">${order.motorista}</div>
            </div>
            ` : ''}
          </div>

          <div class="valor-total">
            VALOR TOTAL: ${formatCurrency(order.valor)}
          </div>

          <div class="footer">
            Impresso em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}<br>
            Sistema Pegasus - Gestão Logística
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
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
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onEdit(order)}
                      >
                        <Edit className="w-3 h-3 mr-2" />
                        Editar
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleBaixarPedido(order)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Baixar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleImprimirPedido(order)}
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Imprimir
                        </Button>
                      </div>
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
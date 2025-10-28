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
      formaPagamento: o.forma_pagamento || o.formaPagamento || '',
    })
    return acc
  }, {} as Record<string, any[]>)
  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'Pendente':
        return <Clock className="w-5 h-5 text-gray-600" />
      case 'Aprovado':
        return <CheckCircle className="w-5 h-5 text-indigo-600" />
      case 'Em Separação':
        return <Package className="w-5 h-5 text-blue-600" />
      case 'Saiu para Entrega':
        return <Truck className="w-5 h-5 text-yellow-600" />
      case 'Entregue':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'Cancelado':
      case 'Rejeitado':
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getColumnColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'border-t-gray-500'
      case 'Aprovado':
        return 'border-t-indigo-500'
      case 'Em Separação':
        return 'border-t-blue-500'
      case 'Saiu para Entrega':
        return 'border-t-yellow-500'
      case 'Entregue':
        return 'border-t-green-500'
      case 'Cancelado':
      case 'Rejeitado':
        return 'border-t-red-500'
      default:
        return 'border-t-gray-500'
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

  const statuses = ['Pendente', 'Aprovado', 'Em Separação', 'Saiu para Entrega', 'Entregue', 'Cancelado', 'Rejeitado']

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
              padding: 20px;
              color: #333;
              background: white;
              font-size: 11px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .logo {
              font-size: 18px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 5px;
            }
            .pedido-numero {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
              color: #1f2937;
            }
            .data-emissao {
              font-size: 9px;
              color: #6b7280;
            }
            .section {
              margin: 12px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 8px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .info-row {
              display: flex;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: 600;
              width: 140px;
              color: #4b5563;
              font-size: 10px;
            }
            .info-value {
              flex: 1;
              color: #1f2937;
              font-weight: 500;
              font-size: 10px;
            }
            .valor-total {
              font-size: 18px;
              font-weight: bold;
              color: #10b981;
              text-align: center;
              margin-top: 15px;
              padding: 12px;
              background: #f0fdf4;
              border-radius: 6px;
              border: 2px solid #10b981;
            }
            .assinaturas-section {
              margin-top: 20px;
              page-break-inside: avoid;
            }
            .assinaturas-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin-top: 30px;
            }
            .assinatura-campo {
              text-align: center;
            }
            .assinatura-linha {
              border-top: 1.5px solid #1f2937;
              margin-bottom: 5px;
              padding-top: 0;
            }
            .assinatura-label {
              font-weight: 600;
              color: #4b5563;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .data-entrega-campo {
              margin-top: 15px;
              padding: 10px;
              background: #f9fafb;
              border: 1.5px dashed #d1d5db;
              border-radius: 6px;
            }
            .data-entrega-label {
              font-weight: 700;
              color: #1f2937;
              font-size: 11px;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .data-entrega-linha {
              border-bottom: 1.5px solid #1f2937;
              height: 30px;
              width: 250px;
              margin: 0 auto;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 8px;
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
              <div class="info-label">Cliente:</div>
              <div class="info-value">${order.cliente}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Endereço:</div>
              <div class="info-value">${order.endereco}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📦 Informações do Pedido</div>
            <div class="info-row">
              <div class="info-label">Prioridade:</div>
              <div class="info-value">${order.prioridade}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Itens:</div>
              <div class="info-value">${order.itens} ${order.itens === 1 ? 'item' : 'itens'}</div>
            </div>
            ${order.motorista ? `
            <div class="info-row">
              <div class="info-label">Motorista:</div>
              <div class="info-value">${order.motorista}</div>
            </div>
            ` : ''}
          </div>

          ${order.formaPagamento === 'Material de Consumo' ? `
          <div class="valor-total" style="background: #fef3c7; border-color: #f59e0b; color: #92400e;">
            FORMA DE PAGAMENTO: MATERIAL DE CONSUMO
          </div>
          ` : `
          <div class="valor-total">
            VALOR TOTAL: ${formatCurrency(order.valor)}
          </div>
          `}

          <div class="data-entrega-campo">
            <div class="data-entrega-label">📅 Data de Entrega</div>
            <div class="data-entrega-linha"></div>
          </div>

          <div class="assinaturas-section">
            <div class="section-title">✍️ Assinaturas e Confirmações</div>
            <div class="assinaturas-grid">
              <div class="assinatura-campo">
                <div class="assinatura-linha"></div>
                <div class="assinatura-label">Logística</div>
              </div>
              <div class="assinatura-campo">
                <div class="assinatura-linha"></div>
                <div class="assinatura-label">Motorista</div>
              </div>
              <div class="assinatura-campo">
                <div class="assinatura-linha"></div>
                <div class="assinatura-label">Solicitante</div>
              </div>
            </div>
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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              font-size: 11px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .logo {
              font-size: 18px;
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 5px;
            }
            .pedido-numero {
              font-size: 16px;
              font-weight: bold;
              margin: 5px 0;
            }
            .section {
              margin: 12px 0;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: bold;
              color: #3b82f6;
              margin-bottom: 8px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .info-row {
              display: flex;
              padding: 5px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            .info-label {
              font-weight: 600;
              width: 140px;
              color: #4b5563;
              font-size: 10px;
            }
            .info-value {
              flex: 1;
              color: #1f2937;
              font-size: 10px;
            }
            .valor-total {
              font-size: 18px;
              font-weight: bold;
              color: #10b981;
              text-align: center;
              margin-top: 15px;
              padding: 12px;
              background: #f0fdf4;
              border-radius: 6px;
              border: 2px solid #10b981;
            }
            .assinaturas-section {
              margin-top: 20px;
              page-break-inside: avoid;
            }
            .assinaturas-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 20px;
              margin-top: 30px;
            }
            .assinatura-campo {
              text-align: center;
            }
            .assinatura-linha {
              border-top: 1.5px solid #1f2937;
              margin-bottom: 5px;
              padding-top: 0;
            }
            .assinatura-label {
              font-weight: 600;
              color: #4b5563;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .data-entrega-campo {
              margin-top: 15px;
              padding: 10px;
              background: #f9fafb;
              border: 1.5px dashed #d1d5db;
              border-radius: 6px;
            }
            .data-entrega-label {
              font-weight: 700;
              color: #1f2937;
              font-size: 11px;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .data-entrega-linha {
              border-bottom: 1.5px solid #1f2937;
              height: 30px;
              width: 250px;
              margin: 0 auto;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px solid #e5e7eb;
              color: #9ca3af;
              font-size: 8px;
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
              <div class="info-label">Itens:</div>
              <div class="info-value">${order.itens} ${order.itens === 1 ? 'item' : 'itens'}</div>
            </div>
            ${order.motorista ? `
            <div class="info-row">
              <div class="info-label">Motorista:</div>
              <div class="info-value">${order.motorista}</div>
            </div>
            ` : ''}
          </div>

          ${order.formaPagamento === 'Material de Consumo' ? `
          <div class="valor-total" style="background: #fef3c7; border-color: #f59e0b; color: #92400e;">
            FORMA DE PAGAMENTO: MATERIAL DE CONSUMO
          </div>
          ` : `
          <div class="valor-total">
            VALOR TOTAL: ${formatCurrency(order.valor)}
          </div>
          `}

          <div class="data-entrega-campo">
            <div class="data-entrega-label">📅 Data de Entrega</div>
            <div class="data-entrega-linha"></div>
          </div>

          <div class="assinaturas-section">
            <div class="section-title">✍️ Assinaturas e Confirmações</div>
            <div class="assinaturas-grid">
              <div class="assinatura-campo">
                <div class="assinatura-linha"></div>
                <div class="assinatura-label">Logística</div>
              </div>
              <div class="assinatura-campo">
                <div class="assinatura-linha"></div>
                <div class="assinatura-label">Motorista</div>
              </div>
              <div class="assinatura-campo">
                <div class="assinatura-linha"></div>
                <div class="assinatura-label">Solicitante</div>
              </div>
            </div>
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
                      {(order as any).formaPagamento === 'Material de Consumo' ? (
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-700">Material de Consumo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-semibold text-green-700">{formatCurrency(order.valor)}</span>
                        </div>
                      )}
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
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {  X, Package, User, Calendar, AlertCircle, CheckCircle, Clock, Truck, MapPin, Building2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { PedidoMobile, aprovarAutorizacaoPedido, updatePedidoMobileStatus } from '@/services/pedidosMobileService'
import { useToast } from '@/hooks/use-toast'

interface MobileOrderViewDialogProps {
  open: boolean
  onClose: () => void
  order: PedidoMobile | null
}

const statusConfig = {
  'Pendente': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock },
  'Aprovado': { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: CheckCircle },
  'Em Separação': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
  'Saiu para Entrega': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Truck },
  'Entregue': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  'Cancelado': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
  'Rejeitado': { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
}

const urgenciaConfig = {
  'Baixa': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Média': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Alta': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Urgente': { bg: 'bg-red-100', text: 'text-red-800' },
}

export function MobileOrderViewDialog({ open, onClose, order }: MobileOrderViewDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  if (!order) return null

  const statusInfo = statusConfig[order.status] || statusConfig['Pendente']
  const urgenciaInfo = urgenciaConfig[order.urgencia] || urgenciaConfig['Média']
  const StatusIcon = statusInfo.icon

  const handleAprovar = async () => {
    setLoading(true)
    try {
      const success = await aprovarAutorizacaoPedido(order.id, true, 'Admin')
      
      if (success) {
        toast({
          title: '✅ Pedido Aprovado!',
          description: `O pedido ${order.numero_pedido} foi aprovado com sucesso.`
        })
        onClose()
        // Recarregar a página para atualizar a lista
        window.location.reload()
      } else {
        toast({
          title: '❌ Erro',
          description: 'Não foi possível aprovar o pedido. Tente novamente.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error)
      toast({
        title: '❌ Erro',
        description: 'Ocorreu um erro ao aprovar o pedido.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRejeitar = async () => {
    const motivo = prompt('Informe o motivo da rejeição:')
    if (!motivo) return

    setLoading(true)
    try {
      const success = await aprovarAutorizacaoPedido(order.id, false, `Admin - Motivo: ${motivo}`)
      
      if (success) {
        toast({
          title: '❌ Pedido Rejeitado',
          description: `O pedido ${order.numero_pedido} foi rejeitado.`
        })
        onClose()
        // Recarregar a página para atualizar a lista
        window.location.reload()
      } else {
        toast({
          title: '❌ Erro',
          description: 'Não foi possível rejeitar o pedido. Tente novamente.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao rejeitar pedido:', error)
      toast({
        title: '❌ Erro',
        description: 'Ocorreu um erro ao rejeitar o pedido.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleIniciarSeparacao = async () => {
    setLoading(true)
    try {
      const success = await updatePedidoMobileStatus(order.id, 'Em Separação')
      
      if (success) {
        toast({
          title: '📦 Separação Iniciada!',
          description: `O pedido ${order.numero_pedido} está em separação.`
        })
        onClose()
        // Recarregar a página para atualizar a lista
        window.location.reload()
      } else {
        toast({
          title: '❌ Erro',
          description: 'Não foi possível iniciar a separação. Tente novamente.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao iniciar separação:', error)
      toast({
        title: '❌ Erro',
        description: 'Ocorreu um erro ao iniciar a separação.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Pedido {order.numero_pedido}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">Pedido do Aplicativo Mobile</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status e Urgência */}
          <div className="flex gap-3">
            <Badge className={`${statusInfo.bg} ${statusInfo.text} flex items-center gap-2 px-3 py-1`}>
              <StatusIcon className="w-4 h-4" />
              {order.status}
            </Badge>
            <Badge className={`${urgenciaInfo.bg} ${urgenciaInfo.text} px-3 py-1`}>
              Urgência: {order.urgencia}
            </Badge>
            {order.requer_autorizacao && (
              <Badge className="bg-orange-100 text-orange-800 px-3 py-1">
                ⚠️ Requer Autorização
              </Badge>
            )}
          </div>

          {/* Informações do Supervisor */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Solicitante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">{order.supervisor_nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.supervisor_email}</p>
              </div>
            </div>
          </div>

          {/* Informações do Contrato/Cliente */}
          {order.contrato_nome && (
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                Cliente/Contrato de Destino
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Cliente/Obra</p>
                  <p className="font-semibold text-lg text-green-900">{order.contrato_nome}</p>
                </div>
                {order.contrato_endereco && (
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Endereço de Entrega
                    </p>
                    <p className="font-medium text-gray-800">{order.contrato_endereco}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Itens do Pedido */}
          <div className="bg-white rounded-lg border">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos Solicitados ({order.itens?.length || 0} {order.itens?.length === 1 ? 'item' : 'itens'})
              </h3>
            </div>
            <div className="p-4">
              {order.itens && order.itens.length > 0 ? (
                <div className="space-y-3">
                  {order.itens.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <p className="font-medium text-gray-900">{item.produto_nome}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Código: {item.produto_codigo}</p>
                        {item.observacoes && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            Obs: {item.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{item.quantidade} {item.unidade}</p>
                        <p className="text-xs text-gray-500">Quantidade</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhum item encontrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          {order.observacoes && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{order.observacoes}</p>
            </div>
          )}

          {/* Autorização */}
          {order.requer_autorizacao && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Informações de Autorização
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Status da Autorização</p>
                  <p className="font-medium">
                    {order.autorizacao_status === 'Aprovada' && '✅ Aprovada'}
                    {order.autorizacao_status === 'Rejeitada' && '❌ Rejeitada'}
                    {order.autorizacao_status === 'Pendente' && '⏳ Pendente'}
                  </p>
                </div>
                {order.autorizacao_justificativa && (
                  <div>
                    <p className="text-sm text-gray-600">Justificativa</p>
                    <p className="text-gray-700">{order.autorizacao_justificativa}</p>
                  </div>
                )}
                {order.autorizado_por && (
                  <div>
                    <p className="text-sm text-gray-600">Autorizado por</p>
                    <p className="font-medium">{order.autorizado_por}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Data de Solicitação
              </h3>
              <p className="text-gray-700">
                {order.data_solicitacao 
                  ? format(new Date(order.data_solicitacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                  : order.created_at 
                    ? format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                    : 'Data não disponível'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Última Atualização
              </h3>
              <p className="text-gray-700">
                {order.data_atualizacao 
                  ? format(new Date(order.data_atualizacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                  : order.updated_at 
                    ? format(new Date(order.updated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                    : 'Data não disponível'}
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Fechar
            </Button>
            {order.status === 'Pendente' && (
              <>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  onClick={handleRejeitar}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Rejeitar'}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleAprovar}
                  disabled={loading}
                >
                  {loading ? 'Processando...' : 'Aprovar'}
                </Button>
              </>
            )}
            {order.status === 'Aprovado' && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleIniciarSeparacao}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Iniciar Separação'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


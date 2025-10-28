import { supabase } from '@/lib/supabase'

export type PedidoMobile = {
  id: string
  numero_pedido: string
  supervisor_id: string
  supervisor_nome: string
  supervisor_email: string
  produto_id: string
  produto_nome: string
  quantidade: number
  unidade: string
  urgencia: 'Baixa' | 'Média' | 'Alta' | 'Urgente'
  observacoes?: string
  status: 'Pendente' | 'Aprovado' | 'Em Separação' | 'Saiu para Entrega' | 'Entregue' | 'Cancelado' | 'Rejeitado'
  requer_autorizacao: boolean
  autorizacao_status?: 'Pendente' | 'Aprovada' | 'Rejeitada'
  autorizacao_justificativa?: string
  autorizado_por?: string
  data_solicitacao: string
  data_atualizacao: string
  forma_pagamento?: string
}

/**
 * Busca todos os pedidos do mobile (supervisores)
 */
export async function fetchPedidosMobile(): Promise<PedidoMobile[]> {
  const { data, error } = await supabase
    .from('pedidos_supervisores')
    .select('*')
    .order('data_solicitacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar pedidos do mobile:', error)
    return []
  }

  return (data || []).map(p => ({
    ...p,
    forma_pagamento: 'Material de Consumo' // Todos os pedidos do mobile são Material de Consumo
  })) as PedidoMobile[]
}

/**
 * Atualiza o status de um pedido do mobile
 */
export async function updatePedidoMobileStatus(
  pedidoId: string,
  status: PedidoMobile['status'],
  autorizadoPor?: string
): Promise<boolean> {
  const updateData: any = {
    status,
    data_atualizacao: new Date().toISOString()
  }

  if (autorizadoPor) {
    updateData.autorizado_por = autorizadoPor
    updateData.autorizacao_status = 'Aprovada'
  }

  const { error } = await supabase
    .from('pedidos_supervisores')
    .update(updateData)
    .eq('id', pedidoId)

  if (error) {
    console.error('Erro ao atualizar status do pedido mobile:', error)
    return false
  }

  return true
}

/**
 * Aprovar ou rejeitar autorização de um pedido
 */
export async function aprovarAutorizacaoPedido(
  pedidoId: string,
  aprovado: boolean,
  autorizadoPor: string
): Promise<boolean> {
  const updateData: any = {
    autorizacao_status: aprovado ? 'Aprovada' : 'Rejeitada',
    autorizado_por: autorizadoPor,
    data_atualizacao: new Date().toISOString()
  }

  if (aprovado) {
    updateData.status = 'Aprovado'
  } else {
    updateData.status = 'Rejeitado'
  }

  const { error } = await supabase
    .from('pedidos_supervisores')
    .update(updateData)
    .eq('id', pedidoId)

  if (error) {
    console.error('Erro ao aprovar/rejeitar autorização:', error)
    return false
  }

  return true
}

/**
 * Subscribe para mudanças em tempo real
 */
export function subscribePedidosMobile(callback: () => void) {
  const channel = supabase
    .channel('pedidos_mobile_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pedidos_supervisores'
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Calcula estatísticas dos pedidos
 */
export function calcularEstatisticasPedidos(pedidos: PedidoMobile[]) {
  const total = pedidos.length
  const entregues = pedidos.filter(p => p.status === 'Entregue').length
  const emAndamento = pedidos.filter(p => ['Aprovado', 'Em Separação', 'Saiu para Entrega'].includes(p.status)).length
  const pendentes = pedidos.filter(p => p.status === 'Pendente').length
  const cancelados = pedidos.filter(p => p.status === 'Cancelado' || p.status === 'Rejeitado').length
  
  const porStatus = {
    'Pendente': pedidos.filter(p => p.status === 'Pendente').length,
    'Aprovado': pedidos.filter(p => p.status === 'Aprovado').length,
    'Em Separação': pedidos.filter(p => p.status === 'Em Separação').length,
    'Saiu para Entrega': pedidos.filter(p => p.status === 'Saiu para Entrega').length,
    'Entregue': pedidos.filter(p => p.status === 'Entregue').length,
    'Cancelado': pedidos.filter(p => p.status === 'Cancelado').length,
    'Rejeitado': pedidos.filter(p => p.status === 'Rejeitado').length,
  }

  const requeremAutorizacao = pedidos.filter(p => p.requer_autorizacao && p.autorizacao_status === 'Pendente').length

  return {
    total,
    entregues,
    emAndamento,
    pendentes,
    cancelados,
    porStatus,
    requeremAutorizacao,
    taxaEntrega: total > 0 ? ((entregues / total) * 100).toFixed(1) : '0'
  }
}


import { supabase } from '@/lib/supabaseClient'

export type OrderStatus =
  | 'Pendente'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Em Separação'
  | 'Em Rota'
  | 'Entregue'
  | 'Atrasado'
  | 'Cancelado'

export interface OrderItem {
  produto: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
}

export interface OrderRecord {
  id?: string
  numero: string
  cliente: string
  telefone?: string
  endereco: string
  cidade?: string
  estado?: string
  cep?: string
  data_pedido: string // ISO
  data_entrega?: string | null // ISO
  status: OrderStatus
  motorista?: string | null
  veiculo?: string | null
  forma_pagamento?: string | null
  observacoes?: string | null
  observacao_rejeicao?: string | null
  valor_total: number
  itens?: OrderItem[]
  created_at?: string
  updated_at?: string
}

export async function fetchOrders(): Promise<OrderRecord[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('fetchOrders error:', error.message)
    return []
  }
  const rows = (data as OrderRecord[]) || []
  // Normaliza itens como array
  for (const r of rows) {
    const anyR: any = r as any
    if (!Array.isArray(anyR.itens)) {
      try {
        anyR.itens = anyR.itens ? JSON.parse(anyR.itens as unknown as string) : []
      } catch {
        anyR.itens = []
      }
    }
  }
  return rows
}

export async function fetchOrdersByStatus(): Promise<Record<string, OrderRecord[]>> {
  const all = await fetchOrders()
  return all.reduce((acc, o) => {
    const key = o.status || 'Pendente'
    acc[key] = acc[key] || []
    acc[key].push(o)
    return acc
  }, {} as Record<string, OrderRecord[]>)
}

export async function createOrder(order: OrderRecord): Promise<OrderRecord | null> {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select('*')
    .single()
  if (error) {
    console.error('createOrder error:', error.message)
    return null
  }
  return data as OrderRecord
}

export async function updateOrder(id: string, updates: Partial<OrderRecord>): Promise<boolean> {
  const { error } = await supabase
    .from('orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('updateOrder error:', error.message)
    return false
  }
  return true
}

export async function approveOrder(id: string): Promise<boolean> {
  // Aprovar e mover para Em Separação
  return updateOrder(id, { status: 'Em Separação' })
}

export async function rejectOrder(id: string, reason: string): Promise<boolean> {
  return updateOrder(id, { status: 'Rejeitado', observacao_rejeicao: reason })
}

export async function upsertOrdersBulk(rows: OrderRecord[]): Promise<{ ok: number; fail: number }> {
  if (!rows.length) return { ok: 0, fail: 0 }
  const { error } = await supabase.from('orders').upsert(rows, { onConflict: 'numero' })
  if (error) {
    console.error('upsertOrdersBulk error:', error.message)
    return { ok: 0, fail: rows.length }
  }
  return { ok: rows.length, fail: 0 }
}

export function subscribeOrders(onChange: () => void) {
  // Realtime (precisa estar habilitado nas Policies do Supabase)
  const channel = supabase
    .channel('orders-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => onChange())
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}



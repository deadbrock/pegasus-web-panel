import { supabase } from '@/lib/supabaseClient'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type PedidoMaterialStatus =
  | 'Aguardando Validação'
  | 'Pendente'
  | 'Em Análise'
  | 'Aprovado'
  | 'Rejeitado'
  | 'Em Separação'
  | 'Separado'
  | 'Entregue'
  | 'Cancelado'

export type PedidoMaterialUrgencia = 'Baixa' | 'Média' | 'Alta' | 'Urgente'

export interface ItemPedidoMaterial {
  id?: string
  pedido_id?: string
  produto_id?: string | null
  produto_codigo: string
  produto_nome: string
  unidade: string
  quantidade: number
  observacoes?: string | null
}

export interface PedidoMaterial {
  id: string
  numero_pedido: string
  solicitante_id?: string | null
  solicitante_nome: string
  solicitante_email?: string | null
  solicitante_setor?: string | null
  portal_supervisor_id?: string | null
  portal_encarregado_id?: string | null
  supervisor_id?: string | null
  supervisor_nome?: string | null
  aprovado_por?: string | null
  data_aprovacao?: string | null
  motivo_rejeicao?: string | null
  urgencia: PedidoMaterialUrgencia
  status: PedidoMaterialStatus
  observacoes?: string | null
  created_at: string
  updated_at: string
  itens?: ItemPedidoMaterial[]
}

export interface PedidoMaterialInsert
  extends Omit<PedidoMaterial, 'id' | 'created_at' | 'updated_at' | 'itens'> {}

// ─── Labels / helpers ─────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<PedidoMaterialStatus, string> = {
  'Aguardando Validação': 'Aguardando Validação',
  'Pendente': 'Pendente',
  'Em Análise': 'Em Análise',
  'Aprovado': 'Aprovado',
  'Rejeitado': 'Rejeitado',
  'Em Separação': 'Em Separação',
  'Separado': 'Separado',
  'Entregue': 'Entregue',
  'Cancelado': 'Cancelado',
}

export const STATUS_COLORS: Record<PedidoMaterialStatus, string> = {
  'Aguardando Validação': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Pendente':      'bg-amber-100 text-amber-700 border-amber-200',
  'Em Análise':    'bg-blue-100 text-blue-700 border-blue-200',
  'Aprovado':      'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Rejeitado':     'bg-rose-100 text-rose-700 border-rose-200',
  'Em Separação':  'bg-violet-100 text-violet-700 border-violet-200',
  'Separado':      'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Entregue':      'bg-green-100 text-green-700 border-green-200',
  'Cancelado':     'bg-slate-100 text-slate-500 border-slate-200',
}

export const URGENCIA_COLORS: Record<PedidoMaterialUrgencia, string> = {
  'Baixa':   'bg-slate-100 text-slate-600',
  'Média':   'bg-amber-100 text-amber-700',
  'Alta':    'bg-orange-100 text-orange-700',
  'Urgente': 'bg-rose-100 text-rose-700',
}

export function gerarNumeroPedido(): string {
  const now = new Date()
  const ano = now.getFullYear()
  const seq = String(now.getTime()).slice(-5)
  return `PM-${ano}-${seq}`
}

// ─── Fluxo de status: quem pode mover para qual status ────────────────────────
// encarregado/supervisor pode criar e cancelar o próprio pedido
// supervisor/gestor/admin pode aprovar, rejeitar, mover para separação, entregue

export const SUPERVISOR_ROLES = ['admin', 'diretor', 'gestor', 'logistica', 'supervisor']
export const CREATOR_ROLES    = ['admin', 'diretor', 'gestor', 'logistica', 'supervisor', 'encarregado']

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function fetchPedidosMateriais(): Promise<PedidoMaterial[]> {
  const { data, error } = await supabase
    .from('pedidos_materiais')
    .select(`
      id, numero_pedido,
      solicitante_id, solicitante_nome, solicitante_email, solicitante_setor,
      supervisor_id, supervisor_nome,
      aprovado_por, data_aprovacao, motivo_rejeicao,
      urgencia, status, observacoes,
      created_at, updated_at,
      itens:itens_pedido_material(
        id, pedido_id, produto_id,
        produto_codigo, produto_nome, unidade, quantidade, observacoes
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[pedidosMateriaisService] fetchPedidosMateriais error:', error.message)
    return []
  }
  return (data ?? []) as PedidoMaterial[]
}

export async function fetchPedidoMaterialById(id: string): Promise<PedidoMaterial | null> {
  const { data, error } = await supabase
    .from('pedidos_materiais')
    .select(`
      id, numero_pedido,
      solicitante_id, solicitante_nome, solicitante_email, solicitante_setor,
      supervisor_id, supervisor_nome,
      aprovado_por, data_aprovacao, motivo_rejeicao,
      urgencia, status, observacoes,
      created_at, updated_at,
      itens:itens_pedido_material(
        id, pedido_id, produto_id,
        produto_codigo, produto_nome, unidade, quantidade, observacoes
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('[pedidosMateriaisService] fetchPedidoMaterialById error:', error.message)
    return null
  }
  return data as PedidoMaterial
}

export async function createPedidoMaterial(
  pedido: Omit<PedidoMaterialInsert, 'numero_pedido'>,
  itens: Omit<ItemPedidoMaterial, 'id' | 'pedido_id'>[]
): Promise<PedidoMaterial | null> {
  const numero_pedido = gerarNumeroPedido()

  const { data, error } = await supabase
    .from('pedidos_materiais')
    .insert({ ...pedido, numero_pedido })
    .select('id, numero_pedido')
    .single()

  if (error) {
    console.error('[pedidosMateriaisService] createPedidoMaterial error:', error.message)
    return null
  }

  if (itens.length > 0) {
    const rows = itens.map((item) => ({ ...item, pedido_id: data.id }))
    const { error: itensError } = await supabase
      .from('itens_pedido_material')
      .insert(rows)

    if (itensError) {
      console.error('[pedidosMateriaisService] insert itens error:', itensError.message)
    }
  }

  return fetchPedidoMaterialById(data.id)
}

export async function updateStatusPedidoMaterial(
  id: string,
  status: PedidoMaterialStatus,
  extra?: {
    aprovado_por?: string
    motivo_rejeicao?: string
    data_aprovacao?: string
  }
): Promise<boolean> {
  const payload: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    ...(extra ?? {}),
    ...(status === 'Aprovado' || status === 'Rejeitado'
      ? { data_aprovacao: extra?.data_aprovacao ?? new Date().toISOString() }
      : {}),
  }

  const { error } = await supabase
    .from('pedidos_materiais')
    .update(payload)
    .eq('id', id)

  if (error) {
    console.error('[pedidosMateriaisService] updateStatus error:', error.message)
    return false
  }
  return true
}

export async function cancelarPedidoMaterial(id: string): Promise<boolean> {
  return updateStatusPedidoMaterial(id, 'Cancelado')
}

export async function aprovarPedidoMaterial(
  id: string,
  aprovadoPor: string
): Promise<boolean> {
  return updateStatusPedidoMaterial(id, 'Aprovado', { aprovado_por: aprovadoPor })
}

export async function rejeitarPedidoMaterial(
  id: string,
  motivo: string,
  rejeitadoPor: string
): Promise<boolean> {
  return updateStatusPedidoMaterial(id, 'Rejeitado', {
    motivo_rejeicao: motivo,
    aprovado_por: rejeitadoPor,
  })
}

export async function deletePedidoMaterial(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pedidos_materiais')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[pedidosMateriaisService] delete error:', error.message)
    return false
  }
  return true
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function calcularStatsPedidos(pedidos: PedidoMaterial[]) {
  const total     = pedidos.length
  const pendentes = pedidos.filter((p) => p.status === 'Pendente').length
  const emAnalise = pedidos.filter((p) => p.status === 'Em Análise').length
  const aprovados = pedidos.filter((p) => p.status === 'Aprovado' || p.status === 'Em Separação' || p.status === 'Separado').length
  const entregues = pedidos.filter((p) => p.status === 'Entregue').length
  const rejeitados = pedidos.filter((p) => p.status === 'Rejeitado' || p.status === 'Cancelado').length
  return { total, pendentes, emAnalise, aprovados, entregues, rejeitados }
}

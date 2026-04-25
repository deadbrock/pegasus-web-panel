import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const PEDIDO_SELECT = `
  id, numero_pedido,
  solicitante_nome, solicitante_email, solicitante_setor,
  portal_supervisor_id, portal_encarregado_id,
  supervisor_nome, aprovado_por, data_aprovacao, motivo_rejeicao,
  urgencia, status, observacoes, created_at, updated_at,
  itens:itens_pedido_material(
    id, pedido_id, produto_id,
    produto_codigo, produto_nome, unidade, quantidade, observacoes
  )
`

function gerarNumeroPedido(): string {
  const now = new Date()
  return `PM-${now.getFullYear()}-${String(now.getTime()).slice(-5)}`
}

// GET - Buscar pedidos do portal
// Query params: supervisor_id | encarregado_id
export async function GET(request: Request) {
  try {
    const db = getAdmin()
    const { searchParams } = new URL(request.url)
    const supervisorId = searchParams.get('supervisor_id')
    const encarregadoId = searchParams.get('encarregado_id')

    if (!supervisorId && !encarregadoId) {
      return NextResponse.json({ error: 'Forneça supervisor_id ou encarregado_id' }, { status: 400 })
    }

    let query = db
      .from('pedidos_materiais')
      .select(PEDIDO_SELECT)
      .order('created_at', { ascending: false })

    if (supervisorId) query = query.eq('portal_supervisor_id', supervisorId)
    if (encarregadoId) query = query.eq('portal_encarregado_id', encarregadoId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ pedidos: data ?? [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST - Criar pedido pelo portal (sem auth)
export async function POST(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const {
      portal_supervisor_id,
      portal_encarregado_id,
      solicitante_nome,
      solicitante_setor,
      urgencia,
      observacoes,
      itens,
    } = body

    if (!portal_supervisor_id || !portal_encarregado_id || !solicitante_nome || !itens?.length) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const numero_pedido = gerarNumeroPedido()

    const { data, error } = await db
      .from('pedidos_materiais')
      .insert({
        numero_pedido,
        portal_supervisor_id,
        portal_encarregado_id,
        solicitante_nome,
        solicitante_setor: solicitante_setor || null,
        urgencia: urgencia || 'Baixa',
        status: 'Aguardando Validação',
        observacoes: observacoes || null,
      })
      .select('id, numero_pedido')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Inserir itens
    const rows = itens.map((item: Record<string, unknown>) => ({ ...item, pedido_id: data.id }))
    const { error: itensError } = await db.from('itens_pedido_material').insert(rows)
    if (itensError) {
      console.error('[portal/pedidos] insert itens error:', itensError.message)
    }

    // Retornar pedido completo
    const { data: pedidoCompleto, error: fetchError } = await db
      .from('pedidos_materiais')
      .select(PEDIDO_SELECT)
      .eq('id', data.id)
      .single()

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
    return NextResponse.json({ pedido: pedidoCompleto }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH - Atualizar status pelo portal (rejeitar pelo supervisor)
export async function PATCH(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { id, status, motivo_rejeicao, supervisor_nome } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id e status são obrigatórios' }, { status: 400 })
    }

    const payload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (motivo_rejeicao) payload.motivo_rejeicao = motivo_rejeicao
    if (supervisor_nome) payload.aprovado_por = supervisor_nome

    const { error } = await db
      .from('pedidos_materiais')
      .update(payload)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

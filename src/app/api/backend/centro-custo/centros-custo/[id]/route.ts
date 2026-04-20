import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TABLE = 'centros_custo'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || ''
  return createClient(url, key)
}

function errMsg(e: any): string {
  if (!e) return 'Erro desconhecido'
  if (typeof e === 'string') return e
  return e.message || e.error_description || e.details || e.hint
    || JSON.stringify(e)
    || 'Erro desconhecido'
}

// PUT - Atualizar centro de custo
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { nome, codigo, descricao, cor_hex, ativo, tipo } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data, error } = await getClient()
      .from(TABLE)
      .update({ nome, codigo, descricao, cor_hex, ativo, tipo })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      const msg = errMsg(error)
      console.error('[centros-custo PUT]', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('[centros-custo PUT] exception:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) }, { status: 500 })
  }
}

// DELETE - Excluir centro de custo
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { error } = await getClient()
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) {
      const msg = errMsg(error)
      console.error('[centros-custo DELETE]', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('[centros-custo DELETE] exception:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) }, { status: 500 })
  }
}

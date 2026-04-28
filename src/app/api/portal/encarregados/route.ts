import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function gerarCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

// GET - Listar encarregados (filtrar por supervisor_id opcionalmente)
export async function GET(request: Request) {
  try {
    const db = getAdmin()
    const { searchParams } = new URL(request.url)
    const supervisorId = searchParams.get('supervisor_id')

    let query = db
      .from('portal_encarregados')
      .select('id, supervisor_id, nome, telefone, setor, ativo, created_at')
      .order('nome')

    if (supervisorId) query = query.eq('supervisor_id', supervisorId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ encarregados: data ?? [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST - Criar encarregado (gera código único, retorna UMA VEZ)
export async function POST(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { supervisor_id, nome, telefone, setor } = body

    if (!supervisor_id || !nome?.trim()) {
      return NextResponse.json({ error: 'supervisor_id e nome são obrigatórios' }, { status: 400 })
    }

    const codigoPlain = gerarCodigo()
    const codigoHash  = await bcrypt.hash(codigoPlain, 10)

    const { data, error } = await db
      .from('portal_encarregados')
      .insert({
        supervisor_id,
        nome: nome.trim(),
        telefone: telefone?.trim() || null,
        setor: setor?.trim() || null,
        codigo_hash: codigoHash,
      })
      .select('id, supervisor_id, nome, telefone, setor, ativo, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Retornar código em texto claro UMA ÚNICA VEZ — não fica salvo em texto claro
    return NextResponse.json({ encarregado: data, codigo: codigoPlain })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH - Atualizar encarregado (ativo/inativo ou regenerar_codigo)
export async function PATCH(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    let codigoPlain: string | undefined
    if (updates.regenerar_codigo) {
      codigoPlain = gerarCodigo()
      updates.codigo_hash = await bcrypt.hash(codigoPlain, 10)
      delete updates.regenerar_codigo
    }

    const { error } = await db
      .from('portal_encarregados')
      .update(updates)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, ...(codigoPlain ? { codigo: codigoPlain } : {}) })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE - Remover encarregado
export async function DELETE(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    const { error } = await db
      .from('portal_encarregados')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

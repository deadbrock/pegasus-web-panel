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

// GET - Listar supervisores do portal
export async function GET() {
  try {
    const db = getAdmin()
    const { data, error } = await db
      .from('portal_supervisores')
      .select('id, nome, telefone, setor, ativo, created_at, updated_at')
      .order('nome')

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ supervisores: data ?? [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST - Criar supervisor do portal (gera código único)
export async function POST(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { nome, telefone, setor } = body

    if (!nome?.trim()) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const codigoPlain = gerarCodigo()
    const codigoHash = await bcrypt.hash(codigoPlain, 10)

    const { data, error } = await db
      .from('portal_supervisores')
      .insert({ nome: nome.trim(), telefone: telefone?.trim() || null, setor: setor?.trim() || null, codigo_hash: codigoHash })
      .select('id, nome, telefone, setor, ativo, created_at')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Retornar código em texto claro UMA ÚNICA VEZ — não fica salvo
    return NextResponse.json({ supervisor: data, codigo: codigoPlain })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH - Atualizar supervisor (ativo/inativo, nome, setor, telefone)
export async function PATCH(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    // Se está regenerando o código
    let codigoPlain: string | undefined
    if (updates.regenerar_codigo) {
      codigoPlain = gerarCodigo()
      updates.codigo_hash = await bcrypt.hash(codigoPlain, 10)
      delete updates.regenerar_codigo
    }

    const { error } = await db
      .from('portal_supervisores')
      .update(updates)
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, ...(codigoPlain ? { codigo: codigoPlain } : {}) })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// DELETE - Excluir supervisor
export async function DELETE(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { id } = body

    if (!id) return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })

    const { error } = await db
      .from('portal_supervisores')
      .delete()
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

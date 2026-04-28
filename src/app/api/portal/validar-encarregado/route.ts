import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST - Validar código do encarregado para login no portal
// Body: { encarregado_id, codigo }
export async function POST(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { encarregado_id, codigo } = body

    if (!encarregado_id || !codigo) {
      return NextResponse.json({ error: 'encarregado_id e codigo são obrigatórios' }, { status: 400 })
    }

    const { data: encarregado, error: encError } = await db
      .from('portal_encarregados')
      .select('id, supervisor_id, nome, setor, telefone, codigo_hash, ativo')
      .eq('id', encarregado_id)
      .single()

    if (encError || !encarregado) {
      return NextResponse.json({ error: 'Encarregado não encontrado' }, { status: 404 })
    }

    if (!encarregado.ativo) {
      return NextResponse.json({ error: 'Encarregado inativo' }, { status: 403 })
    }

    if (!encarregado.codigo_hash) {
      return NextResponse.json({ error: 'Código não configurado — solicite ao supervisor para gerar seu código de acesso' }, { status: 403 })
    }

    const codigoValido = await bcrypt.compare(codigo, encarregado.codigo_hash)
    if (!codigoValido) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      encarregado: {
        id: encarregado.id,
        supervisor_id: encarregado.supervisor_id,
        nome: encarregado.nome,
        setor: encarregado.setor,
        telefone: encarregado.telefone,
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

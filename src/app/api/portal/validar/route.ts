import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// POST - Validar código do supervisor
// Body: { supervisor_id, codigo, pedido_id? }
// Se pedido_id fornecido e código válido, aprova o pedido
export async function POST(request: Request) {
  try {
    const db = getAdmin()
    const body = await request.json()
    const { supervisor_id, codigo, pedido_id } = body

    if (!supervisor_id || !codigo) {
      return NextResponse.json({ error: 'supervisor_id e codigo são obrigatórios' }, { status: 400 })
    }

    // Buscar supervisor e verificar código
    const { data: supervisor, error: supError } = await db
      .from('portal_supervisores')
      .select('id, nome, setor, codigo_hash, ativo')
      .eq('id', supervisor_id)
      .single()

    if (supError || !supervisor) {
      return NextResponse.json({ error: 'Supervisor não encontrado' }, { status: 404 })
    }

    if (!supervisor.ativo) {
      return NextResponse.json({ error: 'Supervisor inativo' }, { status: 403 })
    }

    const codigoValido = await bcrypt.compare(codigo, supervisor.codigo_hash)
    if (!codigoValido) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 401 })
    }

    // Código válido — se pedido_id fornecido, aprovar o pedido
    if (pedido_id) {
      const { error: updateError } = await db
        .from('pedidos_materiais')
        .update({
          status: 'Pendente',
          supervisor_nome: supervisor.nome,
          aprovado_por: supervisor.nome,
          data_aprovacao: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', pedido_id)
        .eq('status', 'Aguardando Validação')

      if (updateError) {
        return NextResponse.json({ error: 'Erro ao aprovar pedido: ' + updateError.message }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      supervisor: { id: supervisor.id, nome: supervisor.nome, setor: supervisor.setor },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

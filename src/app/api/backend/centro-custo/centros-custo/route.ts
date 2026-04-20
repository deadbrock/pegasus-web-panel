import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const TABLE = 'centros_custo'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Usa service role para bypassar RLS nas rotas de API admin
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

function isTableMissing(e: any): boolean {
  return e?.code === '42P01' || String(e?.message).includes('does not exist')
}

// GET - Listar centros de custo
export async function GET() {
  try {
    const { data, error } = await getClient()
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      if (isTableMissing(error)) {
        // Tabela ainda não criada — retorna lista vazia sem quebrar
        return NextResponse.json([])
      }
      console.error('[centros-custo GET]', errMsg(error))
      return NextResponse.json({ error: errMsg(error) }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (e: any) {
    console.error('[centros-custo GET] exception:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) }, { status: 500 })
  }
}

// POST - Criar centro de custo
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, codigo, descricao, cor_hex, ativo, tipo } = body

    if (!nome || !codigo) {
      return NextResponse.json({ error: 'Nome e código são obrigatórios' }, { status: 400 })
    }

    const { data, error } = await getClient()
      .from(TABLE)
      .insert({
        nome,
        tipo: tipo || 'personalizado',
        codigo: codigo.toUpperCase().replace(/\s+/g, '_'),
        descricao: descricao || '',
        ativo: ativo !== undefined ? ativo : true,
        cor_hex: cor_hex || '#6B7280',
      })
      .select()
      .single()

    if (error) {
      const msg = errMsg(error)
      console.error('[centros-custo POST]', msg)

      if (isTableMissing(error)) {
        return NextResponse.json(
          { error: 'A tabela centros_custo não existe. Execute o script scripts/setup-centros-custo.sql no Supabase.' },
          { status: 500 }
        )
      }
      // Código único duplicado
      if (error.code === '23505') {
        return NextResponse.json({ error: `Já existe um centro de custo com o código "${codigo}".` }, { status: 400 })
      }

      return NextResponse.json({ error: msg }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e: any) {
    console.error('[centros-custo POST] exception:', errMsg(e))
    return NextResponse.json({ error: errMsg(e) }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    // Autenticação opcional via Supabase Auth
    // Em produção, valide o token JWT aqui
    
    const body = await req.json()
    if (!Array.isArray(body) && typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
    }

    const rows = Array.isArray(body) ? body : [body]
    const { data, error } = await getSupabaseAdmin()
      .from('orders')
      .upsert(rows, { onConflict: 'numero' })
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true, count: data?.length || 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}



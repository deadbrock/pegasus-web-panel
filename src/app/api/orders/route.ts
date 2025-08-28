import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key') || ''
    const expected = process.env.PEGASUS_API_KEY
    if (!expected || apiKey !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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



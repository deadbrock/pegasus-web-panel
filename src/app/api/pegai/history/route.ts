import { NextRequest, NextResponse } from 'next/server'

const getBackendBase = () => {
  const a = (process.env.PEGASUS_BACKEND_URL || '').trim()
  const b = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  return a || b
}

export async function GET(_req: NextRequest) {
  try {
    const backend = getBackendBase()
    if (!backend) {
      return NextResponse.json({ error: 'Backend indisponível. Defina PEGASUS_BACKEND_URL.' }, { status: 500 })
    }

    const res = await fetch(`${backend.replace(/\/$/, '')}/api/chat/simulation/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Força modo no-store para não cachear histórico
      cache: 'no-store',
    })

    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro no proxy PegAI (history)' }, { status: 500 })
  }
}

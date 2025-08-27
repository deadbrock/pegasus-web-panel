import { NextRequest, NextResponse } from 'next/server'

const getBackendBase = () => {
  const a = (process.env.PEGASUS_BACKEND_URL || '').trim()
  const b = (process.env.NEXT_PUBLIC_API_URL || '').trim()
  return a || b
}

export async function POST(req: NextRequest) {
  try {
    const backend = getBackendBase()
    if (!backend) {
      return NextResponse.json({ error: 'Backend indisponível. Defina PEGASUS_BACKEND_URL.' }, { status: 500 })
    }

    // Repassa corpo e headers ao backend
    const body = await req.text()
    const auth = req.headers.get('authorization') || ''

    const res = await fetch(`${backend.replace(/\/$/, '')}/api/chat/simulation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
      },
      body,
    })

    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro no proxy PegAI (simulation)' }, { status: 500 })
  }
}

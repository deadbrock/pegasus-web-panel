import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question: string = body?.question || ''

    // Proxy opcional para backend real (quando existir)
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').trim()
    if (apiBase) {
      const res = await fetch(`${apiBase}/api/ai/simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      })
      const text = await res.text()
      return new NextResponse(text, { status: res.status, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' } })
    }

    // Mock local caso não haja backend configurado
    const pctMatch = /([+-]?\d+\.?\d*)\s*%/.exec(question)
    const pct = pctMatch ? Number(pctMatch[1]) : 0
    return NextResponse.json({
      text: `Simulação (mock local): variação detectada de ${pct}%.`,
      metrics: { variationPct: pct },
      suggestion: pct > 0 ? 'Reforçar frota/estoque' : 'Rever capacidade e rotas',
      alert: Math.abs(pct) >= 20,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro na simulação' }, { status: 500 })
  }
}



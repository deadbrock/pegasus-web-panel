import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Simulação
 * Retorna dados mock para demonstração
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question: string = body?.question || ''

    // Gerar resposta mock baseada na pergunta
    const pctMatch = /([+-]?\d+\.?\d*)\s*%/.exec(question)
    const pct = pctMatch ? Number(pctMatch[1]) : 0
    
    return NextResponse.json({
      text: `Simulação: variação detectada de ${pct}%.`,
      metrics: { variationPct: pct },
      suggestion: pct > 0 ? 'Reforçar frota/estoque' : 'Rever capacidade e rotas',
      alert: Math.abs(pct) >= 20,
      mode: 'mock' // Indica que é dados de demonstração
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro na simulação' }, { status: 500 })
  }
}



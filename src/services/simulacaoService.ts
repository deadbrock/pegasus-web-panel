export type SimulacaoResponse = {
  text: string
  metrics?: Record<string, any>
  suggestion?: string | null
  alert?: boolean
}

export async function simulateQuestion(question: string): Promise<SimulacaoResponse> {
  try {
    const res = await fetch('/api/simulacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })
    if (!res.ok) throw new Error(await res.text())
    return await res.json()
  } catch (e) {
    // Mock de fallback
    const pctMatch = /([+-]?\d+\.?\d*)\s*%/.exec(question)
    const pct = pctMatch ? Number(pctMatch[1]) : 0
    return {
      text: `Simulação (mock): aplicando variação de ${pct}%. Sem backend disponível, esta é uma resposta simulada.`,
      metrics: { variationPct: pct },
      suggestion: pct > 0 ? 'Reforçar frota e revisar mínimos de estoque.' : 'Revisar janelas de entrega e rotas.',
      alert: Math.abs(pct) >= 20,
    }
  }
}



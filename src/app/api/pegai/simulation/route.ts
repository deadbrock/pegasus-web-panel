import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Simulação PegAI
 * 
 * NOTA: Funcionalidade de IA desabilitada temporariamente.
 * Para habilitar, configure um backend Python com IA e defina a variável:
 * PEGASUS_BACKEND_URL=https://seu-backend-ia.railway.app
 */

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Funcionalidade de IA não disponível',
    message: 'Configure um backend Python com IA para usar esta funcionalidade',
    hint: 'Adicione PEGASUS_BACKEND_URL nas variáveis de ambiente do Vercel'
  }, { status: 503 })
}

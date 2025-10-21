import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Histórico PegAI
 * 
 * NOTA: Funcionalidade de IA desabilitada temporariamente.
 * Retorna array vazio até que backend de IA seja configurado.
 */

export async function GET(_req: NextRequest) {
  // Retorna histórico vazio (não quebra a UI)
  return NextResponse.json([])
}

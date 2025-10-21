import { NextRequest, NextResponse } from 'next/server'

/**
 * Rota de fallback para /api/auth/token
 * Redireciona para /api/backend/auth/token
 * 
 * Esta rota existe porque alguns clientes em cache
 * podem estar chamando a URL antiga.
 */
export async function POST(request: NextRequest) {
  console.log('[Auth Fallback] Redirecionando /api/auth/token → /api/backend/auth/token')
  
  // Pega o corpo da requisição
  const body = await request.text()
  
  // Redireciona para o endpoint correto
  const backendUrl = new URL('/api/backend/auth/token', request.url)
  
  const response = await fetch(backendUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': request.headers.get('Content-Type') || 'application/x-www-form-urlencoded',
    },
    body: body,
  })
  
  const data = await response.text()
  
  return new NextResponse(data, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  })
}

export async function GET() {
  return NextResponse.json({
    error: 'Use POST /api/backend/auth/token para autenticação',
    hint: 'Esta é uma rota de fallback. Use /api/backend/auth/token'
  }, { status: 405 })
}


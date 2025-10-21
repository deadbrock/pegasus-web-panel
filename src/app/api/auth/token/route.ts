import { NextRequest, NextResponse } from 'next/server'

/**
 * Rota de fallback para /api/auth/token
 * Redireciona para /api/backend/auth/token
 * 
 * Esta rota existe porque alguns clientes em cache
 * podem estar chamando a URL antiga.
 */

const BACKEND = process.env.PEGASUS_BACKEND_URL

export async function POST(request: NextRequest) {
  console.log('[Auth Fallback] Redirecionando /api/auth/token → /api/backend/auth/token')
  
  if (!BACKEND) {
    console.error('[Auth Fallback] PEGASUS_BACKEND_URL não configurada')
    return NextResponse.json({ 
      error: 'PEGASUS_BACKEND_URL não configurada' 
    }, { status: 500 })
  }
  
  try {
    // Pega o corpo da requisição
    const body = await request.text()
    
    // Monta a URL do backend corretamente (sem protocolo duplicado)
    const backendUrl = `${BACKEND.replace(/\/$/, '')}/api/auth/token`
    console.log('[Auth Fallback] Fazendo request para:', backendUrl)
    
    const headers = new Headers(request.headers)
    headers.set('cache-control', 'no-store')
    headers.delete('host')
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: body,
    })
    
    const data = await response.arrayBuffer()
    
    console.log('[Auth Fallback] Resposta do backend:', response.status)
    
    return new NextResponse(data, {
      status: response.status,
      headers: response.headers,
    })
  } catch (error: any) {
    console.error('[Auth Fallback] Erro ao fazer proxy:', error.message)
    return NextResponse.json({ 
      error: 'Erro ao conectar com backend',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    error: 'Use POST /api/backend/auth/token para autenticação',
    hint: 'Esta é uma rota de fallback. Use /api/backend/auth/token'
  }, { status: 405 })
}


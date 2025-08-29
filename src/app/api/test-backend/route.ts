export const runtime = 'nodejs'

export async function GET() {
  try {
    const backendUrl = process.env.PEGASUS_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
    
    if (!backendUrl) {
      return Response.json({ 
        error: 'Backend URL não configurada',
        env_vars: {
          PEGASUS_BACKEND_URL: !!process.env.PEGASUS_BACKEND_URL,
          NEXT_PUBLIC_API_URL: !!process.env.NEXT_PUBLIC_API_URL
        }
      }, { status: 500 })
    }

    const testUrl = `${backendUrl.replace(/\/$/, '')}/docs`
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/json',
      }
    })

    return Response.json({
      backend_url: backendUrl,
      test_url: testUrl,
      status: response.status,
      accessible: response.ok,
      response_headers: Object.fromEntries(response.headers.entries())
    })

  } catch (error: any) {
    return Response.json({ 
      error: 'Erro ao testar backend',
      message: error?.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}

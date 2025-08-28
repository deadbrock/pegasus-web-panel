import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rotas protegidas que precisam de autenticação
  const protectedPaths = ['/dashboard']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  // Se estiver acessando rota protegida
  if (isProtectedPath) {
    // Aqui verificamos se o usuário está autenticado
    // Como estamos usando cliente (React Context), vamos deixar o componente gerenciar
    // O middleware apenas serve para otimização, mas a verificação real fica no componente
    return NextResponse.next()
  }

  // Redirecionar da raiz para dashboard (se logado) ou login (se não logado)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

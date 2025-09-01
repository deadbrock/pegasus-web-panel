"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { canAccessRoute } from '@/lib/permissions'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Se não há usuário, redireciona para login
    if (!user) {
      router.push('/login')
      return
    }

    // Se o usuário não tem permissão para acessar a rota atual
    if (!canAccessRoute(user.role, pathname)) {
      // Redireciona para o dashboard (primeira página permitida)
      router.push('/dashboard')
      return
    }
  }, [user, pathname, router])

  // Se não há usuário ou não tem permissão, não renderiza nada
  if (!user || !canAccessRoute(user.role, pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

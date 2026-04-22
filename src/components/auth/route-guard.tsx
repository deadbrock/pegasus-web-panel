"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { canAccessRoute, getDefaultRouteForRole } from '@/lib/permissions'
import { useEffect } from 'react'

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (!canAccessRoute(user.role, pathname)) {
      // Redireciona para a rota padrão do perfil (evita loop para adm_contratos)
      router.push(getDefaultRouteForRole(user.role))
    }
  }, [user, pathname, router])

  if (!user || !canAccessRoute(user.role, pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="text-sm text-slate-500">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

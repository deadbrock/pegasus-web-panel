'use client'

import { useAuth } from '../../lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface DashboardGuardProps {
  children: React.ReactNode
}

export function DashboardGuard({ children }: DashboardGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se não está logado, não renderiza nada (vai redirecionar)
  if (!user) {
    return null
  }

  // Se está logado, renderiza o conteúdo
  return <>{children}</>
}

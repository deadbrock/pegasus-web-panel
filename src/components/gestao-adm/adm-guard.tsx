'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// logistica: acesso somente-leitura (apenas valor de materiais visível)
const ADM_ALLOWED_ROLES = ['adm_contratos', 'admin', 'diretor', 'logistica']

interface AdmGuardProps {
  children: React.ReactNode
}

export function AdmGuard({ children }: AdmGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!ADM_ALLOWED_ROLES.includes(user.role)) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-500">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!user || !ADM_ALLOWED_ROLES.includes(user.role)) {
    return null
  }

  return <>{children}</>
}

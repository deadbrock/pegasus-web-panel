'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileCheck2, Zap, LogOut, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'

const navItems = [
  {
    label: 'Contratos',
    path: '/gestao-adm/contratos',
    icon: FileCheck2,
  },
  {
    label: 'Analytics',
    path: '/gestao-adm/analytics',
    icon: BarChart3,
  },
  {
    label: 'Configurações',
    path: '/dashboard/configuracoes',
    icon: Settings,
  },
]

export function AdmSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  if (!user) return null

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#0f172a] overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <Link href="/gestao-adm/contratos" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-white tracking-tight">Pegasus</p>
            <p className="text-[10px] text-violet-400 font-medium tracking-widest uppercase">
              Gestão ADM
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Módulo
        </p>

        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.path || pathname.startsWith(item.path + '/')

          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-colors',
                  isActive
                    ? 'text-white'
                    : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-200 flex-shrink-0" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/[0.06] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-violet-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white uppercase">
              {(user.name || user.email || 'U')[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-slate-500 truncate">Gestão ADM</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sair
        </button>
      </div>
    </aside>
  )
}

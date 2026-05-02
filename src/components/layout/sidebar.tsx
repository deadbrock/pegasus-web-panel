'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  DollarSign,
  FileText, 
  Search,
  Calendar,
  BarChart3,
  FolderOpen,
  Package,
  Warehouse,
  Users,
  Settings,
  Target,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Truck,
  Wrench,
  FileBarChart,
  TrendingUp,
  Database,
  Briefcase,
  ClipboardList,
  MapPin,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getModulesForRole } from '@/lib/permissions'

type ModuleGroup = {
  id: string
  name: string
  icon: any
  modules: {
    name: string
    path: string
    icon: any
    permission?: string
  }[]
}

const moduleGroups: ModuleGroup[] = [
  {
    id: 'operations',
    name: 'Operações',
    icon: Briefcase,
    modules: [
      { name: 'Pedidos', path: '/dashboard/pedidos', icon: ShoppingCart },
      { name: 'Estoque', path: '/dashboard/estoque', icon: Package },
      { name: 'Contratos', path: '/dashboard/contratos', icon: FileText },
      { name: 'Rastreamento', path: '/dashboard/rastreamento', icon: MapPin },
      { name: 'Contratos ADM', path: '/gestao-adm/contratos', icon: ClipboardList },
    ]
  },
  {
    id: 'financial',
    name: 'Financeiro',
    icon: DollarSign,
    modules: [
      { name: 'Financeiro', path: '/dashboard/financeiro', icon: DollarSign },
      { name: 'Custos', path: '/dashboard/custos', icon: Target },
      { name: 'Centro de Custos', path: '/dashboard/centro-custos', icon: Warehouse },
      { name: 'Plan. Financeiro', path: '/dashboard/planejamento-financeiro', icon: Calendar },
    ]
  },
  {
    id: 'fleet',
    name: 'Frota',
    icon: Truck,
    modules: [
      { name: 'Veículos', path: '/dashboard/veiculos', icon: Truck },
      { name: 'Motoristas', path: '/dashboard/motoristas', icon: Users },
      { name: 'Manutenção', path: '/dashboard/manutencao', icon: Wrench },
    ]
  },
  {
    id: 'fiscal',
    name: 'Fiscal',
    icon: FileText,
    modules: [
      { name: 'Fiscal', path: '/dashboard/fiscal', icon: FileText },
      { name: 'Documentos', path: '/dashboard/documentos', icon: FolderOpen },
      { name: 'Auditoria', path: '/dashboard/auditoria', icon: Search },
    ]
  },
  {
    id: 'analysis',
    name: 'Análise',
    icon: BarChart3,
    modules: [
      { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Relatórios', path: '/dashboard/relatorios', icon: FileBarChart },
      { name: 'Data Hub', path: '/dashboard/data-hub', icon: Database },
      { name: 'Forecast', path: '/dashboard/forecast', icon: TrendingUp },
      { name: 'Planejamento', path: '/dashboard/planejamento', icon: ClipboardList },
    ]
  },
  {
    id: 'admin',
    name: 'Administração',
    icon: Settings,
    modules: [
      { name: 'Supervisores', path: '/dashboard/supervisores', icon: Users },
      { name: 'Período de Pedidos', path: '/dashboard/configuracoes-periodo', icon: Calendar },
      { name: 'Configurações', path: '/dashboard/configuracoes', icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['operations'])

  if (!user?.role) return null

  const allowedModules = getModulesForRole(user.role)
  const allowedPaths = allowedModules.map(m => m.path)

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const isGroupActive = (group: ModuleGroup) =>
    group.modules.some(module => pathname === module.path)

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col bg-[#0f172a] overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-white tracking-tight">Pegasus</p>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">v1.2</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">

        {/* Dashboard link */}
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
            pathname === '/dashboard'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          )}
        >
          <LayoutDashboard className={cn(
            'w-4 h-4 flex-shrink-0 transition-colors',
            pathname === '/dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
          )} />
          Dashboard
        </Link>

        <div className="py-2">
          <div className="h-px bg-white/[0.06]" />
        </div>

        {/* Groups */}
        {moduleGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id)
          const hasActive = isGroupActive(group)
          const GroupIcon = group.icon

          const visibleModules = group.modules.filter(m => allowedPaths.includes(m.path))
          if (visibleModules.length === 0) return null

          return (
            <div key={group.id}>
              <button
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 group',
                  hasActive
                    ? 'text-slate-200'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                )}
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-widest">
                  <GroupIcon className="w-3.5 h-3.5" />
                  {group.name}
                </span>
                {isExpanded
                  ? <ChevronDown className="w-3 h-3 opacity-50" />
                  : <ChevronRight className="w-3 h-3 opacity-50" />}
              </button>

              {isExpanded && (
                <div className="mt-0.5 space-y-0.5 ml-2">
                  {visibleModules.map((module) => {
                    const ModuleIcon = module.icon
                    const isActive = pathname === module.path

                    return (
                      <Link
                        key={module.path}
                        href={module.path}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                          isActive
                            ? 'bg-white/[0.10] text-white font-medium'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] font-normal'
                        )}
                      >
                        <ModuleIcon className={cn(
                          'w-4 h-4 flex-shrink-0',
                          isActive ? 'text-blue-400' : 'text-slate-600 group-hover:text-slate-400'
                        )} />
                        <span className="truncate">{module.name}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        )}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white uppercase">
              {(user.name || user.email || 'U')[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-slate-500 capitalize truncate">
              {user.role}
            </p>
          </div>
          <Link href="/dashboard/configuracoes">
            <Settings className="w-4 h-4 text-slate-600 hover:text-slate-400 transition-colors" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

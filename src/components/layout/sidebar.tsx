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
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getModulesForRole } from '@/lib/permissions'

// Definir grupos de módulos
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
    name: 'OPERAÇÕES',
    icon: Briefcase,
    modules: [
      { name: 'Pedidos', path: '/dashboard/pedidos', icon: ShoppingCart },
      { name: 'Estoque', path: '/dashboard/estoque', icon: Package },
      { name: 'Contratos', path: '/dashboard/contratos', icon: FileText },
      { name: 'Rastreamento', path: '/dashboard/rastreamento', icon: MapPin },
    ]
  },
  {
    id: 'financial',
    name: 'FINANCEIRO',
    icon: DollarSign,
    modules: [
      { name: 'Financeiro', path: '/dashboard/financeiro', icon: DollarSign },
      { name: 'Custos', path: '/dashboard/custos', icon: Target },
      { name: 'Centro de Custos', path: '/dashboard/centro-custos', icon: Warehouse },
      { name: 'Planejamento Financeiro', path: '/dashboard/planejamento-financeiro', icon: Calendar },
    ]
  },
  {
    id: 'fleet',
    name: 'FROTA',
    icon: Truck,
    modules: [
      { name: 'Veículos', path: '/dashboard/veiculos', icon: Truck },
      { name: 'Motoristas', path: '/dashboard/motoristas', icon: Users },
      { name: 'Manutenção', path: '/dashboard/manutencao', icon: Wrench },
    ]
  },
  {
    id: 'fiscal',
    name: 'FISCAL',
    icon: FileText,
    modules: [
      { name: 'Fiscal', path: '/dashboard/fiscal', icon: FileText },
      { name: 'Documentos', path: '/dashboard/documentos', icon: FolderOpen },
      { name: 'Auditoria', path: '/dashboard/auditoria', icon: Search },
    ]
  },
  {
    id: 'analysis',
    name: 'ANÁLISE',
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
    name: 'ADMINISTRAÇÃO',
    icon: Settings,
    modules: [
      { name: 'Supervisores', path: '/dashboard/supervisores', icon: Users },
      { name: 'Configurações', path: '/dashboard/configuracoes', icon: Settings },
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['operations'])
  
  // Se não há usuário logado, não mostra nada
  if (!user?.role) {
    return null
  }

  // Obtém os módulos permitidos para o perfil do usuário
  const allowedModules = getModulesForRole(user.role)
  const allowedPaths = allowedModules.map(m => m.path)
  
  // Debug: Log do role e módulos permitidos
  console.log('[Sidebar] User role:', user.role)
  console.log('[Sidebar] Allowed paths:', allowedPaths)

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Verificar se algum módulo do grupo está ativo
  const isGroupActive = (group: ModuleGroup) => {
    return group.modules.some(module => pathname === module.path)
  }

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 pegasus-gradient rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pegasus</h1>
            <p className="text-xs text-gray-500">Gestão Logística</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-3 space-y-2">
          {/* Dashboard - Sempre visível */}
          <Link
            href="/dashboard"
            className={cn(
              'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group',
              pathname === '/dashboard'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <LayoutDashboard 
              className={cn(
                'w-5 h-5 mr-3 transition-colors',
                pathname === '/dashboard' ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            Dashboard
          </Link>

          {/* Divider */}
          <div className="py-2">
            <div className="border-t border-gray-200"></div>
          </div>

          {/* Grupos de Módulos */}
          {moduleGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.id)
            const hasActiveModule = isGroupActive(group)
            const GroupIcon = group.icon
            
            // Filtrar módulos permitidos
            const visibleModules = group.modules.filter(module => 
              allowedPaths.includes(module.path)
            )

            // Se não há módulos visíveis, não mostrar o grupo
            if (visibleModules.length === 0) return null

            return (
              <div key={group.id} className="space-y-1">
                {/* Cabeçalho do Grupo */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-colors',
                    hasActiveModule
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center">
                    <GroupIcon className="w-4 h-4 mr-2" />
                    {group.name}
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {/* Módulos do Grupo */}
                {isExpanded && (
                  <div className="space-y-0.5 ml-3 pl-3 border-l-2 border-gray-200">
                    {visibleModules.map((module) => {
                      const ModuleIcon = module.icon
                      const isActive = pathname === module.path

                      return (
                        <Link
                          key={module.path}
                          href={module.path}
                          className={cn(
                            'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <ModuleIcon 
                            className={cn(
                              'w-4 h-4 mr-3 transition-colors',
                              isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                            )}
                          />
                          {module.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || user.email}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
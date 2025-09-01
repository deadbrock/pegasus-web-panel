'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getModulesForRole } from '@/lib/permissions'

// Mapeamento de ícones para os módulos
const iconMap = {
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
  Target
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Se não há usuário logado, não mostra nada
  if (!user?.role) {
    return null
  }

  // Obtém os módulos permitidos para o perfil do usuário
  const allowedModules = getModulesForRole(user.role)

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
        <div className="px-3 space-y-1">
          {allowedModules.map((module) => {
            const IconComponent = iconMap[module.icon as keyof typeof iconMap] || LayoutDashboard
            const isActive = pathname === module.path
            
            return (
              <Link
                key={module.path}
                href={module.path}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <IconComponent 
                  className={cn(
                    'w-5 h-5 mr-3 transition-colors',
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {module.name}
              </Link>
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
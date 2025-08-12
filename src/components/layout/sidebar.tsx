'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Wrench, 
  MapPin, 
  FileText, 
  TrendingUp,
  Users,
  Truck,
  Package,
  Search,
  Settings,
  BarChart3,
  Calculator,
  FileCheck,
  Shield,
  Gamepad2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    title: 'Contratos',
    icon: FileText,
    href: '/dashboard/contratos',
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    title: 'Estoque',
    icon: Package,
    href: '/dashboard/estoque',
  },
  {
    title: 'Manutenção',
    icon: Wrench,
    href: '/dashboard/manutencao',
  },
  {
    title: 'Rastreamento',
    icon: MapPin,
    href: '/dashboard/rastreamento',
  },
  {
    title: 'Veículos',
    icon: Truck,
    href: '/dashboard/veiculos',
  },
  {
    title: 'Motoristas',
    icon: Users,
    href: '/dashboard/motoristas',
  },
  {
    title: 'Pedidos',
    icon: Package,
    href: '/dashboard/pedidos',
  },
  {
    title: 'Fiscal',
    icon: FileText,
    href: '/dashboard/fiscal',
  },
  {
    title: 'Analytics',
    icon: TrendingUp,
    href: '/dashboard/analytics',
  },
  {
    title: 'Custos',
    icon: Calculator,
    href: '/dashboard/custos',
  },
  {
    title: 'Auditoria',
    icon: Shield,
    href: '/dashboard/auditoria',
  },
  {
    title: 'Documentos',
    icon: FileCheck,
    href: '/dashboard/documentos',
  },
  {
    title: 'Gamificação',
    icon: Gamepad2,
    href: '/dashboard/gamificacao',
  },
  {
    title: 'Planejamento',
    icon: TrendingUp,
    href: '/dashboard/planejamento-financeiro',
  },
  {
    title: 'Relatórios',
    icon: BarChart3,
    href: '/dashboard/relatorios',
  },
  {
    title: 'Configurações',
    icon: Settings,
    href: '/dashboard/configuracoes',
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 pegasus-gradient rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-white" />
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
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5 mr-3 transition-colors',
                    isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.title}
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
              Admin
            </p>
            <p className="text-xs text-gray-500 truncate">
              Sistema Pegasus
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
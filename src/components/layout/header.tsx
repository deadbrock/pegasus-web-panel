'use client'

import { Search, Bell, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

function getBreadcrumbFromPath(path: string): string {
  const pathMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/manutencao': 'Manutenção',
    '/dashboard/rastreamento': 'Rastreamento',
    '/dashboard/veiculos': 'Veículos',
    '/dashboard/motoristas': 'Motoristas',
    '/dashboard/pedidos': 'Pedidos',
    '/dashboard/fiscal': 'Fiscal',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/custos': 'Custos',
    '/dashboard/auditoria': 'Auditoria',
    '/dashboard/documentos': 'Documentos',
    '/dashboard/gamificacao': 'Gamificação',
    '/dashboard/relatorios': 'Relatórios',
    '/dashboard/configuracoes': 'Configurações',
  }
  
  return pathMap[path] || 'Dashboard'
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const currentPage = getBreadcrumbFromPath(pathname)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {currentPage}
        </h1>
        <div className="hidden sm:flex items-center text-sm text-gray-500">
          <span>Sistema Pegasus</span>
          <span className="mx-2">/</span>
          <span>{currentPage}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Pesquisar..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            onKeyDown={(e) => {
              const target = e.target as HTMLInputElement
              if (e.key === 'Enter' && target.value.trim()) {
                router.push(`/dashboard/relatorios?search=${encodeURIComponent(target.value.trim())}`)
              }
            }}
          />
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2 text-sm">
              <div className="font-medium">Notificações</div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-gray-50">3 alertas críticos na Auditoria</div>
                <div className="p-2 rounded bg-gray-50">2 notas fiscais pendentes</div>
                <div className="p-2 rounded bg-gray-50">Pedidos aguardando aprovação</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Settings */}
        <Link href="/dashboard/configuracoes">
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        {/* User Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="text-sm space-y-2">
              <div className="font-medium">Minha Conta</div>
              <Link className="block hover:underline" href="/dashboard/configuracoes">Configurações</Link>
              <button className="text-left w-full hover:underline" onClick={() => {
                try { localStorage.removeItem('pegasus-web-auth'); } catch {}
                router.push('/')
              }}>Sair</button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  )
} 
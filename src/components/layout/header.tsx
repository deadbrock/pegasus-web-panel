'use client'

import { Search, Bell, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { fetchMyNotifications, subscribeMyNotifications, UserNotification } from '@/services/notificationsService'
import { supabase } from '@/lib/supabaseClient'
import { HeaderAuth } from '@/components/layout/header-auth'

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
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unread, setUnread] = useState<number>(0)

  useEffect(() => {
    let unsub: (() => void) | null = null
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id
      if (!uid) return
      const list = await fetchMyNotifications(uid)
      setNotifications(list)
      setUnread(list.length)
      unsub = subscribeMyNotifications(uid, async () => {
        const latest = await fetchMyNotifications(uid)
        setNotifications(latest)
        setUnread(latest.length)
      })
    }
    run()
    return () => { if (unsub) unsub() }
  }, [])

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
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {unread}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2 text-sm">
              <div className="font-medium">Notificações</div>
              <div className="space-y-2 max-h-80 overflow-auto">
                {notifications.length === 0 && (
                  <div className="p-2 text-gray-500">Sem notificações</div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 rounded bg-gray-50">
                    <div className="font-medium">{n.title}</div>
                    <div className="text-gray-700">{n.message}</div>
                    {n.payload?.matches?.length ? (
                      <div className="mt-1 text-xs text-gray-500">{n.payload.matches.length} ocorrência(s)</div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Auth */}
        <HeaderAuth />
      </div>
    </header>
  )
} 
'use client'

import { Search, Bell, Plus, Package, DollarSign, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { fetchMyNotifications, subscribeMyNotifications, UserNotification } from '../../services/notificationsService'
import { supabase } from '../../lib/supabaseClient'
import { HeaderAuth } from '@/components/layout/header-auth'
import { cn } from '@/lib/utils'

const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  '/dashboard':                      { label: 'Dashboard' },
  '/dashboard/manutencao':           { label: 'Manutenção',       parent: 'Frota' },
  '/dashboard/rastreamento':         { label: 'Rastreamento',     parent: 'Operações' },
  '/dashboard/veiculos':             { label: 'Veículos',         parent: 'Frota' },
  '/dashboard/motoristas':           { label: 'Motoristas',       parent: 'Frota' },
  '/dashboard/pedidos':              { label: 'Pedidos',          parent: 'Operações' },
  '/dashboard/fiscal':               { label: 'Fiscal',           parent: 'Fiscal' },
  '/dashboard/analytics':            { label: 'Analytics',        parent: 'Análise' },
  '/dashboard/custos':               { label: 'Custos',           parent: 'Financeiro' },
  '/dashboard/centro-custos':        { label: 'Centro de Custos', parent: 'Financeiro' },
  '/dashboard/auditoria':            { label: 'Auditoria',        parent: 'Fiscal' },
  '/dashboard/documentos':           { label: 'Documentos',       parent: 'Fiscal' },
  '/dashboard/gamificacao':          { label: 'Gamificação',      parent: 'Análise' },
  '/dashboard/relatorios':           { label: 'Relatórios',       parent: 'Análise' },
  '/dashboard/data-hub':             { label: 'Data Hub',         parent: 'Análise' },
  '/dashboard/forecast':             { label: 'Forecast',         parent: 'Análise' },
  '/dashboard/financeiro':           { label: 'Financeiro',       parent: 'Financeiro' },
  '/dashboard/estoque':              { label: 'Estoque',          parent: 'Operações' },
  '/dashboard/contratos':            { label: 'Contratos',        parent: 'Operações' },
  '/dashboard/supervisores':         { label: 'Supervisores',     parent: 'Administração' },
  '/dashboard/configuracoes-periodo':{ label: 'Período de Pedidos',parent: 'Administração' },
  '/dashboard/configuracoes':        { label: 'Configurações',    parent: 'Administração' },
  '/dashboard/planejamento':         { label: 'Planejamento',     parent: 'Análise' },
  '/dashboard/planejamento-financeiro': { label: 'Plan. Financeiro', parent: 'Financeiro' },
  '/dashboard/centro-custos/diarias':{ label: 'Diárias',          parent: 'Centro de Custos' },
  '/gestao-adm/contratos':            { label: 'Contratos',        parent: 'Gestão ADM' },
}

const quickActions = [
  { label: 'Novo Custo',    icon: DollarSign, href: '/dashboard/custos' },
  { label: 'Novo Pedido',   icon: Package,    href: '/dashboard/pedidos' },
  { label: 'Novo Contrato', icon: FileText,   href: '/dashboard/contratos' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const crumb = breadcrumbMap[pathname] ?? { label: 'Dashboard' }

  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  useEffect(() => {
    let unsub: (() => void) | null = null
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.id) return
      const list = await fetchMyNotifications(user.id)
      setNotifications(list)
      setUnread(list.length)
      unsub = subscribeMyNotifications(user.id, async () => {
        const latest = await fetchMyNotifications(user.id)
        setNotifications(latest)
        setUnread(latest.length)
      })
    }
    run()
    return () => { if (unsub) unsub() }
  }, [])

  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 gap-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {crumb.parent && (
          <>
            <span className="text-sm text-slate-400 hidden sm:block">{crumb.parent}</span>
            <span className="text-slate-300 hidden sm:block">/</span>
          </>
        )}
        <h1 className="text-sm font-semibold text-slate-800 truncate">{crumb.label}</h1>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && searchValue.trim()) {
                router.push(`/dashboard/relatorios?search=${encodeURIComponent(searchValue.trim())}`)
                setSearchValue('')
              }
            }}
            className={cn(
              'pl-9 pr-3 py-1.5 w-52 rounded-lg text-sm border',
              'border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white',
              'transition-all duration-150'
            )}
          />
        </div>

        {/* Quick actions */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-1.5 text-xs h-8 px-3 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50">
              <Plus className="w-3.5 h-3.5" />
              Novo
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-52 p-1.5" align="end">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Ações rápidas
            </p>
            {quickActions.map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <a.icon className="w-4 h-4 text-blue-500" />
                {a.label}
              </Link>
            ))}
          </PopoverContent>
        </Popover>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Notificações</span>
              {unread > 0 && (
                <span className="text-xs bg-rose-50 text-rose-600 font-medium px-2 py-0.5 rounded-full">
                  {unread} nova{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">Nenhuma notificação</p>
                </div>
              ) : notifications.map(n => (
                <div key={n.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                  <p className="text-sm font-medium text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                  {n.payload?.matches?.length ? (
                    <p className="text-xs text-slate-400 mt-1">{n.payload.matches.length} ocorrência(s)</p>
                  ) : null}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-5 bg-slate-200" />

        {/* Auth */}
        <HeaderAuth />
      </div>
    </header>
  )
}

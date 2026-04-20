import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { DashboardGuard } from '../../components/auth/dashboard-guard'
import { RouteGuard } from '../../components/auth/route-guard'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardGuard>
      <RouteGuard>
        <div className="flex h-screen bg-slate-50 overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </RouteGuard>
    </DashboardGuard>
  )
}

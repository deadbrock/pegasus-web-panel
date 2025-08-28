import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { DashboardGuard } from '../../components/auth/dashboard-guard'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <DashboardGuard>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  )
}
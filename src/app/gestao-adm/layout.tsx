import { AdmSidebar } from '@/components/gestao-adm/adm-sidebar'
import { AdmGuard } from '@/components/gestao-adm/adm-guard'

interface AdmLayoutProps {
  children: React.ReactNode
}

export default function GestaoAdmLayout({ children }: AdmLayoutProps) {
  return (
    <AdmGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <AdmSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdmGuard>
  )
}

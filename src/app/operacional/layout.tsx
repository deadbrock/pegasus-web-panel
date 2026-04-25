import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Operacional · Pegasus',
  description: 'Portal operacional de pedidos de materiais.',
}

export default function PedidosMateriaisLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pegasus - Sistema de Gestão Logística',
  description: 'Sistema completo de gestão logística com rastreamento, manutenção e analytics',
  keywords: ['logística', 'gestão', 'rastreamento', 'manutenção', 'transportes'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Plus,
  Wrench,
  Truck,
  Package,
  Users,
  FileText,
  BarChart3
} from 'lucide-react'

const quickActions = [
  {
    title: 'Nova Manutenção',
    icon: Wrench,
    href: '/dashboard/manutencao/nova',
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
  },
  {
    title: 'Cadastrar Veículo',
    icon: Truck,
    href: '/dashboard/veiculos/novo',
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
  },
  {
    title: 'Novo Pedido',
    icon: Package,
    href: '/dashboard/pedidos/novo',
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
  },
  {
    title: 'Novo Motorista',
    icon: Users,
    href: '/dashboard/motoristas/novo',
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  },
  {
    title: 'Gerar Relatório',
    icon: BarChart3,
    href: '/dashboard/relatorios',
    color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
  },
  {
    title: 'Nova Nota Fiscal',
    icon: FileText,
    href: '/dashboard/fiscal/nova',
    color: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="ghost"
                  className={`w-full h-auto p-4 flex flex-col items-center gap-2 ${action.color}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.title}
                  </span>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 
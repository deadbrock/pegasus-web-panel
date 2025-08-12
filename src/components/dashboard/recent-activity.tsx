import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Activity,
  Wrench,
  Truck,
  Package,
  Users,
  FileText
} from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

// Mock data - em produção virá do Supabase
const recentActivities = [
  {
    id: 1,
    type: 'maintenance',
    title: 'Manutenção concluída - ABC-1234',
    description: 'Troca de óleo e filtros realizada',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
    icon: Wrench,
    color: 'text-orange-600 bg-orange-50'
  },
  {
    id: 2,
    type: 'delivery',
    title: 'Entrega realizada',
    description: 'Pedido #1056 entregue com sucesso',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min atrás
    icon: Package,
    color: 'text-green-600 bg-green-50'
  },
  {
    id: 3,
    type: 'vehicle',
    title: 'Novo veículo cadastrado',
    description: 'DEF-5678 adicionado à frota',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
    icon: Truck,
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: 4,
    type: 'driver',
    title: 'Motorista conectado',
    description: 'João Silva iniciou rota #45',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3h atrás
    icon: Users,
    color: 'text-purple-600 bg-purple-50'
  },
  {
    id: 5,
    type: 'fiscal',
    title: 'Nota fiscal emitida',
    description: 'NF #8901 processada automaticamente',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
    icon: FileText,
    color: 'text-pink-600 bg-pink-50'
  }
]

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) {
    return `${minutes}m atrás`
  } else if (hours < 24) {
    return `${hours}h atrás`
  } else {
    return `${days}d atrás`
  }
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Atividade Recente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {getRelativeTime(activity.timestamp)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 pt-4 border-t">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            Ver todas as atividades
          </button>
        </div>
      </CardContent>
    </Card>
  )
} 
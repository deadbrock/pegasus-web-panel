import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'

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
        <div className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
          <Activity className="w-8 h-8 mb-2" />
          <p className="text-sm">Nenhuma atividade recente</p>
          <p className="text-xs mt-1">As atividades serão exibidas aqui</p>
        </div>
      </CardContent>
    </Card>
  )
}
'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react'

// Mock data para alertas críticos
const criticalAlerts = [
  {
    id: 1,
    title: 'Veículo ABC-1234 - Manutenção Vencida',
    description: 'Revisão preventiva vencida há 15 dias. Veículo em operação.',
    severity: 'critical',
    time: '2 horas atrás',
    action: 'Revisar Imediatamente'
  },
  {
    id: 2,
    title: 'CNH Vencida - João Silva',
    description: 'Motorista operando com CNH vencida há 5 dias.',
    severity: 'critical',
    time: '1 hora atrás',
    action: 'Suspender Operação'
  },
  {
    id: 3,
    title: 'Orçamento Combustível Ultrapassado',
    description: 'Meta mensal excedida em 25% no dia 15.',
    severity: 'high',
    time: '30 min atrás',
    action: 'Analisar Consumo'
  }
]

export function CriticalAlertsPanel() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 bg-red-50'
      case 'high':
        return 'border-l-orange-500 bg-orange-50'
      default:
        return 'border-l-yellow-500 bg-yellow-50'
    }
  }

  const getSeverityIcon = (severity: string) => {
    return severity === 'critical' ? 
      <AlertTriangle className="w-5 h-5 text-red-600" /> :
      <AlertTriangle className="w-5 h-5 text-orange-600" />
  }

  const handleAction = (alert: any) => {
    console.log('Executar ação para alerta:', alert)
  }

  if (criticalAlerts.length === 0) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">Nenhum alerta crítico encontrado</p>
        <p className="text-sm text-gray-500 mt-1">Sistema operando dentro dos parâmetros normais</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {criticalAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor(alert.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon(alert.severity)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {alert.title}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {alert.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant={alert.severity === 'critical' ? 'destructive' : 'default'}
              onClick={() => handleAction(alert)}
              className="ml-3"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {alert.action}
            </Button>
          </div>
        </div>
      ))}
      
      {/* Resumo */}
      <div className="pt-3 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {criticalAlerts.length} alertas críticos ativos
          </span>
          <Button variant="outline" size="sm">
            Ver Todos os Alertas
          </Button>
        </div>
      </div>
    </div>
  )
}
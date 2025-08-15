'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchFindings, updateFinding, type AuditFindingRecord } from '@/services/auditoriaService'

export function CriticalAlertsPanel() {
  const [alerts, setAlerts] = useState<AuditFindingRecord[]>([])
  const load = async () => {
    const list = await fetchFindings({ severidade: 'Crítica', limit: 5 })
    setAlerts(list)
  }
  useEffect(() => { load() }, [])

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

  const handleAction = async (alert: AuditFindingRecord) => {
    const title = alert.descricao
    if (title.toLowerCase().includes('manuten')) {
      await updateFinding(String(alert.id), { status: 'Em Análise' })
    } else if (title.toLowerCase().includes('cnh') || title.toLowerCase().includes('document')) {
      await updateFinding(String(alert.id), { status: 'Pendente' })
      // Aqui poderia disparar integração externa para suspender operação
    } else if (title.toLowerCase().includes('combust')) {
      await updateFinding(String(alert.id), { status: 'Em Análise' })
    }
    load()
  }

  if (alerts.length === 0) {
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
      {alerts.map((alert) => (
        <div
          key={String(alert.id)}
          className={`border-l-4 p-4 rounded-r-lg ${getSeverityColor('critical')}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getSeverityIcon('critical')}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{alert.area}</h4>
                <p className="text-sm text-gray-700 mb-2">
                  {alert.descricao}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(alert.data_ultima_ocorrencia).toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant={'destructive'}
              onClick={() => handleAction(alert)}
              className="ml-3"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Revisar Imediatamente
            </Button>
          </div>
        </div>
      ))}
      
      {/* Resumo */}
      <div className="pt-3 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {alerts.length} alertas críticos ativos
          </span>
          <Button variant="outline" size="sm">
            Ver Todos os Alertas
          </Button>
        </div>
      </div>
    </div>
  )
}
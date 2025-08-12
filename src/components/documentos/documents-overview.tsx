'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertTriangle, Clock, FileCheck } from 'lucide-react'

// Mock data para overview
const overviewData = {
  total: 89,
  validos: 76,
  vencendo: 8,
  vencidos: 5,
  compliance: 85.4
}

export function DocumentsOverview() {
  const getPercentage = (value: number) => {
    return ((value / overviewData.total) * 100).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Status Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium">Documentos Válidos</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-green-600">{overviewData.validos}</span>
            <span className="text-sm text-gray-600 ml-2">({getPercentage(overviewData.validos)}%)</span>
          </div>
        </div>
        <Progress value={parseFloat(getPercentage(overviewData.validos))} className="h-3" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span className="font-medium">Vencendo (30 dias)</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-orange-600">{overviewData.vencendo}</span>
            <span className="text-sm text-gray-600 ml-2">({getPercentage(overviewData.vencendo)}%)</span>
          </div>
        </div>
        <Progress value={parseFloat(getPercentage(overviewData.vencendo))} className="h-3" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium">Documentos Vencidos</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-red-600">{overviewData.vencidos}</span>
            <span className="text-sm text-gray-600 ml-2">({getPercentage(overviewData.vencidos)}%)</span>
          </div>
        </div>
        <Progress value={parseFloat(getPercentage(overviewData.vencidos))} className="h-3" />
      </div>

      {/* Compliance Score */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span className="font-medium">Taxa de Compliance</span>
          </div>
          <span className="font-bold text-blue-600">{overviewData.compliance}%</span>
        </div>
        <Progress value={overviewData.compliance} className="h-3" />
        <p className="text-xs text-gray-500 mt-1">Meta: 90%</p>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{overviewData.total}</p>
          <p className="text-sm text-gray-600">Total de Documentos</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.round((overviewData.validos / overviewData.total) * 100)}%
          </p>
          <p className="text-sm text-gray-600">Em Conformidade</p>
        </div>
      </div>

      {/* Action Items */}
      <div className="pt-4 border-t">
        <h4 className="font-medium mb-3">Próximas Ações</h4>
        <div className="space-y-2">
          {overviewData.vencidos > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span>Renovar {overviewData.vencidos} documentos vencidos</span>
            </div>
          )}
          
          {overviewData.vencendo > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span>Acompanhar {overviewData.vencendo} documentos vencendo</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Configurar alertas automáticos</span>
          </div>
        </div>
      </div>
    </div>
  )
}
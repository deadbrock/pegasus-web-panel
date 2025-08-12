'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertTriangle, Target } from 'lucide-react'

interface ComplianceScoreCardProps {
  score: number
}

export function ComplianceScoreCard({ score }: ComplianceScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { status: 'Excelente', icon: CheckCircle, color: 'text-green-600' }
    if (score >= 80) return { status: 'Bom', icon: CheckCircle, color: 'text-blue-600' }
    if (score >= 70) return { status: 'Regular', icon: AlertTriangle, color: 'text-yellow-600' }
    return { status: 'Crítico', icon: AlertTriangle, color: 'text-red-600' }
  }

  const scoreInfo = getScoreStatus(score)
  const StatusIcon = scoreInfo.icon

  return (
    <div className="text-center space-y-4">
      {/* Score Principal */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Círculo de fundo */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke="#e5e7eb" 
              strokeWidth="8" 
              fill="none"
            />
            {/* Círculo de progresso */}
            <circle 
              cx="50" 
              cy="50" 
              r="40" 
              stroke={score >= 90 ? '#10b981' : score >= 80 ? '#3b82f6' : score >= 70 ? '#f59e0b' : '#ef4444'} 
              strokeWidth="8" 
              fill="none"
              strokeDasharray={`${score * 2.51}, 251`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </span>
            <StatusIcon className={`w-5 h-5 mt-1 ${scoreInfo.color}`} />
          </div>
        </div>
      </div>

      {/* Status e Descrição */}
      <div>
        <p className={`text-lg font-semibold ${scoreInfo.color}`}>
          {scoreInfo.status}
        </p>
        <p className="text-sm text-gray-600">
          Índice Geral de Conformidade
        </p>
      </div>

      {/* Meta e Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4 text-gray-500" />
            Meta: 90%
          </span>
          <span className={getScoreColor(score)}>
            {score >= 90 ? `+${(score - 90).toFixed(1)}%` : `${(score - 90).toFixed(1)}%`}
          </span>
        </div>
        <Progress value={Math.min(score, 100)} className="h-2" />
      </div>

      {/* Detalhamento */}
      <div className="pt-3 border-t text-left">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-500">Última Auditoria</p>
            <p className="font-medium">Hoje</p>
          </div>
          <div>
            <p className="text-gray-500">Tendência</p>
            <p className={`font-medium ${score >= 85 ? 'text-green-600' : 'text-red-600'}`}>
              {score >= 85 ? '↗ Melhorando' : '↘ Atenção'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Apontamentos</p>
            <p className="font-medium">23 ativos</p>
          </div>
          <div>
            <p className="text-gray-500">Resolução</p>
            <p className="font-medium text-blue-600">89.4%</p>
          </div>
        </div>
      </div>

      {/* Breakdown por Categoria */}
      <div className="pt-3 border-t">
        <p className="text-xs font-medium text-gray-700 mb-2">Breakdown por Área</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Manutenção</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full w-[96%]"></div>
              </div>
              <span className="text-green-600 font-medium">96%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Documentos</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div className="bg-yellow-500 h-1 rounded-full w-[85%]"></div>
              </div>
              <span className="text-yellow-600 font-medium">85%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Estoque</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full w-[92%]"></div>
              </div>
              <span className="text-green-600 font-medium">92%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span>Entregas</span>
            <div className="flex items-center gap-2">
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div className="bg-orange-500 h-1 rounded-full w-[88%]"></div>
              </div>
              <span className="text-orange-600 font-medium">88%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
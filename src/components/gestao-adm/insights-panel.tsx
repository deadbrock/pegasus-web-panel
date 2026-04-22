'use client'

import { cn } from '@/lib/utils'
import type { AdmInsight, AdmInsightTipo } from '@/types/adm-contratos'
import { ADM_INSIGHT_CONFIG } from '@/types/adm-contratos'
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
} from 'lucide-react'

const INSIGHT_ICONS: Record<AdmInsightTipo, React.ElementType> = {
  positivo:    TrendingUp,
  negativo:    TrendingDown,
  atencao:     AlertTriangle,
  oportunidade:Lightbulb,
}

interface InsightsPanelProps {
  insights: AdmInsight[]
  compact?: boolean
}

export function InsightsPanel({ insights, compact = false }: InsightsPanelProps) {
  if (!insights.length) return null

  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      {insights.map((insight, idx) => {
        const cfg  = ADM_INSIGHT_CONFIG[insight.tipo]
        const Icon = INSIGHT_ICONS[insight.tipo]

        if (compact) {
          return (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-2.5 px-3 py-2 rounded-lg border text-xs',
                cfg.bg, cfg.border
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', cfg.iconColor)} />
              <div>
                <span className={cn('font-semibold', cfg.text)}>{insight.titulo}</span>
                <span className={cn('ml-1.5 opacity-70', cfg.text)}>{insight.descricao}</span>
              </div>
            </div>
          )
        }

        return (
          <div
            key={idx}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4',
              cfg.bg, cfg.border
            )}
          >
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.bg)}>
              <Icon className={cn('w-4 h-4', cfg.iconColor)} />
            </div>
            <div>
              <p className={cn('text-sm font-semibold leading-tight', cfg.text)}>
                {insight.titulo}
              </p>
              <p className={cn('text-xs mt-0.5 leading-relaxed opacity-80', cfg.text)}>
                {insight.descricao}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

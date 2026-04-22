'use client'

import { cn } from '@/lib/utils'
import type { AdmAlerta, AdmAlertaSeveridade } from '@/types/adm-contratos'
import { ADM_ALERTA_SEVERIDADE_CONFIG } from '@/types/adm-contratos'
import {
  AlertTriangle, AlertCircle, Info, Clock,
  TrendingDown, DollarSign, Wrench, RotateCcw, Activity,
} from 'lucide-react'

const ALERTA_ICONS: Record<string, React.ElementType> = {
  vencimento_critico:            Clock,
  vencimento_proximo:            Clock,
  contrato_vencido:              AlertCircle,
  prejuizo:                      TrendingDown,
  margem_baixa:                  DollarSign,
  custo_crescente:               TrendingDown,
  sem_dados_financeiros:         Activity,
  sem_movimentacao:              Activity,
  alta_incidencia_ocorrencias:   Wrench,
  reajuste_pendente:             RotateCcw,
}

const SEVERITY_ORDER: Record<AdmAlertaSeveridade, number> = {
  critica: 0, alta: 1, media: 2, info: 3,
}

interface AlertsPanelProps {
  alertas: AdmAlerta[]
  compact?: boolean
  maxVisible?: number
}

export function AlertsPanel({ alertas, compact = false, maxVisible }: AlertsPanelProps) {
  if (!alertas.length) return null

  const sorted  = [...alertas].sort((a, b) =>
    SEVERITY_ORDER[a.severidade] - SEVERITY_ORDER[b.severidade]
  )
  const visible = maxVisible ? sorted.slice(0, maxVisible) : sorted
  const hidden  = alertas.length - visible.length

  return (
    <div className="space-y-2">
      {visible.map((alerta, idx) => {
        const cfg  = ADM_ALERTA_SEVERIDADE_CONFIG[alerta.severidade]
        const Icon = ALERTA_ICONS[alerta.tipo] ?? AlertTriangle

        if (compact) {
          return (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-xs',
                cfg.bg, cfg.border
              )}
            >
              <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', cfg.text)} />
              <div className="flex-1 min-w-0">
                <span className={cn('font-semibold', cfg.text)}>{alerta.titulo}</span>
                {alerta.acao && (
                  <span className="text-slate-400 ml-1.5">— {alerta.acao}</span>
                )}
              </div>
              <span
                className={cn(
                  'shrink-0 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
                  cfg.bg, cfg.text
                )}
              >
                {ADM_ALERTA_SEVERIDADE_CONFIG[alerta.severidade].label}
              </span>
            </div>
          )
        }

        return (
          <div
            key={idx}
            className={cn(
              'rounded-xl border p-4 space-y-1',
              cfg.bg, cfg.border
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5', cfg.bg)}>
                <Icon className={cn('w-4 h-4', cfg.text)} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={cn('text-sm font-semibold', cfg.text)}>{alerta.titulo}</p>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                      cfg.bg, cfg.text, cfg.border
                    )}
                  >
                    {ADM_ALERTA_SEVERIDADE_CONFIG[alerta.severidade].label}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {alerta.descricao}
                </p>
                {alerta.acao && (
                  <p className={cn('text-xs font-medium mt-1.5', cfg.text)}>
                    → {alerta.acao}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {hidden > 0 && (
        <p className="text-xs text-slate-400 text-center pt-1">
          + {hidden} alerta{hidden > 1 ? 's' : ''} adicional{hidden > 1 ? 'is' : ''}
        </p>
      )}
    </div>
  )
}

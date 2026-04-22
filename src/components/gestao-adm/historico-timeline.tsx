'use client'

import { cn } from '@/lib/utils'
import type { AdmHistoricoContrato, AdmHistoricoTipoEvento } from '@/types/adm-contratos'
import { ADM_HISTORICO_LABELS, ADM_HISTORICO_COLORS } from '@/types/adm-contratos'
import {
  FilePlus2,
  FileEdit,
  RefreshCw,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Pencil,
} from 'lucide-react'

const HISTORICO_ICONS: Record<AdmHistoricoTipoEvento, React.ElementType> = {
  contrato_criado:       FilePlus2,
  contrato_editado:      FileEdit,
  status_alterado:       RefreshCw,
  reajuste_aplicado:     TrendingUp,
  financeiro_atualizado: BarChart3,
  manutencao_criada:     AlertTriangle,
  manutencao_concluida:  CheckCircle2,
  manutencao_editada:    Pencil,
}

function formatDateTime(isoString: string) {
  const d = new Date(isoString)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface HistoricoTimelineProps {
  items: AdmHistoricoContrato[]
  loading?: boolean
}

function SkeletonItem() {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
        <div className="w-px flex-1 bg-slate-100 mt-2" />
      </div>
      <div className="flex-1 pb-6 space-y-2 pt-1">
        <div className="h-4 bg-slate-100 rounded w-40 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded w-64 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded w-24 animate-pulse" />
      </div>
    </div>
  )
}

export function HistoricoTimeline({ items, loading }: HistoricoTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonItem key={i} />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <FilePlus2 className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium">Nenhum evento registrado</p>
        <p className="text-xs text-slate-300">
          O histórico será preenchido automaticamente conforme o contrato evolui.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {items.map((item, idx) => {
        const Icon = HISTORICO_ICONS[item.tipo_evento] ?? FileEdit
        const colors = ADM_HISTORICO_COLORS[item.tipo_evento] ?? ADM_HISTORICO_COLORS.contrato_editado
        const isLast = idx === items.length - 1

        return (
          <div key={item.id} className="flex gap-4">
            {/* Ícone + linha vertical */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center ring-2',
                  colors.ring
                )}
              >
                <Icon className={cn('w-3.5 h-3.5', colors.icon)} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-slate-100 mt-2 min-h-[1.5rem]" />
              )}
            </div>

            {/* Conteúdo */}
            <div className={cn('flex-1 pb-6 pt-0.5', isLast && 'pb-0')}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-tight">
                    {item.titulo}
                  </p>
                  <span className="text-xs text-slate-400 mt-0.5 block">
                    {ADM_HISTORICO_LABELS[item.tipo_evento]}
                  </span>
                </div>
                <span className="text-xs text-slate-400 shrink-0 mt-0.5">
                  {formatDateTime(item.created_at)}
                </span>
              </div>

              {item.descricao && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {item.descricao}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

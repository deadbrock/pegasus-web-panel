import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  description?: string
  iconColor?: 'blue' | 'emerald' | 'rose' | 'amber' | 'violet' | 'slate'
  loading?: boolean
  className?: string
}

const iconColorMap = {
  blue:    'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose:    'bg-rose-50 text-rose-600',
  amber:   'bg-amber-50 text-amber-600',
  violet:  'bg-violet-50 text-violet-600',
  slate:   'bg-slate-100 text-slate-500',
}

export function MetricCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  description,
  iconColor = 'blue',
  loading,
  className,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className={cn('pg-card p-5', className)}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2.5">
            <div className="pg-shimmer h-3 w-24 rounded" />
            <div className="pg-shimmer h-8 w-32 rounded" />
            <div className="pg-shimmer h-2.5 w-20 rounded" />
          </div>
          <div className="pg-shimmer w-10 h-10 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'pg-card p-5 hover:shadow-elevated transition-all duration-200 group',
      className
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums leading-none mb-2">
            {value}
          </p>
          <div className="flex items-center gap-2">
            {change && (
              <span className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                changeType === 'positive' && 'bg-emerald-50 text-emerald-700',
                changeType === 'negative' && 'bg-rose-50 text-rose-700',
                changeType === 'neutral'  && 'bg-slate-100 text-slate-500',
              )}>
                {changeType === 'positive' && <TrendingUp className="w-3 h-3" />}
                {changeType === 'negative' && <TrendingDown className="w-3 h-3" />}
                {changeType === 'neutral'  && <Minus className="w-3 h-3" />}
                {change}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-400 truncate">{description}</span>
            )}
          </div>
        </div>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          'transition-transform duration-200 group-hover:scale-105',
          iconColorMap[iconColor]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

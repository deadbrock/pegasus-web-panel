import { cn } from '@/lib/utils'
import type { AdmContratoStatus } from '@/types/adm-contratos'
import { ADM_STATUS_COLORS, ADM_STATUS_LABELS } from '@/types/adm-contratos'

interface ContractStatusBadgeProps {
  status: AdmContratoStatus
  size?: 'sm' | 'md'
}

export function ContractStatusBadge({ status, size = 'md' }: ContractStatusBadgeProps) {
  const colors = ADM_STATUS_COLORS[status] ?? ADM_STATUS_COLORS.encerrado
  const label = ADM_STATUS_LABELS[status] ?? status

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        colors.bg,
        colors.text,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      <span className={cn('rounded-full flex-shrink-0', colors.dot, size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5')} />
      {label}
    </span>
  )
}

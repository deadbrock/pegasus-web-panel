import { cn } from '@/lib/utils'
import type { AdmSaudeStatus, AdmSaudeContrato } from '@/types/adm-contratos'
import { ADM_SAUDE_CONFIG } from '@/types/adm-contratos'
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

const ICONS: Record<AdmSaudeStatus, React.ElementType> = {
  saudavel: ShieldCheck,
  atencao:  ShieldAlert,
  critico:  ShieldX,
}

interface ContractHealthBadgeProps {
  saude: AdmSaudeContrato
  size?: 'sm' | 'md'
  showScore?: boolean
}

export function ContractHealthBadge({
  saude,
  size = 'md',
  showScore = false,
}: ContractHealthBadgeProps) {
  const cfg  = ADM_SAUDE_CONFIG[saude.status]
  const Icon = ICONS[saude.status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium border',
        cfg.bg, cfg.text, cfg.border,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      )}
    >
      <Icon className={cn('flex-shrink-0', cfg.icon, size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {cfg.label}
      {showScore && (
        <span className="opacity-60 font-normal">{saude.score}</span>
      )}
    </span>
  )
}

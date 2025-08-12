import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  description?: string
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  description 
}: MetricCardProps) {
  return (
    <Card className="pegasus-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">
              {title}
            </p>
            <p className="pegasus-metric">
              {value}
            </p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-2">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            {change && (
              <div className={cn(
                'flex items-center text-xs font-medium',
                changeType === 'positive' && 'text-green-600',
                changeType === 'negative' && 'text-red-600',
                changeType === 'neutral' && 'text-gray-600'
              )}>
                {changeType === 'positive' && <TrendingUp className="w-3 h-3 mr-1" />}
                {changeType === 'negative' && <TrendingDown className="w-3 h-3 mr-1" />}
                {change}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
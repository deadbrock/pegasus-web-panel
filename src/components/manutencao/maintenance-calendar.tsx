'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Wrench, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { type Manutencao } from '@/lib/services/manutencoes-service'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** Retorna 'YYYY-MM-DD' de um Date sem fuso */
function toKey(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Gera todas as células do grid do mês (inclui dias do mês anterior/seguinte) */
function buildGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()   // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []

  // Dias do mês anterior para preencher início
  for (let i = 0; i < firstDay; i++) {
    const d = new Date(year, month, -firstDay + i + 1)
    cells.push(d)
  }

  // Dias do mês atual
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d))
  }

  // Completar até múltiplo de 7
  while (cells.length % 7 !== 0) {
    cells.push(new Date(year, month + 1, cells.length - firstDay - daysInMonth + 1))
  }

  return cells
}

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { bg: string; border: string; text: string; dot: string; icon: any }> = {
  'Agendada':     { bg: 'bg-blue-50',   border: 'border-blue-200',  text: 'text-blue-800',  dot: 'bg-blue-500',   icon: Clock },
  'Em Andamento': { bg: 'bg-yellow-50', border: 'border-yellow-200',text: 'text-yellow-800',dot: 'bg-yellow-500', icon: Wrench },
  'Pendente':     { bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-700',  dot: 'bg-gray-400',   icon: AlertCircle },
  'Concluída':    { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', dot: 'bg-green-500',  icon: CheckCircle2 },
  'Atrasada':     { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-800',   dot: 'bg-red-500',    icon: AlertCircle },
  'Cancelada':    { bg: 'bg-gray-50',   border: 'border-gray-200',  text: 'text-gray-500',  dot: 'bg-gray-300',   icon: XCircle },
}

const badgeVariants: Record<string, string> = {
  'Agendada':     'bg-blue-100 text-blue-800',
  'Em Andamento': 'bg-yellow-100 text-yellow-800',
  'Pendente':     'bg-gray-100 text-gray-700',
  'Concluída':    'bg-green-100 text-green-800',
  'Atrasada':     'bg-red-100 text-red-800',
  'Cancelada':    'bg-gray-100 text-gray-500',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MaintenanceCalendarProps {
  manutencoes?: Manutencao[]
}

export function MaintenanceCalendar({ manutencoes = [] }: MaintenanceCalendarProps) {
  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedKey, setSelectedKey] = useState<string>(toKey(today))

  // Indexar manutenções por data
  const byDate: Record<string, Manutencao[]> = {}
  for (const m of manutencoes) {
    const k = m.data_agendada?.substring(0, 10)
    if (k) {
      byDate[k] = byDate[k] ? [...byDate[k], m] : [m]
    }
  }

  const todayKey = toKey(today)
  const grid = buildGrid(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const selectedDate = selectedKey
    ? new Date(selectedKey + 'T12:00:00')
    : null
  const selectedMans = selectedKey ? (byDate[selectedKey] ?? []) : []

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* ── Calendário ── */}
      <div className="flex-shrink-0">

        {/* Navegação */}
        <div className="flex items-center justify-between mb-4 min-w-[280px]">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <span className="font-semibold text-gray-900 text-sm">
            {MESES[viewMonth]} {viewYear}
          </span>

          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-px">

          {/* Cabeçalho dos dias */}
          {DIAS_SEMANA.map(d => (
            <div key={d} className="h-8 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">{d}</span>
            </div>
          ))}

          {/* Células dos dias */}
          {grid.map((date, idx) => {
            if (!date) return <div key={idx} />

            const key = toKey(date)
            const isCurrentMonth = date.getMonth() === viewMonth
            const isToday = key === todayKey
            const isSelected = key === selectedKey
            const hasMans = !!byDate[key]?.length
            const mansCount = byDate[key]?.length ?? 0

            return (
              <button
                key={key + '-' + idx}
                onClick={() => setSelectedKey(key)}
                className={[
                  'relative h-10 w-full flex flex-col items-center justify-center rounded-md text-sm transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
                    : hasMans
                    ? 'bg-blue-50 text-gray-800 hover:bg-blue-100'
                    : isCurrentMonth
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-gray-50',
                ].join(' ')}
              >
                <span className="leading-none">{date.getDate()}</span>

                {/* Indicadores de manutenção */}
                {hasMans && (
                  <span
                    className={[
                      'absolute bottom-1 left-1/2 -translate-x-1/2',
                      'flex gap-px',
                    ].join(' ')}
                  >
                    {Array.from({ length: Math.min(mansCount, 3) }).map((_, i) => (
                      <span
                        key={i}
                        className={[
                          'block w-1 h-1 rounded-full',
                          isSelected ? 'bg-white' : 'bg-blue-500',
                        ].join(' ')}
                      />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Tem manutenção
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200 inline-block" />
            Hoje
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
            Selecionado
          </span>
        </div>
      </div>

      {/* ── Painel de detalhes ── */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          {selectedDate
            ? `Manutenções — ${selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}`
            : 'Selecione uma data'}
        </h3>

        {selectedMans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed">
            <Wrench className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm font-medium">Nenhuma manutenção nesta data</p>
            <p className="text-xs mt-1 text-gray-400">
              {byDate && Object.keys(byDate).length > 0
                ? 'Clique nos dias destacados para ver agendamentos'
                : 'Cadastre manutenções para visualizá-las aqui'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedMans.map((m) => {
              const cfg = statusConfig[m.status] ?? statusConfig['Pendente']
              const StatusIcon = cfg.icon
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-lg border ${cfg.bg} ${cfg.border} transition-shadow hover:shadow-sm`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-1.5 rounded-md ${cfg.bg} border ${cfg.border} shrink-0 mt-0.5`}>
                        <StatusIcon className={`w-4 h-4 ${cfg.text}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900">{m.veiculo_placa || 'Veículo N/A'}</p>
                          <span className="text-gray-400">·</span>
                          <p className="text-sm text-gray-600">{m.tipo}</p>
                        </div>
                        {m.descricao && (
                          <p className="text-sm text-gray-600 mt-0.5 truncate">{m.descricao}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                          {m.responsavel && (
                            <span>Responsável: <span className="font-medium text-gray-700">{m.responsavel}</span></span>
                          )}
                          {m.oficina && (
                            <span>Oficina: <span className="font-medium text-gray-700">{m.oficina}</span></span>
                          )}
                          {m.custo != null && (
                            <span>Custo: <span className="font-medium text-gray-700">
                              {m.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span></span>
                          )}
                          {m.quilometragem > 0 && (
                            <span>KM: <span className="font-medium text-gray-700">{m.quilometragem.toLocaleString('pt-BR')}</span></span>
                          )}
                        </div>
                        {m.observacoes && (
                          <p className="text-xs text-gray-400 mt-1 italic">{m.observacoes}</p>
                        )}
                      </div>
                    </div>

                    <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                      {m.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

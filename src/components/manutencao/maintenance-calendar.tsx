'use client'

import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { Manutencao } from '@/lib/services/manutencoes-service'

interface MaintenanceCalendarProps {
  manutencoes?: Manutencao[]
}

export function MaintenanceCalendar({ manutencoes = [] }: MaintenanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const hasMaintenanceOnDate = (date: Date) => {
    const dateKey = getDateKey(date)
    return manutencoes.some(m => m.data_agendada.startsWith(dateKey))
  }

  const getMaintenanceForDate = (date: Date) => {
    const dateKey = getDateKey(date)
    return manutencoes.filter(m => m.data_agendada.startsWith(dateKey))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada': return 'bg-blue-50 border-blue-200'
      case 'Em Andamento': return 'bg-yellow-50 border-yellow-200'
      case 'Pendente': return 'bg-gray-50 border-gray-200'
      case 'Concluída': return 'bg-green-50 border-green-200'
      case 'Atrasada': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="flex gap-6">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            maintenance: (date) => !!hasMaintenanceOnDate(date)
          }}
          modifiersStyles={{
            maintenance: {
              backgroundColor: '#dbeafe',
              color: '#1d4ed8',
              fontWeight: 'bold'
            }
          }}
        />
      </div>

      {selectedDate && (
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold">
            Manutenções para {selectedDate.toLocaleDateString('pt-BR')}
          </h3>
          
          {getMaintenanceForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getMaintenanceForDate(selectedDate).map((maintenance) => (
                <div 
                  key={maintenance.id} 
                  className={`p-3 border rounded-lg ${getStatusColor(maintenance.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{maintenance.veiculo_placa || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{maintenance.tipo}</p>
                      <p className="text-xs text-gray-500 mt-1">{maintenance.descricao}</p>
                    </div>
                    <Badge variant="outline">
                      {maintenance.status}
                    </Badge>
                  </div>
                  {maintenance.responsavel && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responsável: {maintenance.responsavel}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              Nenhuma manutenção agendada para esta data.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
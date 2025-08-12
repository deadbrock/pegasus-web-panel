'use client'

import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

// Mock data - substituir por dados do Supabase
const maintenanceDates = {
  '2024-01-15': [{ tipo: 'Preventiva', veiculo: 'BRA-2023' }],
  '2024-01-18': [{ tipo: 'Troca de Óleo', veiculo: 'BRA-2025' }],
  '2024-01-22': [{ tipo: 'Preventiva', veiculo: 'BRA-2021' }],
  '2024-01-25': [{ tipo: 'Revisão', veiculo: 'BRA-2024' }]
}

export function MaintenanceCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const hasMaintenanceOnDate = (date: Date) => {
    const dateKey = getDateKey(date)
    return maintenanceDates[dateKey as keyof typeof maintenanceDates]
  }

  const getMaintenanceForDate = (date: Date) => {
    const dateKey = getDateKey(date)
    return maintenanceDates[dateKey as keyof typeof maintenanceDates] || []
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
              {getMaintenanceForDate(selectedDate).map((maintenance, index) => (
                <div key={index} className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{maintenance.veiculo}</p>
                      <p className="text-sm text-gray-600">{maintenance.tipo}</p>
                    </div>
                    <Badge variant="outline">
                      Agendada
                    </Badge>
                  </div>
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
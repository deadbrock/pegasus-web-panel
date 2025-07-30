import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ManutencaoFilter } from '@/types/supabase'
import { manutencaoService } from '@/lib/services/manutencao-service'

interface ManutencaoFiltersProps {
  filters: ManutencaoFilter
  onFiltersChange: (filters: ManutencaoFilter) => void
}

export function ManutencaoFilters({ filters, onFiltersChange }: ManutencaoFiltersProps) {
  const [localFilters, setLocalFilters] = useState<ManutencaoFilter>(filters)

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => manutencaoService.getVeiculos(),
  })

  const handleFilterChange = (key: keyof ManutencaoFilter, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
  }

  const clearFilters = () => {
    const emptyFilters: ManutencaoFilter = {}
    setLocalFilters(emptyFilters)
    onFiltersChange(emptyFilters)
  }

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Agendada', label: 'Agendada' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Concluída', label: 'Concluída' },
    { value: 'Cancelada', label: 'Cancelada' },
  ]

  const tipoOptions = [
    { value: '', label: 'Todos os Tipos' },
    { value: 'Preventiva', label: 'Preventiva' },
    { value: 'Corretiva', label: 'Corretiva' },
    { value: 'Revisão', label: 'Revisão' },
    { value: 'Agendada', label: 'Agendada' },
    { value: 'Outro', label: 'Outro' },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro de Veículo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Veículo
          </label>
          <select
            value={localFilters.veiculo_id || ''}
            onChange={(e) => handleFilterChange('veiculo_id', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
          >
            <option value="">Todos os Veículos</option>
            {veiculos.map((veiculo) => (
              <option key={veiculo.id} value={veiculo.id}>
                {veiculo.placa} - {veiculo.modelo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Tipo */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Tipo
          </label>
          <select
            value={localFilters.tipo || ''}
            onChange={(e) => handleFilterChange('tipo', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
          >
            {tipoOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Data Início */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Data Início
          </label>
          <input
            type="date"
            value={localFilters.data_inicio || ''}
            onChange={(e) => handleFilterChange('data_inicio', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filtro de Data Fim */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Data Fim
          </label>
          <input
            type="date"
            value={localFilters.data_fim || ''}
            onChange={(e) => handleFilterChange('data_fim', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
          />
        </div>

        {/* Botões de Ação */}
        <div className="lg:col-span-3 flex items-end gap-2">
          <Button
            onClick={applyFilters}
            className="flex items-center gap-2 bg-pegasus-blue hover:bg-pegasus-blue/90"
          >
            <Search className="h-4 w-4" />
            Aplicar Filtros
          </Button>
          <Button
            onClick={clearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import { CalendarIcon, X } from 'lucide-react'
import { FiltroNotaFiscal } from '@/types/fiscal'
import { cn, formatDate } from '@/lib/utils'

interface FiscalFiltersProps {
  filters: FiltroNotaFiscal
  onFiltersChange: (filters: FiltroNotaFiscal) => void
  fornecedores: Array<{ id: string; nome: string }>
}

export function FiscalFilters({ filters, onFiltersChange, fornecedores }: FiscalFiltersProps) {
  const [dataInicioCalendar, setDataInicioCalendar] = useState<Date | undefined>(
    filters.dataInicio ? new Date(filters.dataInicio) : undefined
  )
  const [dataFimCalendar, setDataFimCalendar] = useState<Date | undefined>(
    filters.dataFim ? new Date(filters.dataFim) : undefined
  )

  const updateFilter = (key: keyof FiltroNotaFiscal, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      numero: '',
      serie: '',
      fornecedorId: '',
      status: '',
      tipo: '',
      dataInicio: '',
      dataFim: '',
      valorMin: undefined,
      valorMax: undefined
    })
    setDataInicioCalendar(undefined)
    setDataFimCalendar(undefined)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== undefined && value !== null
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg">Filtros</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Número e Série */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="numero" className="text-sm font-medium">
              Número
            </Label>
            <Input
              id="numero"
              placeholder="Ex: 123456"
              value={filters.numero}
              onChange={(e) => updateFilter('numero', e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serie" className="text-sm font-medium">
              Série
            </Label>
            <Input
              id="serie"
              placeholder="Ex: 001"
              value={filters.serie}
              onChange={(e) => updateFilter('serie', e.target.value)}
              className="h-9"
            />
          </div>
        </div>

        {/* Fornecedor */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Fornecedor</Label>
          <Select
            value={filters.fornecedorId}
            onValueChange={(value) => updateFilter('fornecedorId', value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os fornecedores</SelectItem>
              {fornecedores.map((fornecedor) => (
                <SelectItem key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status e Tipo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="processada">Processada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
                <SelectItem value="autorizada">Autorizada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo</Label>
            <Select
              value={filters.tipo}
              onValueChange={(value) => updateFilter('tipo', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="entrada">Entrada</SelectItem>
                <SelectItem value="saida">Saída</SelectItem>
                <SelectItem value="devolucao">Devolução</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Período */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Período</Label>
          <div className="grid grid-cols-2 gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 justify-start text-left font-normal",
                    !dataInicioCalendar && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataInicioCalendar ? formatDate(dataInicioCalendar) : "Data início"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataInicioCalendar}
                  onSelect={(date) => {
                    setDataInicioCalendar(date)
                    updateFilter('dataInicio', date ? date.toISOString().split('T')[0] : '')
                  }}
                  disabled={(date) =>
                    date > new Date() || (dataFimCalendar && date > dataFimCalendar)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-9 justify-start text-left font-normal",
                    !dataFimCalendar && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataFimCalendar ? formatDate(dataFimCalendar) : "Data fim"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dataFimCalendar}
                  onSelect={(date) => {
                    setDataFimCalendar(date)
                    updateFilter('dataFim', date ? date.toISOString().split('T')[0] : '')
                  }}
                  disabled={(date) =>
                    date > new Date() || (dataInicioCalendar && date < dataInicioCalendar)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Valor */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Faixa de Valor</Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Valor mínimo"
              value={filters.valorMin || ''}
              onChange={(e) => updateFilter('valorMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="h-9"
              step="0.01"
              min="0"
            />
            <Input
              type="number"
              placeholder="Valor máximo"
              value={filters.valorMax || ''}
              onChange={(e) => updateFilter('valorMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              className="h-9"
              step="0.01"
              min="0"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 
"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarIcon, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from '@/hooks/use-toast'

export interface VehicleInfo {
  id: number | string
  placa: string
  modelo: string
}

interface VehicleScheduleDialogProps {
  open: boolean
  onClose: () => void
  vehicle?: VehicleInfo | null
  onScheduled?: (data: any) => void
}

const maintenanceTypes = [
  'Preventiva',
  'Corretiva',
  'Revisão',
  'Troca de Óleo',
  'Pneus',
  'Outros',
]

export function VehicleScheduleDialog({ open, onClose, vehicle, onScheduled }: VehicleScheduleDialogProps) {
  const [formData, setFormData] = useState({
    tipo: '',
    descricao: '',
    dataAgendada: undefined as Date | undefined,
    quilometragem: '',
    responsavel: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      toast({ title: 'Agendado com sucesso', description: `${vehicle?.placa} - ${vehicle?.modelo}` })
      onScheduled?.({ ...formData, vehicle })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Agendar manutenção</DialogTitle>
        </DialogHeader>

        <div className="mb-4 text-sm text-gray-700">
          <div className="font-medium">Veículo</div>
          <div className="font-mono">{vehicle?.placa}</div>
          <div>{vehicle?.modelo}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(v) => handleChange('tipo', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataAgendada ? (
                      format(formData.dataAgendada, 'PPP', { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataAgendada}
                    onSelect={(d) => handleChange('dataAgendada', d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Textarea
              placeholder="Ex: Revisão dos 10.000 km"
              rows={3}
              value={formData.descricao}
              onChange={(e) => handleChange('descricao', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quilometragem</Label>
              <Input
                type="number"
                placeholder="Ex: 10000"
                value={formData.quilometragem}
                onChange={(e) => handleChange('quilometragem', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Input
                placeholder="Ex: Oficina Central"
                value={formData.responsavel}
                onChange={(e) => handleChange('responsavel', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}



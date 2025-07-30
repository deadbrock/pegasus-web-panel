'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Save, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MaintenanceDialogProps {
  open: boolean
  onClose: () => void
  maintenance?: any
}

// Mock data - substituir por dados do Supabase
const vehicles = [
  { id: '1', placa: 'BRA-2023', modelo: 'Volkswagen Delivery' },
  { id: '2', placa: 'BRA-2024', modelo: 'Ford Cargo' },
  { id: '3', placa: 'BRA-2025', modelo: 'Mercedes Sprinter' },
  { id: '4', placa: 'BRA-2022', modelo: 'Iveco Daily' },
  { id: '5', placa: 'BRA-2026', modelo: 'Renault Master' },
  { id: '6', placa: 'BRA-2021', modelo: 'Fiat Ducato' }
]

const maintenanceTypes = [
  'Preventiva',
  'Corretiva',
  'Revisão',
  'Troca de Óleo',
  'Pneus',
  'Outros'
]

const statusOptions = [
  'Pendente',
  'Agendada',
  'Em Andamento',
  'Concluída',
  'Cancelada'
]

export function MaintenanceDialog({ open, onClose, maintenance }: MaintenanceDialogProps) {
  const [formData, setFormData] = useState({
    veiculoId: '',
    tipo: '',
    descricao: '',
    dataAgendada: undefined as Date | undefined,
    quilometragem: '',
    status: 'Pendente',
    custo: '',
    responsavel: '',
    observacoes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (maintenance) {
      setFormData({
        veiculoId: maintenance.veiculoId || '',
        tipo: maintenance.tipo || '',
        descricao: maintenance.descricao || '',
        dataAgendada: maintenance.dataAgendada ? new Date(maintenance.dataAgendada) : undefined,
        quilometragem: maintenance.quilometragem?.toString() || '',
        status: maintenance.status || 'Pendente',
        custo: maintenance.custo?.toString() || '',
        responsavel: maintenance.responsavel || '',
        observacoes: maintenance.observacoes || ''
      })
    } else {
      // Reset form for new maintenance
      setFormData({
        veiculoId: '',
        tipo: '',
        descricao: '',
        dataAgendada: undefined,
        quilometragem: '',
        status: 'Pendente',
        custo: '',
        responsavel: '',
        observacoes: ''
      })
    }
  }, [maintenance, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Aqui seria feita a integração com Supabase
      console.log('Salvando manutenção:', formData)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar manutenção:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {maintenance ? 'Editar Manutenção' : 'Nova Manutenção'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Veículo */}
            <div className="space-y-2">
              <Label htmlFor="veiculo">Veículo *</Label>
              <Select 
                value={formData.veiculoId} 
                onValueChange={(value) => handleInputChange('veiculoId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.placa} - {vehicle.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select 
                value={formData.tipo} 
                onValueChange={(value) => handleInputChange('tipo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Agendada */}
            <div className="space-y-2">
              <Label>Data Agendada *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dataAgendada ? (
                      format(formData.dataAgendada, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataAgendada}
                    onSelect={(date) => handleInputChange('dataAgendada', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Quilometragem */}
            <div className="space-y-2">
              <Label htmlFor="quilometragem">Quilometragem (km)</Label>
              <Input
                id="quilometragem"
                type="number"
                placeholder="Ex: 10000"
                value={formData.quilometragem}
                onChange={(e) => handleInputChange('quilometragem', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custo */}
            <div className="space-y-2">
              <Label htmlFor="custo">Custo Estimado (R$)</Label>
              <Input
                id="custo"
                type="number"
                step="0.01"
                placeholder="Ex: 850.00"
                value={formData.custo}
                onChange={(e) => handleInputChange('custo', e.target.value)}
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Ex: Revisão dos 10.000 km"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              required
            />
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              placeholder="Ex: Oficina Central"
              value={formData.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre a manutenção..."
              rows={3}
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
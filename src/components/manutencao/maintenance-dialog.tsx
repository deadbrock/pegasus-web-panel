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
import { CalendarIcon, Save, X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { fetchVeiculos } from '@/lib/services/veiculos-service'
import { createManutencao, updateManutencao, type Manutencao } from '@/lib/services/manutencoes-service'
import { useToast } from '@/hooks/use-toast'

interface MaintenanceDialogProps {
  open: boolean
  onClose: () => void
  maintenance?: Manutencao | null
  onSave?: () => void
}

const maintenanceTypes = [
  'Preventiva',
  'Corretiva',
  'Revisão',
  'Troca de Óleo',
  'Pneus',
  'Inspeção',
  'Outros'
]

const statusOptions = [
  'Pendente',
  'Agendada',
  'Em Andamento',
  'Concluída',
  'Atrasada',
  'Cancelada'
]

export function MaintenanceDialog({ open, onClose, maintenance, onSave }: MaintenanceDialogProps) {
  const { toast } = useToast()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)
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

  // Carrega veículos do Supabase
  useEffect(() => {
    async function loadVehicles() {
      setLoadingVehicles(true)
      try {
        const data = await fetchVeiculos()
        setVehicles(data)
      } catch (error) {
        console.error('[MaintenanceDialog] Erro ao carregar veículos:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de veículos',
          variant: 'destructive'
        })
      } finally {
        setLoadingVehicles(false)
      }
    }

    if (open) {
      loadVehicles()
    }
  }, [open, toast])

  // Preenche o formulário quando edita uma manutenção
  useEffect(() => {
    if (maintenance && open) {
      setFormData({
        veiculoId: maintenance.veiculo_id || '',
        tipo: maintenance.tipo || '',
        descricao: maintenance.descricao || '',
        dataAgendada: maintenance.data_agendada ? new Date(maintenance.data_agendada) : undefined,
        quilometragem: maintenance.quilometragem?.toString() || '',
        status: maintenance.status || 'Pendente',
        custo: maintenance.custo?.toString() || '',
        responsavel: maintenance.responsavel || '',
        observacoes: maintenance.observacoes || ''
      })
    } else if (!maintenance && open) {
      // Reset form for new maintenance
      setFormData({
        veiculoId: '',
        tipo: '',
        descricao: '',
        dataAgendada: undefined,
        quilometragem: '',
        status: 'Agendada',
        custo: '',
        responsavel: '',
        observacoes: ''
      })
    }
  }, [maintenance, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!formData.veiculoId) {
      toast({
        title: 'Erro',
        description: 'Selecione um veículo',
        variant: 'destructive'
      })
      return
    }

    if (!formData.tipo) {
      toast({
        title: 'Erro',
        description: 'Selecione o tipo de manutenção',
        variant: 'destructive'
      })
      return
    }

    if (!formData.descricao.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha a descrição',
        variant: 'destructive'
      })
      return
    }

    if (!formData.dataAgendada) {
      toast({
        title: 'Erro',
        description: 'Selecione a data agendada',
        variant: 'destructive'
      })
      return
    }

    if (!formData.quilometragem || parseInt(formData.quilometragem) <= 0) {
      toast({
        title: 'Erro',
        description: 'Informe a quilometragem válida',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const payload: any = {
        veiculo_id: formData.veiculoId,
        tipo: formData.tipo,
        descricao: formData.descricao.trim(),
        data_agendada: formData.dataAgendada.toISOString(),
        quilometragem: parseInt(formData.quilometragem),
        status: formData.status,
        custo: formData.custo ? parseFloat(formData.custo) : null,
        responsavel: formData.responsavel.trim() || null,
        observacoes: formData.observacoes.trim() || null
      }

      console.log('[MaintenanceDialog] Salvando:', payload)

      if (maintenance?.id) {
        // Atualizar manutenção existente
        const success = await updateManutencao(maintenance.id, payload)
        if (!success) {
          throw new Error('Falha ao atualizar manutenção')
        }
        toast({
          title: 'Sucesso',
          description: 'Manutenção atualizada com sucesso!'
        })
      } else {
        // Criar nova manutenção
        const created = await createManutencao(payload)
        if (!created) {
          throw new Error('Falha ao criar manutenção')
        }
        toast({
          title: 'Sucesso',
          description: 'Manutenção criada com sucesso!'
        })
      }

      onClose()
      if (onSave) onSave()
    } catch (error: any) {
      console.error('[MaintenanceDialog] Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: error?.message || 'Não foi possível salvar a manutenção',
        variant: 'destructive'
      })
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
                disabled={loadingVehicles}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    loadingVehicles ? "Carregando veículos..." : 
                    vehicles.length === 0 ? "Nenhum veículo cadastrado" :
                    "Selecione o veículo"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {loadingVehicles ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                  ) : vehicles.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhum veículo cadastrado
                    </div>
                  ) : (
                    vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.placa} - {vehicle.marca} {vehicle.modelo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!loadingVehicles && vehicles.length === 0 && (
                <p className="text-xs text-gray-500">
                  Cadastre veículos no módulo <strong>Frota</strong> primeiro
                </p>
              )}
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
              disabled={isSubmitting || loadingVehicles || vehicles.length === 0}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
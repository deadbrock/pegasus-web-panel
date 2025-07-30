'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X } from 'lucide-react'

interface VehicleDialogProps {
  open: boolean
  onClose: () => void
  vehicle?: any
}

const vehicleTypes = [
  'Caminhão',
  'Van',
  'Utilitário',
  'Carro',
  'Moto',
  'Outros'
]

const fuelTypes = [
  'Diesel',
  'Gasolina',
  'Etanol',
  'Elétrico',
  'Híbrido',
  'GNV'
]

const statusOptions = [
  'Ativo',
  'Em Manutenção',
  'Inativo',
  'Vendido'
]

const colors = [
  'Branco',
  'Prata',
  'Preto',
  'Azul',
  'Vermelho',
  'Verde',
  'Amarelo',
  'Outros'
]

export function VehicleDialog({ open, onClose, vehicle }: VehicleDialogProps) {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    tipo: '',
    ano: '',
    cor: '',
    combustivel: '',
    capacidade: '',
    kmTotal: '',
    status: 'Ativo',
    chassi: '',
    renavam: '',
    observacoes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (vehicle) {
      setFormData({
        placa: vehicle.placa || '',
        marca: vehicle.marca || '',
        modelo: vehicle.modelo || '',
        tipo: vehicle.tipo || '',
        ano: vehicle.ano?.toString() || '',
        cor: vehicle.cor || '',
        combustivel: vehicle.combustivel || '',
        capacidade: vehicle.capacidade?.toString() || '',
        kmTotal: vehicle.kmTotal?.toString() || '',
        status: vehicle.status || 'Ativo',
        chassi: vehicle.chassi || '',
        renavam: vehicle.renavam || '',
        observacoes: vehicle.observacoes || ''
      })
    } else {
      // Reset form for new vehicle
      setFormData({
        placa: '',
        marca: '',
        modelo: '',
        tipo: '',
        ano: '',
        cor: '',
        combustivel: '',
        capacidade: '',
        kmTotal: '',
        status: 'Ativo',
        chassi: '',
        renavam: '',
        observacoes: ''
      })
    }
  }, [vehicle, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Aqui seria feita a integração com Supabase
      console.log('Salvando veículo:', formData)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar veículo:', error)
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
            {vehicle ? 'Editar Veículo' : 'Novo Veículo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Placa */}
            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                placeholder="Ex: BRA-2023"
                value={formData.placa}
                onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                required
              />
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                placeholder="Ex: Volkswagen"
                value={formData.marca}
                onChange={(e) => handleInputChange('marca', e.target.value)}
                required
              />
            </div>

            {/* Modelo */}
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                placeholder="Ex: Delivery 8.160"
                value={formData.modelo}
                onChange={(e) => handleInputChange('modelo', e.target.value)}
                required
              />
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
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-2">
              <Label htmlFor="ano">Ano *</Label>
              <Input
                id="ano"
                type="number"
                placeholder="Ex: 2023"
                min="1900"
                max="2030"
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', e.target.value)}
                required
              />
            </div>

            {/* Cor */}
            <div className="space-y-2">
              <Label htmlFor="cor">Cor</Label>
              <Select 
                value={formData.cor} 
                onValueChange={(value) => handleInputChange('cor', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color} value={color}>
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Combustível */}
            <div className="space-y-2">
              <Label htmlFor="combustivel">Combustível</Label>
              <Select 
                value={formData.combustivel} 
                onValueChange={(value) => handleInputChange('combustivel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o combustível" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((fuel) => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacidade */}
            <div className="space-y-2">
              <Label htmlFor="capacidade">Capacidade (kg)</Label>
              <Input
                id="capacidade"
                type="number"
                placeholder="Ex: 3500"
                value={formData.capacidade}
                onChange={(e) => handleInputChange('capacidade', e.target.value)}
              />
            </div>

            {/* KM Total */}
            <div className="space-y-2">
              <Label htmlFor="kmTotal">KM Total</Label>
              <Input
                id="kmTotal"
                type="number"
                placeholder="Ex: 15680"
                value={formData.kmTotal}
                onChange={(e) => handleInputChange('kmTotal', e.target.value)}
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

            {/* Chassi */}
            <div className="space-y-2">
              <Label htmlFor="chassi">Chassi</Label>
              <Input
                id="chassi"
                placeholder="Número do chassi"
                value={formData.chassi}
                onChange={(e) => handleInputChange('chassi', e.target.value.toUpperCase())}
              />
            </div>

            {/* RENAVAM */}
            <div className="space-y-2">
              <Label htmlFor="renavam">RENAVAM</Label>
              <Input
                id="renavam"
                placeholder="Número do RENAVAM"
                value={formData.renavam}
                onChange={(e) => handleInputChange('renavam', e.target.value)}
              />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre o veículo..."
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
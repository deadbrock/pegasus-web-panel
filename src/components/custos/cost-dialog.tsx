'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, DollarSign } from 'lucide-react'
import { createCost, updateCost, type CostRecord } from '@/services/costsService'
import { fetchVehicles } from '@/services/vehiclesService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CostDialogProps {
  open: boolean
  onClose: () => void
  cost?: any
  onSaved?: () => void
}

const vehiclesDataMock: Array<{ id: string | number; placa: string; modelo?: string }> = []

const categorias = [
  'Combustível',
  'Manutenção',
  'Pedágio',
  'Seguro',
  'Documentação',
  'Multas',
  'Estacionamento',
  'Outros'
]

export function CostDialog({ open, onClose, cost, onSaved }: CostDialogProps) {
  const [formData, setFormData] = useState({
    data: new Date(),
    categoria: '',
    descricao: '',
    valor: '',
    veiculo_id: '',
    responsavel: '',
    observacoes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [vehicles, setVehicles] = useState<Array<{ id: string; placa: string; modelo?: string }>>(vehiclesDataMock as any)

  useEffect(() => {
    // carregar veículos para select
    fetchVehicles().then((v: any[]) => {
      const mapped = (v || []).map((x: any) => ({ id: String(x.id), placa: x.placa || x.nome || String(x.id), modelo: x.modelo || '' }))
      setVehicles(mapped)
    }).catch(() => setVehicles([]))

    if (cost) {
      setFormData({
        data: new Date(cost.data),
        categoria: cost.categoria || '',
        descricao: cost.descricao || '',
        valor: cost.valor?.toString() || '',
        veiculo_id: cost.veiculo_id?.toString() || '',
        responsavel: cost.responsavel || '',
        observacoes: cost.observacoes || ''
      })
    } else {
      setFormData({
        data: new Date(),
        categoria: '',
        descricao: '',
        valor: '',
        veiculo_id: '',
        responsavel: '',
        observacoes: ''
      })
    }
    setErrors({})
  }, [cost, open])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCurrency = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '')
    // Converte para centavos
    const cents = parseInt(numericValue) || 0
    // Formata como moeda
    return (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrency(value)
    handleInputChange('valor', formatted)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória'
    }
    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    }
    if (!formData.valor || parseFloat(formData.valor.replace(/\./g, '').replace(',', '.')) <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero'
    }
    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    const costData: CostRecord = {
      ...formData,
      valor: parseFloat(formData.valor.replace(/\./g, '').replace(',', '.'))
    }

    try {
      if (cost?.id) {
        await updateCost(String(cost.id), costData)
      } else {
        await createCost(costData)
      }
      onSaved?.()
      onClose()
    } catch (e) {
      // já logado no service
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {cost ? 'Editar Custo' : 'Novo Custo'}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos obrigatórios marcados com * e salve para registrar o custo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primeira linha: Data e Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.data, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.data}
                    onSelect={(date) => date && handleInputChange('data', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select value={formData.categoria} onValueChange={(value) => handleInputChange('categoria', value)}>
                <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && <p className="text-sm text-red-500">{errors.categoria}</p>}
            </div>
          </div>

          {/* Segunda linha: Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Descreva o custo (ex: Abastecimento - Posto Shell)"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
              className={errors.descricao ? 'border-red-500' : ''}
            />
            {errors.descricao && <p className="text-sm text-red-500">{errors.descricao}</p>}
          </div>

          {/* Terceira linha: Valor e Veículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <Input
                  id="valor"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className={`pl-10 ${errors.valor ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.valor && <p className="text-sm text-red-500">{errors.valor}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="veiculo">Veículo</Label>
              <Select value={formData.veiculo_id} onValueChange={(value) => handleInputChange('veiculo_id', value === 'none' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum veículo específico</SelectItem>
                  {vehicles.map((veiculo) => (
                    <SelectItem key={veiculo.id} value={veiculo.id.toString()}>
                      {veiculo.placa}{veiculo.modelo ? ` - ${veiculo.modelo}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quarta linha: Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável *</Label>
            <Input
              id="responsavel"
              placeholder="Nome do responsável pelo custo"
              value={formData.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              className={errors.responsavel ? 'border-red-500' : ''}
            />
            {errors.responsavel && <p className="text-sm text-red-500">{errors.responsavel}</p>}
          </div>

          {/* Quinta linha: Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais (opcional)"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Resumo visual */}
          {formData.categoria && formData.valor && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Resumo</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Categoria:</span>
                  <p className="font-medium">{formData.categoria}</p>
                </div>
                <div>
                  <span className="text-blue-700">Valor:</span>
                  <p className="font-medium">R$ {formData.valor}</p>
                </div>
                {formData.veiculo_id && (
                  <div>
                    <span className="text-blue-700">Veículo:</span>
                    <p className="font-medium">
                      {vehiclesData.find(v => v.id.toString() === formData.veiculo_id)?.placa}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-blue-700">Data:</span>
                  <p className="font-medium">{format(formData.data, "dd/MM/yyyy")}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {cost ? 'Atualizar' : 'Salvar'} Custo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
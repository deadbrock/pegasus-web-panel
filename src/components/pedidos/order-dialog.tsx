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
import { CalendarIcon, Save, X, Plus, Minus } from 'lucide-react'
import { format } from 'date-fns'
import { createOrder, updateOrder } from '@/services/ordersService'
import { useToast } from '@/hooks/use-toast'
import { ptBR } from 'date-fns/locale'

interface OrderDialogProps {
  open: boolean
  onClose: () => void
  order?: any
}

const statusOptions = [
  'Pendente',
  'Em Separação',
  'Em Rota',
  'Entregue',
  'Atrasado',
  'Cancelado'
]

const paymentOptions = [
  'PIX',
  'Cartão',
  'Dinheiro',
  'Boleto',
  'Transferência',
  'Material de Consumo'
]

// Mock data para produtos e motoristas
const mockProducts = [
  { id: 1, name: 'Produto A', price: 25.90 },
  { id: 2, name: 'Produto B', price: 45.50 },
  { id: 3, name: 'Produto C', price: 78.30 },
  { id: 4, name: 'Produto D', price: 120.00 },
]

const mockDrivers = [
  { id: 1, name: 'Carlos Lima', vehicle: 'BRA-2023' },
  { id: 2, name: 'Ana Oliveira', vehicle: 'BRA-2024' },
  { id: 3, name: 'João Silva', vehicle: 'BRA-2025' },
  { id: 4, name: 'Maria Santos', vehicle: 'BRA-2026' },
]

export function OrderDialog({ open, onClose, order }: OrderDialogProps) {
  const [formData, setFormData] = useState({
    numero: '',
    cliente: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    dataPedido: new Date(),
    dataEntrega: undefined as Date | undefined,
    status: 'Pendente',
    motorista: '',
    veiculo: '',
    formaPagamento: '',
    observacoes: '',
    itens: [{ produto: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (order) {
      setFormData({
        numero: order.numero || '',
        cliente: order.cliente || '',
        telefone: order.telefone || '',
        endereco: order.endereco || '',
        cidade: order.cidade || '',
        estado: order.estado || '',
        cep: order.cep || '',
        dataPedido: order.dataPedido ? new Date(order.dataPedido) : new Date(),
        dataEntrega: order.dataEntrega ? new Date(order.dataEntrega) : undefined,
        status: order.status || 'Pendente',
        motorista: order.motorista || '',
        veiculo: order.veiculo || '',
        formaPagamento: order.formaPagamento || '',
        observacoes: order.observacoes || '',
        itens: Array.isArray(order.itens) && order.itens.length > 0 
          ? order.itens 
          : [{ produto: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }]
      })
    } else {
      // Reset form for new order
      const novoNumero = `P-${Date.now().toString().slice(-6)}`
      setFormData({
        numero: novoNumero,
        cliente: '',
        telefone: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        dataPedido: new Date(),
        dataEntrega: undefined,
        status: 'Pendente',
        motorista: '',
        veiculo: '',
        formaPagamento: '',
        observacoes: '',
        itens: [{ produto: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }]
      })
    }
  }, [order, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        numero: formData.numero,
        cliente: formData.cliente,
        telefone: formData.telefone,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        data_pedido: formData.dataPedido.toISOString(),
        data_entrega: formData.dataEntrega ? formData.dataEntrega.toISOString() : null,
        status: formData.status,
        motorista: formData.motorista || null,
        veiculo: formData.veiculo || null,
        forma_pagamento: formData.formaPagamento || null,
        observacoes: formData.observacoes || null,
        valor_total: getValorTotal(),
        itens: formData.itens,
      }
      if (order?.id) {
        await updateOrder(String(order.id), payload)
        toast({ title: 'Pedido atualizado', description: payload.numero })
      } else {
        await createOrder(payload as any)
        toast({ title: 'Pedido criado', description: payload.numero })
      }
      onClose()
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
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

  const handleItemChange = (index: number, field: string, value: any) => {
    const novosItens = [...formData.itens]
    novosItens[index] = {
      ...novosItens[index],
      [field]: value
    }

    // Recalcular valor total do item
    if (field === 'quantidade' || field === 'valorUnitario') {
      novosItens[index].valorTotal = novosItens[index].quantidade * novosItens[index].valorUnitario
    }

    setFormData(prev => ({
      ...prev,
      itens: novosItens
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      itens: [...prev.itens, { produto: '', quantidade: 1, valorUnitario: 0, valorTotal: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.itens.length > 1) {
      setFormData(prev => ({
        ...prev,
        itens: prev.itens.filter((_, i) => i !== index)
      }))
    }
  }

  const getValorTotal = () => {
    return formData.itens.reduce((total, item) => total + (item.valorTotal || 0), 0)
  }

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4,5})(\d{4})/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1')
  }

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1')
  }

  const handleProductSelect = (index: number, productId: string) => {
    const product = mockProducts.find(p => p.id === parseInt(productId))
    if (product) {
      handleItemChange(index, 'produto', product.name)
      handleItemChange(index, 'valorUnitario', product.price)
    }
  }

  const handleDriverSelect = (driverId: string) => {
    const driver = mockDrivers.find(d => d.id === parseInt(driverId))
    if (driver) {
      handleInputChange('motorista', driver.name)
      handleInputChange('veiculo', driver.vehicle)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {order ? 'Editar Pedido' : 'Novo Pedido'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Pedido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Número do Pedido */}
              <div className="space-y-2">
                <Label htmlFor="numero">Número do Pedido</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  disabled
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

              {/* Data do Pedido */}
              <div className="space-y-2">
                <Label>Data do Pedido</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.dataPedido, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataPedido}
                      onSelect={(date) => handleInputChange('dataPedido', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Data de Entrega */}
              <div className="space-y-2">
                <Label>Data de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataEntrega ? (
                        format(formData.dataEntrega, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataEntrega}
                      onSelect={(date) => handleInputChange('dataEntrega', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Nome do Cliente *</Label>
                <Input
                  id="cliente"
                  placeholder="Nome completo do cliente"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 98765-4321"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                  maxLength={15}
                />
              </div>

              {/* Endereço */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço de Entrega *</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
                  required
                />
              </div>

              {/* Cidade */}
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  placeholder="São Paulo"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Input
                  id="estado"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                />
              </div>

              {/* CEP */}
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                  maxLength={9}
                />
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold border-b pb-2">Itens do Pedido</h3>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            
            {formData.itens.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Produto</Label>
                  <Select onValueChange={(value) => handleProductSelect(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantidade}
                    onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor Unitário</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.valorUnitario || 0}
                    onChange={(e) => handleItemChange(index, 'valorUnitario', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valor Total</Label>
                  <Input
                    value={(item.valorTotal || 0).toFixed(2)}
                    disabled
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    disabled={formData.itens.length === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="text-right">
              <p className="text-lg font-semibold">
                Total do Pedido: R$ {getValorTotal().toFixed(2)}
              </p>
            </div>
          </div>

          {/* Entrega e Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Entrega e Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Motorista */}
              <div className="space-y-2">
                <Label>Motorista</Label>
                <Select onValueChange={handleDriverSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name} - {driver.vehicle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select 
                  value={formData.formaPagamento} 
                  onValueChange={(value) => handleInputChange('formaPagamento', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentOptions.map((payment) => (
                      <SelectItem key={payment} value={payment}>
                        {payment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o pedido..."
                rows={3}
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
              />
            </div>
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
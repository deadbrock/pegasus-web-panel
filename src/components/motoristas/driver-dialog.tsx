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

interface DriverDialogProps {
  open: boolean
  onClose: () => void
  driver?: any
}

const cnhCategories = [
  'A',
  'B', 
  'C',
  'D',
  'E',
  'AB',
  'AC',
  'AD',
  'AE'
]

const statusOptions = [
  'Ativo',
  'Inativo',
  'Férias',
  'Licença',
  'Demitido'
]

export function DriverDialog({ open, onClose, driver, onSave }: DriverDialogProps & { onSave?: (data: any) => void }) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    cnh: '',
    categoria_cnh: '',
    validadeCnh: undefined as Date | undefined,
    dataAdmissao: undefined as Date | undefined,
    status: 'Ativo',
    observacoes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (driver) {
      setFormData({
        nome: driver.nome || '',
        cpf: driver.cpf || '',
        rg: driver.rg || '',
        telefone: driver.telefone || '',
        email: driver.email || '',
        endereco: driver.endereco || '',
        cidade: driver.cidade || '',
        estado: driver.estado || '',
        cep: driver.cep || '',
        cnh: driver.cnh || '',
        categoria_cnh: driver.categoria_cnh || '',
        validadeCnh: driver.validade_cnh ? new Date(driver.validade_cnh) : undefined,
        dataAdmissao: driver.data_admissao ? new Date(driver.data_admissao) : undefined,
        status: driver.status || 'Ativo',
        observacoes: driver.observacoes || ''
      })
    } else {
      // Reset form for new driver
      setFormData({
        nome: '',
        cpf: '',
        rg: '',
        telefone: '',
        email: '',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        cnh: '',
        categoria_cnh: '',
        validadeCnh: undefined,
        dataAdmissao: undefined,
        status: 'Ativo',
        observacoes: ''
      })
    }
  }, [driver, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        nome: formData.nome,
        cpf: formData.cpf,
        cnh: formData.cnh,
        categoria_cnh: formData.categoria_cnh,
        validade_cnh: formData.validadeCnh ? formData.validadeCnh.toISOString().split('T')[0] : null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        endereco: [formData.endereco, formData.cidade, formData.estado, formData.cep].filter(Boolean).join(', '),
        data_admissao: formData.dataAdmissao ? formData.dataAdmissao.toISOString().split('T')[0] : null,
        data_nascimento: null,
        status: formData.status,
        observacoes: formData.observacoes || null,
      }
      if (onSave) await onSave(payload)
      onClose()
    } catch (error) {
      console.error('Erro ao salvar motorista:', error)
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

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1')
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {driver ? 'Editar Motorista' : 'Novo Motorista'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: João Silva Santos"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>

              {/* CPF */}
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                  maxLength={14}
                  required
                />
              </div>

              {/* RG */}
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  placeholder="Ex: 12.345.678-9"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                />
              </div>

              {/* Data de Admissão */}
              <div className="space-y-2">
                <Label>Data de Admissão</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dataAdmissao ? (
                        format(formData.dataAdmissao, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dataAdmissao}
                      onSelect={(date) => handleInputChange('dataAdmissao', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 98765-4321"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                  maxLength={15}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="motorista@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Endereço */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, número, complemento"
                  value={formData.endereco}
                  onChange={(e) => handleInputChange('endereco', e.target.value)}
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

          {/* CNH */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Carteira de Habilitação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CNH */}
              <div className="space-y-2">
                <Label htmlFor="cnh">Número da CNH *</Label>
                <Input
                  id="cnh"
                  placeholder="12345678901"
                  value={formData.cnh}
                  onChange={(e) => handleInputChange('cnh', e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  required
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria_cnh">Categoria *</Label>
                <Select 
                  value={formData.categoria_cnh} 
                  onValueChange={(value) => handleInputChange('categoria_cnh', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {cnhCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        CNH {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Validade CNH */}
              <div className="space-y-2">
                <Label>Validade da CNH *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validadeCnh ? (
                        format(formData.validadeCnh, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validadeCnh}
                      onSelect={(date) => handleInputChange('validadeCnh', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Status e Observações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais sobre o motorista..."
                  rows={3}
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange('observacoes', e.target.value)}
                />
              </div>
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
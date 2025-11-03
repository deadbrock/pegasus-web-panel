'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save, X } from 'lucide-react'

interface ProductDialogProps {
  open: boolean
  onClose: () => void
  product?: any
}

const categories = [
  'Fixação',
  'Lubrificantes', 
  'Filtros',
  'Pneus',
  'Elétricos',
  'Ferramentas',
  'Peças',
  'Outros'
]

const units = [
  'UN',
  'KG',
  'L',
  'M',
  'M²',
  'M³',
  'CX',
  'PCT'
]

export function ProductDialog({ open, onClose, product }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    categoria: '',
    unidade: 'UN',
    valorUnitario: '',
    estoqueAtual: '',
    estoqueMinimo: '',
    localizacao: '',
    fornecedor: '',
    descricao: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        codigo: product.codigo || '',
        nome: product.nome || '',
        categoria: product.categoria || '',
        unidade: product.unidade || 'UN',
        valorUnitario: product.preco_unitario?.toString() || product.valorUnitario?.toString() || '',
        estoqueAtual: product.estoque_atual?.toString() || product.estoqueAtual?.toString() || '',
        estoqueMinimo: product.estoque_minimo?.toString() || product.estoqueMinimo?.toString() || '',
        localizacao: product.localizacao || '',
        fornecedor: product.fornecedor || '',
        descricao: product.descricao || ''
      })
    } else {
      // Reset form for new product
      setFormData({
        codigo: '',
        nome: '',
        categoria: '',
        unidade: 'UN',
        valorUnitario: '',
        estoqueAtual: '0',
        estoqueMinimo: '',
        localizacao: '',
        fornecedor: '',
        descricao: ''
      })
    }
  }, [product, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Aqui seria feita a integração com Supabase
      console.log('Salvando produto:', formData)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onClose()
    } catch (error) {
      console.error('Erro ao salvar produto:', error)
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
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código */}
            <div className="space-y-2">
              <Label htmlFor="codigo">Código *</Label>
              <Input
                id="codigo"
                placeholder="Ex: PRD001"
                value={formData.codigo}
                onChange={(e) => handleInputChange('codigo', e.target.value)}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unidade">Unidade *</Label>
              <Select 
                value={formData.unidade} 
                onValueChange={(value) => handleInputChange('unidade', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Valor Unitário */}
            <div className="space-y-2">
              <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
              <Input
                id="valorUnitario"
                type="number"
                step="0.01"
                placeholder="Ex: 25.90"
                value={formData.valorUnitario}
                onChange={(e) => handleInputChange('valorUnitario', e.target.value)}
              />
            </div>

            {/* Estoque Atual */}
            <div className="space-y-2">
              <Label htmlFor="estoqueAtual">Estoque Atual *</Label>
              <Input
                id="estoqueAtual"
                type="number"
                placeholder="Ex: 100"
                value={formData.estoqueAtual}
                onChange={(e) => handleInputChange('estoqueAtual', e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Alterar este valor criará uma movimentação de estoque
              </p>
            </div>

            {/* Estoque Mínimo */}
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                placeholder="Ex: 10"
                value={formData.estoqueMinimo}
                onChange={(e) => handleInputChange('estoqueMinimo', e.target.value)}
              />
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <Label htmlFor="localizacao">Localização</Label>
              <Input
                id="localizacao"
                placeholder="Ex: A1-B3"
                value={formData.localizacao}
                onChange={(e) => handleInputChange('localizacao', e.target.value)}
              />
            </div>
          </div>

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              placeholder="Ex: Parafuso M6x20"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
            />
          </div>

          {/* Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="fornecedor">Fornecedor</Label>
            <Input
              id="fornecedor"
              placeholder="Ex: Parafusos ABC Ltda"
              value={formData.fornecedor}
              onChange={(e) => handleInputChange('fornecedor', e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Descrição detalhada do produto..."
              rows={3}
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
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
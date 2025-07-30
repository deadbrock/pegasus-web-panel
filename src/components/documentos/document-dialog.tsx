'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, FileText, Upload, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DocumentDialogProps {
  open: boolean
  onClose: () => void
  document?: any
}

const documentTypes = [
  'CNH',
  'CRLV',
  'Seguro',
  'ANTT',
  'Licenciamento',
  'Certificado',
  'Contrato',
  'FISPQ',
  'Outros'
]

const documentStatus = [
  'Válido',
  'Vencido',
  'Em Renovação',
  'Pendente'
]

export function DocumentDialog({ open, onClose, document }: DocumentDialogProps) {
  const [formData, setFormData] = useState({
    tipo: '',
    numero: '',
    dataEmissao: new Date(),
    dataVencimento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    status: 'Válido',
    responsavel: '',
    observacoes: '',
    arquivo: null as File | null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (document) {
      setFormData({
        tipo: document.tipo || '',
        numero: document.numero || '',
        dataEmissao: new Date(document.dataEmissao),
        dataVencimento: new Date(document.dataVencimento),
        status: document.status || 'Válido',
        responsavel: document.responsavel || '',
        observacoes: document.observacoes || '',
        arquivo: null
      })
    } else {
      setFormData({
        tipo: '',
        numero: '',
        dataEmissao: new Date(),
        dataVencimento: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: 'Válido',
        responsavel: '',
        observacoes: '',
        arquivo: null
      })
    }
    setErrors({})
  }, [document, open])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleInputChange('arquivo', file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleInputChange('arquivo', e.dataTransfer.files[0])
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório'
    }
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório'
    }
    if (!formData.responsavel.trim()) {
      newErrors.responsavel = 'Responsável é obrigatório'
    }
    if (formData.dataVencimento <= formData.dataEmissao) {
      newErrors.dataVencimento = 'Data de vencimento deve ser posterior à emissão'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    // Aqui seria feita a integração com a API
    const documentData = {
      ...formData,
      arquivo: formData.arquivo ? {
        name: formData.arquivo.name,
        size: formData.arquivo.size,
        type: formData.arquivo.type
      } : null
    }

    console.log('Salvando documento:', documentData)
    onClose()
  }

  const removeFile = () => {
    handleInputChange('arquivo', null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document ? 'Editar Documento' : 'Novo Documento'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primeira linha: Tipo e Número */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo *</Label>
              <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-red-500">{errors.tipo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número/Identificação *</Label>
              <Input
                id="numero"
                placeholder="Ex: 123456789, ABC1234"
                value={formData.numero}
                onChange={(e) => handleInputChange('numero', e.target.value)}
                className={errors.numero ? 'border-red-500' : ''}
              />
              {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
            </div>
          </div>

          {/* Segunda linha: Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataEmissao">Data de Emissão *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.dataEmissao, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataEmissao}
                    onSelect={(date) => date && handleInputChange('dataEmissao', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataVencimento">Data de Vencimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${errors.dataVencimento ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.dataVencimento, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dataVencimento}
                    onSelect={(date) => date && handleInputChange('dataVencimento', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dataVencimento && <p className="text-sm text-red-500">{errors.dataVencimento}</p>}
            </div>
          </div>

          {/* Terceira linha: Status e Responsável */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {documentStatus.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                placeholder="Nome do responsável"
                value={formData.responsavel}
                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                className={errors.responsavel ? 'border-red-500' : ''}
              />
              {errors.responsavel && <p className="text-sm text-red-500">{errors.responsavel}</p>}
            </div>
          </div>

          {/* Upload de Arquivo */}
          <div className="space-y-2">
            <Label>Arquivo do Documento</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {formData.arquivo ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium">{formData.arquivo.name}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(formData.arquivo.size)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeFile}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    Arraste e solte o arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500">
                    Suporte para PDF, DOC, DOCX, JPG, PNG (máx. 10MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="mt-4" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais sobre o documento..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Resumo visual */}
          {formData.tipo && formData.numero && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Resumo do Documento</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Tipo:</span>
                  <p className="font-medium">{formData.tipo}</p>
                </div>
                <div>
                  <span className="text-blue-700">Número:</span>
                  <p className="font-medium">{formData.numero}</p>
                </div>
                <div>
                  <span className="text-blue-700">Emissão:</span>
                  <p className="font-medium">{format(formData.dataEmissao, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <span className="text-blue-700">Vencimento:</span>
                  <p className="font-medium">{format(formData.dataVencimento, "dd/MM/yyyy")}</p>
                </div>
                <div>
                  <span className="text-blue-700">Status:</span>
                  <p className="font-medium">{formData.status}</p>
                </div>
                <div>
                  <span className="text-blue-700">Responsável:</span>
                  <p className="font-medium">{formData.responsavel}</p>
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
            {document ? 'Atualizar' : 'Salvar'} Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
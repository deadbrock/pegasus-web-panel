"use client"

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Upload,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Eye,
  X
} from 'lucide-react'

export default function FiscalPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNovaNotaDialogOpen, setIsNovaNotaDialogOpen] = useState(false)
  const [isPeriodoDialogOpen, setIsPeriodoDialogOpen] = useState(false)
  const [isVisualizarDialogOpen, setIsVisualizarDialogOpen] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState<any>(null)
  const [selectedMonth, setSelectedMonth] = useState('Janeiro')
  const [selectedYear, setSelectedYear] = useState('2025')
  const [novaNotaData, setNovaNotaData] = useState({
    numero: '',
    tipo: 'Entrada',
    empresa: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    vencimento: '',
    observacoes: ''
  })

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const years = Array.from({ length: 6 }, (_, i) => (2025 + i).toString())

  // Funções de handler
  const handleImportXML = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.xml')) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo XML válido',
        variant: 'destructive'
      })
      return
    }

    // Simular importação
    toast({
      title: 'XML Importado!',
      description: `Arquivo "${file.name}" foi importado com sucesso`
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCriarNota = () => {
    if (!novaNotaData.numero || !novaNotaData.empresa || !novaNotaData.valor) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      })
      return
    }

    toast({
      title: 'Nota criada!',
      description: `Nota Fiscal ${novaNotaData.numero} foi criada com sucesso`
    })

    setIsNovaNotaDialogOpen(false)
    setNovaNotaData({
      numero: '',
      tipo: 'Entrada',
      empresa: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      vencimento: '',
      observacoes: ''
    })
  }

  const handleBaixarNota = (doc: any) => {
    // Simular download
    toast({
      title: 'Download iniciado',
      description: `Baixando nota fiscal ${doc.numero}`
    })
  }

  const handleVisualizarNota = (doc: any) => {
    setNotaSelecionada(doc)
    setIsVisualizarDialogOpen(true)
  }

  const handleExportRelatorio = () => {
    const data = {
      periodo: `${selectedMonth} ${selectedYear}`,
      documentos: filteredDocumentos,
      estatisticas: {
        total_faturado: 45231.00,
        impostos_pagar: 8456.00,
        nfs_processadas: 127,
        pendencias: 3
      },
      data_geracao: new Date().toISOString()
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-fiscal-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Relatório exportado!',
      description: 'O relatório fiscal foi baixado com sucesso'
    })
  }

  const handleAplicarPeriodo = () => {
    toast({
      title: 'Período atualizado',
      description: `Exibindo dados de ${selectedMonth} ${selectedYear}`
    })
    setIsPeriodoDialogOpen(false)
  }

  // Dados simulados de documentos fiscais
  const documentosFiscais = [
    {
      id: 1,
      numero: 'NF-001234',
      tipo: 'Nota Fiscal de Entrada',
      fornecedor: 'Transportadora ABC Ltda',
      valor: 1250.00,
      data: '2024-01-15',
      status: 'processada',
      vencimento: '2024-02-15'
    },
    {
      id: 2,
      numero: 'NF-001235',
      tipo: 'Nota Fiscal de Saída',
      cliente: 'Empresa XYZ S.A.',
      valor: 3450.00,
      data: '2024-01-14',
      status: 'emitida',
      vencimento: '2024-02-14'
    },
    {
      id: 3,
      numero: 'NF-001236',
      tipo: 'Nota Fiscal de Serviço',
      prestador: 'Oficina Mecânica Silva',
      valor: 850.00,
      data: '2024-01-13',
      status: 'pendente',
      vencimento: '2024-02-13'
    },
    {
      id: 4,
      numero: 'NF-001237',
      tipo: 'Nota Fiscal de Entrada',
      fornecedor: 'Posto de Combustível Norte',
      valor: 2100.00,
      data: '2024-01-12',
      status: 'processada',
      vencimento: '2024-02-12'
    }
  ]

  const getStatusBadge = (status: string) => {
    const colors = {
      processada: 'bg-green-100 text-green-800',
      emitida: 'bg-blue-100 text-blue-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      cancelada: 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  }

  const filteredDocumentos = documentosFiscais.filter(doc =>
    doc.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.fornecedor && doc.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (doc.cliente && doc.cliente.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Input oculto para upload de XML */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Fiscal</h1>
          <p className="text-gray-600">Controle de documentos fiscais e tributários</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleImportXML}>
            <Upload className="w-4 h-4 mr-2" />
            Importar XML
          </Button>
          <Dialog open={isNovaNotaDialogOpen} onOpenChange={setIsNovaNotaDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nova NF
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nova Nota Fiscal</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova nota fiscal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                      id="numero"
                      value={novaNotaData.numero}
                      onChange={(e) => setNovaNotaData({...novaNotaData, numero: e.target.value})}
                      placeholder="NF-001234"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo</Label>
                    <Select 
                      value={novaNotaData.tipo} 
                      onValueChange={(value) => setNovaNotaData({...novaNotaData, tipo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Entrada">Nota de Entrada</SelectItem>
                        <SelectItem value="Saída">Nota de Saída</SelectItem>
                        <SelectItem value="Serviço">Nota de Serviço</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={novaNotaData.empresa}
                    onChange={(e) => setNovaNotaData({...novaNotaData, empresa: e.target.value})}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor">Valor *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      value={novaNotaData.valor}
                      onChange={(e) => setNovaNotaData({...novaNotaData, valor: e.target.value})}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={novaNotaData.data}
                      onChange={(e) => setNovaNotaData({...novaNotaData, data: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="vencimento">Vencimento</Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={novaNotaData.vencimento}
                    onChange={(e) => setNovaNotaData({...novaNotaData, vencimento: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={novaNotaData.observacoes}
                    onChange={(e) => setNovaNotaData({...novaNotaData, observacoes: e.target.value})}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNovaNotaDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCriarNota}>
                  Criar Nota Fiscal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.231,00</div>
            <p className="text-xs text-muted-foreground">+20.1% desde o mês passado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impostos a Pagar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 8.456,00</div>
            <p className="text-xs text-muted-foreground">Vencimento em 15 dias</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NFs Processadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">+12 desde ontem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-red-600">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número, tipo ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isPeriodoDialogOpen} onOpenChange={setIsPeriodoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Período
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Selecionar Período</DialogTitle>
                  <DialogDescription>
                    Escolha o mês e ano para filtrar as notas fiscais
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="month">Mês</Label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="year">Ano</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Preview:</strong> {selectedMonth} de {selectedYear}
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPeriodoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAplicarPeriodo}>
                    Aplicar Período
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleExportRelatorio}>
              <Download className="w-4 h-4 mr-2" />
              Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle>Documentos Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDocumentos.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">{doc.numero}</span>
                      {getStatusBadge(doc.status)}
                    </div>
                    <p className="text-gray-700 mb-2">{doc.tipo}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {doc.fornecedor || doc.cliente || doc.prestador}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {doc.data}
                      </span>
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        {doc.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleBaixarNota(doc)}
                      title="Baixar Nota"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleVisualizarNota(doc)}
                      title="Visualizar Nota"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Visualização de Nota */}
      <Dialog open={isVisualizarDialogOpen} onOpenChange={setIsVisualizarDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
            <DialogDescription>
              Visualização completa dos dados da nota fiscal
            </DialogDescription>
          </DialogHeader>
          {notaSelecionada && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Número</Label>
                  <p className="font-medium">{notaSelecionada.numero}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(notaSelecionada.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Tipo</Label>
                <p className="font-medium">{notaSelecionada.tipo}</p>
              </div>

              <div>
                <Label className="text-gray-600">Empresa</Label>
                <p className="font-medium">
                  {notaSelecionada.fornecedor || notaSelecionada.cliente || notaSelecionada.prestador}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Valor</Label>
                  <p className="font-medium text-lg text-green-600">
                    {notaSelecionada.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Data de Emissão</Label>
                  <p className="font-medium">
                    {new Date(notaSelecionada.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Vencimento</Label>
                <p className="font-medium">
                  {new Date(notaSelecionada.vencimento).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div className="pt-4 border-t flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleBaixarNota(notaSelecionada)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Nota
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: 'Funcionalidade em desenvolvimento',
                      description: 'Impressão de nota fiscal em breve'
                    })
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsVisualizarDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
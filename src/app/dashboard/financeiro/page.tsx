"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X
} from 'lucide-react'

interface Transacao {
  id: number
  data_transacao: string
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  categoria?: string
  centro_custo?: { nome: string; cor_hex: string }
  status: 'pendente' | 'alocado' | 'aprovado'
  ofx_fitid?: string
}

interface ImportacaoOFX {
  id: number
  arquivo_nome: string
  total_transacoes: number
  transacoes_novas: number
  transacoes_duplicadas: number
  status: string
  created_at: string
}

interface PreviewTransacao {
  data: string
  descricao: string
  valor: number
  tipo: 'entrada' | 'saida'
  categoria_sugerida?: string
  duplicada: boolean
  fitid?: string
}

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [importacoes, setImportacoes] = useState<ImportacaoOFX[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transacao | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  
  // Estados para preview OFX
  const [previewTransacoes, setPreviewTransacoes] = useState<PreviewTransacao[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    data_transacao: new Date().toISOString().split('T')[0],
    descricao: '',
    valor: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    categoria: '',
    status: 'pendente' as 'pendente' | 'alocado' | 'aprovado'
  })

  // Dados simulados para demonstração
  const transacoesSimuladas: Transacao[] = [
    {
      id: 1,
      data_transacao: '2024-01-15',
      descricao: 'COMBUSTÍVEL POSTO IPIRANGA',
      valor: 2500.00,
      tipo: 'saida',
      categoria: 'Combustível',
      centro_custo: { nome: 'Veículos', cor_hex: '#EF4444' },
      status: 'alocado',
      ofx_fitid: 'TXN-001'
    },
    {
      id: 2,
      data_transacao: '2024-01-15',
      descricao: 'RECEBIMENTO CLIENTE ABC LTDA',
      valor: 45000.00,
      tipo: 'entrada',
      categoria: 'Receita Operacional',
      status: 'pendente'
    },
    {
      id: 3,
      data_transacao: '2024-01-14',
      descricao: 'ALUGUEL SEDE JANEIRO',
      valor: 12000.00,
      tipo: 'saida',
      categoria: 'Aluguel',
      centro_custo: { nome: 'Sede', cor_hex: '#3B82F6' },
      status: 'alocado'
    }
  ]

  const importacoesSimuladas: ImportacaoOFX[] = [
    {
      id: 1,
      arquivo_nome: 'extrato_janeiro_2024.ofx',
      total_transacoes: 47,
      transacoes_novas: 45,
      transacoes_duplicadas: 2,
      status: 'concluido',
      created_at: '2024-01-15T14:30:00Z'
    }
  ]

  useEffect(() => {
    // Simula carregamento
    setTimeout(() => {
      setTransacoes(transacoesSimuladas)
      setImportacoes(importacoesSimuladas)
      setLoading(false)
    }, 1000)
  }, [])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.ofx')) {
      alert('Por favor, selecione um arquivo .ofx válido')
      return
    }

    setSelectedFile(file)
    setUploadLoading(true)
    setImportProgress(0)
    
    try {
      // Simula análise do arquivo OFX
      const progressSteps = [10, 30, 60, 80, 100]
      for (const step of progressSteps) {
        setImportProgress(step)
        await new Promise(resolve => setTimeout(resolve, 400))
      }
      
      // Simula preview das transações encontradas
      const previewData: PreviewTransacao[] = [
        {
          data: '2024-01-15',
          descricao: 'TED RECEBIDA - EMPRESA ABC LTDA',
          valor: 15000.00,
          tipo: 'entrada',
          categoria_sugerida: 'Receita Operacional',
          duplicada: false,
          fitid: 'TXN-001'
        },
        {
          data: '2024-01-15',
          descricao: 'COMBUSTIVEL POSTO SHELL',
          valor: 280.50,
          tipo: 'saida',
          categoria_sugerida: 'Combustível',
          duplicada: false,
          fitid: 'TXN-002'
        },
        {
          data: '2024-01-14',
          descricao: 'ALUGUEL SEDE JANEIRO',
          valor: 12000.00,
          tipo: 'saida',
          categoria_sugerida: 'Aluguel',
          duplicada: true, // Já existe no sistema
          fitid: 'TXN-003'
        },
        {
          data: '2024-01-14',
          descricao: 'PAGAMENTO FORNECEDOR XYZ',
          valor: 5600.00,
          tipo: 'saida',
          categoria_sugerida: 'Fornecedores',
          duplicada: false,
          fitid: 'TXN-004'
        },
        {
          data: '2024-01-13',
          descricao: 'DIARIA FUNCIONARIO JOAO SILVA',
          valor: 450.00,
          tipo: 'saida',
          categoria_sugerida: 'Diárias',
          duplicada: false,
          fitid: 'TXN-005'
        }
      ]
      
      setPreviewTransacoes(previewData)
      setShowPreview(true)
      
    } catch (error) {
      alert('Erro ao analisar arquivo OFX')
    } finally {
      setUploadLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!selectedFile || previewTransacoes.length === 0) return

    setUploadLoading(true)
    setImportProgress(0)
    
    try {
      // Simula importação das transações não duplicadas
      const transacoesParaImportar = previewTransacoes.filter(t => !t.duplicada)
      const progressStep = 100 / transacoesParaImportar.length

      for (let i = 0; i < transacoesParaImportar.length; i++) {
        const preview = transacoesParaImportar[i]
        
        // Cria nova transação baseada no preview
        const novaTransacao: Transacao = {
          id: Math.max(...transacoes.map(t => t.id), 0) + i + 1,
          data_transacao: preview.data,
          descricao: preview.descricao,
          valor: preview.valor,
          tipo: preview.tipo,
          categoria: preview.categoria_sugerida,
          status: 'pendente',
          ofx_fitid: preview.fitid
        }
        
        setTransacoes(prev => [novaTransacao, ...prev])
        setImportProgress((i + 1) * progressStep)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // Registra a importação
      const novaImportacao: ImportacaoOFX = {
        id: importacoes.length + 1,
        arquivo_nome: selectedFile.name,
        total_transacoes: previewTransacoes.length,
        transacoes_novas: transacoesParaImportar.length,
        transacoes_duplicadas: previewTransacoes.filter(t => t.duplicada).length,
        status: 'concluido',
        created_at: new Date().toISOString()
      }
      
      setImportacoes([novaImportacao, ...importacoes])
      
      // Reset states
      setShowPreview(false)
      setPreviewTransacoes([])
      setSelectedFile(null)
      setIsImportDialogOpen(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error) {
      alert('Erro ao importar transações')
    } finally {
      setUploadLoading(false)
      setImportProgress(0)
    }
  }

  const handleCancelImport = () => {
    setShowPreview(false)
    setPreviewTransacoes([])
    setSelectedFile(null)
    setUploadLoading(false)
    setImportProgress(0)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCreateTransaction = () => {
    setIsEditMode(false)
    setEditingTransaction(null)
    setFormData({
      data_transacao: new Date().toISOString().split('T')[0],
      descricao: '',
      valor: '',
      tipo: 'entrada',
      categoria: '',
      status: 'pendente'
    })
    setIsTransactionDialogOpen(true)
  }

  const handleEditTransaction = (transaction: Transacao) => {
    setIsEditMode(true)
    setEditingTransaction(transaction)
    setFormData({
      data_transacao: transaction.data_transacao,
      descricao: transaction.descricao,
      valor: transaction.valor.toString(),
      tipo: transaction.tipo,
      categoria: transaction.categoria || '',
      status: transaction.status
    })
    setIsTransactionDialogOpen(true)
  }

  const handleDeleteTransaction = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      setTransacoes(transacoes.filter(t => t.id !== id))
    }
  }

  const handleSaveTransaction = async () => {
    if (!formData.descricao || !formData.valor) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    const transactionData: Transacao = {
      id: isEditMode ? editingTransaction!.id : Math.max(...transacoes.map(t => t.id), 0) + 1,
      data_transacao: formData.data_transacao,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor),
      tipo: formData.tipo,
      categoria: formData.categoria || undefined,
      status: formData.status
    }

    if (isEditMode) {
      setTransacoes(transacoes.map(t => 
        t.id === editingTransaction!.id ? transactionData : t
      ))
    } else {
      setTransacoes([transactionData, ...transacoes])
    }

    setIsTransactionDialogOpen(false)
    setEditingTransaction(null)
  }

  const handleExportData = (format: 'csv' | 'excel' = 'csv') => {
    const data = [
      ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Centro de Custo', 'Status', 'OFX ID'],
      ...filteredTransacoes.map(t => [
        new Date(t.data_transacao).toLocaleDateString('pt-BR'),
        t.descricao,
        t.valor.toFixed(2),
        t.tipo === 'entrada' ? 'Entrada' : 'Saída',
        t.categoria || '',
        t.centro_custo?.nome || '',
        t.status.charAt(0).toUpperCase() + t.status.slice(1),
        t.ofx_fitid || ''
      ])
    ]
    
    if (format === 'csv') {
      const csvContent = data.map(row => 
        row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } else {
      // Para Excel, criamos um HTML simples que o Excel pode interpretar
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .number { text-align: right; }
              .currency { text-align: right; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>${data[0].map(header => `<th>${header}</th>`).join('')}</tr>
              </thead>
              <tbody>
                ${data.slice(1).map(row => 
                  `<tr>${row.map((cell, index) => 
                    index === 2 ? `<td class="currency">${cell}</td>` : `<td>${cell}</td>`
                  ).join('')}</tr>`
                ).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `
      
      const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transacoes_${new Date().toISOString().split('T')[0]}.xls`
      link.click()
      URL.revokeObjectURL(url)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pendente: 'bg-yellow-100 text-yellow-800',
      alocado: 'bg-blue-100 text-blue-800',
      aprovado: 'bg-green-100 text-green-800'
    }
    const labels = {
      pendente: 'Pendente',
      alocado: 'Alocado',
      aprovado: 'Aprovado'
    }
    return <Badge className={colors[status as keyof typeof colors]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  }

  const filteredTransacoes = transacoes.filter(t => {
    const matchesSearch = t.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'todos' || t.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0)
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0)
  const saldo = totalEntradas - totalSaidas
  const transacoesPendentes = transacoes.filter(t => t.status === 'pendente').length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo Financeiro</h1>
          <p className="text-gray-600">Gestão de transações e importação de extratos bancários</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex">
            <Button variant="outline" size="sm" onClick={() => handleExportData('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExportData('excel')}
              className="ml-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleCreateTransaction}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar OFX
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Extrato Bancário (OFX)</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Selecione um arquivo .ofx exportado da Caixa Econômica Federal para importar suas transações automaticamente.
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-4">
                    Arraste um arquivo .ofx aqui ou clique para selecionar
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ofx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadLoading}
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Arquivo
                      </>
                    )}
                  </Button>
                </div>
                
                {uploadLoading && !showPreview && (
                  <div className="space-y-2">
                    <Progress value={importProgress} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      Analisando arquivo OFX e categorizando transações...
                    </p>
                  </div>
                )}

                {showPreview && (
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Preview da Importação - {selectedFile?.name}
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-blue-700 font-medium">Total:</span>
                          <span className="ml-1">{previewTransacoes.length} transações</span>
                        </div>
                        <div>
                          <span className="text-green-700 font-medium">Novas:</span>
                          <span className="ml-1">{previewTransacoes.filter(t => !t.duplicada).length}</span>
                        </div>
                        <div>
                          <span className="text-orange-700 font-medium">Duplicadas:</span>
                          <span className="ml-1">{previewTransacoes.filter(t => t.duplicada).length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {previewTransacoes.map((transacao, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          transacao.duplicada ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{transacao.descricao}</p>
                              <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                                <span>{new Date(transacao.data).toLocaleDateString('pt-BR')}</span>
                                {transacao.categoria_sugerida && (
                                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {transacao.categoria_sugerida}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold ${
                                transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                              </p>
                              {transacao.duplicada && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs mt-1">
                                  Duplicada
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {uploadLoading ? (
                      <div className="space-y-2">
                        <Progress value={importProgress} className="w-full" />
                        <p className="text-sm text-gray-600 text-center">
                          Importando transações... {Math.round(importProgress)}%
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={handleCancelImport}>
                          Cancelar
                        </Button>
                        <Button onClick={handleConfirmImport}>
                          Importar {previewTransacoes.filter(t => !t.duplicada).length} Transações
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </div>
            <p className="text-xs text-muted-foreground">Resultado mensal</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{transacoesPendentes}</div>
            <p className="text-xs text-muted-foreground">Aguardando alocação</p>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Importações */}
      {importacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas Importações OFX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importacoes.slice(0, 3).map((importacao) => (
                <div key={importacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{importacao.arquivo_nome}</p>
                      <p className="text-xs text-gray-500">
                        {importacao.transacoes_novas} novas, {importacao.transacoes_duplicadas} duplicadas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(importacao.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar transações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {['todos', 'pendente', 'alocado', 'aprovado'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Transações */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Financeiras</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransacoes.map((transacao) => (
              <div key={transacao.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium">{transacao.descricao}</p>
                    {transacao.ofx_fitid && (
                      <Badge variant="outline" className="text-xs">OFX</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(transacao.data_transacao).toLocaleDateString('pt-BR')}
                    </span>
                    {transacao.categoria && (
                      <span>{transacao.categoria}</span>
                    )}
                    {transacao.centro_custo && (
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        <span 
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: transacao.centro_custo.cor_hex }}
                        >
                          {transacao.centro_custo.nome}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className={`font-semibold text-lg ${
                      transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </p>
                    {getStatusBadge(transacao.status)}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTransaction(transacao)}
                      className="p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTransaction(transacao.id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTransacoes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'todos' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Importe um arquivo OFX para começar'
                }
              </p>
              {!searchTerm && filterStatus === 'todos' && (
                <Button onClick={() => setIsImportDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Primeiro OFX
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de Criação/Edição de Transação */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Editar Transação' : 'Nova Transação'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data_transacao}
                  onChange={(e) => setFormData({...formData, data_transacao: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value: 'entrada' | 'saida') => setFormData({...formData, tipo: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Digite a descrição da transação"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData({...formData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem categoria</SelectItem>
                    <SelectItem value="Combustível">Combustível</SelectItem>
                    <SelectItem value="Aluguel">Aluguel</SelectItem>
                    <SelectItem value="Receita Operacional">Receita Operacional</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Seguros">Seguros</SelectItem>
                    <SelectItem value="Telefonia">Telefonia</SelectItem>
                    <SelectItem value="Internet">Internet</SelectItem>
                    <SelectItem value="Diárias">Diárias</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: 'pendente' | 'alocado' | 'aprovado') => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="alocado">Alocado</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsTransactionDialogOpen(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSaveTransaction}>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Salvar Alterações' : 'Criar Transação'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
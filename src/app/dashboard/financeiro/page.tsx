"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
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
  Search
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

export default function FinanceiroPage() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [importacoes, setImportacoes] = useState<ImportacaoOFX[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.ofx')) {
      alert('Por favor, selecione um arquivo .ofx válido')
      return
    }

    setUploadLoading(true)
    
    try {
      // Simula upload - substituir por chamada real à API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simula resultado da importação
      const novaImportacao: ImportacaoOFX = {
        id: importacoes.length + 1,
        arquivo_nome: file.name,
        total_transacoes: 25,
        transacoes_novas: 23,
        transacoes_duplicadas: 2,
        status: 'concluido',
        created_at: new Date().toISOString()
      }
      
      setImportacoes([novaImportacao, ...importacoes])
      setIsImportDialogOpen(false)
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      
    } catch (error) {
      alert('Erro ao importar arquivo OFX')
    } finally {
      setUploadLoading(false)
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
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
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
                    onChange={handleFileUpload}
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
                
                {uploadLoading && (
                  <div className="space-y-2">
                    <Progress value={75} className="w-full" />
                    <p className="text-sm text-gray-600 text-center">
                      Processando arquivo e categorizando transações...
                    </p>
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
                <div className="text-right">
                  <p className={`font-semibold text-lg ${
                    transacao.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                  </p>
                  {getStatusBadge(transacao.status)}
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
    </div>
  )
}
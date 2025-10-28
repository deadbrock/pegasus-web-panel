"use client"

import { useState, useRef, useEffect } from 'react'
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
  CheckCircle,
  Loader2
} from 'lucide-react'
import {
  fetchNotasFiscais,
  createNotaFiscal,
  importarNotaFiscalXML,
  processarNotaFiscal,
  deleteNotaFiscal,
  calcularEstatisticasNotas,
  type NotaFiscalRecord,
  type NotaFiscalStats
} from '@/services/notasFiscaisService'

export default function FiscalPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isNovaNotaDialogOpen, setIsNovaNotaDialogOpen] = useState(false)
  const [isVisualizarDialogOpen, setIsVisualizarDialogOpen] = useState(false)
  const [isTipoImportDialogOpen, setIsTipoImportDialogOpen] = useState(false)
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscalRecord | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [xmlPendente, setXmlPendente] = useState<string | null>(null)
  const [tipoOperacaoImport, setTipoOperacaoImport] = useState<'entrada' | 'saida'>('entrada')
  
  const [notas, setNotas] = useState<NotaFiscalRecord[]>([])
  const [stats, setStats] = useState<NotaFiscalStats | null>(null)
  
  const [novaNotaData, setNovaNotaData] = useState({
    numero: '',
    serie: '1',
    chave_acesso: '',
    tipo_operacao: 'entrada' as 'entrada' | 'saida',
    cnpj: '',
    razao_social: '',
    valor_total: '',
    data_emissao: new Date().toISOString().split('T')[0],
    observacoes: ''
  })

  // Carregar notas fiscais
  useEffect(() => {
    loadNotas()
  }, [])

  const loadNotas = async () => {
    setLoading(true)
    const rows = await fetchNotasFiscais()
    setNotas(rows)
    
    // Calcular estatísticas
    const estatisticas = calcularEstatisticasNotas(rows)
    setStats(estatisticas)
    
    setLoading(false)
  }

  // Importação de XML
  const handleImportXML = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Ler conteúdo do arquivo
      const xmlContent = await file.text()
      
      // Armazenar XML e abrir diálogo para escolher tipo
      setXmlPendente(xmlContent)
      setTipoOperacaoImport('entrada')
      setIsTipoImportDialogOpen(true)
      
    } catch (error: any) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error.message || 'Erro ao ler arquivo XML',
        variant: 'destructive'
      })
    } finally {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmarImportacao = async () => {
    if (!xmlPendente) return

    setIsImporting(true)
    setIsTipoImportDialogOpen(false)

    try {
      // Importar nota fiscal com tipo escolhido
      const result = await importarNotaFiscalXML(xmlPendente, tipoOperacaoImport)
      
      if (result.success) {
        toast({
          title: 'XML Importado com sucesso!',
          description: `Nota Fiscal ${result.nota?.numero} foi importada como ${tipoOperacaoImport}`
        })
        
        // Recarregar lista
        await loadNotas()
      } else {
        toast({
          title: 'Erro ao importar XML',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao processar arquivo',
        description: error.message || 'Erro ao importar XML',
        variant: 'destructive'
      })
    } finally {
      setIsImporting(false)
      setXmlPendente(null)
    }
  }

  // Criar nota fiscal manualmente
  const handleCriarNota = async () => {
    if (!novaNotaData.numero || !novaNotaData.cnpj || !novaNotaData.razao_social || !novaNotaData.valor_total) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      })
      return
    }

    // Gerar chave de acesso fake se não fornecida
    const chaveAcesso = novaNotaData.chave_acesso || 
      `${Date.now()}${Math.random().toString().slice(2, 13)}`.padEnd(44, '0')

    const nota: Partial<NotaFiscalRecord> = {
      numero: novaNotaData.numero,
      serie: novaNotaData.serie,
      chave_acesso: chaveAcesso,
      cnpj: novaNotaData.cnpj,
      razao_social: novaNotaData.razao_social,
      valor_total: parseFloat(novaNotaData.valor_total),
      data_emissao: novaNotaData.data_emissao,
      tipo_operacao: novaNotaData.tipo_operacao,
      observacoes: novaNotaData.observacoes,
      status: 'Pendente'
    }

    const created = await createNotaFiscal(nota)

    if (created) {
      toast({
        title: 'Nota criada!',
        description: `Nota Fiscal ${nota.numero} foi criada com sucesso`
      })

      setIsNovaNotaDialogOpen(false)
      setNovaNotaData({
        numero: '',
        serie: '1',
        chave_acesso: '',
        tipo_operacao: 'entrada',
        cnpj: '',
        razao_social: '',
        valor_total: '',
        data_emissao: new Date().toISOString().split('T')[0],
        observacoes: ''
      })
      
      await loadNotas()
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a nota fiscal',
        variant: 'destructive'
      })
    }
  }

  const handleVisualizarNota = (nota: NotaFiscalRecord) => {
    setNotaSelecionada(nota)
    setIsVisualizarDialogOpen(true)
  }

  const handleProcessarNota = async (nota: NotaFiscalRecord) => {
    const success = await processarNotaFiscal(nota.id!)
    
    if (success) {
      toast({
        title: 'Nota processada',
        description: `Nota ${nota.numero} foi processada com sucesso`
      })
      await loadNotas()
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar a nota',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteNota = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta nota fiscal?')) return
    
    const success = await deleteNotaFiscal(id)
    
    if (success) {
      toast({
        title: 'Nota excluída',
        description: 'Nota fiscal foi excluída com sucesso'
      })
      await loadNotas()
    } else {
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a nota',
        variant: 'destructive'
      })
    }
  }

  const handleExportRelatorio = () => {
    const data = {
      periodo: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      notas: filteredNotas,
      estatisticas: stats,
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

  const getStatusBadge = (status: string) => {
    const colors = {
      Processada: 'bg-green-100 text-green-800',
      Pendente: 'bg-yellow-100 text-yellow-800',
      Cancelada: 'bg-red-100 text-red-800',
      Rejeitada: 'bg-red-100 text-red-800',
      Ativa: 'bg-blue-100 text-blue-800'
    }
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {status}
    </Badge>
  }

  const filteredNotas = notas.filter(nota =>
    nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    nota.cnpj.includes(searchTerm)
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleImportXML}
            disabled={isImporting}
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Importar XML
          </Button>
          <Button size="sm" onClick={() => setIsNovaNotaDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova NF
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `R$ ${stats.total_faturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.porTipo.entrada} entradas · {stats?.porTipo.saida} saídas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impostos Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? `R$ ${stats.impostos_totais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                ICMS + IPI + PIS + COFINS
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NFs Processadas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.processadas || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total: {stats?.total || 0} notas
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendentes || 0}</div>
              <p className={`text-xs ${stats && stats.pendentes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats && stats.pendentes > 0 ? 'Requer atenção' : 'Tudo em dia'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Busca e Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número, razão social ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleExportRelatorio}>
              <Download className="w-4 h-4 mr-2" />
              Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notas Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredNotas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mb-4 text-gray-400" />
              <p className="text-lg font-medium">Nenhuma nota fiscal encontrada</p>
              <p className="text-sm mt-2">Importe um XML ou crie uma nova nota fiscal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotas.map((nota) => (
                <div key={nota.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900">{nota.numero}</span>
                        {getStatusBadge(nota.status)}
                        <Badge variant="outline" className={nota.tipo_operacao === 'entrada' ? 'text-green-600' : 'text-blue-600'}>
                          {nota.tipo_operacao === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{nota.razao_social}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>CNPJ: {nota.cnpj}</span>
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(nota.data_emissao).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center font-semibold text-gray-700">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {nota.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {nota.status === 'Pendente' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleProcessarNota(nota)}
                          title="Processar Nota"
                          className="text-green-600 hover:text-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleVisualizarNota(nota)}
                        title="Visualizar Nota"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Nova Nota */}
      <Dialog open={isNovaNotaDialogOpen} onOpenChange={setIsNovaNotaDialogOpen}>
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
                  placeholder="000123"
                />
              </div>
              <div>
                <Label htmlFor="serie">Série</Label>
                <Input
                  id="serie"
                  value={novaNotaData.serie}
                  onChange={(e) => setNovaNotaData({...novaNotaData, serie: e.target.value})}
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={novaNotaData.cnpj}
                onChange={(e) => setNovaNotaData({...novaNotaData, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="razao_social">Razão Social *</Label>
              <Input
                id="razao_social"
                value={novaNotaData.razao_social}
                onChange={(e) => setNovaNotaData({...novaNotaData, razao_social: e.target.value})}
                placeholder="Nome da empresa"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valor">Valor Total *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={novaNotaData.valor_total}
                  onChange={(e) => setNovaNotaData({...novaNotaData, valor_total: e.target.value})}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label htmlFor="data">Data Emissão</Label>
                <Input
                  id="data"
                  type="date"
                  value={novaNotaData.data_emissao}
                  onChange={(e) => setNovaNotaData({...novaNotaData, data_emissao: e.target.value})}
                />
              </div>
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

      {/* Dialog Visualizar Nota */}
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
                  <p className="font-medium">{notaSelecionada.numero} / {notaSelecionada.serie}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(notaSelecionada.status)}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Razão Social</Label>
                <p className="font-medium">{notaSelecionada.razao_social}</p>
              </div>

              <div>
                <Label className="text-gray-600">CNPJ</Label>
                <p className="font-medium">{notaSelecionada.cnpj}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Valor Total</Label>
                  <p className="font-medium text-lg text-green-600">
                    {notaSelecionada.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Data de Emissão</Label>
                  <p className="font-medium">
                    {new Date(notaSelecionada.data_emissao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {notaSelecionada.valor_icms && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">ICMS</Label>
                    <p className="font-medium">
                      {notaSelecionada.valor_icms.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  {notaSelecionada.valor_ipi && (
                    <div>
                      <Label className="text-gray-600">IPI</Label>
                      <p className="font-medium">
                        {notaSelecionada.valor_ipi.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {notaSelecionada.observacoes && (
                <div>
                  <Label className="text-gray-600">Observações</Label>
                  <p className="text-sm mt-1">{notaSelecionada.observacoes}</p>
                </div>
              )}

              <div className="pt-4 border-t flex space-x-2">
                {notaSelecionada.status === 'Pendente' && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      handleProcessarNota(notaSelecionada)
                      setIsVisualizarDialogOpen(false)
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Processar Nota
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  onClick={() => {
                    handleDeleteNota(notaSelecionada.id!)
                    setIsVisualizarDialogOpen(false)
                  }}
                >
                  Excluir Nota
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

      {/* Diálogo de Seleção de Tipo de Operação */}
      <Dialog open={isTipoImportDialogOpen} onOpenChange={setIsTipoImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tipo de Operação da Nota Fiscal</DialogTitle>
            <DialogDescription>
              Selecione se esta nota fiscal é de ENTRADA (compra/recebimento) ou SAÍDA (venda/envio)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <Label htmlFor="tipo_operacao">Tipo de Operação *</Label>
              <Select 
                value={tipoOperacaoImport} 
                onValueChange={(value) => setTipoOperacaoImport(value as 'entrada' | 'saida')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span>ENTRADA - Compra/Recebimento de Materiais</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="saida">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                      <span>SAÍDA - Venda/Envio de Materiais</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              tipoOperacaoImport === 'entrada' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                  tipoOperacaoImport === 'entrada' ? 'text-green-600' : 'text-red-600'
                }`} />
                <div>
                  <p className={`font-semibold ${
                    tipoOperacaoImport === 'entrada' ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {tipoOperacaoImport === 'entrada' ? 'Nota de Entrada' : 'Nota de Saída'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    tipoOperacaoImport === 'entrada' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {tipoOperacaoImport === 'entrada' 
                      ? 'Os produtos desta nota serão ADICIONADOS ao estoque automaticamente ao processar.'
                      : 'Os produtos desta nota serão REMOVIDOS do estoque automaticamente ao processar.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsTipoImportDialogOpen(false)
                setXmlPendente(null)
              }}
              disabled={isImporting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarImportacao}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

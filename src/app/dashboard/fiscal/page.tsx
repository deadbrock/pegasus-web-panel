'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Filter, FileText, Upload, Download, Eye, Edit, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { FiscalStats } from '@/components/fiscal/fiscal-stats'
import { NotasFiscaisTable } from '@/components/fiscal/notas-fiscais-table'
import { NotaFiscalDialog } from '@/components/fiscal/nota-fiscal-dialog'
import { FiscalFilters } from '@/components/fiscal/fiscal-filters'
import { XMLUploadDialog } from '@/components/fiscal/xml-upload-dialog'
import { ProcessamentoDialog } from '@/components/fiscal/processamento-dialog'
import { fiscalService } from '@/lib/services/fiscal-service'
import { NotaFiscal, FiltroNotaFiscal } from '@/types/fiscal'

export default function FiscalPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isXMLUploadOpen, setIsXMLUploadOpen] = useState(false)
  const [isProcessamentoOpen, setIsProcessamentoOpen] = useState(false)
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FiltroNotaFiscal>({})

  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Query para buscar notas fiscais
  const { data: notasFiscais = [], isLoading } = useQuery({
    queryKey: ['notas-fiscais', filters],
    queryFn: () => fiscalService.getNotasFiscais(filters),
  })

  // Query para estatísticas
  const { data: stats } = useQuery({
    queryKey: ['fiscal-stats'],
    queryFn: () => fiscalService.getStats(),
  })

  // Mutation para deletar nota fiscal
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fiscalService.deleteNotaFiscal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] })
      queryClient.invalidateQueries({ queryKey: ['fiscal-stats'] })
      toast({
        title: 'Sucesso',
        description: 'Nota fiscal excluída com sucesso',
      })
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir nota fiscal',
        variant: 'destructive',
      })
    },
  })

  const handleEdit = (nota: NotaFiscal) => {
    setSelectedNota(nota)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta nota fiscal?')) {
      deleteMutation.mutate(id)
    }
  }

  const handleProcessar = (nota: NotaFiscal) => {
    setSelectedNota(nota)
    setIsProcessamentoOpen(true)
  }

  const handleNovaNotaFiscal = () => {
    setSelectedNota(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setSelectedNota(null)
    queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] })
    queryClient.invalidateQueries({ queryKey: ['fiscal-stats'] })
  }

  const handleXMLUploadClose = () => {
    setIsXMLUploadOpen(false)
    queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] })
    queryClient.invalidateQueries({ queryKey: ['fiscal-stats'] })
  }

  const handleProcessamentoClose = () => {
    setIsProcessamentoOpen(false)
    setSelectedNota(null)
    queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] })
    queryClient.invalidateQueries({ queryKey: ['fiscal-stats'] })
  }

  const handleExportarRelatorio = () => {
    // Gerar relatório em CSV
    const csvContent = [
      'Número,Série,Chave de Acesso,CNPJ,Razão Social,Data Emissão,Valor Total,Status,Tipo Operação',
      ...notasFiscais.map(nota => [
        nota.numero,
        nota.serie,
        nota.chave_acesso,
        nota.cnpj,
        nota.razao_social,
        nota.data_emissao,
        nota.valor_total,
        nota.status,
        nota.tipo_operacao
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_fiscal_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Fiscal</h1>
          <p className="text-gray-600">Gerencie notas fiscais e documentos tributários</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsXMLUploadOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar XML
          </Button>
          <Button
            variant="outline"
            onClick={handleExportarRelatorio}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button
            onClick={handleNovaNotaFiscal}
            className="flex items-center gap-2 bg-pegasus-blue hover:bg-pegasus-blue/90"
          >
            <Plus className="h-4 w-4" />
            Nova Nota Fiscal
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && <FiscalStats stats={stats} />}

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FiscalFilters
              filters={filters}
              onFiltersChange={setFilters}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabela de Notas Fiscais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Fiscais ({notasFiscais.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotasFiscaisTable
            notasFiscais={notasFiscais}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onProcessar={handleProcessar}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <NotaFiscalDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        notaFiscal={selectedNota}
      />

      <XMLUploadDialog
        open={isXMLUploadOpen}
        onClose={handleXMLUploadClose}
      />

      <ProcessamentoDialog
        open={isProcessamentoOpen}
        onClose={handleProcessamentoClose}
        notaFiscal={selectedNota}
      />
    </div>
  )
} 
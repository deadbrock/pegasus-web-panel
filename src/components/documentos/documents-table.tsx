'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Calendar, User, Shield, Download, Edit, Trash2, Eye, AlertTriangle } from 'lucide-react'

interface DocumentsTableProps {
  onEdit: (document: any) => void
}

// Mock data para documentos
const documentsData = [
  {
    id: 1,
    tipo: 'CNH',
    numero: '123456789',
    dataEmissao: '2023-01-15',
    dataVencimento: '2028-01-15',
    status: 'Válido',
    responsavel: 'João Silva',
    arquivo: 'CNH_JoaoSilva.pdf',
    tamanho: '2.4 MB',
    observacoes: 'Categoria B',
    diasParaVencer: 1095
  },
  {
    id: 2,
    tipo: 'CRLV',
    numero: 'BRA-2023',
    dataEmissao: '2023-12-01',
    dataVencimento: '2024-12-01',
    status: 'Válido',
    responsavel: 'Carlos Lima',
    arquivo: 'CRLV_BRA2023.pdf',
    tamanho: '1.8 MB',
    observacoes: 'Veículo de carga',
    diasParaVencer: 330
  },
  {
    id: 3,
    tipo: 'CNH',
    numero: '987654321',
    dataEmissao: '2020-03-10',
    dataVencimento: '2024-01-18',
    status: 'Vencido',
    responsavel: 'Maria Santos',
    arquivo: 'CNH_MariaSantos.pdf',
    tamanho: '2.1 MB',
    observacoes: 'Categoria D - Vencida',
    diasParaVencer: -5
  },
  {
    id: 4,
    tipo: 'Seguro',
    numero: 'SEG-2024-001',
    dataEmissao: '2024-01-01',
    dataVencimento: '2025-01-01',
    status: 'Válido',
    responsavel: 'Ana Costa',
    arquivo: 'Seguro_Frota_2024.pdf',
    tamanho: '3.2 MB',
    observacoes: 'Cobertura completa da frota',
    diasParaVencer: 350
  },
  {
    id: 5,
    tipo: 'ANTT',
    numero: 'ANTT-123456',
    dataEmissao: '2023-06-15',
    dataVencimento: '2026-06-15',
    status: 'Válido',
    responsavel: 'Pedro Costa',
    arquivo: 'ANTT_Registro.pdf',
    tamanho: '1.5 MB',
    observacoes: 'Registro de transporte',
    diasParaVencer: 870
  },
  {
    id: 6,
    tipo: 'CRLV',
    numero: 'BRA-2024',
    dataEmissao: '2023-11-20',
    dataVencimento: '2024-01-25',
    status: 'Vencendo',
    responsavel: 'Luis Fernando',
    arquivo: 'CRLV_BRA2024.pdf',
    tamanho: '1.9 MB',
    observacoes: 'Renovação pendente',
    diasParaVencer: 3
  },
  {
    id: 7,
    tipo: 'Certificado',
    numero: 'CERT-2023-007',
    dataEmissao: '2023-09-01',
    dataVencimento: '2024-09-01',
    status: 'Válido',
    responsavel: 'Roberto Silva',
    arquivo: 'Certificado_Seguranca.pdf',
    tamanho: '2.7 MB',
    observacoes: 'Certificado de segurança',
    diasParaVencer: 230
  },
  {
    id: 8,
    tipo: 'CNH',
    numero: '555444333',
    dataEmissao: '2022-08-20',
    dataVencimento: '2024-02-15',
    status: 'Em Renovação',
    responsavel: 'Fernanda Oliveira',
    arquivo: 'CNH_FernandaOliveira.pdf',
    tamanho: '2.3 MB',
    observacoes: 'Processo de renovação em andamento',
    diasParaVencer: 25
  }
]

export function DocumentsTable({ onEdit }: DocumentsTableProps) {
  const getStatusBadge = (status: string, diasParaVencer: number) => {
    if (status === 'Vencido' || diasParaVencer < 0) {
      return <Badge variant="destructive">Vencido</Badge>
    }
    if (status === 'Vencendo' || diasParaVencer <= 30) {
      return <Badge className="bg-orange-500">Vencendo</Badge>
    }
    if (status === 'Em Renovação') {
      return <Badge className="bg-blue-500">Em Renovação</Badge>
    }
    if (status === 'Pendente') {
      return <Badge variant="outline">Pendente</Badge>
    }
    return <Badge className="bg-green-500">Válido</Badge>
  }

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'CNH':
        return <Shield className="w-4 h-4 text-blue-600" />
      case 'CRLV':
        return <FileText className="w-4 h-4 text-green-600" />
      case 'Seguro':
        return <Shield className="w-4 h-4 text-purple-600" />
      case 'ANTT':
        return <FileText className="w-4 h-4 text-orange-600" />
      case 'Certificado':
        return <Shield className="w-4 h-4 text-cyan-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysUntilExpiration = (diasParaVencer: number) => {
    if (diasParaVencer < 0) {
      return `Vencido há ${Math.abs(diasParaVencer)} dias`
    }
    if (diasParaVencer === 0) {
      return 'Vence hoje'
    }
    if (diasParaVencer <= 30) {
      return `${diasParaVencer} dias`
    }
    return `${Math.floor(diasParaVencer / 30)} meses`
  }

  const getExpirationColor = (diasParaVencer: number) => {
    if (diasParaVencer < 0) return 'text-red-600'
    if (diasParaVencer <= 7) return 'text-red-600'
    if (diasParaVencer <= 30) return 'text-orange-600'
    return 'text-gray-600'
  }

  const handleEdit = (document: any) => {
    onEdit(document)
  }

  const handleDownload = (document: any) => {
    console.log('Download documento:', document.arquivo)
  }

  const handleDelete = (documentId: number) => {
    console.log('Deletar documento:', documentId)
  }

  const handleView = (document: any) => {
    console.log('Visualizar documento:', document.arquivo)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead>Número</TableHead>
            <TableHead>Emissão</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Arquivo</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documentsData.map((document) => (
            <TableRow key={document.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  {getTypeIcon(document.tipo)}
                  <div>
                    <p className="font-medium">{document.tipo}</p>
                    {document.observacoes && (
                      <p className="text-sm text-gray-500">{document.observacoes}</p>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <span className="font-mono text-sm">{document.numero}</span>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{formatDate(document.dataEmissao)}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{formatDate(document.dataVencimento)}</span>
                  </div>
                  <div className={`text-xs mt-1 ${getExpirationColor(document.diasParaVencer)}`}>
                    {document.diasParaVencer < 0 && (
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                    )}
                    {getDaysUntilExpiration(document.diasParaVencer)}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                {getStatusBadge(document.status, document.diasParaVencer)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{document.responsavel}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">{document.arquivo}</p>
                    <p className="text-xs text-gray-500">{document.tamanho}</p>
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(document)}
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(document)}
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(document.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {/* Resumo na parte inferior */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <span className="text-gray-600">
              Total: {documentsData.length} documentos
            </span>
            <span className="text-green-600">
              Válidos: {documentsData.filter(d => d.status === 'Válido' && d.diasParaVencer > 30).length}
            </span>
            <span className="text-orange-600">
              Vencendo: {documentsData.filter(d => d.diasParaVencer <= 30 && d.diasParaVencer > 0).length}
            </span>
            <span className="text-red-600">
              Vencidos: {documentsData.filter(d => d.diasParaVencer < 0).length}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Última atualização: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  )
}
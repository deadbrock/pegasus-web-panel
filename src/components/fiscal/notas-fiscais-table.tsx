import React from 'react'
import { Edit3, Trash2, FileText, CheckCircle, ArrowUpDown, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils'
import { NotaFiscal } from '@/types/fiscal'

interface NotasFiscaisTableProps {
  notasFiscais: NotaFiscal[]
  isLoading: boolean
  onEdit: (nota: NotaFiscal) => void
  onDelete: (id: string) => void
  onProcessar: (nota: NotaFiscal) => void
}

export function NotasFiscaisTable({ 
  notasFiscais, 
  isLoading, 
  onEdit, 
  onDelete, 
  onProcessar 
}: NotasFiscaisTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pegasus-blue"></div>
      </div>
    )
  }

  if (notasFiscais.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma nota fiscal encontrada</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comece criando uma nova nota fiscal ou importando um XML.
        </p>
      </div>
    )
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'Processada':
        return 'bg-green-100 text-green-800'
      case 'Cancelada':
        return 'bg-red-100 text-red-800'
      case 'Rejeitada':
        return 'bg-red-100 text-red-800'
      case 'Ativa':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoOperacaoColor = (tipo: string) => {
    return tipo === 'entrada' ? 'text-green-600' : 'text-blue-600'
  }

  const getTipoOperacaoIcon = (tipo: string) => {
    return tipo === 'entrada' ? <ArrowDown className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Número/Série
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fornecedor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data Emissão
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notasFiscais.map((nota) => (
            <tr key={nota.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {nota.numero}
                    </div>
                    <div className="text-sm text-gray-500">
                      Série: {nota.serie}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {nota.fornecedor?.razao_social || nota.razao_social}
                </div>
                <div className="text-sm text-gray-500">
                  CNPJ: {nota.cnpj}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(nota.data_emissao)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {formatCurrency(nota.valor_total)}
                </div>
                {nota.valor_icms && (
                  <div className="text-sm text-gray-500">
                    ICMS: {formatCurrency(nota.valor_icms)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`flex items-center gap-1 text-sm font-medium ${getTipoOperacaoColor(nota.tipo_operacao)}`}>
                  {getTipoOperacaoIcon(nota.tipo_operacao)}
                  <span className="capitalize">{nota.tipo_operacao}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(nota.status)}`}>
                  {nota.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  {nota.status === 'Pendente' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onProcessar(nota)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:border-green-300"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Processar
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(nota)}
                    className="flex items-center gap-1"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(nota.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
} 
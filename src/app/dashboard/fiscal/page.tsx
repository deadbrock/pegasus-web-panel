"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Upload,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export default function FiscalPage() {
  const [searchTerm, setSearchTerm] = useState('')

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão Fiscal</h1>
          <p className="text-gray-600">Controle de documentos fiscais e tributários</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Importar XML
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova NF
          </Button>
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
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Período
            </Button>
            <Button variant="outline">
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
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
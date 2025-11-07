'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, AlertTriangle, CheckCircle, Upload } from 'lucide-react'
import { DriverRecord } from '@/services/driversService'

type DocumentosStatusType = {
  vencidos: number
  vencendo: number
  pendentes: number
  emDia: number
}

type DriverDocumentsStatusProps = {
  statusSummary?: DocumentosStatusType
  drivers?: DriverRecord[]
}

export function DriverDocumentsStatus({ statusSummary, drivers = [] }: DriverDocumentsStatusProps) {
  // Mapear motoristas para dados de documentos
  const documentsData = drivers.map(driver => {
    const hoje = new Date()
    const validade_cnh = driver.validade_cnh ? new Date(driver.validade_cnh) : null
    const diasCnh = validade_cnh 
      ? Math.ceil((validade_cnh.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    return {
      id: driver.id,
      motorista: driver.nome,
      cnh: {
        status: diasCnh < 0 ? 'Vencida' : diasCnh <= 30 ? 'Vencendo' : validade_cnh ? 'Em Dia' : 'Pendente',
        dias: diasCnh,
        validade: driver.validade_cnh
      },
      // Documentos futuros (podem ser adicionados na tabela motoristas)
      exameMedico: { status: 'Pendente', dias: 999, validade: null },
      certidaoAntecedentes: { status: 'Pendente', dias: 999, validade: null },
      cursoDefensiva: { status: 'Pendente', dias: 999, validade: null }
    }
  })
  
  const summary = statusSummary || { vencidos: 0, vencendo: 0, pendentes: 0, emDia: 0 }
  const getStatusBadge = (status: string, dias: number) => {
    if (status === 'Vencida' || dias < 0) {
      return <Badge variant="destructive">Vencida</Badge>
    } else if (status === 'Vencendo' || dias <= 30) {
      return <Badge variant="default" className="bg-orange-500">Vencendo</Badge>
    } else if (status === 'Pendente') {
      return <Badge variant="secondary">Pendente</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">Em Dia</Badge>
    }
  }

  const getStatusIcon = (status: string, dias: number) => {
    if (status === 'Vencida' || dias < 0) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />
    } else if (status === 'Vencendo' || dias <= 30) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />
    } else if (status === 'Pendente') {
      return <FileText className="w-4 h-4 text-gray-500" />
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getDaysText = (dias: number) => {
    if (dias < 0) {
      return `${Math.abs(dias)} dias atrás`
    } else if (dias <= 30) {
      return `${dias} dias`
    } else {
      return formatDate(new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString())
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">Documentos Vencidos</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-2">{summary.vencidos}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-800">Vencendo (30 dias)</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-2">{summary.vencendo}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-2">{summary.pendentes}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Em Dia</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">{summary.emDia}</p>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motorista</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Exame Médico</TableHead>
              <TableHead>Certidão Antecedentes</TableHead>
              <TableHead>Curso Defensiva</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentsData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 mb-2 text-gray-400" />
                    <p>Nenhum documento para exibir</p>
                    <p className="text-sm mt-1">Os documentos dos motoristas aparecerão aqui</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              documentsData.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell>
                  <div className="font-medium">{driver.motorista}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(driver.cnh.status, driver.cnh.dias)}
                    <div>
                      {getStatusBadge(driver.cnh.status, driver.cnh.dias)}
                      <p className="text-sm text-gray-500 mt-1">
                        {getDaysText(driver.cnh.dias)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(driver.exameMedico.status, driver.exameMedico.dias)}
                    <div>
                      {getStatusBadge(driver.exameMedico.status, driver.exameMedico.dias)}
                      <p className="text-sm text-gray-500 mt-1">
                        {getDaysText(driver.exameMedico.dias)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(driver.certidaoAntecedentes.status, driver.certidaoAntecedentes.dias)}
                    <div>
                      {getStatusBadge(driver.certidaoAntecedentes.status, driver.certidaoAntecedentes.dias)}
                      <p className="text-sm text-gray-500 mt-1">
                        {getDaysText(driver.certidaoAntecedentes.dias)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(driver.cursoDefensiva.status, driver.cursoDefensiva.dias)}
                    <div>
                      {getStatusBadge(driver.cursoDefensiva.status, driver.cursoDefensiva.dias)}
                      <p className="text-sm text-gray-500 mt-1">
                        {getDaysText(driver.cursoDefensiva.dias)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
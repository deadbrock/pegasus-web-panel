'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, AlertTriangle, CheckCircle, Upload } from 'lucide-react'

// Mock data - substituir por dados do Supabase
const documentsData = [
  {
    id: 1,
    motorista: 'João Silva',
    cnh: { status: 'Vencendo', vencimento: '2024-01-30', dias: 15 },
    exameMedico: { status: 'Em Dia', vencimento: '2024-06-15', dias: 150 },
    certidaoAntecedentes: { status: 'Em Dia', vencimento: '2024-08-20', dias: 216 },
    cursoDefensiva: { status: 'Pendente', vencimento: '2024-02-01', dias: 17 }
  },
  {
    id: 2,
    motorista: 'Maria Santos',
    cnh: { status: 'Vencendo', vencimento: '2024-02-10', dias: 26 },
    exameMedico: { status: 'Em Dia', vencimento: '2024-07-30', dias: 196 },
    certidaoAntecedentes: { status: 'Em Dia', vencimento: '2024-09-15', dias: 242 },
    cursoDefensiva: { status: 'Em Dia', vencimento: '2024-05-10', dias: 115 }
  },
  {
    id: 3,
    motorista: 'Pedro Costa',
    cnh: { status: 'Em Dia', vencimento: '2025-08-20', dias: 587 },
    exameMedico: { status: 'Vencendo', vencimento: '2024-01-25', dias: 10 },
    certidaoAntecedentes: { status: 'Em Dia', vencimento: '2024-12-01', dias: 320 },
    cursoDefensiva: { status: 'Em Dia', vencimento: '2024-04-15', dias: 90 }
  },
  {
    id: 4,
    motorista: 'Ana Oliveira',
    cnh: { status: 'Em Dia', vencimento: '2024-11-30', dias: 319 },
    exameMedico: { status: 'Em Dia', vencimento: '2024-10-15', dias: 273 },
    certidaoAntecedentes: { status: 'Vencida', vencimento: '2024-01-10', dias: -5 },
    cursoDefensiva: { status: 'Em Dia', vencimento: '2024-03-20', dias: 64 }
  },
  {
    id: 5,
    motorista: 'Carlos Lima',
    cnh: { status: 'Em Dia', vencimento: '2026-03-18', dias: 798 },
    exameMedico: { status: 'Em Dia', vencimento: '2024-09-30', dias: 258 },
    certidaoAntecedentes: { status: 'Em Dia', vencimento: '2024-11-15', dias: 304 },
    cursoDefensiva: { status: 'Em Dia', vencimento: '2024-06-30', dias: 166 }
  }
]

export function DriverDocumentsStatus() {
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
          <p className="text-2xl font-bold text-red-600 mt-2">1</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-800">Vencendo (30 dias)</span>
          </div>
          <p className="text-2xl font-bold text-orange-600 mt-2">3</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Pendentes</span>
          </div>
          <p className="text-2xl font-bold text-gray-600 mt-2">1</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Em Dia</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-2">15</p>
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
            {documentsData.map((driver) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
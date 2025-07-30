'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Phone, Calendar, CreditCard, AlertTriangle, Users } from 'lucide-react'

// Mock data - substituir por dados do Supabase
const driversData = [
  {
    id: 1,
    nome: 'João Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    cnh: '12345678901',
    categoria: 'D',
    validadeCnh: '2024-12-15',
    status: 'Ativo',
    ultimaViagem: '2024-01-14',
    totalViagens: 156,
    pontuacao: 92
  },
  {
    id: 2,
    nome: 'Maria Santos',
    cpf: '234.567.890-11',
    telefone: '(11) 98765-4322',
    email: 'maria.santos@email.com',
    cnh: '23456789012',
    categoria: 'D',
    validadeCnh: '2024-02-10',
    status: 'Ativo',
    ultimaViagem: '2024-01-15',
    totalViagens: 203,
    pontuacao: 96
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    cpf: '345.678.901-22',
    telefone: '(11) 98765-4323',
    email: 'pedro.costa@email.com',
    cnh: '34567890123',
    categoria: 'C',
    validadeCnh: '2025-08-20',
    status: 'Ativo',
    ultimaViagem: '2024-01-12',
    totalViagens: 89,
    pontuacao: 85
  },
  {
    id: 4,
    nome: 'Ana Oliveira',
    cpf: '456.789.012-33',
    telefone: '(11) 98765-4324',
    email: 'ana.oliveira@email.com',
    cnh: '45678901234',
    categoria: 'D',
    validadeCnh: '2024-11-30',
    status: 'Ativo',
    ultimaViagem: '2024-01-13',
    totalViagens: 134,
    pontuacao: 89
  },
  {
    id: 5,
    nome: 'Carlos Lima',
    cpf: '567.890.123-44',
    telefone: '(11) 98765-4325',
    email: 'carlos.lima@email.com',
    cnh: '56789012345',
    categoria: 'E',
    validadeCnh: '2026-03-18',
    status: 'Ativo',
    ultimaViagem: '2024-01-15',
    totalViagens: 278,
    pontuacao: 94
  },
  {
    id: 6,
    nome: 'Roberto Silva',
    cpf: '678.901.234-55',
    telefone: '(11) 98765-4326',
    email: 'roberto.silva@email.com',
    cnh: '67890123456',
    categoria: 'C',
    validadeCnh: '2024-01-25',
    status: 'CNH Vencida',
    ultimaViagem: '2023-12-20',
    totalViagens: 45,
    pontuacao: 78
  }
]

interface DriversTableProps {
  onEdit: (driver: any) => void
}

export function DriversTable({ onEdit }: DriversTableProps) {
  const getStatusBadge = (status: string, validadeCnh: string) => {
    const hoje = new Date()
    const vencimento = new Date(validadeCnh)
    const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

    if (status === 'CNH Vencida' || diasParaVencer < 0) {
      return <Badge variant="destructive">CNH Vencida</Badge>
    } else if (diasParaVencer <= 30) {
      return <Badge variant="default" className="bg-orange-500">CNH Vencendo</Badge>
    } else if (status === 'Inativo') {
      return <Badge variant="secondary">Inativo</Badge>
    } else {
      return <Badge variant="default" className="bg-green-500">Ativo</Badge>
    }
  }

  const getCategoryBadge = (categoria: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-gray-500',
      'B': 'bg-blue-500',
      'C': 'bg-green-500',
      'D': 'bg-orange-500',
      'E': 'bg-purple-500'
    }

    return (
      <Badge variant="outline" className={`${colors[categoria]} text-white border-0`}>
        CNH {categoria}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getPerformanceColor = (pontuacao: number) => {
    if (pontuacao >= 90) return 'text-green-600'
    if (pontuacao >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Motorista</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>CNH</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Validade CNH</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead>Viagens</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {driversData.map((driver) => (
            <TableRow key={driver.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">{driver.nome}</p>
                    <p className="text-sm text-gray-500">{driver.cpf}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{driver.telefone}</span>
                  </div>
                  <p className="text-sm text-gray-500">{driver.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="font-mono text-sm">{driver.cnh}</span>
                </div>
              </TableCell>
              <TableCell>{getCategoryBadge(driver.categoria)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{formatDate(driver.validadeCnh)}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(driver.status, driver.validadeCnh)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${getPerformanceColor(driver.pontuacao)}`}>
                    {driver.pontuacao}%
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        driver.pontuacao >= 90 ? 'bg-green-500' :
                        driver.pontuacao >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${driver.pontuacao}%` }}
                    />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{driver.totalViagens}</p>
                  <p className="text-sm text-gray-500">
                    Última: {formatDate(driver.ultimaViagem)}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(driver)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
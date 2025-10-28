'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Phone, Calendar, CreditCard, AlertTriangle, Users } from 'lucide-react'
import { DriverRecord } from '@/services/driversService'

// Dados removidos - agora usa apenas dados reais do Supabase

interface DriversTableProps {
  onEdit: (driver: any) => void
  onView?: (driver: any) => void
  data?: DriverRecord[]
}

export function DriversTable({ onEdit, onView, data }: DriversTableProps) {
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

  const drivers = data || []
  
  if (drivers.length === 0) {
    return (
      <div className="rounded-md border p-8">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Users className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">Nenhum motorista cadastrado</p>
          <p className="text-sm mt-2">Clique em "Novo Motorista" para adicionar</p>
        </div>
      </div>
    )
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
          {drivers.map((driver: any) => (
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
                    onClick={(e) => { e.stopPropagation(); onView && onView(driver) }}
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
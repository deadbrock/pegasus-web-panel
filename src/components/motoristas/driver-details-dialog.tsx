'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface DriverDetailsDialogProps {
  open: boolean
  onClose: () => void
  driver: any | null
}

export function DriverDetailsDialog({ open, onClose, driver }: DriverDetailsDialogProps) {
  if (!driver) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Motorista • {driver.nome}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">CPF</div>
              <div className="font-medium">{driver.cpf}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">CNH</div>
              <div className="font-mono font-medium">{driver.cnh}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <Badge>{driver.status || 'Ativo'}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Telefone</div>
              <div className="font-medium">{driver.telefone || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">E-mail</div>
              <div className="font-medium">{driver.email || '-'}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500">Endereço</div>
              <div className="font-medium">{driver.endereco || '-'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">Categoria</div>
              <div className="font-medium">{driver.categoria || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Validade CNH</div>
              <div className="font-medium">{driver.validadeCnh ? new Date(driver.validadeCnh).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Data Admissão</div>
              <div className="font-medium">{driver.dataAdmissao ? new Date(driver.dataAdmissao).toLocaleDateString('pt-BR') : '-'}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



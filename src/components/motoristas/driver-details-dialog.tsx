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
              <div className="text-xs text-gray-500">Categoria CNH</div>
              <div className="font-medium">{driver.categoria_cnh || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Validade CNH</div>
              <div className="font-medium">
                {driver.validade_cnh ? new Date(driver.validade_cnh).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Data Admissão</div>
              <div className="font-medium">
                {driver.data_admissao ? new Date(driver.data_admissao).toLocaleDateString('pt-BR') : '-'}
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Dados de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">Total de Viagens</div>
                <div className="font-medium text-lg">{driver.totalViagens || 0}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Última Viagem</div>
                <div className="font-medium">
                  {driver.ultimaViagem ? new Date(driver.ultimaViagem).toLocaleDateString('pt-BR') : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Pontuação Geral</div>
                <div className="font-medium text-lg">{driver.pontuacao || 0}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Pontualidade</div>
                <div className="font-medium text-lg">{driver.pontualidade || 0}%</div>
              </div>
            </div>
          </div>

          {driver.observacoes && (
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500">Observações</div>
              <div className="font-medium">{driver.observacoes}</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}



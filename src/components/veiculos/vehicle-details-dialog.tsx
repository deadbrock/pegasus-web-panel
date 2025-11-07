"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Vehicle {
  id: number | string
  placa: string
  marca: string
  modelo: string
  tipo: string
  ano: number
  cor: string
  kmTotal: number
  status: string
  combustivel: string
  capacidade: number
  ultimaManutencao: string
  chassi?: string
  renavam?: string
  observacoes?: string
}

interface VehicleDetailsDialogProps {
  open: boolean
  onClose: () => void
  vehicle: Vehicle | null
}

export function VehicleDetailsDialog({ open, onClose, vehicle }: VehicleDetailsDialogProps) {
  if (!vehicle) return null

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Detalhes do Veículo • <span className="font-mono">{vehicle.placa}</span>
          </DialogTitle>
          <DialogDescription>
            Informações completas do veículo {vehicle.marca} {vehicle.modelo}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Linha 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">Marca</div>
              <div className="font-medium">{vehicle.marca}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Modelo</div>
              <div className="font-medium">{vehicle.modelo}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Tipo</div>
              <div className="font-medium">{vehicle.tipo}</div>
            </div>
          </div>

          {/* Linha 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500">Ano</div>
              <div className="font-medium">{vehicle.ano}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Cor</div>
              <div className="font-medium">{vehicle.cor}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Combustível</div>
              <div className="font-medium">{vehicle.combustivel}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <Badge>{vehicle.status}</Badge>
            </div>
          </div>

          {/* Linha 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500">KM Total</div>
              <div className="font-medium">
                {vehicle.kmTotal !== null && vehicle.kmTotal !== undefined 
                  ? `${Number(vehicle.kmTotal).toLocaleString('pt-BR')} km`
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Capacidade</div>
              <div className="font-medium">
                {vehicle.capacidade !== null && vehicle.capacidade !== undefined 
                  ? `${Number(vehicle.capacidade).toLocaleString('pt-BR')} kg`
                  : '-'}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Última Manutenção</div>
              <div className="font-medium">
                {vehicle.ultimaManutencao ? formatDate(vehicle.ultimaManutencao) : '-'}
              </div>
            </div>
          </div>

          {/* Linha 4 (docs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500">Chassi</div>
              <div className="font-medium">{vehicle.chassi || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">RENAVAM</div>
              <div className="font-medium">{vehicle.renavam || '-'}</div>
            </div>
          </div>

          {/* Observações */}
          {vehicle.observacoes && (
            <div>
              <div className="text-xs text-gray-500">Observações</div>
              <div className="font-medium whitespace-pre-wrap">{vehicle.observacoes}</div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}



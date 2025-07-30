import React from 'react'
import { Car, User, Clock, Navigation } from 'lucide-react'
import { VeiculoRastreamento } from '@/types/rastreamento'
import { formatDate } from '@/lib/utils'

interface VeiculosAtivosProps {
  veiculos: VeiculoRastreamento[]
  isLoading: boolean
  veiculoSelecionado?: VeiculoRastreamento | null
  onVeiculoSelect: (veiculo: VeiculoRastreamento) => void
}

export function VeiculosAtivos({ veiculos, isLoading, veiculoSelecionado, onVeiculoSelect }: VeiculosAtivosProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pegasus-blue"></div>
      </div>
    )
  }

  if (veiculos.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum veículo ativo</h3>
        <p className="mt-1 text-sm text-gray-500">
          Não há veículos ativos no momento.
        </p>
      </div>
    )
  }

  const getStatusColor = (status: VeiculoRastreamento['status']) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-800'
      case 'Em Rota':
        return 'bg-blue-100 text-blue-800'
      case 'Parado':
        return 'bg-yellow-100 text-yellow-800'
      case 'Offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: VeiculoRastreamento['status']) => {
    switch (status) {
      case 'Ativo':
        return <Navigation className="h-3 w-3" />
      case 'Em Rota':
        return <Navigation className="h-3 w-3" />
      case 'Parado':
        return <Clock className="h-3 w-3" />
      case 'Offline':
        return <div className="w-3 h-3 rounded-full bg-red-500" />
      default:
        return <Car className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto">
      {veiculos.map((veiculo) => (
        <div
          key={veiculo.id}
          onClick={() => onVeiculoSelect(veiculo)}
          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
            veiculoSelecionado?.id === veiculo.id
              ? 'border-pegasus-blue bg-pegasus-blue/5 ring-2 ring-pegasus-blue/20'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {/* Header do veículo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-sm">{veiculo.placa}</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(veiculo.status)}`}>
              {getStatusIcon(veiculo.status)}
              {veiculo.status}
            </span>
          </div>

          {/* Informações do veículo */}
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{veiculo.modelo}</span>
            </div>
            
            {veiculo.motorista && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{veiculo.motorista.nome}</span>
              </div>
            )}

            {veiculo.velocidade !== undefined && (
              <div className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                <span>{veiculo.velocidade} km/h</span>
              </div>
            )}

            {veiculo.ultima_atualizacao && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{getTempoRelativo(veiculo.ultima_atualizacao)}</span>
              </div>
            )}
          </div>

          {/* Coordenadas (se disponível) */}
          {veiculo.latitude && veiculo.longitude && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                <span className="font-mono">
                  {veiculo.latitude.toFixed(6)}, {veiculo.longitude.toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getTempoRelativo(timestamp: string): string {
  const agora = new Date()
  const data = new Date(timestamp)
  const diferencaMs = agora.getTime() - data.getTime()
  const diferencaMinutos = Math.floor(diferencaMs / (1000 * 60))

  if (diferencaMinutos < 1) {
    return 'Agora'
  } else if (diferencaMinutos < 60) {
    return `${diferencaMinutos}m atrás`
  } else if (diferencaMinutos < 1440) { // 24 horas
    const horas = Math.floor(diferencaMinutos / 60)
    return `${horas}h atrás`
  } else {
    return formatDate(timestamp)
  }
} 
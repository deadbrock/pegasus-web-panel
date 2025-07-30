'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Calendar, Clock, MapPin, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VeiculoRastreamento, PosicaoHistorico } from '@/types/rastreamento'
import { rastreamentoService } from '@/lib/services/rastreamento-service'
import { formatDate, formatDateTime } from '@/lib/utils'

interface HistoricoModalProps {
  open: boolean
  onClose: () => void
  veiculo: VeiculoRastreamento | null
}

export function HistoricoModal({ open, onClose, veiculo }: HistoricoModalProps) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  // Definir datas padrão (último dia)
  useEffect(() => {
    if (open && !dataInicio && !dataFim) {
      const hoje = new Date()
      const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000)
      
      setDataInicio(ontem.toISOString().split('T')[0])
      setDataFim(hoje.toISOString().split('T')[0])
    }
  }, [open, dataInicio, dataFim])

  // Query para buscar histórico
  const { data: historico = [], isLoading, refetch } = useQuery({
    queryKey: ['historico-veiculo', veiculo?.id, dataInicio, dataFim],
    queryFn: () => {
      if (!veiculo || !dataInicio || !dataFim) return Promise.resolve([])
      return rastreamentoService.getHistoricoVeiculo({
        veiculo_id: veiculo.id,
        data_inicio: dataInicio,
        data_fim: dataFim,
        incluir_paradas: true,
        incluir_eventos: true,
      })
    },
    enabled: open && !!veiculo && !!dataInicio && !!dataFim,
  })

  const handleBuscar = () => {
    refetch()
  }

  const handleExportar = () => {
    if (historico.length === 0) return

    const csvContent = [
      'Data/Hora,Latitude,Longitude,Velocidade,Direção,Evento,Endereço',
      ...historico.map(pos => [
        formatDateTime(pos.timestamp),
        pos.latitude,
        pos.longitude,
        pos.velocidade || 0,
        pos.direcao || 0,
        pos.evento || 'movimento',
        pos.endereco || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historico_${veiculo?.placa}_${dataInicio}_${dataFim}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Histórico de Posições - {veiculo?.placa}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Filtros de Data */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleBuscar}
              className="bg-pegasus-blue hover:bg-pegasus-blue/90"
              disabled={isLoading || !dataInicio || !dataFim}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                'Buscar'
              )}
            </Button>

            {historico.length > 0 && (
              <Button
                onClick={handleExportar}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            )}
          </div>

          {/* Resumo */}
          {historico.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pegasus-blue">
                    {historico.length}
                  </div>
                  <div className="text-sm text-gray-600">Posições</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {historico.filter(p => p.evento === 'movimento').length}
                  </div>
                  <div className="text-sm text-gray-600">Em Movimento</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {historico.filter(p => p.evento === 'parada').length}
                  </div>
                  <div className="text-sm text-gray-600">Paradas</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(historico.reduce((acc, p) => acc + (p.velocidade || 0), 0) / historico.length)} km/h
                  </div>
                  <div className="text-sm text-gray-600">Vel. Média</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Lista de Posições */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Posições Registradas
            </h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pegasus-blue"></div>
              </div>
            ) : historico.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>Nenhuma posição encontrada para o período selecionado</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {historico.map((posicao, index) => (
                  <div
                    key={posicao.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        posicao.evento === 'movimento' ? 'bg-green-500' :
                        posicao.evento === 'parada' ? 'bg-yellow-500' :
                        posicao.evento === 'excesso_velocidade' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`} />
                      
                      <div>
                        <div className="text-sm font-medium">
                          {formatDateTime(posicao.timestamp)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {posicao.latitude.toFixed(6)}, {posicao.longitude.toFixed(6)}
                        </div>
                        {posicao.endereco && (
                          <div className="text-xs text-gray-500">
                            {posicao.endereco}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {posicao.velocidade || 0} km/h
                      </div>
                      <div className="text-xs text-gray-600 capitalize">
                        {posicao.evento || 'movimento'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 
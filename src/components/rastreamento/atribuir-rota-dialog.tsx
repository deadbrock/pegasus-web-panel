'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { User, Truck, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { atribuirMotoristaVeiculo, type RotaEntrega } from '@/lib/services/rotas-service'
import { fetchMotoristas } from '@/lib/services/motoristas-service'
import { supabase } from '@/lib/supabase'

interface AtribuirRotaDialogProps {
  open: boolean
  onClose: () => void
  rota: RotaEntrega | null
  onSuccess?: () => void
}

type Motorista = {
  id: string
  nome: string
  cpf: string
  telefone?: string
  status: string
}

type Veiculo = {
  id: string
  placa: string
  modelo: string
  status: string
}

export function AtribuirRotaDialog({ open, onClose, rota, onSuccess }: AtribuirRotaDialogProps) {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [motoristaId, setMotoristaId] = useState('')
  const [veiculoId, setVeiculoId] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const { toast } = useToast()

  // Carregar motoristas e veículos
  useEffect(() => {
    if (open) {
      loadData()
    }
  }, [open])

  const loadData = async () => {
    setLoadingData(true)
    try {
      // Buscar motoristas ativos
      const motoristasData = await fetchMotoristas()
      const motoristasAtivos = motoristasData.filter(m => m.status === 'Ativo')
      setMotoristas(motoristasAtivos)

      // Buscar veículos disponíveis
      const { data: veiculosData, error: veiculosError } = await supabase
        .from('veiculos')
        .select('id, placa, modelo, status')
        .in('status', ['Disponível', 'Ativo'])
        .order('placa')

      if (veiculosError) throw veiculosError
      setVeiculos(veiculosData || [])

      console.log('[AtribuirRotaDialog] Motoristas:', motoristasAtivos.length)
      console.log('[AtribuirRotaDialog] Veículos:', veiculosData?.length || 0)
    } catch (error) {
      console.error('[AtribuirRotaDialog] Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar motoristas e veículos.',
        variant: 'destructive'
      })
    } finally {
      setLoadingData(false)
    }
  }

  const handleAtribuir = async () => {
    if (!rota) return

    if (!motoristaId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um motorista.',
        variant: 'destructive'
      })
      return
    }

    if (!veiculoId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um veículo.',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      // Buscar email do usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      const usuarioEmail = user?.email || 'sistema@fgservices.com.br'

      console.log('[AtribuirRotaDialog] Atribuindo rota:', {
        rotaId: rota.id,
        motoristaId,
        veiculoId,
        usuarioEmail
      })

      const rotaAtualizada = await atribuirMotoristaVeiculo(
        rota.id,
        motoristaId,
        veiculoId,
        usuarioEmail
      )

      if (rotaAtualizada) {
        // Atualizar observações se fornecidas
        if (observacoes.trim()) {
          await supabase
            .from('rotas_entrega')
            .update({
              observacoes: `${rota.observacoes || ''}\n\n[Atribuição] ${observacoes}`.trim()
            })
            .eq('id', rota.id)
        }

        toast({
          title: '✅ Rota Atribuída!',
          description: `Motorista e veículo atribuídos com sucesso à rota ${rota.numero_rota}.`
        })

        // Limpar formulário
        setMotoristaId('')
        setVeiculoId('')
        setObservacoes('')

        // Callback de sucesso
        if (onSuccess) onSuccess()
        
        // Fechar dialog
        setTimeout(() => onClose(), 1000)
      } else {
        throw new Error('Falha ao atribuir rota')
      }
    } catch (error) {
      console.error('[AtribuirRotaDialog] Erro ao atribuir:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atribuir a rota. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setMotoristaId('')
      setVeiculoId('')
      setObservacoes('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Atribuir Motorista e Veículo
          </DialogTitle>
          <DialogDescription>
            {rota && (
              <>
                Rota: <span className="font-semibold">{rota.numero_rota}</span>
                <br />
                Destino: <span className="text-xs">{rota.endereco_completo}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Selecionar Motorista */}
            <div className="space-y-2">
              <Label htmlFor="motorista" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Motorista *
              </Label>
              <Select value={motoristaId} onValueChange={setMotoristaId} disabled={loading}>
                <SelectTrigger id="motorista">
                  <SelectValue placeholder="Selecione um motorista" />
                </SelectTrigger>
                <SelectContent>
                  {motoristas.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhum motorista ativo disponível
                    </div>
                  ) : (
                    motoristas.map((motorista) => (
                      <SelectItem key={motorista.id} value={motorista.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{motorista.nome}</span>
                          <span className="text-xs text-gray-500">
                            CPF: {motorista.cpf} {motorista.telefone && `• ${motorista.telefone}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selecionar Veículo */}
            <div className="space-y-2">
              <Label htmlFor="veiculo" className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                Veículo *
              </Label>
              <Select value={veiculoId} onValueChange={setVeiculoId} disabled={loading}>
                <SelectTrigger id="veiculo">
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Nenhum veículo disponível
                    </div>
                  ) : (
                    veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{veiculo.placa}</span>
                          <span className="text-xs text-gray-500">
                            {veiculo.modelo} • {veiculo.status}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                placeholder="Instruções especiais, horário preferencial, etc."
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={3}
                disabled={loading}
                className="resize-none"
              />
            </div>

            {/* Informações da Rota */}
            {rota && (
              <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-1">
                <p className="font-medium text-blue-900">Informações da Rota:</p>
                <p className="text-blue-700">
                  <span className="font-medium">Prioridade:</span> {rota.prioridade}
                </p>
                {rota.data_prevista_entrega && (
                  <p className="text-blue-700">
                    <span className="font-medium">Previsão:</span>{' '}
                    {new Date(rota.data_prevista_entrega).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAtribuir} disabled={loading || loadingData}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Atribuindo...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Atribuir Rota
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


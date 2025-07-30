'use client'

import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, Calendar, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Manutencao, ManutencaoInsert, ManutencaoUpdate } from '@/types/supabase'
import { manutencaoService } from '@/lib/services/manutencao-service'

const manutencaoSchema = z.object({
  veiculo_id: z.string().min(1, 'Veículo é obrigatório'),
  tipo: z.enum(['Preventiva', 'Corretiva', 'Revisão', 'Agendada', 'Outro']),
  descricao: z.string().optional(),
  data_prevista: z.string().min(1, 'Data prevista é obrigatória'),
  data_realizada: z.string().optional(),
  status: z.enum(['Pendente', 'Agendada', 'Em Andamento', 'Concluída', 'Cancelada']),
  custo_total: z.number().min(0).optional(),
  observacoes: z.string().optional(),
  prioridade: z.number().min(1).max(5).optional(),
})

type ManutencaoFormData = z.infer<typeof manutencaoSchema>

interface ManutencaoDialogProps {
  open: boolean
  onClose: () => void
  manutencao?: Manutencao | null
}

export function ManutencaoDialog({ open, onClose, manutencao }: ManutencaoDialogProps) {
  const [showDataRealizada, setShowDataRealizada] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: veiculos = [] } = useQuery({
    queryKey: ['veiculos'],
    queryFn: () => manutencaoService.getVeiculos(),
    enabled: open,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ManutencaoFormData>({
    resolver: zodResolver(manutencaoSchema),
    defaultValues: {
      tipo: 'Preventiva',
      status: 'Agendada',
      prioridade: 3,
    },
  })

  const watchStatus = watch('status')

  // Mutation para criar/atualizar manutenção
  const saveMutation = useMutation({
    mutationFn: async (data: ManutencaoFormData) => {
      const formattedData = {
        ...data,
        custo_total: data.custo_total || 0,
        prioridade: data.prioridade || 3,
        data_realizada: data.status === 'Concluída' ? data.data_realizada : null,
      }

      if (manutencao) {
        return manutencaoService.updateManutencao(manutencao.id, formattedData as ManutencaoUpdate)
      } else {
        return manutencaoService.createManutencao(formattedData as ManutencaoInsert)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] })
      queryClient.invalidateQueries({ queryKey: ['manutencao-stats'] })
      toast({
        title: 'Sucesso',
        description: `Manutenção ${manutencao ? 'atualizada' : 'criada'} com sucesso`,
      })
      onClose()
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: `Erro ao ${manutencao ? 'atualizar' : 'criar'} manutenção`,
        variant: 'destructive',
      })
      console.error('Erro ao salvar manutenção:', error)
    },
  })

  // Efeito para mostrar/esconder data realizada
  useEffect(() => {
    setShowDataRealizada(watchStatus === 'Concluída')
    if (watchStatus !== 'Concluída') {
      setValue('data_realizada', '')
    }
  }, [watchStatus, setValue])

  // Carregar dados da manutenção para edição
  useEffect(() => {
    if (open && manutencao) {
      reset({
        veiculo_id: manutencao.veiculo_id,
        tipo: manutencao.tipo,
        descricao: manutencao.descricao || '',
        data_prevista: manutencao.data_prevista.split('T')[0],
        data_realizada: manutencao.data_realizada?.split('T')[0] || '',
        status: manutencao.status,
        custo_total: manutencao.custo_total || 0,
        observacoes: manutencao.observacoes || '',
        prioridade: manutencao.prioridade || 3,
      })
    } else if (open && !manutencao) {
      reset({
        tipo: 'Preventiva',
        status: 'Agendada',
        prioridade: 3,
        data_prevista: new Date().toISOString().split('T')[0],
      })
    }
  }, [open, manutencao, reset])

  const onSubmit = (data: ManutencaoFormData) => {
    saveMutation.mutate(data)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {manutencao ? 'Editar Manutenção' : 'Nova Manutenção'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Veículo e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Veículo *
                </label>
                <select
                  {...register('veiculo_id')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                >
                  <option value="">Selecione um veículo</option>
                  {veiculos.map((veiculo) => (
                    <option key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.modelo}
                    </option>
                  ))}
                </select>
                {errors.veiculo_id && (
                  <p className="text-sm text-red-600">{errors.veiculo_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tipo *
                </label>
                <select
                  {...register('tipo')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                >
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                  <option value="Revisão">Revisão</option>
                  <option value="Agendada">Agendada</option>
                  <option value="Outro">Outro</option>
                </select>
                {errors.tipo && (
                  <p className="text-sm text-red-600">{errors.tipo.message}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                {...register('descricao')}
                rows={3}
                placeholder="Descreva os detalhes da manutenção..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
              />
            </div>

            {/* Datas e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Data Prevista *
                </label>
                <input
                  type="date"
                  {...register('data_prevista')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                />
                {errors.data_prevista && (
                  <p className="text-sm text-red-600">{errors.data_prevista.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  {...register('status')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Agendada">Agendada</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              {showDataRealizada && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Data Realizada
                  </label>
                  <input
                    type="date"
                    {...register('data_realizada')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Custo e Prioridade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Custo Total (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('custo_total', { valueAsNumber: true })}
                  placeholder="0,00"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Prioridade (1-5)
                </label>
                <select
                  {...register('prioridade', { valueAsNumber: true })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
                >
                  <option value={1}>1 - Muito Baixa</option>
                  <option value={2}>2 - Baixa</option>
                  <option value={3}>3 - Média</option>
                  <option value={4}>4 - Alta</option>
                  <option value={5}>5 - Muito Alta</option>
                </select>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Observações
              </label>
              <textarea
                {...register('observacoes')}
                rows={3}
                placeholder="Observações adicionais..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pegasus-blue focus:border-transparent"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-pegasus-blue hover:bg-pegasus-blue/90"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {manutencao ? 'Atualizar' : 'Criar'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 
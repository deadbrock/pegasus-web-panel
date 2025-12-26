'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { Calendar, Clock, AlertCircle, Save, RefreshCw } from 'lucide-react'

type ConfiguracaoPeriodo = {
  id: string
  nome: string
  descricao?: string
  ativo: boolean
  dia_inicio?: number
  dia_fim?: number
  dias_semana_permitidos: number[]
  horario_inicio?: string
  horario_fim?: string
  max_pedidos_por_periodo?: number
  requer_autorizacao_apos: number
  permitir_urgentes: boolean
  mensagem_bloqueio: string
}

export default function ConfiguracoesPeriodoPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<ConfiguracaoPeriodo | null>(null)

  const [formData, setFormData] = useState({
    nome: 'Período Padrão Mensal',
    descricao: '',
    ativo: true,
    dia_inicio: 15,
    dia_fim: 23,
    dias_semana_permitidos: [1, 2, 3, 4, 5], // Segunda a Sexta
    horario_inicio: '08:00',
    horario_fim: '18:00',
    max_pedidos_por_periodo: null as number | null,
    requer_autorizacao_apos: 1,
    permitir_urgentes: false,
    mensagem_bloqueio: 'O período de pedidos é do dia 15 ao dia 23 de cada mês. Por favor, aguarde a próxima janela.'
  })

  const diasSemana = [
    { valor: 0, label: 'Domingo' },
    { valor: 1, label: 'Segunda' },
    { valor: 2, label: 'Terça' },
    { valor: 3, label: 'Quarta' },
    { valor: 4, label: 'Quinta' },
    { valor: 5, label: 'Sexta' },
    { valor: 6, label: 'Sábado' }
  ]

  useEffect(() => {
    loadConfiguracao()
  }, [])

  const loadConfiguracao = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configuracoes-periodo')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar configuração')
      }

      const { configuracao } = await response.json()
      
      if (configuracao) {
        setConfig(configuracao)
        setFormData({
          nome: configuracao.nome,
          descricao: configuracao.descricao || '',
          ativo: configuracao.ativo,
          dia_inicio: configuracao.dia_inicio || 15,
          dia_fim: configuracao.dia_fim || 23,
          dias_semana_permitidos: configuracao.dias_semana_permitidos || [1, 2, 3, 4, 5],
          horario_inicio: configuracao.horario_inicio?.slice(0, 5) || '08:00',
          horario_fim: configuracao.horario_fim?.slice(0, 5) || '18:00',
          max_pedidos_por_periodo: configuracao.max_pedidos_por_periodo,
          requer_autorizacao_apos: configuracao.requer_autorizacao_apos || 1,
          permitir_urgentes: configuracao.permitir_urgentes || false,
          mensagem_bloqueio: configuracao.mensagem_bloqueio || 'Período de pedidos encerrado.'
        })
      }
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error)
      toast({
        title: 'Erro ao carregar configuração',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      // Validações
      if (!formData.nome.trim()) {
        toast({
          title: 'Nome é obrigatório',
          description: 'Por favor, informe um nome para a configuração',
          variant: 'destructive'
        })
        return
      }

      if (formData.dia_inicio && formData.dia_fim && formData.dia_inicio > formData.dia_fim) {
        toast({
          title: 'Período inválido',
          description: 'Dia de início deve ser menor ou igual ao dia de fim',
          variant: 'destructive'
        })
        return
      }

      const method = config ? 'PUT' : 'POST'
      const body = config ? { ...formData, id: config.id } : formData

      const response = await fetch('/api/configuracoes-periodo', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar configuração')
      }

      toast({
        title: '✅ Configuração salva!',
        description: 'As regras de período foram atualizadas com sucesso'
      })

      await loadConfiguracao()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro ao salvar configuração',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleDiaSemana = (dia: number) => {
    const novos = formData.dias_semana_permitidos.includes(dia)
      ? formData.dias_semana_permitidos.filter(d => d !== dia)
      : [...formData.dias_semana_permitidos, dia].sort()
    
    setFormData({ ...formData, dias_semana_permitidos: novos })
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configurações de Período de Pedidos</h1>
        <p className="text-muted-foreground mt-2">
          Defina quando os supervisores podem fazer pedidos no app mobile
        </p>
      </div>

      {/* Informação Importante */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">Como funciona</h3>
              <p className="text-sm text-orange-800 mt-1">
                As regras configuradas aqui serão aplicadas automaticamente no app mobile dos supervisores.
                Apenas <strong>uma configuração pode estar ativa</strong> por vez.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Regras de Período
          </CardTitle>
          <CardDescription>
            Configure quando os supervisores podem fazer pedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nome e Descrição */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Configuração *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Período Padrão Mensal"
              />
            </div>

            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo" className="cursor-pointer">
                  Configuração Ativa {formData.ativo && '✅'}
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva o propósito desta configuração..."
              rows={2}
            />
          </div>

          {/* Período do Mês */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Período do Mês
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dia_inicio">Dia de Início (1-31)</Label>
                <Input
                  id="dia_inicio"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_inicio || ''}
                  onChange={(e) => setFormData({ ...formData, dia_inicio: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 15"
                />
                <p className="text-xs text-muted-foreground">
                  Primeiro dia do mês em que pedidos são permitidos
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dia_fim">Dia de Fim (1-31)</Label>
                <Input
                  id="dia_fim"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dia_fim || ''}
                  onChange={(e) => setFormData({ ...formData, dia_fim: parseInt(e.target.value) || undefined })}
                  placeholder="Ex: 23"
                />
                <p className="text-xs text-muted-foreground">
                  Último dia do mês em que pedidos são permitidos
                </p>
              </div>
            </div>
          </div>

          {/* Dias da Semana */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dias da Semana Permitidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
              {diasSemana.map((dia) => (
                <Button
                  key={dia.valor}
                  type="button"
                  variant={formData.dias_semana_permitidos.includes(dia.valor) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDiaSemana(dia.valor)}
                  className="w-full"
                >
                  {dia.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione os dias da semana em que pedidos são permitidos
            </p>
          </div>

          {/* Horários */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horário Permitido
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="horario_inicio">Horário de Início</Label>
                <Input
                  id="horario_inicio"
                  type="time"
                  value={formData.horario_inicio || ''}
                  onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horario_fim">Horário de Fim</Label>
                <Input
                  id="horario_fim"
                  type="time"
                  value={formData.horario_fim || ''}
                  onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Limites e Regras */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Limites e Autorizações</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="max_pedidos">Máximo de Pedidos por Período</Label>
                <Input
                  id="max_pedidos"
                  type="number"
                  min="0"
                  value={formData.max_pedidos_por_periodo || ''}
                  onChange={(e) => setFormData({ ...formData, max_pedidos_por_periodo: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Deixe vazio para ilimitado"
                />
                <p className="text-xs text-muted-foreground">
                  Limite total de pedidos por supervisor no período (vazio = sem limite)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requer_autorizacao">Requer Autorização Após</Label>
                <Input
                  id="requer_autorizacao"
                  type="number"
                  min="1"
                  value={formData.requer_autorizacao_apos}
                  onChange={(e) => setFormData({ ...formData, requer_autorizacao_apos: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-muted-foreground">
                  Após X pedidos, o supervisor precisa justificar e aguardar autorização
                </p>
              </div>
            </div>
          </div>

          {/* Opções Adicionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Opções Adicionais</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="permitir_urgentes"
                checked={formData.permitir_urgentes}
                onCheckedChange={(checked) => setFormData({ ...formData, permitir_urgentes: checked })}
              />
              <Label htmlFor="permitir_urgentes" className="cursor-pointer">
                Permitir pedidos urgentes fora do período
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem_bloqueio">Mensagem de Bloqueio</Label>
              <Textarea
                id="mensagem_bloqueio"
                value={formData.mensagem_bloqueio}
                onChange={(e) => setFormData({ ...formData, mensagem_bloqueio: e.target.value })}
                placeholder="Mensagem exibida quando o período está fechado..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Esta mensagem será exibida no app mobile quando o período não estiver ativo
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configuração'}
            </Button>

            <Button
              onClick={loadConfiguracao}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview da Configuração Atual */}
      {config && (
        <Card>
          <CardHeader>
            <CardTitle>Configuração Atual no App Mobile</CardTitle>
            <CardDescription>
              Como os supervisores verão esta regra
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Período permitido:</strong> Dia {formData.dia_inicio} ao dia {formData.dia_fim} de cada mês
              </p>
              <p>
                <strong>Dias da semana:</strong>{' '}
                {formData.dias_semana_permitidos.map(d => diasSemana.find(ds => ds.valor === d)?.label).join(', ')}
              </p>
              <p>
                <strong>Horário:</strong> {formData.horario_inicio} às {formData.horario_fim}
              </p>
              <p>
                <strong>Autorização requerida após:</strong> {formData.requer_autorizacao_apos} pedido(s)
              </p>
              {formData.max_pedidos_por_periodo && (
                <p>
                  <strong>Limite por período:</strong> {formData.max_pedidos_por_periodo} pedidos
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


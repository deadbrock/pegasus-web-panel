'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { X, UserPlus, DollarSign, Calendar, Building2, Mail, Phone } from 'lucide-react'
import { 
  type Contrato,
  createContrato, 
  updateContrato,
  fetchSupervisoresDisponiveis,
  atualizarSupervisoresContrato
} from '@/lib/services/contratos-service'

type ContratoDialogProps = {
  open: boolean
  onClose: () => void
  contrato?: Contrato | null
  onSaved?: () => void
}

type SupervisorOption = {
  id: string
  nome: string
  email: string
}

export function ContratosDialogCompleto({ open, onClose, contrato, onSaved }: ContratoDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [supervisoresDisponiveis, setSupervisoresDisponiveis] = useState<SupervisorOption[]>([])
  const [supervisoresSelecionados, setSupervisoresSelecionados] = useState<string[]>([])
  
  // Form state
  const [numeroContrato, setNumeroContrato] = useState('')
  const [cliente, setCliente] = useState('')
  const [tipo, setTipo] = useState<Contrato['tipo']>('Prestação de Serviço')
  const [descricao, setDescricao] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [valorMensal, setValorMensal] = useState('')
  const [valorMensalMaterial, setValorMensalMaterial] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [status, setStatus] = useState<Contrato['status']>('Ativo')
  const [formaPagamento, setFormaPagamento] = useState('')
  const [diaVencimento, setDiaVencimento] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [emailContato, setEmailContato] = useState('')
  const [telefoneContato, setTelefoneContato] = useState('')
  const [observacoes, setObservacoes] = useState('')

  useEffect(() => {
    if (open) {
      loadSupervisores()
      if (contrato) {
        preencherFormulario(contrato)
      } else {
        limparFormulario()
      }
    }
  }, [open, contrato])

  const loadSupervisores = async () => {
    try {
      const supervisores = await fetchSupervisoresDisponiveis()
      setSupervisoresDisponiveis(supervisores)
    } catch (error) {
      console.error('Erro ao carregar supervisores:', error)
      toast({
        title: 'Erro ao carregar supervisores',
        description: 'Não foi possível carregar a lista de supervisores',
        variant: 'destructive'
      })
    }
  }

  const preencherFormulario = (c: Contrato) => {
    setNumeroContrato(c.numero_contrato)
    setCliente(c.cliente)
    setTipo(c.tipo)
    setDescricao(c.descricao || '')
    setValorTotal(c.valor_total?.toString() || '')
    setValorMensal(c.valor_mensal?.toString() || '')
    setValorMensalMaterial(c.valor_mensal_material?.toString() || '')
    setDataInicio(c.data_inicio)
    setDataFim(c.data_fim)
    setStatus(c.status)
    setFormaPagamento(c.forma_pagamento || '')
    setDiaVencimento(c.dia_vencimento?.toString() || '')
    setResponsavel(c.responsavel || '')
    setEmailContato(c.email_contato || '')
    setTelefoneContato(c.telefone_contato || '')
    setObservacoes(c.observacoes || '')
    
    // Carregar supervisores já atribuídos (se houver)
    // TODO: buscar da API os supervisores já atribuídos
    setSupervisoresSelecionados([])
  }

  const limparFormulario = () => {
    setNumeroContrato('')
    setCliente('')
    setTipo('Prestação de Serviço')
    setDescricao('')
    setValorTotal('')
    setValorMensal('')
    setValorMensalMaterial('')
    setDataInicio('')
    setDataFim('')
    setStatus('Ativo')
    setFormaPagamento('')
    setDiaVencimento('')
    setResponsavel('')
    setEmailContato('')
    setTelefoneContato('')
    setObservacoes('')
    setSupervisoresSelecionados([])
  }

  const handleAdicionarSupervisor = (supervisorId: string) => {
    if (!supervisoresSelecionados.includes(supervisorId)) {
      setSupervisoresSelecionados([...supervisoresSelecionados, supervisorId])
    }
  }

  const handleRemoverSupervisor = (supervisorId: string) => {
    setSupervisoresSelecionados(supervisoresSelecionados.filter(id => id !== supervisorId))
  }

  const validarFormulario = (): boolean => {
    if (!numeroContrato.trim()) {
      toast({
        title: 'Número do contrato é obrigatório',
        variant: 'destructive'
      })
      return false
    }

    if (!cliente.trim()) {
      toast({
        title: 'Cliente é obrigatório',
        variant: 'destructive'
      })
      return false
    }

    if (!dataInicio || !dataFim) {
      toast({
        title: 'Data de início e fim são obrigatórias',
        variant: 'destructive'
      })
      return false
    }

    if (new Date(dataInicio) > new Date(dataFim)) {
      toast({
        title: 'Data de início deve ser anterior à data de fim',
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const handleSalvar = async () => {
    if (!validarFormulario()) return

    setLoading(true)

    try {
      const contratoData: Omit<Contrato, 'id' | 'created_at' | 'updated_at'> = {
        numero_contrato: numeroContrato.trim(),
        cliente: cliente.trim(),
        tipo,
        descricao: descricao.trim() || undefined,
        valor_total: valorTotal ? parseFloat(valorTotal) : 0,
        valor_mensal: valorMensal ? parseFloat(valorMensal) : undefined,
        valor_mensal_material: valorMensalMaterial ? parseFloat(valorMensalMaterial) : undefined,
        data_inicio: dataInicio,
        data_fim: dataFim,
        status,
        forma_pagamento: formaPagamento.trim() || undefined,
        dia_vencimento: diaVencimento ? parseInt(diaVencimento) : undefined,
        responsavel: responsavel.trim() || undefined,
        email_contato: emailContato.trim() || undefined,
        telefone_contato: telefoneContato.trim() || undefined,
        observacoes: observacoes.trim() || undefined
      }

      let contratoId: string

      if (contrato?.id) {
        // Atualizar contrato existente
        await updateContrato(contrato.id, contratoData)
        contratoId = contrato.id
        toast({
          title: '✅ Contrato atualizado!',
          description: 'As informações do contrato foram atualizadas com sucesso'
        })
      } else {
        // Criar novo contrato
        const novoContrato = await createContrato(contratoData)
        if (!novoContrato?.id) {
          throw new Error('Erro ao criar contrato')
        }
        contratoId = novoContrato.id
        toast({
          title: '✅ Contrato criado!',
          description: 'O contrato foi criado com sucesso'
        })
      }

      // Atualizar supervisores atribuídos
      if (supervisoresSelecionados.length > 0) {
        await atualizarSupervisoresContrato(contratoId, supervisoresSelecionados)
        toast({
          title: '✅ Supervisores atribuídos!',
          description: `${supervisoresSelecionados.length} supervisor(es) atribuído(s) ao contrato`
        })
      }

      onSaved?.()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar contrato:', error)
      toast({
        title: 'Erro ao salvar contrato',
        description: error.message || 'Ocorreu um erro ao salvar o contrato',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const supervisoresNaoSelecionados = supervisoresDisponiveis.filter(
    s => !supervisoresSelecionados.includes(s.id)
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {contrato ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do contrato e atribua supervisores responsáveis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero_contrato">Número do Contrato *</Label>
                <Input
                  id="numero_contrato"
                  value={numeroContrato}
                  onChange={(e) => setNumeroContrato(e.target.value)}
                  placeholder="Ex: CONT-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Contrato</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as Contrato['tipo'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Prestação de Serviço">Prestação de Serviço</SelectItem>
                    <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                    <SelectItem value="Parceria">Parceria</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as Contrato['status'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                    <SelectItem value="Suspenso">Suspenso</SelectItem>
                    <SelectItem value="Em Renovação">Em Renovação</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição do contrato"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Valores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Valores e Pagamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_total">Valor Total</Label>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_mensal">Valor Mensal</Label>
                <Input
                  id="valor_mensal"
                  type="number"
                  step="0.01"
                  value={valorMensal}
                  onChange={(e) => setValorMensal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_mensal_material" className="text-blue-600 font-semibold">
                  💰 Teto Mensal de Material *
                </Label>
                <Input
                  id="valor_mensal_material"
                  type="number"
                  step="0.01"
                  value={valorMensalMaterial}
                  onChange={(e) => setValorMensalMaterial(e.target.value)}
                  placeholder="0.00"
                  className="border-blue-300 focus:border-blue-500"
                />
                <p className="text-xs text-muted-foreground">
                  Limite mensal para pedidos de material de consumo
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
                <Input
                  id="forma_pagamento"
                  value={formaPagamento}
                  onChange={(e) => setFormaPagamento(e.target.value)}
                  placeholder="Ex: Boleto, PIX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dia_vencimento">Dia de Vencimento</Label>
                <Input
                  id="dia_vencimento"
                  type="number"
                  min="1"
                  max="31"
                  value={diaVencimento}
                  onChange={(e) => setDiaVencimento(e.target.value)}
                  placeholder="1-31"
                />
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Vigência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data de Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Responsável e Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email_contato">E-mail</Label>
                <Input
                  id="email_contato"
                  type="email"
                  value={emailContato}
                  onChange={(e) => setEmailContato(e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone_contato">Telefone</Label>
                <Input
                  id="telefone_contato"
                  value={telefoneContato}
                  onChange={(e) => setTelefoneContato(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Supervisores Responsáveis */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-600">
              <UserPlus className="h-4 w-4" />
              Supervisores Responsáveis pelo Contrato
            </h3>
            <p className="text-sm text-muted-foreground">
              Selecione os supervisores que poderão fazer pedidos para este contrato no app mobile
            </p>
            
            {/* Supervisores selecionados */}
            {supervisoresSelecionados.length > 0 && (
              <div className="space-y-2">
                <Label>Supervisores Selecionados ({supervisoresSelecionados.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {supervisoresSelecionados.map(supId => {
                    const supervisor = supervisoresDisponiveis.find(s => s.id === supId)
                    if (!supervisor) return null
                    return (
                      <Badge key={supId} variant="secondary" className="text-sm">
                        {supervisor.nome}
                        <button
                          type="button"
                          onClick={() => handleRemoverSupervisor(supId)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Adicionar supervisor */}
            {supervisoresNaoSelecionados.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="adicionar_supervisor">Adicionar Supervisor</Label>
                <Select onValueChange={handleAdicionarSupervisor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um supervisor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisoresNaoSelecionados.map(supervisor => (
                      <SelectItem key={supervisor.id} value={supervisor.id}>
                        {supervisor.nome} ({supervisor.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {supervisoresDisponiveis.length === 0 && (
              <p className="text-sm text-amber-600">
                ⚠️ Nenhum supervisor cadastrado no sistema
              </p>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações adicionais sobre o contrato"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Contrato'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

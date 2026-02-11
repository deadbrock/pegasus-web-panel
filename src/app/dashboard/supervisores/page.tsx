'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Plus, UserPlus, Search, Mail, Shield, Trash2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { type ContractRecord, updateContract } from '@/services/contractsService'

type Supervisor = {
  id: string
  email: string
  nome: string
  status: 'ativo' | 'inativo'
  created_at: string
  total_pedidos?: number
}

export default function SupervisoresPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [detalhesAberto, setDetalhesAberto] = useState(false)
  const [supervisorSelecionado, setSupervisorSelecionado] = useState<Supervisor | null>(null)
  const [contratosSupervisor, setContratosSupervisor] = useState<ContractRecord[]>([])
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)

  useEffect(() => {
    loadSupervisores()
  }, [])

  const loadSupervisores = async () => {
    try {
      setLoading(true)

      // Buscar supervisores via API (usa service_role key)
      const response = await fetch('/api/supervisores')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar supervisores')
      }

      const { supervisores: supervisoresData } = await response.json()
      setSupervisores(supervisoresData)
    } catch (error: any) {
      console.error('Erro ao carregar supervisores:', error)
      toast({
        title: 'Erro ao carregar supervisores',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSupervisor = async () => {
    // Validações
    if (!formData.nome || !formData.email || !formData.senha) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      })
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: 'Senhas não conferem',
        description: 'A senha e confirmação devem ser iguais',
        variant: 'destructive'
      })
      return
    }

    if (formData.senha.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive'
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Email inválido',
        description: 'Digite um email válido',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Criar usuário via API (usa service_role key)
      const response = await fetch('/api/supervisores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar supervisor')
      }

      toast({
        title: '✅ Supervisor criado!',
        description: `${formData.nome} foi cadastrado com sucesso e já pode fazer login no app mobile.`
      })

      // Limpar formulário e fechar dialog
      setFormData({ nome: '', email: '', senha: '', confirmarSenha: '' })
      setIsDialogOpen(false)

      // Recarregar lista
      await loadSupervisores()
    } catch (error: any) {
      console.error('Erro ao criar supervisor:', error)
      
      let mensagemErro = error.message
      if (error.message?.includes('User already registered') || error.message?.includes('already')) {
        mensagemErro = 'Este email já está cadastrado no sistema'
      }

      toast({
        title: 'Erro ao criar supervisor',
        description: mensagemErro,
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (supervisorId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo'

    try {
      // Atualizar status via API (usa service_role key)
      const response = await fetch('/api/supervisores', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supervisorId,
          status: newStatus
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao atualizar status')
      }

      toast({
        title: 'Status atualizado',
        description: `Supervisor ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso`
      })

      await loadSupervisores()
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const carregarDetalhesSupervisor = async (supervisor: Supervisor) => {
    try {
      setSupervisorSelecionado(supervisor)
      setDetalhesAberto(true)
      setLoadingDetalhes(true)

      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('supervisor_id', supervisor.id)
        .order('nome', { ascending: true })

      if (error) throw error

      setContratosSupervisor((data || []) as ContractRecord[])
    } catch (error: any) {
      console.error('Erro ao carregar contratos do supervisor:', error)
      toast({
        title: 'Erro ao carregar contratos',
        description: error.message || 'Não foi possível carregar os contratos deste supervisor',
        variant: 'destructive'
      })
    } finally {
      setLoadingDetalhes(false)
    }
  }

  const handleReatribuirContrato = async (contrato: ContractRecord, novoSupervisorId: string) => {
    if (!novoSupervisorId || !contrato.id) return

    const novoSupervisor = supervisores.find((s) => s.id === novoSupervisorId)

    try {
      const ok = await updateContract(String(contrato.id), {
        supervisor_id: novoSupervisorId,
        responsavel: novoSupervisor?.nome || null
      })

      if (!ok) {
        throw new Error('Não foi possível atualizar o contrato')
      }

      toast({
        title: 'Contrato atualizado',
        description: `Contrato agora está vinculado a ${novoSupervisor?.nome || 'outro supervisor'}.`
      })

      if (supervisorSelecionado) {
        await carregarDetalhesSupervisor(supervisorSelecionado)
      }
    } catch (error: any) {
      console.error('Erro ao reatribuir contrato:', error)
      toast({
        title: 'Erro ao reatribuir contrato',
        description: error.message || 'Não foi possível reatribuir o contrato',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteSupervisor = async (supervisor: Supervisor) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o supervisor "${supervisor.nome}"?\n\n` +
      'Esta ação é permanente. Se existirem contratos vinculados a ele, a exclusão será bloqueada.'
    )
    if (!confirmDelete) return

    try {
      const response = await fetch('/api/supervisores', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ supervisorId: supervisor.id })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir supervisor')
      }

      toast({
        title: 'Supervisor excluído',
        description: `${supervisor.nome} foi removido com sucesso.`
      })

      await loadSupervisores()
      if (supervisorSelecionado?.id === supervisor.id) {
        setDetalhesAberto(false)
        setContratosSupervisor([])
        setSupervisorSelecionado(null)
      }
    } catch (error: any) {
      console.error('Erro ao excluir supervisor:', error)
      toast({
        title: 'Erro ao excluir supervisor',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const filteredSupervisores = supervisores.filter(s =>
    s.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const supervisoresAtivos = supervisores.filter(s => s.status === 'ativo').length
  const totalPedidos = supervisores.reduce((acc, s) => acc + (s.total_pedidos || 0), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervisores</h1>
          <p className="text-gray-600 mt-1">Gerencie os supervisores do app mobile</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Supervisor
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Supervisores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{supervisores.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Supervisores Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{supervisoresAtivos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalPedidos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Supervisores</CardTitle>
          <CardDescription>Supervisores cadastrados no sistema mobile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Carregando supervisores...</div>
          ) : filteredSupervisores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Nenhum supervisor encontrado' : 'Nenhum supervisor cadastrado'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSupervisores.map((supervisor) => (
                <div
                  key={supervisor.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg">
                      {supervisor.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{supervisor.nome}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {supervisor.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {supervisor.total_pedidos || 0} pedidos realizados
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={supervisor.status === 'ativo' ? 'default' : 'secondary'}>
                      {supervisor.status === 'ativo' ? '✓ Ativo' : '✕ Inativo'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => carregarDetalhesSupervisor(supervisor)}
                    >
                      Detalhes
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(supervisor.id, supervisor.status)}
                    >
                      {supervisor.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteSupervisor(supervisor)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criar Supervisor */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Cadastrar Novo Supervisor
            </DialogTitle>
            <DialogDescription>
              Crie uma conta de supervisor para acesso ao aplicativo mobile
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                placeholder="Ex: João Silva"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Corporativo *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: joao.silva@empresa.com.br"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">Este será o login do supervisor no app</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha *</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
              <Input
                id="confirmarSenha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                value={formData.confirmarSenha}
                onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex gap-2">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <strong>Isolamento de Dados:</strong> Cada supervisor verá apenas seus próprios pedidos e contratos no aplicativo mobile.
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setFormData({ nome: '', email: '', senha: '', confirmarSenha: '' })
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateSupervisor} disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar Supervisor'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Detalhes do Supervisor */}
      <Dialog open={detalhesAberto} onOpenChange={setDetalhesAberto}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Supervisor</DialogTitle>
            <DialogDescription>
              Informações do supervisor e contratos vinculados.
            </DialogDescription>
          </DialogHeader>

          {supervisorSelecionado && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{supervisorSelecionado.nome}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    {supervisorSelecionado.email}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Criado em {new Date(supervisorSelecionado.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <Badge variant={supervisorSelecionado.status === 'ativo' ? 'default' : 'secondary'}>
                  {supervisorSelecionado.status === 'ativo' ? '✓ Ativo' : '✕ Inativo'}
                </Badge>
              </div>

              <div className="border-t pt-4 space-y-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Contratos Vinculados</CardTitle>
                    <CardDescription>
                      Realoque contratos para outros supervisores quando necessário.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingDetalhes ? (
                      <div className="text-center py-4 text-gray-500">Carregando contratos...</div>
                    ) : contratosSupervisor.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        Nenhum contrato vinculado a este supervisor.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contratosSupervisor.map((contrato) => (
                          <div
                            key={contrato.id}
                            className="flex items-center justify-between border rounded-lg p-3"
                          >
                            <div>
                              <div className="font-medium">{contrato.nome}</div>
                              <div className="text-xs text-gray-500">
                                {contrato.cidade}/{contrato.estado} • Status: {contrato.status}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select
                                value={contrato.supervisor_id || supervisorSelecionado.id}
                                onValueChange={(value) => handleReatribuirContrato(contrato, value)}
                              >
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Reatribuir para..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {supervisores.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                      {s.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


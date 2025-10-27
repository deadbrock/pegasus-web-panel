import { supabase } from '../supabase'

export type Contrato = {
  id?: string
  numero_contrato: string
  cliente: string
  tipo: 'Prestação de Serviço' | 'Fornecimento' | 'Parceria' | 'Manutenção' | 'Outros'
  descricao?: string
  valor_total: number
  valor_mensal?: number
  data_inicio: string
  data_fim: string
  data_renovacao?: string
  status: 'Ativo' | 'Vencido' | 'Cancelado' | 'Suspenso' | 'Em Renovação'
  forma_pagamento?: string
  dia_vencimento?: number
  responsavel?: string
  email_contato?: string
  telefone_contato?: string
  observacoes?: string
  anexo_url?: string
  alerta_renovacao_dias?: number
  created_at?: string
  updated_at?: string
}

export type ContratoStats = {
  total: number
  ativos: number
  vencidos: number
  em_renovacao: number
  cancelados: number
  valor_total_ativos: number
  valor_mensal_total: number
  vencendo_30_dias: number
  vencendo_60_dias: number
}

/**
 * Busca todos os contratos
 */
export async function fetchContratos(): Promise<Contrato[]> {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .order('data_inicio', { ascending: false })

  if (error) {
    console.error('Erro ao buscar contratos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um contrato por ID
 */
export async function fetchContratoById(id: string): Promise<Contrato | null> {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar contrato:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo contrato
 */
export async function createContrato(contrato: Omit<Contrato, 'id' | 'created_at' | 'updated_at'>): Promise<Contrato | null> {
  const { data, error } = await supabase
    .from('contratos')
    .insert(contrato)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar contrato:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um contrato existente
 */
export async function updateContrato(id: string, updates: Partial<Contrato>): Promise<Contrato | null> {
  const { data, error } = await supabase
    .from('contratos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar contrato:', error)
    throw error
  }
  return data
}

/**
 * Deleta um contrato
 */
export async function deleteContrato(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('contratos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar contrato:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de contratos
 */
export async function fetchContratosStats(): Promise<ContratoStats> {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const hoje = new Date()
  const daquiA30Dias = new Date()
  daquiA30Dias.setDate(hoje.getDate() + 30)
  const daquiA60Dias = new Date()
  daquiA60Dias.setDate(hoje.getDate() + 60)

  const total = data?.length || 0
  const ativos = data?.filter(c => c.status === 'Ativo').length || 0
  const vencidos = data?.filter(c => c.status === 'Vencido').length || 0
  const em_renovacao = data?.filter(c => c.status === 'Em Renovação').length || 0
  const cancelados = data?.filter(c => c.status === 'Cancelado').length || 0

  const valor_total_ativos = data?.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + c.valor_total, 0) || 0
  const valor_mensal_total = data?.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + (c.valor_mensal || 0), 0) || 0

  const vencendo_30_dias = data?.filter(c => {
    if (c.status !== 'Ativo') return false
    const dataFim = new Date(c.data_fim)
    return dataFim >= hoje && dataFim <= daquiA30Dias
  }).length || 0

  const vencendo_60_dias = data?.filter(c => {
    if (c.status !== 'Ativo') return false
    const dataFim = new Date(c.data_fim)
    return dataFim > daquiA30Dias && dataFim <= daquiA60Dias
  }).length || 0

  return {
    total,
    ativos,
    vencidos,
    em_renovacao,
    cancelados,
    valor_total_ativos,
    valor_mensal_total,
    vencendo_30_dias,
    vencendo_60_dias
  }
}

/**
 * Busca contratos por status
 */
export async function fetchContratosByStatus(status: Contrato['status']): Promise<Contrato[]> {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('status', status)
    .order('data_fim', { ascending: true })

  if (error) {
    console.error('Erro ao buscar contratos por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca contratos vencendo em X dias
 */
export async function fetchContratosVencendo(dias: number = 30): Promise<Contrato[]> {
  const hoje = new Date()
  const dataLimite = new Date()
  dataLimite.setDate(hoje.getDate() + dias)

  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('status', 'Ativo')
    .gte('data_fim', hoje.toISOString().split('T')[0])
    .lte('data_fim', dataLimite.toISOString().split('T')[0])
    .order('data_fim', { ascending: true })

  if (error) {
    console.error('Erro ao buscar contratos vencendo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca contratos vencidos
 */
export async function fetchContratosVencidos(): Promise<Contrato[]> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('status', 'Ativo')
    .lt('data_fim', hoje)
    .order('data_fim', { ascending: false })

  if (error) {
    console.error('Erro ao buscar contratos vencidos:', error)
    throw error
  }
  return data || []
}

/**
 * Renova um contrato
 */
export async function renovarContrato(id: string, novaDataFim: string, novoValor?: number): Promise<Contrato | null> {
  const updates: Partial<Contrato> = {
    data_renovacao: new Date().toISOString().split('T')[0],
    data_fim: novaDataFim,
    status: 'Ativo'
  }
  
  if (novoValor) {
    updates.valor_total = novoValor
  }

  return updateContrato(id, updates)
}

/**
 * Cancela um contrato
 */
export async function cancelarContrato(id: string, motivo?: string): Promise<Contrato | null> {
  const updates: Partial<Contrato> = {
    status: 'Cancelado'
  }
  
  if (motivo) {
    updates.observacoes = `Cancelado: ${motivo}\n${updates.observacoes || ''}`
  }

  return updateContrato(id, updates)
}

/**
 * Busca contratos por tipo
 */
export async function fetchContratosByTipo(tipo: Contrato['tipo']): Promise<Contrato[]> {
  const { data, error } = await supabase
    .from('contratos')
    .select('*')
    .eq('tipo', tipo)
    .order('data_inicio', { ascending: false })

  if (error) {
    console.error('Erro ao buscar contratos por tipo:', error)
    throw error
  }
  return data || []
}

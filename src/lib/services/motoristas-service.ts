import { supabase } from '../supabase'

export type Motorista = {
  id?: string
  nome: string
  cpf: string
  cnh: string
  categoria_cnh: string
  validade_cnh: string
  telefone?: string
  email?: string
  endereco?: string
  data_nascimento?: string
  data_admissao?: string
  status: 'Ativo' | 'Inativo' | 'Férias' | 'Afastado'
  observacoes?: string
  foto_url?: string
  created_at?: string
  updated_at?: string
}

export type MotoristaStats = {
  total: number
  ativos: number
  inativos: number
  ferias: number
  afastados: number
  cnh_vencendo: number // CNH vencendo nos próximos 30 dias
}

/**
 * Busca todos os motoristas
 */
export async function fetchMotoristas(): Promise<Motorista[]> {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar motoristas:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um motorista por ID
 */
export async function fetchMotoristaById(id: string): Promise<Motorista | null> {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar motorista:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo motorista
 */
export async function createMotorista(motorista: Omit<Motorista, 'id' | 'created_at' | 'updated_at'>): Promise<Motorista | null> {
  const { data, error } = await supabase
    .from('motoristas')
    .insert(motorista)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar motorista:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um motorista existente
 */
export async function updateMotorista(id: string, updates: Partial<Motorista>): Promise<Motorista | null> {
  const { data, error } = await supabase
    .from('motoristas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar motorista:', error)
    throw error
  }
  return data
}

/**
 * Deleta um motorista
 */
export async function deleteMotorista(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('motoristas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar motorista:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de motoristas
 */
export async function fetchMotoristasStats(): Promise<MotoristaStats> {
  const { data, error } = await supabase
    .from('motoristas')
    .select('status, validade_cnh')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const ativos = data?.filter(m => m.status === 'Ativo').length || 0
  const inativos = data?.filter(m => m.status === 'Inativo').length || 0
  const ferias = data?.filter(m => m.status === 'Férias').length || 0
  const afastados = data?.filter(m => m.status === 'Afastado').length || 0

  // CNH vencendo nos próximos 30 dias
  const hoje = new Date()
  const daquiA30Dias = new Date()
  daquiA30Dias.setDate(hoje.getDate() + 30)

  const cnh_vencendo = data?.filter(m => {
    if (!m.validade_cnh) return false
    const validade = new Date(m.validade_cnh)
    return validade >= hoje && validade <= daquiA30Dias
  }).length || 0

  return {
    total,
    ativos,
    inativos,
    ferias,
    afastados,
    cnh_vencendo
  }
}

/**
 * Busca motoristas com CNH vencendo
 */
export async function fetchMotoristasComCNHVencendo(dias: number = 30): Promise<Motorista[]> {
  const hoje = new Date()
  const dataLimite = new Date()
  dataLimite.setDate(hoje.getDate() + dias)

  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .gte('validade_cnh', hoje.toISOString().split('T')[0])
    .lte('validade_cnh', dataLimite.toISOString().split('T')[0])
    .order('validade_cnh', { ascending: true })

  if (error) {
    console.error('Erro ao buscar motoristas com CNH vencendo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca motoristas por status
 */
export async function fetchMotoristasByStatus(status: Motorista['status']): Promise<Motorista[]> {
  const { data, error } = await supabase
    .from('motoristas')
    .select('*')
    .eq('status', status)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar motoristas por status:', error)
    throw error
  }
  return data || []
}


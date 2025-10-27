import { supabase } from '../supabase'

export type Veiculo = {
  id?: string
  placa: string
  marca: string
  modelo: string
  tipo?: string
  ano?: number
  cor?: string
  combustivel?: string
  capacidade?: number
  km_atual?: number
  status: 'Ativo' | 'Inativo' | 'Manutenção'
  chassi?: string
  renavam?: string
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type VeiculoStats = {
  total: number
  ativos: number
  inativos: number
  em_manutencao: number
  por_tipo: Record<string, number>
  km_medio: number
}

/**
 * Busca todos os veículos
 */
export async function fetchVeiculos(): Promise<Veiculo[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .order('placa', { ascending: true })

  if (error) {
    console.error('Erro ao buscar veículos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um veículo por ID
 */
export async function fetchVeiculoById(id: string): Promise<Veiculo | null> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar veículo:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo veículo
 */
export async function createVeiculo(veiculo: Omit<Veiculo, 'id' | 'created_at' | 'updated_at'>): Promise<Veiculo | null> {
  const { data, error } = await supabase
    .from('veiculos')
    .insert(veiculo)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar veículo:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um veículo existente
 */
export async function updateVeiculo(id: string, updates: Partial<Veiculo>): Promise<Veiculo | null> {
  const { data, error } = await supabase
    .from('veiculos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar veículo:', error)
    throw error
  }
  return data
}

/**
 * Deleta um veículo
 */
export async function deleteVeiculo(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('veiculos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar veículo:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de veículos
 */
export async function fetchVeiculosStats(): Promise<VeiculoStats> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('status, tipo, km_atual')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const ativos = data?.filter(v => v.status === 'Ativo').length || 0
  const inativos = data?.filter(v => v.status === 'Inativo').length || 0
  const em_manutencao = data?.filter(v => v.status === 'Manutenção').length || 0

  // Agrupar por tipo
  const por_tipo: Record<string, number> = {}
  data?.forEach(v => {
    if (v.tipo) {
      por_tipo[v.tipo] = (por_tipo[v.tipo] || 0) + 1
    }
  })

  // Calcular KM médio
  const veiculosComKm = data?.filter(v => v.km_atual && v.km_atual > 0) || []
  const km_medio = veiculosComKm.length > 0
    ? veiculosComKm.reduce((sum, v) => sum + (v.km_atual || 0), 0) / veiculosComKm.length
    : 0

  return {
    total,
    ativos,
    inativos,
    em_manutencao,
    por_tipo,
    km_medio
  }
}

/**
 * Busca veículos por status
 */
export async function fetchVeiculosByStatus(status: Veiculo['status']): Promise<Veiculo[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .eq('status', status)
    .order('placa', { ascending: true })

  if (error) {
    console.error('Erro ao buscar veículos por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca veículo por placa
 */
export async function fetchVeiculoByPlaca(placa: string): Promise<Veiculo | null> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .eq('placa', placa)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Não encontrado
    console.error('Erro ao buscar veículo por placa:', error)
    throw error
  }
  return data
}

/**
 * Busca veículos por tipo
 */
export async function fetchVeiculosByTipo(tipo: string): Promise<Veiculo[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .eq('tipo', tipo)
    .order('placa', { ascending: true })

  if (error) {
    console.error('Erro ao buscar veículos por tipo:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza quilometragem de um veículo
 */
export async function updateVeiculoKm(id: string, kmAtual: number): Promise<Veiculo | null> {
  return updateVeiculo(id, { km_atual: kmAtual })
}

/**
 * Atualiza status de um veículo
 */
export async function updateVeiculoStatus(id: string, status: Veiculo['status']): Promise<Veiculo | null> {
  return updateVeiculo(id, { status })
}


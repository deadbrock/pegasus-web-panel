import { supabase } from '../supabase'

export type Fornecedor = {
  id?: string
  nome: string
  razao_social?: string
  cnpj?: string
  cpf?: string
  tipo: 'Pessoa Física' | 'Pessoa Jurídica'
  categoria: 'Combustível' | 'Peças' | 'Manutenção' | 'Serviços' | 'Produtos' | 'Outros'
  email?: string
  telefone?: string
  celular?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  contato_principal?: string
  banco?: string
  agencia?: string
  conta?: string
  pix?: string
  status: 'Ativo' | 'Inativo' | 'Bloqueado'
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type FornecedorStats = {
  total: number
  ativos: number
  inativos: number
  bloqueados: number
  por_categoria: Record<string, number>
  por_estado: Record<string, number>
}

/**
 * Busca todos os fornecedores
 */
export async function fetchFornecedores(): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar fornecedores:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um fornecedor por ID
 */
export async function fetchFornecedorById(id: string): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar fornecedor:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo fornecedor
 */
export async function createFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .insert(fornecedor)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar fornecedor:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um fornecedor existente
 */
export async function updateFornecedor(id: string, updates: Partial<Fornecedor>): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar fornecedor:', error)
    throw error
  }
  return data
}

/**
 * Deleta um fornecedor
 */
export async function deleteFornecedor(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('fornecedores')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar fornecedor:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de fornecedores
 */
export async function fetchFornecedoresStats(): Promise<FornecedorStats> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const ativos = data?.filter(f => f.status === 'Ativo').length || 0
  const inativos = data?.filter(f => f.status === 'Inativo').length || 0
  const bloqueados = data?.filter(f => f.status === 'Bloqueado').length || 0

  // Agrupar por categoria
  const por_categoria: Record<string, number> = {}
  data?.forEach(f => {
    por_categoria[f.categoria] = (por_categoria[f.categoria] || 0) + 1
  })

  // Agrupar por estado
  const por_estado: Record<string, number> = {}
  data?.forEach(f => {
    if (f.estado) {
      por_estado[f.estado] = (por_estado[f.estado] || 0) + 1
    }
  })

  return {
    total,
    ativos,
    inativos,
    bloqueados,
    por_categoria,
    por_estado
  }
}

/**
 * Busca fornecedores por categoria
 */
export async function fetchFornecedoresByCategoria(categoria: Fornecedor['categoria']): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('categoria', categoria)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar fornecedores por categoria:', error)
    throw error
  }
  return data || []
}

/**
 * Busca fornecedores por status
 */
export async function fetchFornecedoresByStatus(status: Fornecedor['status']): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('status', status)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar fornecedores por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca fornecedores por tipo
 */
export async function fetchFornecedoresByTipo(tipo: Fornecedor['tipo']): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('tipo', tipo)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar fornecedores por tipo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca fornecedores por estado
 */
export async function fetchFornecedoresByEstado(estado: string): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('estado', estado)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar fornecedores por estado:', error)
    throw error
  }
  return data || []
}

/**
 * Busca fornecedor por CNPJ
 */
export async function fetchFornecedorByCNPJ(cnpj: string): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('cnpj', cnpj)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Não encontrado
    console.error('Erro ao buscar fornecedor por CNPJ:', error)
    throw error
  }
  return data
}

/**
 * Busca fornecedor por CPF
 */
export async function fetchFornecedorByCPF(cpf: string): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('cpf', cpf)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Não encontrado
    console.error('Erro ao buscar fornecedor por CPF:', error)
    throw error
  }
  return data
}

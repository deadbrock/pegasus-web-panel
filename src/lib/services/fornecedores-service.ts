import { supabase } from '../supabase'

export type Fornecedor = {
  id: string
  razao_social: string
  nome_fantasia?: string
  cpf_cnpj: string
  rg_ie?: string
  endereco?: string
  telefone?: string
  email?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export type CreateFornecedorInput = Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>

export async function fetchFornecedores(): Promise<Fornecedor[]> {
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .order('razao_social')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    return []
  }
}

export async function fetchFornecedorById(id: string): Promise<Fornecedor | null> {
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error)
    return null
  }
}

export async function createFornecedor(input: Partial<CreateFornecedorInput>): Promise<Fornecedor | null> {
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar fornecedor:', error)
    return null
  }
}

export async function updateFornecedor(id: string, updates: Partial<Fornecedor>): Promise<Fornecedor | null> {
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error)
    return null
  }
}

export async function deleteFornecedor(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar fornecedor:', error)
    return false
  }
}

export async function fetchFornecedoresStats() {
  try {
    const fornecedores = await fetchFornecedores()
    
    const total = fornecedores.length
    const ativos = fornecedores.filter(f => f.ativo).length
    const inativos = fornecedores.filter(f => !f.ativo).length

    return {
      total,
      ativos,
      inativos
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      ativos: 0,
      inativos: 0
    }
  }
}


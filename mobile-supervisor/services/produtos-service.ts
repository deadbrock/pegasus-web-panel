import { supabase } from './supabase'

export type Produto = {
  id: string
  nome: string
  codigo?: string
  categoria?: string
  unidade?: string
}

/**
 * Busca todos os produtos disponíveis no estoque
 * Não retorna quantidade, apenas lista de produtos
 */
export async function fetchProdutosDisponiveis(): Promise<Produto[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, codigo, categoria, unidade')
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
}

/**
 * Busca produtos por nome (busca)
 */
export async function searchProdutos(searchTerm: string): Promise<Produto[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('id, nome, codigo, categoria, unidade')
      .ilike('nome', `%${searchTerm}%`)
      .order('nome', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
}


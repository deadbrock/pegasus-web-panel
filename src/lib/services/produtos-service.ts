import { supabase } from '../supabase'

export type Produto = {
  id: string
  codigo: string
  nome: string
  descricao?: string
  categoria: string
  unidade: string
  quantidade: number
  estoque_minimo: number
  valor_unitario: number
  localizacao?: string
  fornecedor?: string
  created_at: string
  updated_at: string
}

export type CreateProdutoInput = Omit<Produto, 'id' | 'created_at' | 'updated_at'>

export async function fetchProdutos(): Promise<Produto[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
}

export async function fetchProdutoById(id: string): Promise<Produto | null> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return null
  }
}

export async function createProduto(input: Partial<CreateProdutoInput>): Promise<Produto | null> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return null
  }
}

export async function updateProduto(id: string, updates: Partial<Produto>): Promise<Produto | null> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return null
  }
}

export async function deleteProduto(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return false
  }
}

export async function fetchProdutosStats() {
  try {
    const produtos = await fetchProdutos()
    
    const total = produtos.length
    const estoque_baixo = produtos.filter(p => p.quantidade <= p.estoque_minimo).length
    const estoque_critico = produtos.filter(p => p.quantidade === 0).length
    
    const valor_total_estoque = produtos.reduce((acc, p) => 
      acc + (Number(p.quantidade) * Number(p.valor_unitario)), 0
    )
    
    const quantidade_total = produtos.reduce((acc, p) => acc + Number(p.quantidade), 0)

    return {
      total,
      estoque_baixo,
      estoque_critico,
      valor_total_estoque,
      quantidade_total
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      estoque_baixo: 0,
      estoque_critico: 0,
      valor_total_estoque: 0,
      quantidade_total: 0
    }
  }
}

export async function fetchProdutosBaixoEstoque(): Promise<Produto[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .lte('quantidade', supabase.raw('estoque_minimo'))
      .order('quantidade')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar produtos baixo estoque:', error)
    return []
  }
}


import { supabase } from '../supabase'

export type Produto = {
  id?: string
  nome: string
  codigo: string
  categoria: string
  descricao?: string
  unidade: string
  preco_unitario?: number
  estoque_atual: number
  estoque_minimo: number
  estoque_maximo?: number
  localizacao?: string
  fornecedor?: string
  data_validade?: string
  lote?: string
  status: 'Ativo' | 'Inativo' | 'Descontinuado'
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type ProdutoStats = {
  total: number
  ativos: number
  inativos: number
  estoque_baixo: number // Produtos abaixo do estoque mínimo
  estoque_critico: number // Produtos com estoque zero ou negativo
  valor_total_estoque: number
}

/**
 * Busca todos os produtos
 */
export async function fetchProdutos(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um produto por ID
 */
export async function fetchProdutoById(id: string): Promise<Produto | null> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar produto:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo produto
 */
export async function createProduto(produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>): Promise<Produto | null> {
  const { data, error } = await supabase
    .from('produtos')
    .insert(produto)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar produto:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um produto existente
 */
export async function updateProduto(id: string, updates: Partial<Produto>): Promise<Produto | null> {
  const { data, error } = await supabase
    .from('produtos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    throw error
  }
  return data
}

/**
 * Deleta um produto
 */
export async function deleteProduto(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar produto:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de produtos
 */
export async function fetchProdutosStats(): Promise<ProdutoStats> {
  const { data, error } = await supabase
    .from('produtos')
    .select('status, estoque_atual, estoque_minimo, preco_unitario')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const ativos = data?.filter(p => p.status === 'Ativo').length || 0
  const inativos = data?.filter(p => p.status === 'Inativo').length || 0
  const estoque_baixo = data?.filter(p => p.estoque_atual < p.estoque_minimo && p.estoque_atual > 0).length || 0
  const estoque_critico = data?.filter(p => p.estoque_atual <= 0).length || 0

  const valor_total_estoque = data?.reduce((sum, p) => {
    return sum + (p.estoque_atual * (p.preco_unitario || 0))
  }, 0) || 0

  return {
    total,
    ativos,
    inativos,
    estoque_baixo,
    estoque_critico,
    valor_total_estoque
  }
}

/**
 * Busca produtos com estoque baixo
 */
export async function fetchProdutosEstoqueBaixo(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .gt('estoque_atual', 0)
    .filter('estoque_atual', 'lt', 'estoque_minimo')
    .order('estoque_atual', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos com estoque baixo:', error)
    // Fallback: buscar todos e filtrar no cliente
    const allData = await fetchProdutos()
    return allData.filter(p => p.estoque_atual > 0 && p.estoque_atual < p.estoque_minimo)
  }
  return data || []
}

/**
 * Busca produtos com estoque crítico (zero ou negativo)
 */
export async function fetchProdutosEstoqueCritico(): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .lte('estoque_atual', 0)
    .order('estoque_atual', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos com estoque crítico:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza estoque de um produto
 */
export async function updateProdutoEstoque(id: string, quantidade: number, operacao: 'adicionar' | 'remover'): Promise<Produto | null> {
  // Buscar produto atual
  const produto = await fetchProdutoById(id)
  if (!produto) throw new Error('Produto não encontrado')

  const novoEstoque = operacao === 'adicionar' 
    ? produto.estoque_atual + quantidade 
    : produto.estoque_atual - quantidade

  return updateProduto(id, { estoque_atual: novoEstoque })
}

/**
 * Busca produtos por categoria
 */
export async function fetchProdutosByCategoria(categoria: string): Promise<Produto[]> {
  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('categoria', categoria)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar produtos por categoria:', error)
    throw error
  }
  return data || []
}

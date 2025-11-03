import { supabase } from '../supabase'

export type MovimentacaoEstoque = {
  id?: string
  produto_id: string
  produto?: {
    codigo: string
    nome: string
  }
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
  quantidade: number
  estoque_anterior?: number
  estoque_novo?: number
  motivo?: string
  documento?: string
  usuario?: string
  data_movimentacao?: string
  created_at?: string
}

/**
 * Busca todas as movimentações
 */
export async function fetchMovimentacoes(limit = 100): Promise<MovimentacaoEstoque[]> {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .select(`
      *,
      produto:produtos(codigo, nome)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Erro ao buscar movimentações:', error)
    throw error
  }
  return data || []
}

/**
 * Busca movimentações de um produto específico
 */
export async function fetchMovimentacoesByProduto(produto_id: string): Promise<MovimentacaoEstoque[]> {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .select(`
      *,
      produto:produtos(codigo, nome)
    `)
    .eq('produto_id', produto_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar movimentações do produto:', error)
    throw error
  }
  return data || []
}

/**
 * Registra uma nova movimentação
 */
export async function createMovimentacao(
  movimentacao: Omit<MovimentacaoEstoque, 'id' | 'created_at'>
): Promise<MovimentacaoEstoque | null> {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .insert(movimentacao)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar movimentação:', error)
    throw error
  }
  return data
}

/**
 * Busca estatísticas de movimentações
 */
export async function fetchMovimentacoesStats() {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .select('tipo, quantidade')

  if (error) {
    console.error('Erro ao buscar estatísticas de movimentações:', error)
    return {
      total: 0,
      entradas: 0,
      saidas: 0,
      ajustes: 0,
      transferencias: 0
    }
  }

  const total = data?.length || 0
  const entradas = data?.filter(m => m.tipo === 'entrada').length || 0
  const saidas = data?.filter(m => m.tipo === 'saida').length || 0
  const ajustes = data?.filter(m => m.tipo === 'ajuste').length || 0
  const transferencias = data?.filter(m => m.tipo === 'transferencia').length || 0

  return {
    total,
    entradas,
    saidas,
    ajustes,
    transferencias
  }
}

/**
 * Busca movimentações por período
 */
export async function fetchMovimentacoesByPeriodo(
  dataInicio: string,
  dataFim: string
): Promise<MovimentacaoEstoque[]> {
  const { data, error } = await supabase
    .from('movimentacoes_estoque')
    .select(`
      *,
      produto:produtos(codigo, nome)
    `)
    .gte('data_movimentacao', dataInicio)
    .lte('data_movimentacao', dataFim)
    .order('data_movimentacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar movimentações por período:', error)
    throw error
  }
  return data || []
}


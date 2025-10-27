import { supabase } from '../supabase'

export type MetaFinanceira = {
  id: string
  categoria: string
  meta_anual: number
  realizado_atual: number
  periodo: string
  ano: string
  descricao?: string
  status: 'em_andamento' | 'no_prazo' | 'atrasado' | 'concluido' | 'cancelado'
  progresso: number
  created_at: string
  updated_at: string
}

export type CreateMetaInput = {
  categoria: string
  meta_anual: number
  periodo: string
  ano: string
  descricao?: string
}

/**
 * Buscar todas as metas financeiras
 */
export async function fetchMetasFinanceiras(ano?: string): Promise<MetaFinanceira[]> {
  try {
    let query = supabase
      .from('metas_financeiras')
      .select('*')
      .order('created_at', { ascending: false })

    if (ano) {
      query = query.eq('ano', ano)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar metas:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar metas:', error)
    return []
  }
}

/**
 * Buscar meta por ID
 */
export async function fetchMetaById(id: string): Promise<MetaFinanceira | null> {
  try {
    const { data, error } = await supabase
      .from('metas_financeiras')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar meta:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar meta:', error)
    return null
  }
}

/**
 * Criar nova meta financeira
 */
export async function createMeta(input: CreateMetaInput): Promise<MetaFinanceira | null> {
  try {
    const { data, error } = await supabase
      .from('metas_financeiras')
      .insert([
        {
          categoria: input.categoria,
          meta_anual: input.meta_anual,
          periodo: input.periodo,
          ano: input.ano,
          descricao: input.descricao,
          realizado_atual: 0,
          progresso: 0,
          status: 'em_andamento'
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar meta:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao criar meta:', error)
    return null
  }
}

/**
 * Atualizar meta financeira
 */
export async function updateMeta(
  id: string,
  updates: Partial<MetaFinanceira>
): Promise<MetaFinanceira | null> {
  try {
    const { data, error } = await supabase
      .from('metas_financeiras')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar meta:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar meta:', error)
    return null
  }
}

/**
 * Atualizar progresso da meta
 */
export async function updateMetaProgresso(
  id: string,
  realizado_atual: number
): Promise<MetaFinanceira | null> {
  try {
    // Buscar a meta para calcular o progresso
    const meta = await fetchMetaById(id)
    if (!meta) {
      throw new Error('Meta não encontrada')
    }

    const progresso = Math.min(100, (realizado_atual / meta.meta_anual) * 100)
    
    // Determinar status baseado no progresso
    let status: MetaFinanceira['status'] = 'em_andamento'
    if (progresso >= 100) {
      status = 'concluido'
    } else if (progresso >= 75) {
      status = 'no_prazo'
    } else if (progresso < 50) {
      status = 'atrasado'
    }

    const { data, error } = await supabase
      .from('metas_financeiras')
      .update({
        realizado_atual,
        progresso: Math.round(progresso),
        status
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar progresso:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error)
    return null
  }
}

/**
 * Deletar meta financeira
 */
export async function deleteMeta(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('metas_financeiras')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar meta:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar meta:', error)
    return false
  }
}

/**
 * Buscar estatísticas das metas por ano
 */
export async function fetchMetasEstatisticas(ano: string) {
  try {
    const metas = await fetchMetasFinanceiras(ano)

    const total = metas.length
    const concluidas = metas.filter(m => m.status === 'concluido').length
    const no_prazo = metas.filter(m => m.status === 'no_prazo').length
    const atrasadas = metas.filter(m => m.status === 'atrasado').length
    const em_andamento = metas.filter(m => m.status === 'em_andamento').length

    const meta_total = metas.reduce((acc, m) => acc + Number(m.meta_anual), 0)
    const realizado_total = metas.reduce((acc, m) => acc + Number(m.realizado_atual), 0)
    const progresso_medio = total > 0 ? metas.reduce((acc, m) => acc + Number(m.progresso), 0) / total : 0

    return {
      total,
      concluidas,
      no_prazo,
      atrasadas,
      em_andamento,
      meta_total,
      realizado_total,
      progresso_medio: Math.round(progresso_medio),
      taxa_conclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      concluidas: 0,
      no_prazo: 0,
      atrasadas: 0,
      em_andamento: 0,
      meta_total: 0,
      realizado_total: 0,
      progresso_medio: 0,
      taxa_conclusao: 0
    }
  }
}


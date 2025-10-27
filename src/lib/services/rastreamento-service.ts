import { supabase } from '../supabase'

export type PosicaoVeiculo = {
  id: string
  veiculo_id: string
  latitude: number
  longitude: number
  velocidade?: number
  direcao?: number
  timestamp: string
}

export type AlertaRastreamento = {
  id: string
  veiculo_id: string
  tipo: string
  descricao?: string
  prioridade: 'Baixa' | 'Média' | 'Alta'
  status: 'Ativo' | 'Resolvido'
  created_at: string
}

export async function fetchPosicoes(veiculo_id?: string): Promise<PosicaoVeiculo[]> {
  try {
    let query = supabase
      .from('posicoes_veiculo')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000)

    if (veiculo_id) {
      query = query.eq('veiculo_id', veiculo_id)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar posições:', error)
    return []
  }
}

export async function fetchUltimaPosicao(veiculo_id: string): Promise<PosicaoVeiculo | null> {
  try {
    const { data, error } = await supabase
      .from('posicoes_veiculo')
      .select('*')
      .eq('veiculo_id', veiculo_id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar última posição:', error)
    return null
  }
}

export async function createPosicao(input: Omit<PosicaoVeiculo, 'id'>): Promise<PosicaoVeiculo | null> {
  try {
    const { data, error } = await supabase
      .from('posicoes_veiculo')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar posição:', error)
    return null
  }
}

export async function fetchAlertas(): Promise<AlertaRastreamento[]> {
  try {
    const { data, error } = await supabase
      .from('alertas_rastreamento')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar alertas:', error)
    return []
  }
}

export async function createAlerta(input: Omit<AlertaRastreamento, 'id' | 'created_at'>): Promise<AlertaRastreamento | null> {
  try {
    const { data, error } = await supabase
      .from('alertas_rastreamento')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar alerta:', error)
    return null
  }
}

export async function updateAlerta(id: string, updates: Partial<AlertaRastreamento>): Promise<AlertaRastreamento | null> {
  try {
    const { data, error } = await supabase
      .from('alertas_rastreamento')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error)
    return null
  }
}

export async function fetchRastreamentoStats() {
  try {
    const alertas = await fetchAlertas()
    
    const total_alertas = alertas.length
    const alertas_ativos = alertas.filter(a => a.status === 'Ativo').length
    const alertas_resolvidos = alertas.filter(a => a.status === 'Resolvido').length
    
    const por_prioridade = {
      alta: alertas.filter(a => a.prioridade === 'Alta' && a.status === 'Ativo').length,
      media: alertas.filter(a => a.prioridade === 'Média' && a.status === 'Ativo').length,
      baixa: alertas.filter(a => a.prioridade === 'Baixa' && a.status === 'Ativo').length
    }

    return {
      total_alertas,
      alertas_ativos,
      alertas_resolvidos,
      por_prioridade
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total_alertas: 0,
      alertas_ativos: 0,
      alertas_resolvidos: 0,
      por_prioridade: { alta: 0, media: 0, baixa: 0 }
    }
  }
}

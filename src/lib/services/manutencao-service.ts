import { supabase } from '@/lib/supabase'
import { Manutencao, ManutencaoInsert, ManutencaoUpdate, ManutencaoFilter } from '@/types/supabase'

export interface ManutencaoStats {
  total: number
  pendentes: number
  emAndamento: number
  concluidas: number
  custoTotal: number
  custoPreventivaTotal: number
  custoCorretivaTotal: number
}

class ManutencaoService {
  async getManutencoes(filters: ManutencaoFilter = {}): Promise<Manutencao[]> {
    let query = supabase
      .from('manutencoes')
      .select(`
        *,
        veiculo:veiculos(id, placa, modelo, marca)
      `)
      .order('data_prevista', { ascending: false })

    // Aplicar filtros
    if (filters.veiculo_id) {
      query = query.eq('veiculo_id', filters.veiculo_id)
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters.tipo) {
      query = query.eq('tipo', filters.tipo)
    }
    
    if (filters.data_inicio && filters.data_fim) {
      query = query
        .gte('data_prevista', filters.data_inicio)
        .lte('data_prevista', filters.data_fim)
    } else if (filters.data_inicio) {
      query = query.gte('data_prevista', filters.data_inicio)
    } else if (filters.data_fim) {
      query = query.lte('data_prevista', filters.data_fim)
    }

    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar manutenções:', error)
      throw new Error('Erro ao buscar manutenções')
    }
    
    return data || []
  }

  async getManutencaoById(id: string): Promise<Manutencao | null> {
    const { data, error } = await supabase
      .from('manutencoes')
      .select(`
        *,
        veiculo:veiculos(id, placa, modelo, marca)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Erro ao buscar manutenção:', error)
      return null
    }
    
    return data
  }

  async createManutencao(manutencao: ManutencaoInsert): Promise<Manutencao> {
    const { data, error } = await supabase
      .from('manutencoes')
      .insert(manutencao)
      .select(`
        *,
        veiculo:veiculos(id, placa, modelo, marca)
      `)
      .single()
    
    if (error) {
      console.error('Erro ao criar manutenção:', error)
      throw new Error('Erro ao criar manutenção')
    }
    
    return data
  }

  async updateManutencao(id: string, manutencao: ManutencaoUpdate): Promise<Manutencao> {
    const { data, error } = await supabase
      .from('manutencoes')
      .update(manutencao)
      .eq('id', id)
      .select(`
        *,
        veiculo:veiculos(id, placa, modelo, marca)
      `)
      .single()
    
    if (error) {
      console.error('Erro ao atualizar manutenção:', error)
      throw new Error('Erro ao atualizar manutenção')
    }
    
    return data
  }

  async deleteManutencao(id: string): Promise<void> {
    const { error } = await supabase
      .from('manutencoes')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao excluir manutenção:', error)
      throw new Error('Erro ao excluir manutenção')
    }
  }

  async getStats(): Promise<ManutencaoStats> {
    const { data, error } = await supabase
      .from('manutencoes')
      .select('status, tipo, custo_total')
    
    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw new Error('Erro ao buscar estatísticas')
    }

    const stats: ManutencaoStats = {
      total: data.length,
      pendentes: data.filter(m => m.status === 'Pendente').length,
      emAndamento: data.filter(m => m.status === 'Em Andamento').length,
      concluidas: data.filter(m => m.status === 'Concluída').length,
      custoTotal: data.reduce((sum, m) => sum + (m.custo_total || 0), 0),
      custoPreventivaTotal: data
        .filter(m => m.tipo === 'Preventiva')
        .reduce((sum, m) => sum + (m.custo_total || 0), 0),
      custoCorretivaTotal: data
        .filter(m => m.tipo === 'Corretiva')
        .reduce((sum, m) => sum + (m.custo_total || 0), 0),
    }

    return stats
  }

  async getVeiculos() {
    const { data, error } = await supabase
      .from('veiculos')
      .select('id, placa, modelo, marca')
      .order('placa')
    
    if (error) {
      console.error('Erro ao buscar veículos:', error)
      throw new Error('Erro ao buscar veículos')
    }
    
    return data || []
  }

  async getManutencoesPendentes(): Promise<Manutencao[]> {
    return this.getManutencoes({ status: 'Pendente' })
  }

  async getManutencoesPorVencimento(dias: number = 30): Promise<Manutencao[]> {
    const dataLimite = new Date()
    dataLimite.setDate(dataLimite.getDate() + dias)
    
    return this.getManutencoes({
      status: 'Agendada',
      data_fim: dataLimite.toISOString().split('T')[0]
    })
  }
}

export const manutencaoService = new ManutencaoService() 
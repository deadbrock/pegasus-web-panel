import { supabase } from '@/lib/supabase'
import { 
  VeiculoRastreamento, 
  RastreamentoStats, 
  PosicaoHistorico, 
  ParametrosHistorico,
  FiltroRastreamento,
  AlertaRastreamento 
} from '@/types/rastreamento'

class RastreamentoService {
  async getVeiculosAtivos(filtros: FiltroRastreamento = {}): Promise<VeiculoRastreamento[]> {
    try {
      let query = supabase
        .from('veiculos')
        .select(`
          *,
          motorista:motoristas(id, nome, telefone)
        `)
        .neq('status', 'Inativo')
        .order('ultima_atualizacao', { ascending: false })

      // Aplicar filtros
      if (filtros.status && filtros.status.length > 0) {
        query = query.in('status', filtros.status)
      }
      
      if (filtros.motorista_id) {
        query = query.eq('motorista_id', filtros.motorista_id)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Erro ao buscar veículos ativos:', error)
        throw new Error('Erro ao buscar veículos ativos')
      }

      // Simular alguns dados de rastreamento para demonstração
      return data.map(veiculo => ({
        ...veiculo,
        status: this.determinarStatus(veiculo),
        velocidade: Math.floor(Math.random() * 80) + 20, // Simulação
        direcao: Math.floor(Math.random() * 360), // Simulação
        latitude: veiculo.latitude || (-14.235 + (Math.random() - 0.5) * 10),
        longitude: veiculo.longitude || (-51.9253 + (Math.random() - 0.5) * 10),
      }))
    } catch (error) {
      console.error('Erro no serviço de rastreamento:', error)
      return []
    }
  }

  private determinarStatus(veiculo: any): VeiculoRastreamento['status'] {
    if (!veiculo.ultima_atualizacao) return 'Offline'
    
    const ultimaAtualizacao = new Date(veiculo.ultima_atualizacao)
    const agora = new Date()
    const diferencaMinutos = (agora.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60)
    
    if (diferencaMinutos > 30) return 'Offline'
    if (veiculo.velocidade > 5) return 'Em Rota'
    if (veiculo.velocidade <= 5) return 'Parado'
    
    return 'Ativo'
  }

  async getStats(): Promise<RastreamentoStats> {
    try {
      const { data: veiculos, error } = await supabase
        .from('veiculos')
        .select('status, ultima_atualizacao')
        .neq('status', 'Inativo')

      if (error) throw error

      const agora = new Date()
      let ativos = 0, emRota = 0, parados = 0, offline = 0

      veiculos.forEach(veiculo => {
        const status = this.determinarStatus(veiculo)
        switch (status) {
          case 'Ativo':
            ativos++
            break
          case 'Em Rota':
            emRota++
            break
          case 'Parado':
            parados++
            break
          case 'Offline':
            offline++
            break
        }
      })

      return {
        total_veiculos: veiculos.length,
        veiculos_ativos: ativos,
        veiculos_em_rota: emRota,
        veiculos_parados: parados,
        veiculos_offline: offline,
        rotas_ativas: emRota, // Simplificação
        distancia_total_percorrida: Math.floor(Math.random() * 50000) + 10000, // Simulação
        tempo_medio_rota: Math.floor(Math.random() * 120) + 60, // Simulação em minutos
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        total_veiculos: 0,
        veiculos_ativos: 0,
        veiculos_em_rota: 0,
        veiculos_parados: 0,
        veiculos_offline: 0,
        rotas_ativas: 0,
        distancia_total_percorrida: 0,
        tempo_medio_rota: 0,
      }
    }
  }

  async getHistoricoVeiculo(parametros: ParametrosHistorico): Promise<PosicaoHistorico[]> {
    try {
      // Para demonstração, vamos simular um histórico
      // Em uma implementação real, isso viria de uma tabela de histórico de posições
      const posicoes: PosicaoHistorico[] = []
      const inicio = new Date(parametros.data_inicio)
      const fim = new Date(parametros.data_fim)
      
      // Gerar posições simuladas a cada 15 minutos
      const intervalo = 15 * 60 * 1000 // 15 minutos em ms
      let dataAtual = new Date(inicio)
      
      // Coordenadas base para simular movimento
      let lat = -14.235 + (Math.random() - 0.5) * 0.5
      let lng = -51.9253 + (Math.random() - 0.5) * 0.5
      
      while (dataAtual <= fim) {
        // Simular pequeno movimento
        lat += (Math.random() - 0.5) * 0.01
        lng += (Math.random() - 0.5) * 0.01
        
        posicoes.push({
          id: `pos_${dataAtual.getTime()}`,
          veiculo_id: parametros.veiculo_id,
          latitude: lat,
          longitude: lng,
          velocidade: Math.floor(Math.random() * 80) + 10,
          direcao: Math.floor(Math.random() * 360),
          timestamp: dataAtual.toISOString(),
          evento: Math.random() > 0.8 ? 'parada' : 'movimento',
        })
        
        dataAtual = new Date(dataAtual.getTime() + intervalo)
      }
      
      return posicoes
    } catch (error) {
      console.error('Erro ao buscar histórico:', error)
      return []
    }
  }

  async atualizarPosicao(veiculoId: string, latitude: number, longitude: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('veiculos')
        .update({
          latitude,
          longitude,
          ultima_atualizacao: new Date().toISOString(),
        })
        .eq('id', veiculoId)

      if (error) {
        console.error('Erro ao atualizar posição:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Erro ao atualizar posição:', error)
      return false
    }
  }

  async getAlertas(): Promise<AlertaRastreamento[]> {
    // Para demonstração, retornamos alguns alertas simulados
    return [
      {
        id: '1',
        veiculo_id: 'veiculo1',
        tipo: 'excesso_velocidade',
        descricao: 'Veículo ABC-1234 excedeu 80 km/h',
        timestamp: new Date().toISOString(),
        status: 'ativo',
        prioridade: 'alta',
        localizacao: {
          latitude: -14.235,
          longitude: -51.9253,
          endereco: 'Rodovia BR-010, Km 25'
        }
      },
      {
        id: '2',
        veiculo_id: 'veiculo2',
        tipo: 'parada_prolongada',
        descricao: 'Veículo DEF-5678 parado há mais de 2 horas',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'ativo',
        prioridade: 'media',
        localizacao: {
          latitude: -14.240,
          longitude: -51.930,
          endereco: 'Centro de Brasília'
        }
      }
    ]
  }

  async resolverAlerta(alertaId: string): Promise<boolean> {
    try {
      // Em uma implementação real, atualizaria o status do alerta no banco
      console.log(`Resolvendo alerta ${alertaId}`)
      return true
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
      return false
    }
  }

  // Método para calcular distância entre dois pontos (fórmula de Haversine)
  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Raio da Terra em km
    const dLat = this.toRad(lat2 - lat1)
    const dLng = this.toRad(lng2 - lng1)
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180)
  }
}

export const rastreamentoService = new RastreamentoService() 
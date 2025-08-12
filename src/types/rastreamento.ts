export interface VeiculoRastreamento {
  id: string
  placa: string
  modelo: string
  marca: string
  motorista_id?: string
  motorista?: {
    id: string
    nome: string
    telefone?: string
  }
  latitude?: number
  longitude?: number
  status: 'Ativo' | 'Em Rota' | 'Parado' | 'Offline'
  velocidade?: number
  direcao?: number
  ultima_atualizacao?: string
  rota_ativa?: RotaAtiva
  historico_posicoes?: PosicaoHistorico[]
}

export interface RotaAtiva {
  id: string
  origem: {
    endereco: string
    latitude: number
    longitude: number
  }
  destino: {
    endereco: string
    latitude: number
    longitude: number
  }
  status: 'Planejada' | 'Em Andamento' | 'Concluída' | 'Cancelada'
  distancia_total?: number
  distancia_percorrida?: number
  tempo_estimado?: number
  tempo_decorrido?: number
  pontos_rota?: PontoRota[]
}

export interface PontoRota {
  latitude: number
  longitude: number
  ordem: number
  endereco?: string
  tipo: 'origem' | 'parada' | 'destino'
  status: 'pendente' | 'visitado'
  horario_previsto?: string
  horario_real?: string
}

export interface PosicaoHistorico {
  id: string
  veiculo_id: string
  latitude: number
  longitude: number
  velocidade?: number
  direcao?: number
  timestamp: string
  endereco?: string
  evento?: 'movimento' | 'parada' | 'excesso_velocidade' | 'desvio_rota'
}

export interface RastreamentoStats {
  total_veiculos: number
  veiculos_ativos: number
  veiculos_em_rota: number
  veiculos_parados: number
  veiculos_offline: number
  rotas_ativas: number
  distancia_total_percorrida: number
  tempo_medio_rota: number
}

export interface FiltroRastreamento {
  status?: string[]
  motorista_id?: string
  data_inicio?: string
  data_fim?: string
  com_rota?: boolean
}

export interface AlertaRastreamento {
  id: string
  veiculo_id: string
  tipo: 'excesso_velocidade' | 'desvio_rota' | 'parada_prolongada' | 'offline'
  descricao: string
  timestamp: string
  status: 'ativo' | 'resolvido' | 'ignorado'
  prioridade: 'baixa' | 'media' | 'alta'
  localizacao?: {
    latitude: number
    longitude: number
    endereco?: string
  }
}

export interface ParametrosHistorico {
  veiculo_id: string
  data_inicio: string
  data_fim: string
  incluir_paradas?: boolean
  incluir_eventos?: boolean
} 
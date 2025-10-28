import { VehicleRecord } from './vehiclesService'

export type VehicleStats = {
  total: number
  ativos: number
  emManutencao: number
  inativos: number
  kmTotal: number
  porStatus: {
    Ativo: number
    'Em Manutenção': number
    Inativo: number
    Vendido: number
  }
  porIdade: {
    '0-2 anos': number
    '3-5 anos': number
    '6-10 anos': number
    '+10 anos': number
  }
}

/**
 * Calcula estatísticas gerais da frota
 */
export function calcularEstatisticasVeiculos(vehicles: VehicleRecord[]): VehicleStats {
  const total = vehicles.length
  
  // Status
  const ativos = vehicles.filter(v => v.status === 'Ativo').length
  const emManutencao = vehicles.filter(v => v.status === 'Em Manutenção').length
  const inativos = vehicles.filter(v => v.status === 'Inativo').length
  const vendidos = vehicles.filter(v => v.status === 'Vendido').length
  
  // Quilometragem total
  const kmTotal = vehicles.reduce((acc, v) => acc + (v.kmTotal || 0), 0)
  
  // Idade da frota
  const hoje = new Date()
  const porIdade = {
    '0-2 anos': 0,
    '3-5 anos': 0,
    '6-10 anos': 0,
    '+10 anos': 0
  }
  
  vehicles.forEach(v => {
    if (v.ano) {
      const idade = hoje.getFullYear() - v.ano
      if (idade <= 2) porIdade['0-2 anos']++
      else if (idade <= 5) porIdade['3-5 anos']++
      else if (idade <= 10) porIdade['6-10 anos']++
      else porIdade['+10 anos']++
    }
  })
  
  return {
    total,
    ativos,
    emManutencao,
    inativos,
    kmTotal,
    porStatus: {
      'Ativo': ativos,
      'Em Manutenção': emManutencao,
      'Inativo': inativos,
      'Vendido': vendidos
    },
    porIdade
  }
}

/**
 * Calcula quilometragem por veículo
 */
export function calcularKmPorVeiculo(vehicles: VehicleRecord[]) {
  return vehicles
    .filter(v => v.placa && v.kmTotal)
    .slice(0, 6) // Top 6 veículos
    .map(v => ({
      placa: v.placa,
      kmTotal: v.kmTotal || 0,
      kmMensal: 0 // TODO: implementar cálculo de KM mensal quando houver histórico
    }))
}

/**
 * Calcula métricas de performance da frota
 */
export function calcularPerformanceFrota(vehicles: VehicleRecord[]) {
  const total = vehicles.length
  if (total === 0) {
    return {
      disponibilidade: 0,
      eficienciaOperacional: 0,
      manutencoesEmDia: 0
    }
  }
  
  const ativos = vehicles.filter(v => v.status === 'Ativo').length
  const disponibilidade = (ativos / total) * 100
  
  // Eficiência operacional = veículos em boa condição (ativos)
  const emBoaCondicao = vehicles.filter(v => v.status === 'Ativo').length
  const eficienciaOperacional = (emBoaCondicao / total) * 100
  
  // Manutenções em dia = assumindo que veículos ativos estão em dia
  const comManutencaoEmDia = vehicles.filter(v => v.status === 'Ativo').length
  const manutencoesEmDia = (comManutencaoEmDia / total) * 100
  
  return {
    disponibilidade: parseFloat(disponibilidade.toFixed(1)),
    eficienciaOperacional: parseFloat(eficienciaOperacional.toFixed(1)),
    manutencoesEmDia: parseFloat(manutencoesEmDia.toFixed(1))
  }
}

/**
 * Busca próximas manutenções
 * TODO: Implementar quando houver campo de manutenção no banco de dados
 */
export function buscarProximasManutencoes(vehicles: VehicleRecord[]) {
  // Retorna lista vazia por enquanto, pois não temos campo de próxima manutenção
  // no VehicleRecord atual
  return []
}


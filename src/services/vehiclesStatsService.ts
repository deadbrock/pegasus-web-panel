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
  const kmTotal = vehicles.reduce((acc, v) => acc + (v.km_atual || 0), 0)
  
  // Idade da frota
  const hoje = new Date()
  const porIdade = {
    '0-2 anos': 0,
    '3-5 anos': 0,
    '6-10 anos': 0,
    '+10 anos': 0
  }
  
  vehicles.forEach(v => {
    if (v.ano_fabricacao) {
      const idade = hoje.getFullYear() - v.ano_fabricacao
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
    .filter(v => v.placa && v.km_atual)
    .slice(0, 6) // Top 6 veículos
    .map(v => ({
      placa: v.placa,
      kmTotal: v.km_atual || 0,
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
  
  // Eficiência operacional = veículos em boa condição
  const emBoaCondicao = vehicles.filter(v => 
    v.status === 'Ativo' && (!v.proxima_manutencao || new Date(v.proxima_manutencao) > new Date())
  ).length
  const eficienciaOperacional = (emBoaCondicao / total) * 100
  
  // Manutenções em dia = veículos sem manutenção atrasada
  const comManutencaoEmDia = vehicles.filter(v => 
    !v.proxima_manutencao || new Date(v.proxima_manutencao) >= new Date()
  ).length
  const manutencoesEmDia = (comManutencaoEmDia / total) * 100
  
  return {
    disponibilidade: parseFloat(disponibilidade.toFixed(1)),
    eficienciaOperacional: parseFloat(eficienciaOperacional.toFixed(1)),
    manutencoesEmDia: parseFloat(manutencoesEmDia.toFixed(1))
  }
}

/**
 * Busca próximas manutenções
 */
export function buscarProximasManutencoes(vehicles: VehicleRecord[]) {
  const hoje = new Date()
  const seteDiasDepois = new Date(hoje)
  seteDiasDepois.setDate(hoje.getDate() + 7)
  
  return vehicles
    .filter(v => v.proxima_manutencao)
    .map(v => {
      const dataManutencao = new Date(v.proxima_manutencao!)
      const diasRestantes = Math.ceil((dataManutencao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      
      let status: 'atrasada' | 'urgente' | 'proxima' = 'proxima'
      if (diasRestantes < 0) status = 'atrasada'
      else if (diasRestantes <= 3) status = 'urgente'
      
      return {
        placa: v.placa,
        modelo: v.modelo,
        dataManutencao: v.proxima_manutencao,
        diasRestantes,
        status
      }
    })
    .sort((a, b) => a.diasRestantes - b.diasRestantes)
    .slice(0, 3) // Top 3 próximas manutenções
}


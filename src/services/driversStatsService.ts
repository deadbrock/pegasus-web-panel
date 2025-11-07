import { DriverRecord } from './driversService'

export type DriverStats = {
  total: number
  ativos: number
  inativos: number
  cnhVencendo: number
  cnhVencidas: number
  porCategoria: { categoria: string; quantidade: number }[]
  porStatus: { name: string; value: number; color: string }[]
  documentosStatus: {
    vencidos: number
    vencendo: number
    pendentes: number
    emDia: number
  }
  performance: {
    pontualidade: number
    seguranca: number
    eficiencia: number
    satisfacao: number
  }
}

/**
 * Calcula estatísticas gerais dos motoristas
 */
export function calcularEstatisticasMotoristas(drivers: DriverRecord[]): DriverStats {
  const hoje = new Date()
  
  const total = drivers.length
  
  // Contar status
  let ativos = 0
  let inativos = 0
  let cnhVencendo = 0
  let cnhVencidas = 0
  
  drivers.forEach(driver => {
    // Usar validade_cnh (campo correto do banco)
    const validade = driver.validade_cnh ? new Date(driver.validade_cnh) : null
    const diasParaVencer = validade 
      ? Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    if (driver.status === 'Ativo') {
      ativos++
    } else {
      inativos++
    }
    
    // Contar CNHs apenas se houver validade cadastrada
    if (validade) {
      if (diasParaVencer < 0) {
        cnhVencidas++
      } else if (diasParaVencer <= 30) {
        cnhVencendo++
      }
    }
  })
  
  // Contar por categoria
  const categorias: Record<string, number> = {}
  drivers.forEach(driver => {
    const cat = driver.categoria_cnh || 'N/A'
    categorias[cat] = (categorias[cat] || 0) + 1
  })
  
  const porCategoria = Object.entries(categorias)
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria))
  
  // Por status para gráfico
  const porStatus = [
    { name: 'Ativo', value: ativos, color: '#10b981' },
    { name: 'CNH Vencendo', value: cnhVencendo, color: '#f59e0b' },
    { name: 'Inativo', value: inativos, color: '#6b7280' },
    { name: 'Férias', value: 0, color: '#3b82f6' }
  ]
  
  // Status de documentos
  const documentosStatus = {
    vencidos: cnhVencidas,
    vencendo: cnhVencendo,
    pendentes: 0,
    emDia: total - cnhVencidas - cnhVencendo
  }
  
  // Performance média - calculada dos dados reais dos motoristas
  let somaPontualidade = 0
  let somaSeguranca = 0
  let somaEficiencia = 0
  let somaSatisfacao = 0
  let countComPerformance = 0
  
  drivers.forEach(driver => {
    if (driver.pontuacao && driver.pontuacao > 0) {
      somaPontualidade += driver.pontualidade || 0
      somaSeguranca += driver.seguranca || 0
      somaEficiencia += driver.eficiencia || 0
      somaSatisfacao += driver.satisfacao || 0
      countComPerformance++
    }
  })
  
  const performance = {
    pontualidade: countComPerformance > 0 ? Math.round(somaPontualidade / countComPerformance) : 0,
    seguranca: countComPerformance > 0 ? Math.round(somaSeguranca / countComPerformance) : 0,
    eficiencia: countComPerformance > 0 ? Math.round(somaEficiencia / countComPerformance) : 0,
    satisfacao: countComPerformance > 0 ? Math.round(somaSatisfacao / countComPerformance) : 0
  }
  
  return {
    total,
    ativos,
    inativos,
    cnhVencendo,
    cnhVencidas,
    porCategoria,
    porStatus,
    documentosStatus,
    performance
  }
}

/**
 * Retorna alertas de documentos vencendo
 */
export function buscarAlertasDocumentos(drivers: DriverRecord[]) {
  const hoje = new Date()
  const alertas: Array<{
    motorista: string
    tipo: string
    mensagem: string
    dias: number
    severidade: 'critico' | 'alerta' | 'atencao'
  }> = []
  
  drivers.forEach(driver => {
    // Usar validade_cnh (campo correto do banco)
    const validade = driver.validade_cnh ? new Date(driver.validade_cnh) : null
    
    if (!validade) return // Ignorar motoristas sem validade cadastrada
    
    const diasParaVencer = Math.ceil((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasParaVencer < 0) {
      alertas.push({
        motorista: driver.nome,
        tipo: 'CNH',
        mensagem: `CNH vencida há ${Math.abs(diasParaVencer)} dias`,
        dias: diasParaVencer,
        severidade: 'critico'
      })
    } else if (diasParaVencer <= 15) {
      alertas.push({
        motorista: driver.nome,
        tipo: 'CNH',
        mensagem: `CNH vence em ${diasParaVencer} dias`,
        dias: diasParaVencer,
        severidade: 'critico'
      })
    } else if (diasParaVencer <= 45) {
      alertas.push({
        motorista: driver.nome,
        tipo: 'CNH',
        mensagem: `CNH vence em ${diasParaVencer} dias`,
        dias: diasParaVencer,
        severidade: 'alerta'
      })
    }
  })
  
  return alertas.sort((a, b) => a.dias - b.dias)
}

/**
 * Retorna os motoristas com melhor performance (dados reais)
 */
export function buscarMelhoresPerformances(drivers: DriverRecord[]) {
  const performances = drivers
    .filter(d => d.status === 'Ativo' && d.pontuacao && d.pontuacao > 0)
    .sort((a, b) => (b.pontuacao || 0) - (a.pontuacao || 0))
    .slice(0, 3)
    .map(d => ({
      nome: d.nome,
      pontuacao: d.pontuacao || 0
    }))
  
  return performances
}


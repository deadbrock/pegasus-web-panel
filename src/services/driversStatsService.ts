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
    const vencimento = new Date(driver.validadeCnh || '')
    const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    
    if (driver.status === 'Ativo') {
      ativos++
    } else {
      inativos++
    }
    
    if (diasParaVencer < 0) {
      cnhVencidas++
    } else if (diasParaVencer <= 30) {
      cnhVencendo++
    }
  })
  
  // Contar por categoria
  const categorias: Record<string, number> = {}
  drivers.forEach(driver => {
    const cat = driver.categoria || 'N/A'
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
  
  // Performance média - calculada dos motoristas (se disponível)
  // Por enquanto, calcula baseado na taxa de documentos em dia
  const taxaDocumentosEmDia = total > 0 ? Math.round(((total - cnhVencidas) / total) * 100) : 0
  const performance = {
    pontualidade: total > 0 ? taxaDocumentosEmDia : 0,
    seguranca: total > 0 ? taxaDocumentosEmDia : 0,
    eficiencia: total > 0 ? Math.round((ativos / total) * 100) : 0,
    satisfacao: total > 0 ? taxaDocumentosEmDia : 0
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
    const vencimento = new Date(driver.validadeCnh || '')
    const diasParaVencer = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    
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
 * Retorna os motoristas com melhor performance (mock por enquanto)
 */
export function buscarMelhoresPerformances(drivers: DriverRecord[]) {
  // Mock data - pode ser expandido com dados reais de performance
  const performances = drivers
    .filter(d => d.status === 'Ativo')
    .slice(0, 3)
    .map((d, i) => ({
      nome: d.nome,
      pontuacao: 96 - (i * 2) // Mock
    }))
  
  return performances
}


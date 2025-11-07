import { supabase } from '@/lib/supabaseClient'

export interface AnalyticsStats {
  totalEntregas: number
  totalEntregasCompletas: number
  totalEntregasPendentes: number
  eficienciaOperacional: number
  custoTotal: number
  motoristasAtivos: number
  variacao: {
    entregas: number
    eficiencia: number
    custos: number
    motoristas: number
  }
}

export interface DeliveryPoint {
  data: string
  entregas: number
  concluidas: number
  meta: number
}

export interface PieItem {
  name: string
  value: number
  color?: string
}

export interface DriverPerformance {
  name: string
  entregas: number
  pontuacao: number
}

/**
 * Calcula estatísticas gerais de analytics
 */
export async function calcularEstatisticasAnalytics(
  periodoAtual: { inicio: Date; fim: Date },
  periodoAnterior: { inicio: Date; fim: Date }
): Promise<AnalyticsStats> {
  try {
    // Buscar rotas do período atual
    const { data: rotasAtuais, error: errorAtual } = await supabase
      .from('rotas_entrega')
      .select('status, data_criacao')
      .gte('data_criacao', periodoAtual.inicio.toISOString())
      .lte('data_criacao', periodoAtual.fim.toISOString())

    if (errorAtual) throw errorAtual

    // Buscar rotas do período anterior
    const { data: rotasAnteriores, error: errorAnterior } = await supabase
      .from('rotas_entrega')
      .select('status, data_criacao')
      .gte('data_criacao', periodoAnterior.inicio.toISOString())
      .lte('data_criacao', periodoAnterior.fim.toISOString())

    if (errorAnterior) throw errorAnterior

    // Calcular métricas atuais
    const totalEntregas = rotasAtuais?.length || 0
    const totalEntregasCompletas = rotasAtuais?.filter(r => r.status === 'Entregue').length || 0
    const totalEntregasPendentes = rotasAtuais?.filter(r => 
      r.status !== 'Entregue' && r.status !== 'Cancelada'
    ).length || 0
    const eficienciaOperacional = totalEntregas > 0 
      ? (totalEntregasCompletas / totalEntregas) * 100 
      : 0

    // Calcular métricas anteriores
    const totalEntregasAnteriores = rotasAnteriores?.length || 0
    const totalEntregasCompletasAnteriores = rotasAnteriores?.filter(r => r.status === 'Entregue').length || 0
    const eficienciaAnterior = totalEntregasAnteriores > 0
      ? (totalEntregasCompletasAnteriores / totalEntregasAnteriores) * 100
      : 0

    // Buscar custos (manutenções)
    const { data: custos } = await supabase
      .from('manutencoes')
      .select('custo, data_agendada')
      .gte('data_agendada', periodoAtual.inicio.toISOString())
      .lte('data_agendada', periodoAtual.fim.toISOString())

    const custoTotal = custos?.reduce((sum, m) => sum + (Number(m.custo) || 0), 0) || 0

    const { data: custosAnteriores } = await supabase
      .from('manutencoes')
      .select('custo')
      .gte('data_agendada', periodoAnterior.inicio.toISOString())
      .lte('data_agendada', periodoAnterior.fim.toISOString())

    const custoAnterior = custosAnteriores?.reduce((sum, m) => sum + (Number(m.custo) || 0), 0) || 0

    // Buscar motoristas ativos (que fizeram entregas no período)
    const { data: motoristasData } = await supabase
      .from('rotas_entrega')
      .select('motorista_id')
      .gte('data_criacao', periodoAtual.inicio.toISOString())
      .lte('data_criacao', periodoAtual.fim.toISOString())
      .not('motorista_id', 'is', null)

    const motoristasUnicos = new Set(motoristasData?.map(r => r.motorista_id) || [])
    const motoristasAtivos = motoristasUnicos.size

    const { data: motoristasAnterioresData } = await supabase
      .from('rotas_entrega')
      .select('motorista_id')
      .gte('data_criacao', periodoAnterior.inicio.toISOString())
      .lte('data_criacao', periodoAnterior.fim.toISOString())
      .not('motorista_id', 'is', null)

    const motoristasAnterioresUnicos = new Set(motoristasAnterioresData?.map(r => r.motorista_id) || [])
    const motoristasAnteriores = motoristasAnterioresUnicos.size

    // Calcular variações
    const variacaoEntregas = totalEntregasAnteriores > 0
      ? ((totalEntregas - totalEntregasAnteriores) / totalEntregasAnteriores) * 100
      : 0

    const variacaoEficiencia = eficienciaAnterior > 0
      ? eficienciaOperacional - eficienciaAnterior
      : 0

    const variacaoCustos = custoAnterior > 0
      ? ((custoTotal - custoAnterior) / custoAnterior) * 100
      : 0

    const variacaoMotoristas = motoristasAnteriores > 0
      ? motoristasAtivos - motoristasAnteriores
      : 0

    return {
      totalEntregas,
      totalEntregasCompletas,
      totalEntregasPendentes,
      eficienciaOperacional: Math.round(eficienciaOperacional * 10) / 10,
      custoTotal,
      motoristasAtivos,
      variacao: {
        entregas: Math.round(variacaoEntregas * 10) / 10,
        eficiencia: Math.round(variacaoEficiencia * 10) / 10,
        custos: Math.round(variacaoCustos * 10) / 10,
        motoristas: variacaoMotoristas
      }
    }
  } catch (error) {
    console.error('[calcularEstatisticasAnalytics] Erro:', error)
    return {
      totalEntregas: 0,
      totalEntregasCompletas: 0,
      totalEntregasPendentes: 0,
      eficienciaOperacional: 0,
      custoTotal: 0,
      motoristasAtivos: 0,
      variacao: {
        entregas: 0,
        eficiencia: 0,
        custos: 0,
        motoristas: 0
      }
    }
  }
}

/**
 * Busca evolução de entregas por dia no período
 */
export async function getDeliveryEvolutionRange(start: Date, end: Date): Promise<DeliveryPoint[]> {
  try {
    const { data, error } = await supabase
      .from('rotas_entrega')
      .select('status, data_criacao, data_entrega')
      .gte('data_criacao', start.toISOString())
      .lte('data_criacao', end.toISOString())

    if (error) throw error

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1)
    const byDay: Record<string, { total: number; concluidas: number }> = {}

    for (let i = 0; i < days; i++) {
      const d = new Date(start.getTime() + i * 86400000)
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      byDay[key] = { total: 0, concluidas: 0 }
    }

    for (const rota of data || []) {
      const d = new Date(rota.data_criacao)
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      if (byDay[key]) {
        byDay[key].total++
        if (rota.status === 'Entregue') {
          byDay[key].concluidas++
        }
      }
    }

    // Meta dinâmica: 80% da média de entregas
    const totalEntregas = Object.values(byDay).reduce((sum, v) => sum + v.total, 0)
    const meta = Math.ceil((totalEntregas / days) * 0.8)

    return Object.entries(byDay).map(([data, v]) => ({
      data,
      entregas: v.total,
      concluidas: v.concluidas,
      meta
    }))
  } catch (error) {
    console.error('[getDeliveryEvolutionRange] Erro:', error)
    return []
  }
}

/**
 * Busca status das rotas no período
 */
export async function getRouteStatusRange(start: Date, end: Date): Promise<PieItem[]> {
  try {
    const { data, error } = await supabase
      .from('rotas_entrega')
      .select('status, data_criacao')
      .gte('data_criacao', start.toISOString())
      .lte('data_criacao', end.toISOString())

    if (error) throw error

    const counts: Record<string, number> = {}
    for (const rota of data || []) {
      const status = rota.status || 'Aguardando Atribuição'
      counts[status] = (counts[status] || 0) + 1
    }

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  } catch (error) {
    console.error('[getRouteStatusRange] Erro:', error)
    return []
  }
}

/**
 * Busca custos por categoria no período
 */
export async function getCostsByCategoryRange(start: Date, end: Date): Promise<PieItem[]> {
  try {
    const { data, error } = await supabase
      .from('manutencoes')
      .select('tipo, custo, data_agendada')
      .gte('data_agendada', start.toISOString())
      .lte('data_agendada', end.toISOString())

    if (error) throw error

    const buckets: Record<string, number> = {}

    for (const manutencao of data || []) {
      const tipo = manutencao.tipo || 'Outros'
      const custo = Number(manutencao.custo) || 0
      buckets[tipo] = (buckets[tipo] || 0) + custo
    }

    // Se não houver dados, retornar array vazio
    if (Object.keys(buckets).length === 0) {
      return []
    }

    return Object.entries(buckets)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  } catch (error) {
    console.error('[getCostsByCategoryRange] Erro:', error)
    return []
  }
}

/**
 * Busca performance dos motoristas no período
 */
export async function getDriversPerformanceRange(start: Date, end: Date): Promise<DriverPerformance[]> {
  try {
    const { data: rotas, error: errorRotas } = await supabase
      .from('rotas_entrega')
      .select('motorista_id, status, data_criacao')
      .gte('data_criacao', start.toISOString())
      .lte('data_criacao', end.toISOString())
      .not('motorista_id', 'is', null)

    if (errorRotas) throw errorRotas

    // Buscar dados dos motoristas
    const motoristasIds = [...new Set(rotas?.map(r => r.motorista_id) || [])]
    const { data: motoristas, error: errorMotoristas } = await supabase
      .from('motoristas')
      .select('id, nome, pontuacao')
      .in('id', motoristasIds)

    if (errorMotoristas) throw errorMotoristas

    // Calcular performance por motorista
    const stats: Record<string, { nome: string; entregas: number; pontuacao: number }> = {}

    for (const motorista of motoristas || []) {
      stats[motorista.id] = {
        nome: motorista.nome,
        entregas: 0,
        pontuacao: motorista.pontuacao || 0
      }
    }

    for (const rota of rotas || []) {
      if (rota.motorista_id && stats[rota.motorista_id]) {
        if (rota.status === 'Entregue') {
          stats[rota.motorista_id].entregas++
        }
      }
    }

    return Object.values(stats)
      .map(v => ({
        name: v.nome,
        entregas: v.entregas,
        pontuacao: v.pontuacao
      }))
      .sort((a, b) => b.entregas - a.entregas)
      .slice(0, 10) // Top 10 motoristas
  } catch (error) {
    console.error('[getDriversPerformanceRange] Erro:', error)
    return []
  }
}

/**
 * Busca custos por categoria do mês atual
 */
export async function getCostsByCategory(): Promise<{ categoria: string; valor: number; percentual: number }[]> {
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from('manutencoes')
      .select('tipo, custo')
      .gte('data_agendada', start.toISOString())
      .lte('data_agendada', end.toISOString())

    if (error) throw error

    const buckets: Record<string, number> = {}
    let total = 0

    for (const manutencao of data || []) {
      const tipo = manutencao.tipo || 'Outros'
      const custo = Number(manutencao.custo) || 0
      buckets[tipo] = (buckets[tipo] || 0) + custo
      total += custo
    }

    return Object.entries(buckets)
      .map(([categoria, valor]) => ({
        categoria,
        valor,
        percentual: total > 0 ? Math.round((valor / total) * 100) : 0
      }))
      .sort((a, b) => b.valor - a.valor)
  } catch (error) {
    console.error('[getCostsByCategory] Erro:', error)
    return []
  }
}


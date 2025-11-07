import { supabase } from '@/lib/supabaseClient'

export type DriverPerformanceData = {
  motorista_id: string
  motorista_nome: string
  totalViagens: number
  ultimaViagem: string | null // ISO date
  pontuacao: number // 0-100
  pontualidade: number // % de entregas no prazo
  seguranca: number // % de viagens sem incidentes
  eficiencia: number // média geral
  satisfacao: number // baseado em feedback (mock por enquanto)
  viagensEntregues: number
  viagensAtrasadas: number
  viagensEmAndamento: number
}

/**
 * Busca dados de performance de um motorista específico baseado em rotas_entrega
 */
export async function fetchDriverPerformance(motoristaId: string): Promise<DriverPerformanceData | null> {
  try {
    // Buscar motorista
    const { data: motorista, error: errMotorista } = await supabase
      .from('motoristas')
      .select('nome')
      .eq('id', motoristaId)
      .single()

    if (errMotorista || !motorista) {
      console.error('Erro ao buscar motorista:', errMotorista)
      return null
    }

    // Buscar todas as rotas do motorista
    const { data: rotas, error: errRotas } = await supabase
      .from('rotas_entrega')
      .select('*')
      .eq('motorista_id', motoristaId)
      .order('data_criacao', { ascending: false })

    if (errRotas) {
      console.error('Erro ao buscar rotas do motorista:', errRotas)
      return null
    }

    const totalViagens = rotas?.length || 0
    
    // Última viagem (mais recente) - apenas se houver rotas válidas
    const ultimaViagem = rotas && rotas.length > 0 && rotas[0].data_criacao
      ? rotas[0].data_criacao 
      : null

    // Calcular estatísticas
    const viagensEntregues = rotas?.filter(r => r.status === 'Entregue').length || 0
    const viagensAtrasadas = rotas?.filter(r => r.status === 'Atrasada').length || 0
    const viagensEmAndamento = rotas?.filter(r => r.status === 'Em Rota').length || 0

    // Calcular pontualidade (entregas no prazo)
    let pontualidade = 100
    if (totalViagens > 0) {
      const entreguesNoPrazo = rotas?.filter(r => {
        if (r.status !== 'Entregue' || !r.data_entrega || !r.data_prevista_entrega) return false
        const dataEntrega = new Date(r.data_entrega)
        const dataPrevista = new Date(r.data_prevista_entrega)
        return dataEntrega <= dataPrevista
      }).length || 0
      
      pontualidade = viagensEntregues > 0 
        ? Math.round((entreguesNoPrazo / viagensEntregues) * 100) 
        : 100
    }

    // Segurança: 100% se não houver viagens atrasadas, senão calcula proporção
    const seguranca = totalViagens > 0 
      ? Math.round(((totalViagens - viagensAtrasadas) / totalViagens) * 100)
      : 100

    // Eficiência: taxa de conclusão
    const eficiencia = totalViagens > 0 
      ? Math.round((viagensEntregues / totalViagens) * 100)
      : 100

    // Satisfação: mock por enquanto (pode ser implementado com feedback de clientes)
    const satisfacao = 95

    // Pontuação geral (média ponderada)
    const pontuacao = Math.round(
      (pontualidade * 0.3) + 
      (seguranca * 0.3) + 
      (eficiencia * 0.25) + 
      (satisfacao * 0.15)
    )

    return {
      motorista_id: motoristaId,
      motorista_nome: motorista.nome,
      totalViagens,
      ultimaViagem,
      pontuacao,
      pontualidade,
      seguranca,
      eficiencia,
      satisfacao,
      viagensEntregues,
      viagensAtrasadas,
      viagensEmAndamento
    }
  } catch (error) {
    console.error('Erro ao calcular performance do motorista:', error)
    return null
  }
}

/**
 * Busca performance de todos os motoristas
 */
export async function fetchAllDriversPerformance(): Promise<Map<string, DriverPerformanceData>> {
  const performanceMap = new Map<string, DriverPerformanceData>()

  try {
    // Buscar todos os motoristas
    const { data: motoristas, error } = await supabase
      .from('motoristas')
      .select('id')

    if (error || !motoristas) {
      console.error('Erro ao buscar motoristas:', error)
      return performanceMap
    }

    // Buscar performance de cada motorista
    const promises = motoristas.map(m => fetchDriverPerformance(m.id))
    const results = await Promise.all(promises)

    results.forEach(perf => {
      if (perf) {
        performanceMap.set(perf.motorista_id, perf)
      }
    })

    return performanceMap
  } catch (error) {
    console.error('Erro ao buscar performance de todos os motoristas:', error)
    return performanceMap
  }
}

/**
 * Incrementar contador de viagens ao finalizar entrega
 * (Esta função deve ser chamada pelo serviço de rotas ao finalizar uma entrega)
 */
export async function registrarEntregaConcluida(motoristaId: string, rotaId: string): Promise<boolean> {
  try {
    // A contagem é feita dinamicamente a partir de rotas_entrega
    // Não precisa atualizar nada no motorista, apenas garantir que a rota está marcada como entregue
    console.log(`[Performance] Entrega concluída - Motorista: ${motoristaId}, Rota: ${rotaId}`)
    return true
  } catch (error) {
    console.error('Erro ao registrar entrega concluída:', error)
    return false
  }
}


import { supabase } from '../supabaseClient'

export type AuditoriaLog = {
  id: string
  timestamp: string
  usuario: string
  acao: string
  modulo: string
  descricao: string
  ip: string
  status: 'sucesso' | 'falha'
  detalhes?: any
  created_at: string
}

export type AuditoriaTask = {
  id: string
  titulo: string
  tipo: 'financeiro' | 'operacional' | 'seguranca' | 'compliance'
  modulos: string[]
  periodo_inicio: string
  periodo_fim: string
  descricao?: string
  automatica: boolean
  notificar_email: boolean
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
  created_at: string
  updated_at: string
}

/**
 * Buscar logs de auditoria com filtros
 */
export async function fetchAuditoriaLogs(filtros?: {
  usuario?: string
  modulo?: string
  acao?: string
  status?: string
  dataInicio?: string
  dataFim?: string
}): Promise<AuditoriaLog[]> {
  try {
    let query = supabase
      .from('auditoria_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (filtros?.usuario) {
      query = query.ilike('usuario', `%${filtros.usuario}%`)
    }

    if (filtros?.modulo) {
      query = query.eq('modulo', filtros.modulo)
    }

    if (filtros?.acao) {
      query = query.eq('acao', filtros.acao)
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status)
    }

    if (filtros?.dataInicio) {
      query = query.gte('timestamp', filtros.dataInicio)
    }

    if (filtros?.dataFim) {
      query = query.lte('timestamp', filtros.dataFim)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar logs de auditoria:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('[fetchAuditoriaLogs] Erro:', error)
    return []
  }
}

/**
 * Criar novo log de auditoria
 */
export async function createAuditoriaLog(log: Omit<AuditoriaLog, 'id' | 'created_at'>): Promise<AuditoriaLog | null> {
  try {
    const { data, error } = await supabase
      .from('auditoria_logs')
      .insert({
        ...log,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar log de auditoria:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('[createAuditoriaLog] Erro:', error)
    return null
  }
}

/**
 * Buscar tarefas de auditoria
 */
export async function fetchAuditoriaTasks(): Promise<AuditoriaTask[]> {
  try {
    const { data, error } = await supabase
      .from('auditoria_tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar tarefas de auditoria:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('[fetchAuditoriaTasks] Erro:', error)
    return []
  }
}

/**
 * Criar nova tarefa de auditoria
 */
export async function createAuditoriaTask(task: Omit<AuditoriaTask, 'id' | 'created_at' | 'updated_at'>): Promise<AuditoriaTask | null> {
  try {
    const { data, error } = await supabase
      .from('auditoria_tasks')
      .insert({
        ...task,
        status: 'agendada',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar tarefa de auditoria:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('[createAuditoriaTask] Erro:', error)
    return null
  }
}

/**
 * Atualizar tarefa de auditoria
 */
export async function updateAuditoriaTask(id: string, updates: Partial<Omit<AuditoriaTask, 'id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('auditoria_tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar tarefa de auditoria:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('[updateAuditoriaTask] Erro:', error)
    return false
  }
}

/**
 * Calcular estatísticas de auditoria
 */
export async function calcularEstatisticasAuditoria(): Promise<{
  totalLogs: number
  logsHoje: number
  logsSucesso: number
  logsFalha: number
  porModulo: { modulo: string; count: number }[]
  porAcao: { acao: string; count: number }[]
}> {
  try {
    // Total de logs
    const { count: totalLogs } = await supabase
      .from('auditoria_logs')
      .select('*', { count: 'exact', head: true })

    // Logs de hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const { count: logsHoje } = await supabase
      .from('auditoria_logs')
      .select('*', { count: 'exact', head: true })
      .gte('timestamp', hoje.toISOString())

    // Logs por status
    const { count: logsSucesso } = await supabase
      .from('auditoria_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sucesso')

    const { count: logsFalha } = await supabase
      .from('auditoria_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'falha')

    // Por módulo (top 5)
    const { data: logsModulo } = await supabase
      .from('auditoria_logs')
      .select('modulo')
      .limit(1000)

    const modulosCount: Record<string, number> = {}
    logsModulo?.forEach(log => {
      modulosCount[log.modulo] = (modulosCount[log.modulo] || 0) + 1
    })

    const porModulo = Object.entries(modulosCount)
      .map(([modulo, count]) => ({ modulo, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Por ação (top 5)
    const { data: logsAcao } = await supabase
      .from('auditoria_logs')
      .select('acao')
      .limit(1000)

    const acoesCount: Record<string, number> = {}
    logsAcao?.forEach(log => {
      acoesCount[log.acao] = (acoesCount[log.acao] || 0) + 1
    })

    const porAcao = Object.entries(acoesCount)
      .map(([acao, count]) => ({ acao, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalLogs: totalLogs || 0,
      logsHoje: logsHoje || 0,
      logsSucesso: logsSucesso || 0,
      logsFalha: logsFalha || 0,
      porModulo,
      porAcao
    }
  } catch (error) {
    console.error('[calcularEstatisticasAuditoria] Erro:', error)
    return {
      totalLogs: 0,
      logsHoje: 0,
      logsSucesso: 0,
      logsFalha: 0,
      porModulo: [],
      porAcao: []
    }
  }
}

/**
 * Subscribe para mudanças em tempo real
 */
export function subscribeAuditoriaLogs(onChange: () => void) {
  const channel = supabase
    .channel('auditoria-logs-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'auditoria_logs' 
    }, () => onChange())
    .subscribe()

  return () => supabase.removeChannel(channel)
}

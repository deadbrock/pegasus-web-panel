import { supabase } from '../supabase'

export type AuditoriaFinding = {
  id?: string
  area: string
  categoria: 'Conformidade' | 'Financeiro' | 'Operacional' | 'Segurança' | 'Qualidade' | 'Outros'
  titulo: string
  descricao: string
  severidade: 'Baixa' | 'Média' | 'Alta' | 'Crítica'
  status: 'Aberto' | 'Em Análise' | 'Em Correção' | 'Resolvido' | 'Fechado' | 'Cancelado'
  data_identificacao: string
  data_limite?: string
  data_resolucao?: string
  responsavel?: string
  auditor?: string
  recomendacao?: string
  acao_corretiva?: string
  evidencias_url?: string
  impacto_financeiro?: number
  prioridade?: number
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type AuditoriaStats = {
  total: number
  abertos: number
  em_analise: number
  em_correcao: number
  resolvidos: number
  fechados: number
  por_severidade: Record<string, number>
  por_categoria: Record<string, number>
  taxa_resolucao: number
  tempo_medio_resolucao: number // em dias
  impacto_financeiro_total: number
}

/**
 * Busca todos os achados de auditoria
 */
export async function fetchAuditoriaFindings(): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .order('data_identificacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar achados de auditoria:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um achado de auditoria por ID
 */
export async function fetchAuditoriaFindingById(id: string): Promise<AuditoriaFinding | null> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar achado de auditoria:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo achado de auditoria
 */
export async function createAuditoriaFinding(finding: Omit<AuditoriaFinding, 'id' | 'created_at' | 'updated_at'>): Promise<AuditoriaFinding | null> {
  const { data, error } = await supabase
    .from('audit_findings')
    .insert(finding)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar achado de auditoria:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um achado de auditoria existente
 */
export async function updateAuditoriaFinding(id: string, updates: Partial<AuditoriaFinding>): Promise<AuditoriaFinding | null> {
  const { data, error } = await supabase
    .from('audit_findings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar achado de auditoria:', error)
    throw error
  }
  return data
}

/**
 * Deleta um achado de auditoria
 */
export async function deleteAuditoriaFinding(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('audit_findings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar achado de auditoria:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de auditoria
 */
export async function fetchAuditoriaStats(): Promise<AuditoriaStats> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const abertos = data?.filter(f => f.status === 'Aberto').length || 0
  const em_analise = data?.filter(f => f.status === 'Em Análise').length || 0
  const em_correcao = data?.filter(f => f.status === 'Em Correção').length || 0
  const resolvidos = data?.filter(f => f.status === 'Resolvido').length || 0
  const fechados = data?.filter(f => f.status === 'Fechado').length || 0

  // Agrupar por severidade
  const por_severidade: Record<string, number> = {}
  data?.forEach(f => {
    por_severidade[f.severidade] = (por_severidade[f.severidade] || 0) + 1
  })

  // Agrupar por categoria
  const por_categoria: Record<string, number> = {}
  data?.forEach(f => {
    por_categoria[f.categoria] = (por_categoria[f.categoria] || 0) + 1
  })

  // Taxa de resolução
  const taxa_resolucao = total > 0 ? ((resolvidos + fechados) / total) * 100 : 0

  // Tempo médio de resolução
  const findingsResolvidos = data?.filter(f => f.data_resolucao && f.data_identificacao) || []
  const tempo_medio_resolucao = findingsResolvidos.length > 0
    ? findingsResolvidos.reduce((sum, f) => {
        const dataId = new Date(f.data_identificacao)
        const dataRes = new Date(f.data_resolucao!)
        const diffDias = Math.floor((dataRes.getTime() - dataId.getTime()) / (1000 * 60 * 60 * 24))
        return sum + diffDias
      }, 0) / findingsResolvidos.length
    : 0

  // Impacto financeiro total
  const impacto_financeiro_total = data?.reduce((sum, f) => sum + (f.impacto_financeiro || 0), 0) || 0

  return {
    total,
    abertos,
    em_analise,
    em_correcao,
    resolvidos,
    fechados,
    por_severidade,
    por_categoria,
    taxa_resolucao,
    tempo_medio_resolucao,
    impacto_financeiro_total
  }
}

/**
 * Busca achados por severidade
 */
export async function fetchAuditoriaFindingsBySeveridade(severidade: AuditoriaFinding['severidade']): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('severidade', severidade)
    .order('data_identificacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar achados por severidade:', error)
    throw error
  }
  return data || []
}

/**
 * Busca achados por status
 */
export async function fetchAuditoriaFindingsByStatus(status: AuditoriaFinding['status']): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('status', status)
    .order('data_identificacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar achados por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca achados por categoria
 */
export async function fetchAuditoriaFindingsByCategoria(categoria: AuditoriaFinding['categoria']): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('categoria', categoria)
    .order('data_identificacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar achados por categoria:', error)
    throw error
  }
  return data || []
}

/**
 * Busca achados por área
 */
export async function fetchAuditoriaFindingsByArea(area: string): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('area', area)
    .order('data_identificacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar achados por área:', error)
    throw error
  }
  return data || []
}

/**
 * Busca achados críticos em aberto
 */
export async function fetchAuditoriaFindingsCriticos(): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('severidade', 'Crítica')
    .in('status', ['Aberto', 'Em Análise', 'Em Correção'])
    .order('data_identificacao', { ascending: true })

  if (error) {
    console.error('Erro ao buscar achados críticos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca achados com prazo vencido
 */
export async function fetchAuditoriaFindingsVencidos(): Promise<AuditoriaFinding[]> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .in('status', ['Aberto', 'Em Análise', 'Em Correção'])
    .lt('data_limite', hoje)
    .order('data_limite', { ascending: true })

  if (error) {
    console.error('Erro ao buscar achados vencidos:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza status de um achado
 */
export async function updateAuditoriaFindingStatus(id: string, status: AuditoriaFinding['status'], dataResolucao?: string): Promise<AuditoriaFinding | null> {
  const updates: Partial<AuditoriaFinding> = { status }
  
  if ((status === 'Resolvido' || status === 'Fechado') && dataResolucao) {
    updates.data_resolucao = dataResolucao
  }

  return updateAuditoriaFinding(id, updates)
}

/**
 * Busca achados por responsável
 */
export async function fetchAuditoriaFindingsByResponsavel(responsavel: string): Promise<AuditoriaFinding[]> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('responsavel', responsavel)
    .order('data_identificacao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar achados por responsável:', error)
    throw error
  }
  return data || []
}

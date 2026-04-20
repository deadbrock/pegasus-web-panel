import { supabase } from '../supabase'

export type Custo = {
  id?: string
  descricao: string
  categoria: 'Combustível' | 'Manutenção' | 'Pedágio' | 'Seguro' | 'Licenciamento' | 'Salário' | 'Outros'
  valor: number
  data: string
  veiculo_id?: string
  motorista_id?: string
  fornecedor?: string
  forma_pagamento?: 'Dinheiro' | 'Cartão' | 'Boleto' | 'PIX' | 'Transferência'
  status_pagamento?: 'Pago' | 'Pendente' | 'Vencido' | 'Cancelado'
  data_vencimento?: string
  data_pagamento?: string
  numero_documento?: string
  observacoes?: string
  anexo_url?: string
  created_at?: string
  updated_at?: string
}

export type CustoStats = {
  total_mes: number
  total_ano: number
  por_categoria: Record<string, number>
  media_mensal: number
  maior_custo: number
  custo_por_km?: number
  pendentes: number
  vencidos: number
}

/**
 * Busca todos os custos
 */
export async function fetchCustos(): Promise<Custo[]> {
  const { data, error } = await supabase
    .from('custos')
    .select('*')
    .order('data', { ascending: false })

  if (error) {
    console.error('Erro ao buscar custos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um custo por ID
 */
export async function fetchCustoById(id: string): Promise<Custo | null> {
  const { data, error } = await supabase
    .from('custos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar custo:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo custo
 */
export async function createCusto(custo: Omit<Custo, 'id' | 'created_at' | 'updated_at'>): Promise<Custo | null> {
  const { data, error } = await supabase
    .from('custos')
    .insert(custo)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar custo:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um custo existente
 */
export async function updateCusto(id: string, updates: Partial<Custo>): Promise<Custo | null> {
  const { data, error } = await supabase
    .from('custos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar custo:', error)
    throw error
  }
  return data
}

/**
 * Deleta um custo
 */
export async function deleteCusto(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('custos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar custo:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de custos — agrega a tabela `custos` + `lancamentos_centro_custo`
 */
export async function fetchCustosStats(ano?: number, mes?: number): Promise<CustoStats> {
  const hoje = new Date()
  const mesAtual = mes || hoje.getMonth() + 1
  const anoAtual = ano || hoje.getFullYear()
  const anoStr = anoAtual.toString()

  // Buscar custos tradicionais e lançamentos de centros em paralelo
  const [custosRes, lancamentosRes] = await Promise.all([
    supabase
      .from('custos')
      .select('data, valor, categoria, status_pagamento')
      .gte('data', `${anoStr}-01-01`)
      .lte('data', `${anoStr}-12-31`),
    supabase
      .from('lancamentos_centro_custo')
      .select('data, valor, categoria, status_pagamento')
      .gte('data', `${anoStr}-01-01`)
      .lte('data', `${anoStr}-12-31`)
      // Se tabela não existir ainda, ignora silenciosamente
      .throwOnError()
      .catch(() => ({ data: [] as any[], error: null }))
  ])

  const custosData = custosRes.data || []
  // lancamentosRes pode ser resultado do catch (objeto direto) ou resultado normal
  const lancamentosData = (lancamentosRes as any)?.data ?? []

  // Unificar todos os registros
  const todos = [
    ...custosData.map((c: any) => ({ ...c, origem: 'custos' })),
    ...lancamentosData.map((l: any) => ({ ...l, origem: 'lancamentos' })),
  ]

  // Filtrar pelo mês atual
  const doMes = todos.filter(c => {
    const d = new Date(c.data + 'T12:00:00')
    return d.getMonth() + 1 === mesAtual && d.getFullYear() === anoAtual
  })

  const total_mes = doMes.reduce((sum, c) => sum + Number(c.valor), 0)
  const total_ano = todos.reduce((sum, c) => sum + Number(c.valor), 0)

  const por_categoria: Record<string, number> = {}
  todos.forEach(c => {
    const cat = c.categoria || 'Outros'
    por_categoria[cat] = (por_categoria[cat] || 0) + Number(c.valor)
  })

  const media_mensal = total_ano / 12
  const maior_custo = todos.length ? Math.max(...todos.map(c => Number(c.valor))) : 0

  const pendentes = todos.filter(c => c.status_pagamento === 'Pendente').length
  const vencidos = todos.filter(c => c.status_pagamento === 'Vencido').length

  return { total_mes, total_ano, por_categoria, media_mensal, maior_custo, pendentes, vencidos }
}

/**
 * Busca custos por categoria
 */
export async function fetchCustosByCategoria(categoria: Custo['categoria']): Promise<Custo[]> {
  const { data, error } = await supabase
    .from('custos')
    .select('*')
    .eq('categoria', categoria)
    .order('data', { ascending: false })

  if (error) {
    console.error('Erro ao buscar custos por categoria:', error)
    throw error
  }
  return data || []
}

/**
 * Busca custos por período
 */
export async function fetchCustosByPeriodo(dataInicio: string, dataFim: string): Promise<Custo[]> {
  const { data, error } = await supabase
    .from('custos')
    .select('*')
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false })

  if (error) {
    console.error('Erro ao buscar custos por período:', error)
    throw error
  }
  return data || []
}

/**
 * Busca custos pendentes
 */
export async function fetchCustosPendentes(): Promise<Custo[]> {
  const { data, error } = await supabase
    .from('custos')
    .select('*')
    .eq('status_pagamento', 'Pendente')
    .order('data_vencimento', { ascending: true })

  if (error) {
    console.error('Erro ao buscar custos pendentes:', error)
    throw error
  }
  return data || []
}

/**
 * Busca custos vencidos
 */
export async function fetchCustosVencidos(): Promise<Custo[]> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('custos')
    .select('*')
    .eq('status_pagamento', 'Pendente')
    .lt('data_vencimento', hoje)
    .order('data_vencimento', { ascending: true })

  if (error) {
    console.error('Erro ao buscar custos vencidos:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza status de pagamento de um custo
 */
export async function updateCustoStatusPagamento(id: string, status: Custo['status_pagamento'], dataPagamento?: string): Promise<Custo | null> {
  const updates: Partial<Custo> = { status_pagamento: status }
  if (dataPagamento) {
    updates.data_pagamento = dataPagamento
  }
  return updateCusto(id, updates)
}

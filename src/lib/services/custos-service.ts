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
 * Busca estatísticas de custos
 */
export async function fetchCustosStats(ano?: number, mes?: number): Promise<CustoStats> {
  let query = supabase.from('custos').select('*')

  if (ano) {
    const anoStr = ano.toString()
    query = query.gte('data', `${anoStr}-01-01`).lte('data', `${anoStr}-12-31`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const hoje = new Date()
  const mesAtual = mes || hoje.getMonth() + 1
  const anoAtual = ano || hoje.getFullYear()

  // Filtrar custos do mês atual
  const custosMes = data?.filter(c => {
    const dataCusto = new Date(c.data)
    return dataCusto.getMonth() + 1 === mesAtual && dataCusto.getFullYear() === anoAtual
  }) || []

  const total_mes = custosMes.reduce((sum, c) => sum + c.valor, 0)
  const total_ano = data?.reduce((sum, c) => sum + c.valor, 0) || 0

  // Agrupar por categoria
  const por_categoria: Record<string, number> = {}
  data?.forEach(c => {
    por_categoria[c.categoria] = (por_categoria[c.categoria] || 0) + c.valor
  })

  // Calcular média mensal (considerando todos os meses do ano)
  const media_mensal = total_ano / 12

  // Maior custo individual
  const maior_custo = data?.length ? Math.max(...data.map(c => c.valor)) : 0

  // Custos pendentes e vencidos
  const pendentes = data?.filter(c => c.status_pagamento === 'Pendente').length || 0
  const vencidos = data?.filter(c => c.status_pagamento === 'Vencido').length || 0

  return {
    total_mes,
    total_ano,
    por_categoria,
    media_mensal,
    maior_custo,
    pendentes,
    vencidos
  }
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

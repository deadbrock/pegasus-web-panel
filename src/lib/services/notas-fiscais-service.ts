import { supabase } from '../supabase'

export type NotaFiscal = {
  id?: string
  numero_nota: string
  serie?: string
  tipo: 'Entrada' | 'Saída' | 'Serviço'
  modelo?: string
  chave_acesso?: string
  fornecedor_id?: string
  cliente?: string
  data_emissao: string
  data_entrada?: string
  valor_total: number
  valor_produtos?: number
  valor_servicos?: number
  valor_icms?: number
  valor_ipi?: number
  valor_pis?: number
  valor_cofins?: number
  valor_desconto?: number
  valor_frete?: number
  status: 'Autorizada' | 'Cancelada' | 'Denegada' | 'Pendente' | 'Rejeitada'
  finalidade?: 'Normal' | 'Complementar' | 'Ajuste' | 'Devolução'
  natureza_operacao?: string
  cfop?: string
  descricao?: string
  xml_url?: string
  pdf_url?: string
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type NotaFiscalStats = {
  total: number
  autorizadas: number
  canceladas: number
  pendentes: number
  valor_total_entrada: number
  valor_total_saida: number
  valor_total_impostos: number
  media_valor: number
  por_tipo: Record<string, number>
  por_mes: Record<string, number>
}

/**
 * Busca todas as notas fiscais
 */
export async function fetchNotasFiscais(): Promise<NotaFiscal[]> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .order('data_emissao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    throw error
  }
  return data || []
}

/**
 * Busca uma nota fiscal por ID
 */
export async function fetchNotaFiscalById(id: string): Promise<NotaFiscal | null> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar nota fiscal:', error)
    throw error
  }
  return data
}

/**
 * Cria uma nova nota fiscal
 */
export async function createNotaFiscal(nota: Omit<NotaFiscal, 'id' | 'created_at' | 'updated_at'>): Promise<NotaFiscal | null> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .insert(nota)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar nota fiscal:', error)
    throw error
  }
  return data
}

/**
 * Atualiza uma nota fiscal existente
 */
export async function updateNotaFiscal(id: string, updates: Partial<NotaFiscal>): Promise<NotaFiscal | null> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar nota fiscal:', error)
    throw error
  }
  return data
}

/**
 * Deleta uma nota fiscal
 */
export async function deleteNotaFiscal(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notas_fiscais')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar nota fiscal:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de notas fiscais
 */
export async function fetchNotasFiscaisStats(ano?: number, mes?: number): Promise<NotaFiscalStats> {
  let query = supabase.from('notas_fiscais').select('*')

  if (ano) {
    const anoStr = ano.toString()
    query = query.gte('data_emissao', `${anoStr}-01-01`).lte('data_emissao', `${anoStr}-12-31`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const total = data?.length || 0
  const autorizadas = data?.filter(n => n.status === 'Autorizada').length || 0
  const canceladas = data?.filter(n => n.status === 'Cancelada').length || 0
  const pendentes = data?.filter(n => n.status === 'Pendente').length || 0

  const valor_total_entrada = data?.filter(n => n.tipo === 'Entrada').reduce((sum, n) => sum + n.valor_total, 0) || 0
  const valor_total_saida = data?.filter(n => n.tipo === 'Saída').reduce((sum, n) => sum + n.valor_total, 0) || 0

  const valor_total_impostos = data?.reduce((sum, n) => {
    return sum + (n.valor_icms || 0) + (n.valor_ipi || 0) + (n.valor_pis || 0) + (n.valor_cofins || 0)
  }, 0) || 0

  const media_valor = total > 0 ? data.reduce((sum, n) => sum + n.valor_total, 0) / total : 0

  // Agrupar por tipo
  const por_tipo: Record<string, number> = {}
  data?.forEach(n => {
    por_tipo[n.tipo] = (por_tipo[n.tipo] || 0) + 1
  })

  // Agrupar por mês (últimos 12 meses)
  const por_mes: Record<string, number> = {}
  data?.forEach(n => {
    const mesAno = n.data_emissao.substring(0, 7) // YYYY-MM
    por_mes[mesAno] = (por_mes[mesAno] || 0) + 1
  })

  return {
    total,
    autorizadas,
    canceladas,
    pendentes,
    valor_total_entrada,
    valor_total_saida,
    valor_total_impostos,
    media_valor,
    por_tipo,
    por_mes
  }
}

/**
 * Busca notas fiscais por tipo
 */
export async function fetchNotasFiscaisByTipo(tipo: NotaFiscal['tipo']): Promise<NotaFiscal[]> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('tipo', tipo)
    .order('data_emissao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas fiscais por tipo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca notas fiscais por status
 */
export async function fetchNotasFiscaisByStatus(status: NotaFiscal['status']): Promise<NotaFiscal[]> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('status', status)
    .order('data_emissao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas fiscais por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca notas fiscais por período
 */
export async function fetchNotasFiscaisByPeriodo(dataInicio: string, dataFim: string): Promise<NotaFiscal[]> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .gte('data_emissao', dataInicio)
    .lte('data_emissao', dataFim)
    .order('data_emissao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas fiscais por período:', error)
    throw error
  }
  return data || []
}

/**
 * Busca nota fiscal por número
 */
export async function fetchNotaFiscalByNumero(numero: string, serie?: string): Promise<NotaFiscal | null> {
  let query = supabase
    .from('notas_fiscais')
    .select('*')
    .eq('numero_nota', numero)

  if (serie) {
    query = query.eq('serie', serie)
  }

  const { data, error } = await query.single()

  if (error) {
    if (error.code === 'PGRST116') return null // Não encontrado
    console.error('Erro ao buscar nota fiscal por número:', error)
    throw error
  }
  return data
}

/**
 * Busca nota fiscal por chave de acesso
 */
export async function fetchNotaFiscalByChaveAcesso(chaveAcesso: string): Promise<NotaFiscal | null> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('chave_acesso', chaveAcesso)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Não encontrado
    console.error('Erro ao buscar nota fiscal por chave de acesso:', error)
    throw error
  }
  return data
}

/**
 * Busca notas fiscais por fornecedor
 */
export async function fetchNotasFiscaisByFornecedor(fornecedorId: string): Promise<NotaFiscal[]> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('fornecedor_id', fornecedorId)
    .order('data_emissao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas fiscais por fornecedor:', error)
    throw error
  }
  return data || []
}

/**
 * Cancela uma nota fiscal
 */
export async function cancelarNotaFiscal(id: string, motivo?: string): Promise<NotaFiscal | null> {
  const updates: Partial<NotaFiscal> = {
    status: 'Cancelada'
  }
  
  if (motivo) {
    updates.observacoes = `Cancelada: ${motivo}\n${updates.observacoes || ''}`
  }

  return updateNotaFiscal(id, updates)
}

/**
 * Calcula total de impostos de uma nota
 */
export function calcularImpostos(nota: NotaFiscal): number {
  return (nota.valor_icms || 0) + (nota.valor_ipi || 0) + (nota.valor_pis || 0) + (nota.valor_cofins || 0)
}

/**
 * Calcula valor líquido de uma nota
 */
export function calcularValorLiquido(nota: NotaFiscal): number {
  return nota.valor_total - (nota.valor_desconto || 0)
}

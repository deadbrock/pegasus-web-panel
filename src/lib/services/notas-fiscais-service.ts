import { supabase } from '../supabase'

export type NotaFiscal = {
  id: string
  numero: string
  serie: string
  chave_acesso: string
  cnpj: string
  razao_social: string
  fornecedor_id?: string
  data_emissao: string
  data_entrada?: string
  valor_total: number
  base_icms?: number
  valor_icms?: number
  valor_ipi?: number
  valor_pis?: number
  valor_cofins?: number
  tipo_operacao: 'Entrada' | 'Saída'
  cliente_id?: string
  pedido_id?: string
  observacoes?: string
  status: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
  xml_path?: string
  created_at: string
  updated_at: string
}

export type CreateNotaFiscalInput = Omit<NotaFiscal, 'id' | 'created_at' | 'updated_at'>

export async function fetchNotasFiscais(): Promise<NotaFiscal[]> {
  try {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .order('data_emissao', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    return []
  }
}

export async function fetchNotaFiscalById(id: string): Promise<NotaFiscal | null> {
  try {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar nota fiscal:', error)
    return null
  }
}

export async function createNotaFiscal(input: Partial<CreateNotaFiscalInput>): Promise<NotaFiscal | null> {
  try {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar nota fiscal:', error)
    return null
  }
}

export async function updateNotaFiscal(id: string, updates: Partial<NotaFiscal>): Promise<NotaFiscal | null> {
  try {
    const { data, error } = await supabase
      .from('notas_fiscais')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar nota fiscal:', error)
    return null
  }
}

export async function deleteNotaFiscal(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notas_fiscais')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar nota fiscal:', error)
    return false
  }
}

export async function fetchNotasFiscaisStats() {
  try {
    const notas = await fetchNotasFiscais()
    
    const total = notas.length
    const pendentes = notas.filter(n => n.status === 'Pendente').length
    const processadas = notas.filter(n => n.status === 'Processada').length
    const canceladas = notas.filter(n => n.status === 'Cancelada').length
    const ativas = notas.filter(n => n.status === 'Ativa').length
    
    const valor_total = notas.reduce((acc, n) => acc + Number(n.valor_total), 0)
    const valor_icms = notas.reduce((acc, n) => acc + Number(n.valor_icms || 0), 0)
    const valor_ipi = notas.reduce((acc, n) => acc + Number(n.valor_ipi || 0), 0)
    
    const entradas = notas.filter(n => n.tipo_operacao === 'Entrada').length
    const saidas = notas.filter(n => n.tipo_operacao === 'Saída').length
    
    const valor_entradas = notas
      .filter(n => n.tipo_operacao === 'Entrada')
      .reduce((acc, n) => acc + Number(n.valor_total), 0)
    const valor_saidas = notas
      .filter(n => n.tipo_operacao === 'Saída')
      .reduce((acc, n) => acc + Number(n.valor_total), 0)

    return {
      total,
      pendentes,
      processadas,
      canceladas,
      ativas,
      valor_total,
      valor_icms,
      valor_ipi,
      entradas,
      saidas,
      valor_entradas,
      valor_saidas
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      pendentes: 0,
      processadas: 0,
      canceladas: 0,
      ativas: 0,
      valor_total: 0,
      valor_icms: 0,
      valor_ipi: 0,
      entradas: 0,
      saidas: 0,
      valor_entradas: 0,
      valor_saidas: 0
    }
  }
}


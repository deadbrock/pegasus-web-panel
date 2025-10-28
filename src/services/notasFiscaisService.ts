import { supabase } from '@/lib/supabaseClient'
import { parseNFeXML, isValidNFeXML, type NFeData } from './nfeXmlParser'

export type NotaFiscalRecord = {
  id?: string
  numero: string
  serie: string
  chave_acesso: string
  cnpj: string
  razao_social: string
  fornecedor_id?: string | null
  data_emissao: string
  data_entrada?: string | null
  valor_total: number
  base_icms?: number | null
  valor_icms?: number | null
  valor_ipi?: number | null
  valor_pis?: number | null
  valor_cofins?: number | null
  tipo_operacao: 'entrada' | 'saida'
  cliente_id?: string | null
  pedido_id?: string | null
  observacoes?: string | null
  status: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
  xml_path?: string | null
  created_at?: string
  updated_at?: string
}

export type NotaFiscalStats = {
  total: number
  total_faturado: number
  impostos_totais: number
  processadas: number
  pendentes: number
  canceladas: number
  porTipo: {
    entrada: number
    saida: number
  }
  porStatus: {
    Pendente: number
    Processada: number
    Cancelada: number
    Rejeitada: number
    Ativa: number
  }
}

/**
 * Busca todas as notas fiscais
 */
export async function fetchNotasFiscais(): Promise<NotaFiscalRecord[]> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .order('data_emissao', { ascending: false })

  if (error) {
    console.error('Erro ao buscar notas fiscais:', error)
    return []
  }

  return (data || []) as NotaFiscalRecord[]
}

/**
 * Busca uma nota fiscal por ID
 */
export async function fetchNotaFiscalById(id: string): Promise<NotaFiscalRecord | null> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar nota fiscal:', error)
    return null
  }

  return data as NotaFiscalRecord
}

/**
 * Cria uma nova nota fiscal
 */
export async function createNotaFiscal(nota: Partial<NotaFiscalRecord>): Promise<NotaFiscalRecord | null> {
  const { data, error } = await supabase
    .from('notas_fiscais')
    .insert({
      numero: nota.numero!,
      serie: nota.serie!,
      chave_acesso: nota.chave_acesso!,
      cnpj: nota.cnpj!,
      razao_social: nota.razao_social!,
      fornecedor_id: nota.fornecedor_id,
      data_emissao: nota.data_emissao!,
      data_entrada: nota.data_entrada,
      valor_total: nota.valor_total!,
      base_icms: nota.base_icms,
      valor_icms: nota.valor_icms,
      valor_ipi: nota.valor_ipi,
      valor_pis: nota.valor_pis,
      valor_cofins: nota.valor_cofins,
      tipo_operacao: nota.tipo_operacao!,
      cliente_id: nota.cliente_id,
      pedido_id: nota.pedido_id,
      observacoes: nota.observacoes,
      status: nota.status || 'Pendente',
      xml_path: nota.xml_path
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar nota fiscal:', error)
    return null
  }

  return data as NotaFiscalRecord
}

/**
 * Atualiza uma nota fiscal
 */
export async function updateNotaFiscal(id: string, nota: Partial<NotaFiscalRecord>): Promise<boolean> {
  const { error } = await supabase
    .from('notas_fiscais')
    .update({
      numero: nota.numero,
      serie: nota.serie,
      cnpj: nota.cnpj,
      razao_social: nota.razao_social,
      fornecedor_id: nota.fornecedor_id,
      data_emissao: nota.data_emissao,
      data_entrada: nota.data_entrada,
      valor_total: nota.valor_total,
      base_icms: nota.base_icms,
      valor_icms: nota.valor_icms,
      valor_ipi: nota.valor_ipi,
      valor_pis: nota.valor_pis,
      valor_cofins: nota.valor_cofins,
      tipo_operacao: nota.tipo_operacao,
      observacoes: nota.observacoes,
      status: nota.status
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar nota fiscal:', error)
    return false
  }

  return true
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
    return false
  }

  return true
}

/**
 * Importa nota fiscal de XML
 */
export async function importarNotaFiscalXML(xmlContent: string, tipoOperacaoOverride?: 'entrada' | 'saida'): Promise<{ success: boolean; nota?: NotaFiscalRecord; error?: string }> {
  try {
    // Validar XML
    if (!isValidNFeXML(xmlContent)) {
      return { success: false, error: 'XML de NFe inválido' }
    }

    // Parse XML
    const nfeData: NFeData = parseNFeXML(xmlContent)

    // Verificar se já existe nota com mesma chave de acesso (usando maybeSingle para evitar erro 406)
    const { data: existing, error: checkError } = await supabase
      .from('notas_fiscais')
      .select('id')
      .eq('chave_acesso', nfeData.chave_acesso)
      .maybeSingle()

    if (checkError) {
      console.error('Erro ao verificar nota existente:', checkError)
      return { success: false, error: 'Erro ao verificar duplicidade de nota fiscal' }
    }

    if (existing) {
      return { success: false, error: 'Nota fiscal já importada anteriormente' }
    }

    // Criar nota fiscal (usar tipo manual se fornecido, senão usar do XML)
    const notaFiscal: Partial<NotaFiscalRecord> = {
      numero: nfeData.numero,
      serie: nfeData.serie,
      chave_acesso: nfeData.chave_acesso,
      cnpj: nfeData.emit_cnpj,
      razao_social: nfeData.emit_razao_social,
      data_emissao: nfeData.data_emissao,
      data_entrada: new Date().toISOString(),
      valor_total: nfeData.valor_total,
      base_icms: nfeData.base_icms,
      valor_icms: nfeData.valor_icms,
      valor_ipi: nfeData.valor_ipi,
      valor_pis: nfeData.valor_pis,
      valor_cofins: nfeData.valor_cofins,
      tipo_operacao: tipoOperacaoOverride || nfeData.tipo_operacao, // Prioriza tipo manual
      observacoes: nfeData.info_complementar,
      status: 'Pendente'
    }

    const created = await createNotaFiscal(notaFiscal)

    if (!created) {
      return { success: false, error: 'Erro ao salvar nota fiscal no banco de dados' }
    }

    // Criar itens da nota fiscal
    if (nfeData.itens && nfeData.itens.length > 0 && created.id) {
      await createItensNotaFiscal(created.id, nfeData.itens)
    }

    return { success: true, nota: created }
  } catch (error: any) {
    console.error('Erro ao importar XML:', error)
    return { success: false, error: error.message || 'Erro ao processar XML' }
  }
}

/**
 * Cria itens de nota fiscal
 */
async function createItensNotaFiscal(notaFiscalId: string, itens: NFeData['itens']): Promise<boolean> {
  try {
    const itensInsert = itens.map(item => ({
      nota_fiscal_id: notaFiscalId,
      produto_codigo: item.codigo_produto,
      produto_descricao: item.descricao, // Nome/descrição do produto do XML
      quantidade: item.quantidade,
      valor_unitario: item.valor_unitario,
      valor_total: item.valor_total,
      cfop: item.cfop,
      ncm: item.ncm,
      cst_icms: item.cst_icms,
      cst_ipi: item.cst_ipi,
      cst_pis: item.cst_pis,
      cst_cofins: item.cst_cofins,
      processado: false
    }))

    const { error } = await supabase
      .from('itens_nota_fiscal')
      .insert(itensInsert)

    if (error) {
      console.error('Erro ao criar itens da nota fiscal:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao criar itens:', error)
    return false
  }
}

/**
 * Calcula estatísticas das notas fiscais
 */
export function calcularEstatisticasNotas(notas: NotaFiscalRecord[]): NotaFiscalStats {
  const total = notas.length
  
  const total_faturado = notas.reduce((sum, nota) => sum + (nota.valor_total || 0), 0)
  
  const impostos_totais = notas.reduce((sum, nota) => {
    const icms = nota.valor_icms || 0
    const ipi = nota.valor_ipi || 0
    const pis = nota.valor_pis || 0
    const cofins = nota.valor_cofins || 0
    return sum + icms + ipi + pis + cofins
  }, 0)
  
  const processadas = notas.filter(n => n.status === 'Processada').length
  const pendentes = notas.filter(n => n.status === 'Pendente').length
  const canceladas = notas.filter(n => n.status === 'Cancelada').length
  
  const porTipo = {
    entrada: notas.filter(n => n.tipo_operacao === 'entrada').length,
    saida: notas.filter(n => n.tipo_operacao === 'saida').length
  }
  
  const porStatus = {
    Pendente: notas.filter(n => n.status === 'Pendente').length,
    Processada: notas.filter(n => n.status === 'Processada').length,
    Cancelada: notas.filter(n => n.status === 'Cancelada').length,
    Rejeitada: notas.filter(n => n.status === 'Rejeitada').length,
    Ativa: notas.filter(n => n.status === 'Ativa').length
  }
  
  return {
    total,
    total_faturado,
    impostos_totais,
    processadas,
    pendentes,
    canceladas,
    porTipo,
    porStatus
  }
}

/**
 * Processa uma nota fiscal (muda status para Processada)
 */
export async function processarNotaFiscal(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('notas_fiscais')
    .update({ status: 'Processada', data_entrada: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Erro ao processar nota fiscal:', error)
    return false
  }

  return true
}


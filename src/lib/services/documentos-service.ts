import { supabase } from '../supabase'

export type Documento = {
  id?: string
  nome: string
  tipo: 'CNH' | 'CRLV' | 'Seguro' | 'Licenciamento' | 'Contrato' | 'Certidão' | 'Alvará' | 'Outros'
  numero_documento?: string
  entidade_relacionada?: string // Pode ser veiculo_id, motorista_id, etc.
  tipo_entidade?: 'Veículo' | 'Motorista' | 'Empresa' | 'Contrato' | 'Outros'
  data_emissao?: string
  data_validade?: string
  status: 'Válido' | 'Vencido' | 'A Vencer' | 'Pendente' | 'Cancelado'
  orgao_emissor?: string
  arquivo_url?: string
  alerta_renovacao_dias?: number
  observacoes?: string
  created_at?: string
  updated_at?: string
}

export type DocumentoStats = {
  total: number
  validos: number
  vencidos: number
  a_vencer: number
  pendentes: number
  por_tipo: Record<string, number>
  vencendo_30_dias: number
  vencendo_60_dias: number
}

/**
 * Busca todos os documentos
 */
export async function fetchDocumentos(): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .order('data_validade', { ascending: true })

  if (error) {
    console.error('Erro ao buscar documentos:', error)
    throw error
  }
  return data || []
}

/**
 * Busca um documento por ID
 */
export async function fetchDocumentoById(id: string): Promise<Documento | null> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar documento:', error)
    throw error
  }
  return data
}

/**
 * Cria um novo documento
 */
export async function createDocumento(documento: Omit<Documento, 'id' | 'created_at' | 'updated_at'>): Promise<Documento | null> {
  const { data, error } = await supabase
    .from('documentos')
    .insert(documento)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar documento:', error)
    throw error
  }
  return data
}

/**
 * Atualiza um documento existente
 */
export async function updateDocumento(id: string, updates: Partial<Documento>): Promise<Documento | null> {
  const { data, error } = await supabase
    .from('documentos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar documento:', error)
    throw error
  }
  return data
}

/**
 * Deleta um documento
 */
export async function deleteDocumento(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar documento:', error)
    throw error
  }
  return true
}

/**
 * Busca estatísticas de documentos
 */
export async function fetchDocumentosStats(): Promise<DocumentoStats> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')

  if (error) {
    console.error('Erro ao buscar estatísticas:', error)
    throw error
  }

  const hoje = new Date()
  const daquiA30Dias = new Date()
  daquiA30Dias.setDate(hoje.getDate() + 30)
  const daquiA60Dias = new Date()
  daquiA60Dias.setDate(hoje.getDate() + 60)

  const total = data?.length || 0
  const validos = data?.filter(d => d.status === 'Válido').length || 0
  const vencidos = data?.filter(d => d.status === 'Vencido').length || 0
  const a_vencer = data?.filter(d => d.status === 'A Vencer').length || 0
  const pendentes = data?.filter(d => d.status === 'Pendente').length || 0

  // Agrupar por tipo
  const por_tipo: Record<string, number> = {}
  data?.forEach(d => {
    por_tipo[d.tipo] = (por_tipo[d.tipo] || 0) + 1
  })

  const vencendo_30_dias = data?.filter(d => {
    if (!d.data_validade || d.status === 'Vencido' || d.status === 'Cancelado') return false
    const dataValidade = new Date(d.data_validade)
    return dataValidade >= hoje && dataValidade <= daquiA30Dias
  }).length || 0

  const vencendo_60_dias = data?.filter(d => {
    if (!d.data_validade || d.status === 'Vencido' || d.status === 'Cancelado') return false
    const dataValidade = new Date(d.data_validade)
    return dataValidade > daquiA30Dias && dataValidade <= daquiA60Dias
  }).length || 0

  return {
    total,
    validos,
    vencidos,
    a_vencer,
    pendentes,
    por_tipo,
    vencendo_30_dias,
    vencendo_60_dias
  }
}

/**
 * Busca documentos por tipo
 */
export async function fetchDocumentosByTipo(tipo: Documento['tipo']): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('tipo', tipo)
    .order('data_validade', { ascending: true })

  if (error) {
    console.error('Erro ao buscar documentos por tipo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca documentos por status
 */
export async function fetchDocumentosByStatus(status: Documento['status']): Promise<Documento[]> {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .eq('status', status)
    .order('data_validade', { ascending: true })

  if (error) {
    console.error('Erro ao buscar documentos por status:', error)
    throw error
  }
  return data || []
}

/**
 * Busca documentos vencendo em X dias
 */
export async function fetchDocumentosVencendo(dias: number = 30): Promise<Documento[]> {
  const hoje = new Date()
  const dataLimite = new Date()
  dataLimite.setDate(hoje.getDate() + dias)

  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .in('status', ['Válido', 'A Vencer'])
    .gte('data_validade', hoje.toISOString().split('T')[0])
    .lte('data_validade', dataLimite.toISOString().split('T')[0])
    .order('data_validade', { ascending: true })

  if (error) {
    console.error('Erro ao buscar documentos vencendo:', error)
    throw error
  }
  return data || []
}

/**
 * Busca documentos vencidos
 */
export async function fetchDocumentosVencidos(): Promise<Documento[]> {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .lt('data_validade', hoje)
    .in('status', ['Válido', 'A Vencer'])
    .order('data_validade', { ascending: false })

  if (error) {
    console.error('Erro ao buscar documentos vencidos:', error)
    throw error
  }
  return data || []
}

/**
 * Renova um documento
 */
export async function renovarDocumento(id: string, novaDataValidade: string, novoArquivo?: string): Promise<Documento | null> {
  const updates: Partial<Documento> = {
    data_validade: novaDataValidade,
    data_emissao: new Date().toISOString().split('T')[0],
    status: 'Válido'
  }
  
  if (novoArquivo) {
    updates.arquivo_url = novoArquivo
  }

  return updateDocumento(id, updates)
}

/**
 * Busca documentos por entidade relacionada
 */
export async function fetchDocumentosByEntidade(entidadeId: string, tipoEntidade?: Documento['tipo_entidade']): Promise<Documento[]> {
  let query = supabase
    .from('documentos')
    .select('*')
    .eq('entidade_relacionada', entidadeId)

  if (tipoEntidade) {
    query = query.eq('tipo_entidade', tipoEntidade)
  }

  const { data, error } = await query.order('data_validade', { ascending: true })

  if (error) {
    console.error('Erro ao buscar documentos por entidade:', error)
    throw error
  }
  return data || []
}

/**
 * Atualiza status automaticamente baseado na data de validade
 */
export async function atualizarStatusDocumentos(): Promise<void> {
  const hoje = new Date()
  const daquiA30Dias = new Date()
  daquiA30Dias.setDate(hoje.getDate() + 30)

  const documentos = await fetchDocumentos()

  for (const doc of documentos) {
    if (!doc.data_validade || !doc.id) continue

    const dataValidade = new Date(doc.data_validade)
    let novoStatus: Documento['status'] = doc.status

    if (dataValidade < hoje) {
      novoStatus = 'Vencido'
    } else if (dataValidade <= daquiA30Dias) {
      novoStatus = 'A Vencer'
    } else {
      novoStatus = 'Válido'
    }

    if (novoStatus !== doc.status) {
      await updateDocumento(doc.id, { status: novoStatus })
    }
  }
}

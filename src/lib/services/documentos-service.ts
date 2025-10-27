import { supabase } from '../supabase'

export type Documento = {
  id: string
  tipo: string
  numero: string
  descricao?: string
  entidade_tipo: 'Veículo' | 'Motorista' | 'Empresa' | 'Contrato'
  entidade_id?: string
  data_emissao: string
  data_validade?: string
  status: 'Válido' | 'Vencido' | 'Pendente' | 'Em Renovação'
  arquivo_url?: string
  observacoes?: string
  created_at: string
  updated_at: string
}

export type CreateDocumentoInput = Omit<Documento, 'id' | 'created_at' | 'updated_at'>

export async function fetchDocumentos(): Promise<Documento[]> {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .order('data_validade', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar documentos:', error)
    return []
  }
}

export async function fetchDocumentoById(id: string): Promise<Documento | null> {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao buscar documento:', error)
    return null
  }
}

export async function createDocumento(input: Partial<CreateDocumentoInput>): Promise<Documento | null> {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .insert([input])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao criar documento:', error)
    return null
  }
}

export async function updateDocumento(id: string, updates: Partial<Documento>): Promise<Documento | null> {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao atualizar documento:', error)
    return null
  }
}

export async function deleteDocumento(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Erro ao deletar documento:', error)
    return false
  }
}

export async function fetchDocumentosStats() {
  try {
    const documentos = await fetchDocumentos()
    
    const total = documentos.length
    const validos = documentos.filter(d => d.status === 'Válido').length
    const vencidos = documentos.filter(d => d.status === 'Vencido').length
    const pendentes = documentos.filter(d => d.status === 'Pendente').length
    const em_renovacao = documentos.filter(d => d.status === 'Em Renovação').length
    
    // Documentos vencendo em 30 dias
    const hoje = new Date()
    const proximos30dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000)
    const vencendo_30_dias = documentos.filter(d => {
      if (!d.data_validade) return false
      const dataValidade = new Date(d.data_validade)
      return dataValidade >= hoje && dataValidade <= proximos30dias && d.status === 'Válido'
    }).length

    // Por entidade
    const por_entidade = {
      veiculo: documentos.filter(d => d.entidade_tipo === 'Veículo').length,
      motorista: documentos.filter(d => d.entidade_tipo === 'Motorista').length,
      empresa: documentos.filter(d => d.entidade_tipo === 'Empresa').length,
      contrato: documentos.filter(d => d.entidade_tipo === 'Contrato').length
    }

    return {
      total,
      validos,
      vencidos,
      pendentes,
      em_renovacao,
      vencendo_30_dias,
      por_entidade
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      validos: 0,
      vencidos: 0,
      pendentes: 0,
      em_renovacao: 0,
      vencendo_30_dias: 0,
      por_entidade: { veiculo: 0, motorista: 0, empresa: 0, contrato: 0 }
    }
  }
}


import { supabase } from '../supabaseClient'

export type Documento = {
  id: string
  titulo: string
  tipo: 'financeiro' | 'fiscal' | 'logistica' | 'outro'
  arquivo_url: string
  usuario_id?: string
  created_at: string
  updated_at: string
}

export type DocumentoInsert = Omit<Documento, 'id' | 'created_at' | 'updated_at'>

/**
 * Buscar todos os documentos ou filtrar por tipo
 */
export async function fetchDocumentos(tipo?: string): Promise<Documento[]> {
  try {
    let query = supabase
      .from('documentos')
      .select('*')
      .order('created_at', { ascending: false })

    if (tipo) {
      query = query.eq('tipo', tipo)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar documentos:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('[fetchDocumentos] Erro:', error)
    return []
  }
}

/**
 * Criar novo documento
 */
export async function createDocumento(documento: DocumentoInsert): Promise<Documento | null> {
  try {
    const { data, error } = await supabase
      .from('documentos')
      .insert({
        ...documento,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar documento:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('[createDocumento] Erro:', error)
    return null
  }
}

/**
 * Atualizar documento
 */
export async function updateDocumento(id: string, updates: Partial<DocumentoInsert>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documentos')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar documento:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('[updateDocumento] Erro:', error)
    return false
  }
}

/**
 * Deletar documento
 */
export async function deleteDocumento(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('documentos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar documento:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('[deleteDocumento] Erro:', error)
    return false
  }
}

/**
 * Upload de arquivo para o storage do Supabase
 */
export async function uploadDocumento(file: File, bucket: string = 'documentos'): Promise<string | null> {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      throw uploadError
    }

    // Obter URL pública
    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)

    return publicData.publicUrl
  } catch (error) {
    console.error('[uploadDocumento] Erro:', error)
    return null
  }
}

/**
 * Subscribe para mudanças em tempo real
 */
export function subscribeDocumentos(onChange: () => void) {
  const channel = supabase
    .channel('documentos-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'documentos' 
    }, () => onChange())
    .subscribe()

  return () => supabase.removeChannel(channel)
}

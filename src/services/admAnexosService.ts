import { supabase } from '@/lib/supabaseClient'
import type { AdmContratoAnexo, AdmContratoAnexoInsert } from '@/types/adm-contratos'

const BUCKET = 'contratos-anexos'

export async function fetchAnexos(contratoId: string): Promise<AdmContratoAnexo[]> {
  const { data, error } = await supabase
    .from('adm_contrato_anexos')
    .select('*')
    .eq('contrato_id', contratoId)
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('[admAnexosService] fetchAnexos error:', error.message)
    return []
  }
  return (data as AdmContratoAnexo[]) ?? []
}

export async function uploadAnexo(
  contratoId: string,
  file: File,
  descricao?: string
): Promise<AdmContratoAnexo | null> {
  const ext      = file.name.split('.').pop() ?? ''
  const uuid     = crypto.randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path     = `${contratoId}/${uuid}-${safeName}`

  // 1. Upload para o Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (storageError) {
    console.error('[admAnexosService] upload error:', storageError.message)
    return null
  }

  // 2. Gerar URL assinada (1 hora) — usar URL pública se bucket for público
  const { data: urlData } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60)

  // 3. Salvar registro no banco
  const { data: { user } } = await supabase.auth.getUser()
  const insert: AdmContratoAnexoInsert = {
    contrato_id:   contratoId,
    nome_arquivo:  file.name,
    tipo_arquivo:  file.type || null,
    tamanho_bytes: file.size,
    storage_path:  path,
    url_publica:   urlData?.signedUrl ?? null,
    descricao:     descricao ?? null,
    created_by:    user?.id ?? null,
  }

  const { data, error: dbError } = await supabase
    .from('adm_contrato_anexos')
    .insert(insert)
    .select('*')
    .single()

  if (dbError) {
    console.error('[admAnexosService] insert error:', dbError.message)
    // Limpar arquivo do storage em caso de falha no banco
    await supabase.storage.from(BUCKET).remove([path])
    return null
  }

  return data as AdmContratoAnexo
}

export async function getAnexoUrl(storagePath: string): Promise<string | null> {
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60 * 60)
  return data?.signedUrl ?? null
}

export async function deleteAnexo(anexo: AdmContratoAnexo): Promise<boolean> {
  // Remover do Storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([anexo.storage_path])

  if (storageError) {
    console.warn('[admAnexosService] storage remove error:', storageError.message)
    // Continua mesmo com erro no storage para limpar o banco
  }

  // Remover do banco
  const { error } = await supabase
    .from('adm_contrato_anexos')
    .delete()
    .eq('id', anexo.id)

  if (error) {
    console.error('[admAnexosService] delete error:', error.message)
    return false
  }
  return true
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return '—'
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function getFileIcon(mimeType: string | null | undefined): string {
  if (!mimeType) return 'file'
  if (mimeType.includes('pdf'))   return 'pdf'
  if (mimeType.includes('image')) return 'image'
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc'
  if (mimeType.includes('sheet') || mimeType.includes('excel'))   return 'sheet'
  return 'file'
}

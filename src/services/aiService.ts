import { getSupabaseClient } from '@/lib/supabaseClient'

/**
 * Helper para chamadas autenticadas
 * Usa URLs relativas (API Routes locais) em vez de backend externo
 */
export async function postAuth(path: string, body?: any) {
  const supabase = getSupabaseClient()
  const token = (await supabase.auth.getSession()).data.session?.access_token
  
  // Usa API Routes locais
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}



import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not configured')
    // Durante o build, retorna um cliente mock
    return createClient('https://temp.supabase.co', 'temp_key')
  }
  if (!key) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not configured')
    // Durante o build, retorna um cliente mock
    return createClient(url, 'temp_key')
  }
  cached = createClient(url, key)
  return cached
}



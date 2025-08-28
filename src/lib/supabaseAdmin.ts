import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url) throw new Error('supabaseUrl is required.')
  if (!key) throw new Error('serviceRoleKey is required.')
  cached = createClient(url, key)
  return cached
}

export const supabaseAdmin = getSupabaseAdmin()



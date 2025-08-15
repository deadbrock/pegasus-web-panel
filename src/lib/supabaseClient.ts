import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined

let cached: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (cached) return cached
  const url = (supabaseUrl ?? 'https://placeholder.supabase.co').trim()
  const key = (supabaseAnonKey ?? 'anon-placeholder').trim()
  cached = createClient(url, key, {
    auth: {
      storageKey: 'pegasus-web-auth',
      persistSession: true,
      autoRefreshToken: true,
    },
  })
  return cached
}

export const supabase: SupabaseClient = getSupabaseClient()



import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Evita múltiplas instâncias no mesmo contexto e usa storageKey exclusivo
const globalForSupabase = globalThis as unknown as { __pegasus_supabase__: SupabaseClient | undefined }

export const supabase: SupabaseClient =
  globalForSupabase.__pegasus_supabase__ ??
  createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'pegasus-web-auth',
      persistSession: true,
      autoRefreshToken: true,
    },
  })

if (typeof window !== 'undefined') {
  globalForSupabase.__pegasus_supabase__ = supabase
}



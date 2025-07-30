import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Durante o build, algumas vezes as variáveis podem não estar disponíveis
// Criamos valores padrão temporários para permitir a compilação
const defaultUrl = 'https://placeholder.supabase.co'
const defaultKey = 'placeholder-key'

const finalUrl = supabaseUrl || defaultUrl
const finalAnonKey = supabaseAnonKey || defaultKey

// Só validamos em tempo de execução, não durante o build
const validateEnvironment = () => {
  if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    console.error('Missing Supabase environment variables. Please check your .env file.')
    return false
  }
  return true
}

export const supabase = createClient<Database>(finalUrl, finalAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Helper functions para operações comuns
export const supabaseAdmin = createClient<Database>(
  finalUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-admin-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Exportar função de validação para uso nos componentes
export { validateEnvironment } 
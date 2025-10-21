import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'

/**
 * Endpoint de teste de conexão
 * Verifica se Supabase está acessível
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!supabaseUrl) {
      return Response.json({ 
        error: 'Supabase não configurado',
        message: 'NEXT_PUBLIC_SUPABASE_URL não definida'
      }, { status: 500 })
    }

    // Testar conexão com Supabase
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      return Response.json({
        supabase_url: supabaseUrl,
        status: 'error',
        error: error.message,
        accessible: false
      }, { status: 500 })
    }

    return Response.json({
      supabase_url: supabaseUrl,
      status: 'ok',
      accessible: true,
      message: 'Supabase conectado com sucesso',
      architecture: 'Vercel + Supabase (sem backend Python)'
    })

  } catch (error: any) {
    return Response.json({ 
      error: 'Erro ao testar conexão',
      message: error?.message || 'Erro desconhecido'
    }, { status: 500 })
  }
}

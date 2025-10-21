import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Exemplo de endpoint backend customizado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Lógica de negócio aqui
    const resultado = await processarDados(body)
    
    // Salvar no Supabase
    const { data, error } = await supabase
      .from('tabela')
      .insert(resultado)
    
    if (error) throw error
    
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }
}

async function processarDados(dados: any) {
  // Sua lógica customizada aqui
  return dados
}


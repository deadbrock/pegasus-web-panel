import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter cliente Supabase Admin
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// GET - Buscar configuração ativa
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Buscar configuração ativa
    const { data, error } = await supabaseAdmin
      .from('configuracoes_periodo_pedidos')
      .select('*')
      .eq('ativo', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Erro ao buscar configuração:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar configuração', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ configuracao: data || null })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Criar nova configuração
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()

    // Validações básicas
    if (!body.nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    // Se ativo=true, desativar outras configurações
    if (body.ativo) {
      await supabaseAdmin
        .from('configuracoes_periodo_pedidos')
        .update({ ativo: false })
        .eq('ativo', true)
    }

    // Criar nova configuração
    const { data, error } = await supabaseAdmin
      .from('configuracoes_periodo_pedidos')
      .insert({
        nome: body.nome,
        descricao: body.descricao,
        ativo: body.ativo || false,
        dia_inicio: body.dia_inicio,
        dia_fim: body.dia_fim,
        dias_semana_permitidos: body.dias_semana_permitidos || [],
        horario_inicio: body.horario_inicio,
        horario_fim: body.horario_fim,
        max_pedidos_por_periodo: body.max_pedidos_por_periodo,
        requer_autorizacao_apos: body.requer_autorizacao_apos || 1,
        permitir_urgentes: body.permitir_urgentes || false,
        mensagem_bloqueio: body.mensagem_bloqueio || 'Período de pedidos encerrado.'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar configuração:', error)
      return NextResponse.json(
        { error: 'Erro ao criar configuração', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      configuracao: data
    })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configuração existente
export async function PUT(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    // Se ativo=true, desativar outras configurações
    if (body.ativo) {
      await supabaseAdmin
        .from('configuracoes_periodo_pedidos')
        .update({ ativo: false })
        .eq('ativo', true)
        .neq('id', body.id)
    }

    // Atualizar configuração
    const { data, error } = await supabaseAdmin
      .from('configuracoes_periodo_pedidos')
      .update({
        nome: body.nome,
        descricao: body.descricao,
        ativo: body.ativo,
        dia_inicio: body.dia_inicio,
        dia_fim: body.dia_fim,
        dias_semana_permitidos: body.dias_semana_permitidos,
        horario_inicio: body.horario_inicio,
        horario_fim: body.horario_fim,
        max_pedidos_por_periodo: body.max_pedidos_por_periodo,
        requer_autorizacao_apos: body.requer_autorizacao_apos,
        permitir_urgentes: body.permitir_urgentes,
        mensagem_bloqueio: body.mensagem_bloqueio
      })
      .eq('id', body.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar configuração:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar configuração', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      configuracao: data
    })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Deletar configuração
export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('configuracoes_periodo_pedidos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar configuração:', error)
      return NextResponse.json(
        { error: 'Erro ao deletar configuração', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}


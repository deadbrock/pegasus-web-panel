import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const TABLE = 'centros_custo'

// GET - Listar centros de custo
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .order('nome', { ascending: true })

    if (error) {
      // Tabela pode não existir ainda — retorna lista vazia
      if (error.code === '42P01') {
        return NextResponse.json([])
      }
      console.error('Erro ao buscar centros de custo:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar centros de custo', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Erro ao buscar centros de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar centros de custo', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Criar centro de custo
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nome, codigo, descricao, cor_hex, ativo } = body

    if (!nome || !codigo) {
      return NextResponse.json(
        { error: 'Nome e código são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        nome,
        tipo: 'personalizado',
        codigo,
        descricao: descricao || '',
        ativo: ativo !== undefined ? ativo : true,
        cor_hex: cor_hex || '#6B7280',
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar centro de custo:', error)
      return NextResponse.json(
        { error: 'Erro ao criar centro de custo', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, centro: data })
  } catch (error: any) {
    console.error('Erro ao criar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar centro de custo', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Atualizar centro de custo
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, nome, codigo, descricao, cor_hex, ativo } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from(TABLE)
      .update({ nome, codigo, descricao, cor_hex, ativo })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar centro de custo:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar centro de custo', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Centro de custo atualizado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao atualizar centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar centro de custo', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Excluir centro de custo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir centro de custo:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir centro de custo', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Centro de custo excluído com sucesso' })
  } catch (error: any) {
    console.error('Erro ao excluir centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir centro de custo', details: error.message },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Função para obter cliente Supabase Admin com validação
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

// GET - Listar supervisores
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    // Buscar usuários com role 'supervisor'
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError)
      return NextResponse.json(
        { error: 'Erro ao buscar supervisores', details: usersError.message },
        { status: 500 }
      )
    }

    // Filtrar apenas supervisores
    const supervisoresList = users.users
      .filter(user => user.user_metadata?.role === 'supervisor')
      .map(user => ({
        id: user.id,
        email: user.email || '',
        nome: user.user_metadata?.name || user.email?.split('@')[0] || 'Supervisor',
        status: (user.user_metadata?.status || 'ativo') as 'ativo' | 'inativo',
        created_at: user.created_at
      }))

    // Buscar contagem de pedidos de cada supervisor
    const supervisoresComPedidos = await Promise.all(
      supervisoresList.map(async (supervisor) => {
        const { count } = await supabaseAdmin
          .from('pedidos_supervisores')
          .select('*', { count: 'exact', head: true })
          .eq('supervisor_id', supervisor.id)

        return {
          ...supervisor,
          total_pedidos: count || 0
        }
      })
    )

    return NextResponse.json({ supervisores: supervisoresComPedidos })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Criar supervisor
export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { nome, email, senha } = body

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: newUser, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
      user_metadata: {
        name: nome,
        role: 'supervisor',
        status: 'ativo'
      }
    })

    if (signUpError) {
      console.error('Erro ao criar supervisor:', signUpError)
      return NextResponse.json(
        { error: 'Erro ao criar supervisor', details: signUpError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      success: true,
      supervisor: {
        id: newUser.user.id,
        email: newUser.user.email,
        nome
      }
    })
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar status do supervisor
export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin()
    
    const body = await request.json()
    const { supervisorId, status } = body

    if (!supervisorId || !status) {
      return NextResponse.json(
        { error: 'ID do supervisor e status são obrigatórios' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(supervisorId, {
      user_metadata: { status }
    })

    if (error) {
      console.error('Erro ao atualizar status:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar status', details: error.message },
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


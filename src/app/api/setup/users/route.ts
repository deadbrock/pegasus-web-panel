import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '../../../../lib/supabaseAdmin'
import bcrypt from 'bcryptjs'

// Usuários padrão do sistema
const DEFAULT_USERS = [
  {
    username: 'diretor@pegasus.com',
    email: 'diretor@pegasus.com',
    password: 'diretor123',
    role: 'diretor',
    name: 'Diretor Geral'
  },
  {
    username: 'admin@pegasus.com', 
    email: 'admin@pegasus.com',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador'
  },
  {
    username: 'gestor@pegasus.com',
    email: 'gestor@pegasus.com', 
    password: 'gestor123',
    role: 'gestor',
    name: 'Gestor Logístico'
  },
  {
    username: 'financeiro@pegasus.com',
    email: 'financeiro@pegasus.com',
    password: 'financeiro123', 
    role: 'financeiro',
    name: 'Analista Financeiro'
  }
]

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    
    // Verificar se já existem usuários
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .limit(1)
    
    if (checkError) {
      console.error('Erro ao verificar usuários:', checkError)
      return NextResponse.json({ error: 'Erro ao acessar banco de dados' }, { status: 500 })
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ 
        message: 'Usuários já existem no sistema',
        users: existingUsers.map(u => u.email)
      }, { status: 200 })
    }
    
    // Criar usuários padrão
    const usersToCreate = []
    
    for (const user of DEFAULT_USERS) {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(user.password, 12)
      
      usersToCreate.push({
        username: user.username,
        email: user.email,
        hashed_password: hashedPassword,
        role: user.role,
        name: user.name,
        created_at: new Date().toISOString()
      })
    }
    
    // Inserir no banco
    const { data, error } = await supabase
      .from('users')
      .insert(usersToCreate)
      .select('id, email, role, name')
    
    if (error) {
      console.error('Erro ao criar usuários:', error)
      return NextResponse.json({ error: 'Erro ao criar usuários no banco' }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Usuários padrão criados com sucesso!',
      users: DEFAULT_USERS.map(u => ({
        email: u.email,
        password: u.password,
        role: u.role,
        name: u.name
      })),
      created: data
    }, { status: 201 })
    
  } catch (e: any) {
    console.error('Erro no setup de usuários:', e)
    return NextResponse.json({ 
      error: e?.message || 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para criar usuários padrão do sistema',
    method: 'POST',
    users: DEFAULT_USERS.map(u => ({
      email: u.email,
      role: u.role,
      name: u.name
    }))
  })
}

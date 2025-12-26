import { NextResponse } from 'next/server'

// Dados simulados de centros de custo
const centrosCustoSimulados = [
  {
    id: 1,
    nome: 'Sede',
    tipo: 'predefinido',
    codigo: 'SEDE',
    descricao: 'Custos administrativos da sede',
    ativo: true,
    cor_hex: '#3B82F6',
    created_at: '2024-01-01',
    total_gastos: 125000,
    transacoes_mes: 45
  },
  {
    id: 2,
    nome: 'Veículos',
    tipo: 'predefinido',
    codigo: 'VEICULOS',
    descricao: 'Combustível, manutenção e seguro veicular',
    ativo: true,
    cor_hex: '#EF4444',
    created_at: '2024-01-01',
    total_gastos: 98000,
    transacoes_mes: 67
  },
  {
    id: 3,
    nome: 'Filiais',
    tipo: 'predefinido',
    codigo: 'FILIAL',
    descricao: 'Custos das filiais',
    ativo: true,
    cor_hex: '#10B981',
    created_at: '2024-01-01',
    total_gastos: 85000,
    transacoes_mes: 32
  },
  {
    id: 4,
    nome: 'Diárias',
    tipo: 'predefinido',
    codigo: 'DIARIAS',
    descricao: 'Pagamento de diárias para funcionários',
    ativo: true,
    cor_hex: '#F59E0B',
    created_at: '2024-01-01',
    total_gastos: 35000,
    transacoes_mes: 28
  },
  {
    id: 5,
    nome: 'Máquinas e Equipamentos',
    tipo: 'predefinido',
    codigo: 'MAQUINAS',
    descricao: 'Manutenção e aquisição de máquinas',
    ativo: true,
    cor_hex: '#8B5CF6',
    created_at: '2024-01-01',
    total_gastos: 52000,
    transacoes_mes: 18
  },
  {
    id: 6,
    nome: 'Contratos',
    tipo: 'predefinido',
    codigo: 'CONTRATOS',
    descricao: 'Pagamentos de contratos diversos',
    ativo: true,
    cor_hex: '#EC4899',
    created_at: '2024-01-01',
    total_gastos: 72000,
    transacoes_mes: 24
  },
  {
    id: 7,
    nome: 'Seguros',
    tipo: 'predefinido',
    codigo: 'SEGUROS',
    descricao: 'Seguros diversos da empresa',
    ativo: true,
    cor_hex: '#14B8A6',
    created_at: '2024-01-01',
    total_gastos: 28000,
    transacoes_mes: 12
  },
  {
    id: 8,
    nome: 'Telefonia',
    tipo: 'predefinido',
    codigo: 'TELEFONIA',
    descricao: 'Telefonia móvel e fixa',
    ativo: true,
    cor_hex: '#F97316',
    created_at: '2024-01-01',
    total_gastos: 15000,
    transacoes_mes: 36
  },
  {
    id: 9,
    nome: 'Internet',
    tipo: 'predefinido',
    codigo: 'INTERNET',
    descricao: 'Links de internet e conectividade',
    ativo: true,
    cor_hex: '#06B6D4',
    created_at: '2024-01-01',
    total_gastos: 8500,
    transacoes_mes: 12
  }
]

// GET - Listar centros de custo
export async function GET() {
  try {
    // Por enquanto, retorna dados simulados
    // TODO: Implementar busca no Supabase quando a tabela estiver criada
    return NextResponse.json(centrosCustoSimulados)
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

    // TODO: Implementar criação no Supabase quando a tabela estiver criada
    const novoCentro = {
      id: centrosCustoSimulados.length + 1,
      nome,
      tipo: 'personalizado',
      codigo,
      descricao: descricao || '',
      ativo: ativo !== undefined ? ativo : true,
      cor_hex: cor_hex || '#6B7280',
      created_at: new Date().toISOString(),
      total_gastos: 0,
      transacoes_mes: 0
    }

    return NextResponse.json({ 
      success: true,
      centro: novoCentro
    })
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

    // TODO: Implementar atualização no Supabase quando a tabela estiver criada
    return NextResponse.json({ 
      success: true,
      message: 'Centro de custo atualizado com sucesso'
    })
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

    // TODO: Implementar exclusão no Supabase quando a tabela estiver criada
    return NextResponse.json({ 
      success: true,
      message: 'Centro de custo excluído com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao excluir centro de custo:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir centro de custo', details: error.message },
      { status: 500 }
    )
  }
}


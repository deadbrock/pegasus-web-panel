import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * API para buscar contratos atribuídos a um supervisor
 * Usado pelo aplicativo mobile
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const supervisorId = searchParams.get('supervisor_id')

    if (!supervisorId) {
      return NextResponse.json(
        { error: 'supervisor_id é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`[API] Buscando contratos para supervisor: ${supervisorId}`)

    // Buscar contratos atribuídos ao supervisor
    const { data, error } = await supabase
      .from('contratos')
      .select(`
        id,
        numero_contrato,
        cliente,
        tipo,
        descricao,
        valor_total,
        valor_mensal,
        valor_mensal_material,
        data_inicio,
        data_fim,
        status,
        responsavel,
        email_contato,
        telefone_contato,
        observacoes,
        contratos_supervisores_atribuicao!inner(
          id,
          data_atribuicao,
          ativo
        )
      `)
      .eq('contratos_supervisores_atribuicao.supervisor_id', supervisorId)
      .eq('contratos_supervisores_atribuicao.ativo', true)
      .eq('status', 'Ativo')
      .order('cliente', { ascending: true })

    if (error) {
      console.error('[API] Erro ao buscar contratos:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar contratos', details: error.message },
        { status: 500 }
      )
    }

    // Transformar dados para formato do mobile
    const contratos = (data || []).map((item: any) => {
      const { contratos_supervisores_atribuicao, ...contrato } = item
      return {
        ...contrato,
        data_atribuicao: contratos_supervisores_atribuicao?.[0]?.data_atribuicao
      }
    })

    console.log(`[API] ${contratos.length} contrato(s) encontrado(s)`)

    return NextResponse.json({
      success: true,
      contratos,
      total: contratos.length
    })

  } catch (error: any) {
    console.error('[API] Erro inesperado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * Endpoint para sincronizar configurações de período com o mobile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supervisor_id, action } = body

    if (!supervisor_id) {
      return NextResponse.json(
        { error: 'supervisor_id é obrigatório' },
        { status: 400 }
      )
    }

    if (action === 'sync_periodo') {
      // Buscar configuração ativa de período de pedidos
      const { data: config, error: configError } = await supabase
        .from('configuracoes_periodo_pedidos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (configError && configError.code !== 'PGRST116') {
        console.error('[API] Erro ao buscar configuração de período:', configError)
        return NextResponse.json(
          { error: 'Erro ao buscar configuração', details: configError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        periodo_config: config || null,
        mensagem: config 
          ? 'Configuração de período sincronizada'
          : 'Nenhuma configuração de período ativa'
      })
    }

    if (action === 'sync_contratos') {
      // Buscar contratos do supervisor
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          id,
          numero_contrato,
          cliente,
          tipo,
          descricao,
          valor_total,
          valor_mensal,
          valor_mensal_material,
          data_inicio,
          data_fim,
          status,
          responsavel,
          email_contato,
          telefone_contato,
          observacoes,
          contratos_supervisores_atribuicao!inner(
            id,
            data_atribuicao,
            ativo
          )
        `)
        .eq('contratos_supervisores_atribuicao.supervisor_id', supervisor_id)
        .eq('contratos_supervisores_atribuicao.ativo', true)
        .eq('status', 'Ativo')

      if (error) {
        console.error('[API] Erro ao sincronizar contratos:', error)
        return NextResponse.json(
          { error: 'Erro ao sincronizar contratos', details: error.message },
          { status: 500 }
        )
      }

      const contratos = (data || []).map((item: any) => {
        const { contratos_supervisores_atribuicao, ...contrato } = item
        return contrato
      })

      return NextResponse.json({
        success: true,
        contratos,
        total: contratos.length,
        mensagem: `${contratos.length} contrato(s) sincronizado(s)`
      })
    }

    return NextResponse.json(
      { error: 'Ação não reconhecida. Use "sync_periodo" ou "sync_contratos"' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('[API] Erro inesperado no POST:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    )
  }
}

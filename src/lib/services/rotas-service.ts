import { supabase } from '../supabase'

export type RotaEntrega = {
  id: string
  pedido_id: string
  numero_rota: string
  data_criacao: string
  data_prevista_entrega?: string
  endereco_completo: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cidade: string
  endereco_estado: string
  endereco_cep?: string
  latitude?: number
  longitude?: number
  motorista_id?: string
  veiculo_id?: string
  data_atribuicao?: string
  atribuido_por?: string
  status: 'Aguardando Atribuição' | 'Atribuída' | 'Em Rota' | 'Entregue' | 'Cancelada' | 'Atrasada'
  data_inicio_rota?: string
  data_entrega?: string
  observacoes?: string
  prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente'
  created_at: string
  updated_at: string
  // Joins
  pedido?: any
  motorista?: any
  veiculo?: any
}

/**
 * Buscar todas as rotas
 */
export async function fetchRotas(status?: string): Promise<RotaEntrega[]> {
  let query = supabase
    .from('rotas_entrega')
    .select(`
      *,
      pedido:pedidos_supervisores(numero_pedido, supervisor_nome, created_at),
      motorista:motoristas(nome, telefone),
      veiculo:veiculos(placa, modelo)
    `)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Erro ao buscar rotas:', error)
    throw error
  }

  return data || []
}

/**
 * Buscar rotas aguardando atribuição
 */
export async function fetchRotasAguardandoAtribuicao(): Promise<RotaEntrega[]> {
  return fetchRotas('Aguardando Atribuição')
}

/**
 * Buscar rotas em andamento
 */
export async function fetchRotasEmAndamento(): Promise<RotaEntrega[]> {
  const { data, error } = await supabase
    .from('rotas_entrega')
    .select(`
      *,
      pedido:pedidos_supervisores(numero_pedido, supervisor_nome),
      motorista:motoristas(nome, telefone),
      veiculo:veiculos(placa, modelo)
    `)
    .in('status', ['Atribuída', 'Em Rota'])
    .order('data_prevista_entrega', { ascending: true })

  if (error) {
    console.error('Erro ao buscar rotas em andamento:', error)
    throw error
  }

  return data || []
}

/**
 * Atribuir motorista e veículo a uma rota
 */
export async function atribuirMotoristaVeiculo(
  rotaId: string,
  motoristaId: string,
  veiculoId: string,
  usuarioEmail: string
): Promise<RotaEntrega | null> {
  const { data, error } = await supabase
    .from('rotas_entrega')
    .update({
      motorista_id: motoristaId,
      veiculo_id: veiculoId,
      status: 'Atribuída',
      data_atribuicao: new Date().toISOString(),
      atribuido_por: usuarioEmail
    })
    .eq('id', rotaId)
    .select(`
      *,
      pedido:pedidos_supervisores(numero_pedido, supervisor_nome),
      motorista:motoristas(nome, telefone),
      veiculo:veiculos(placa, modelo)
    `)
    .single()

  if (error) {
    console.error('Erro ao atribuir motorista/veículo:', error)
    throw error
  }

  return data
}

/**
 * Iniciar rota (motorista inicia entrega)
 */
export async function iniciarRota(rotaId: string): Promise<RotaEntrega | null> {
  const { data, error } = await supabase
    .from('rotas_entrega')
    .update({
      status: 'Em Rota',
      data_inicio_rota: new Date().toISOString()
    })
    .eq('id', rotaId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao iniciar rota:', error)
    throw error
  }

  return data
}

/**
 * Finalizar entrega
 */
export async function finalizarEntrega(rotaId: string): Promise<RotaEntrega | null> {
  const { data, error } = await supabase
    .from('rotas_entrega')
    .update({
      status: 'Entregue',
      data_entrega: new Date().toISOString()
    })
    .eq('id', rotaId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao finalizar entrega:', error)
    throw error
  }

  // Atualizar status do pedido também
  if (data) {
    await supabase
      .from('pedidos_supervisores')
      .update({ status: 'Entregue' })
      .eq('id', data.pedido_id)
    
    // Log da entrega concluída (a performance será calculada dinamicamente)
    console.log(`[Rotas] Entrega concluída - Rota: ${rotaId}, Motorista: ${data.motorista_id}`)
  }

  return data
}

/**
 * Cancelar rota
 */
export async function cancelarRota(rotaId: string, motivo: string): Promise<RotaEntrega | null> {
  const { data, error } = await supabase
    .from('rotas_entrega')
    .update({
      status: 'Cancelada',
      observacoes: motivo
    })
    .eq('id', rotaId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao cancelar rota:', error)
    throw error
  }

  return data
}

/**
 * Buscar rotas de um motorista
 */
export async function fetchRotasPorMotorista(motoristaId: string): Promise<RotaEntrega[]> {
  const { data, error } = await supabase
    .from('rotas_entrega')
    .select(`
      *,
      pedido:pedidos_mobile(numero_pedido, supervisor_nome, produtos),
      veiculo:veiculos(placa, modelo)
    `)
    .eq('motorista_id', motoristaId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar rotas do motorista:', error)
    throw error
  }

  return data || []
}

/**
 * Subscrever mudanças em rotas (realtime)
 */
export function subscribeRotas(onChange: (rotas: RotaEntrega[]) => void) {
  const channel = supabase
    .channel('rotas-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rotas_entrega'
      },
      async () => {
        const rotas = await fetchRotas()
        onChange(rotas)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}


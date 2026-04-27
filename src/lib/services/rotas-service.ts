import { supabase } from '../supabase'

export type Parada = {
  id: string          // UUID local (para key do React)
  endereco: string
  descricao?: string
}

export type RotaEntrega = {
  id: string
  pedido_id: string
  numero_rota: string
  data_criacao: string
  data_prevista_entrega?: string

  // Endereço de entrega (destino)
  endereco_completo: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cidade: string
  endereco_estado: string
  endereco_cep?: string
  latitude?: number
  longitude?: number

  // Ponto de partida e paradas intermediárias
  ponto_partida?: string
  paradas?: Parada[]

  // Destinatário
  destinatario_nome?: string
  destinatario_tel?: string
  destinatario_doc?: string

  // Distância e tempo estimados
  distancia_est_km?: number
  tempo_est_min?: number

  // Atribuição
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

  // ID alternativo para pedidos do portal operacional
  pedido_material_id?: string

  // Joins
  pedido?: any
  pedido_material?: any
  motorista?: any
  veiculo?: any
}

export type CriarRotaPayload = {
  /** ID em pedidos_supervisores (mobile) */
  pedido_id?: string
  /** ID em pedidos_materiais (portal operacional) */
  pedido_material_id?: string
  ponto_partida?: string
  endereco_completo: string
  endereco_cidade?: string
  endereco_estado?: string
  paradas?: Parada[]
  destinatario_nome?: string
  destinatario_tel?: string
  destinatario_doc?: string
  data_prevista_entrega?: string
  prioridade?: RotaEntrega['prioridade']
  motorista_id?: string
  veiculo_id?: string
  distancia_est_km?: number
  tempo_est_min?: number
  observacoes?: string
  atribuido_por?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gerarNumeroRota(): string {
  const now = new Date()
  return `RT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-4)}`
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * Criar uma rota de entrega para um pedido
 */
export async function criarRota(payload: CriarRotaPayload): Promise<RotaEntrega> {
  const numero_rota = gerarNumeroRota()
  const temAtribuicao = !!payload.motorista_id && !!payload.veiculo_id

  if (!payload.pedido_id && !payload.pedido_material_id) {
    throw new Error('criarRota: informe pedido_id ou pedido_material_id')
  }

  const insert: Record<string, unknown> = {
    // Usar a referência correta
    pedido_id:            payload.pedido_id ?? null,
    pedido_material_id:   payload.pedido_material_id ?? null,
    numero_rota,
    data_prevista_entrega: payload.data_prevista_entrega ?? null,
    endereco_completo:    payload.endereco_completo,
    endereco_cidade:      payload.endereco_cidade ?? '',
    endereco_estado:      payload.endereco_estado ?? '',
    ponto_partida:        payload.ponto_partida ?? null,
    paradas:              payload.paradas ?? [],
    destinatario_nome:    payload.destinatario_nome ?? null,
    destinatario_tel:     payload.destinatario_tel ?? null,
    destinatario_doc:     payload.destinatario_doc ?? null,
    distancia_est_km:     payload.distancia_est_km ?? null,
    tempo_est_min:        payload.tempo_est_min ?? null,
    prioridade:           payload.prioridade ?? 'Normal',
    observacoes:          payload.observacoes ?? null,
    status:               temAtribuicao ? 'Atribuída' : 'Aguardando Atribuição',
    motorista_id:         payload.motorista_id ?? null,
    veiculo_id:           payload.veiculo_id ?? null,
    data_atribuicao:      temAtribuicao ? new Date().toISOString() : null,
    atribuido_por:        temAtribuicao ? (payload.atribuido_por ?? 'Sistema') : null,
  }

  const { data, error } = await supabase
    .from('rotas_entrega')
    .insert(insert)
    .select(`
      *,
      pedido:pedidos_supervisores(numero_pedido, supervisor_nome, contrato_nome, contrato_endereco),
      pedido_material:pedidos_materiais(numero_pedido, solicitante_nome, solicitante_setor),
      motorista:motoristas(nome, telefone),
      veiculo:veiculos(placa, modelo)
    `)
    .single()

  if (error) {
    console.error('[criarRota] error:', error)
    throw error
  }
  return data as RotaEntrega
}

/**
 * Criar uma rota mínima (placeholder) ao marcar pedido como Separado.
 * O usuário completa os detalhes depois via atualizarRotaDetalhes().
 */
export async function criarRotaMinima(
  pedidoMaterialId: string,
  prioridade: RotaEntrega['prioridade'] = 'Normal'
): Promise<RotaEntrega> {
  const numero_rota = gerarNumeroRota()

  const { data, error } = await supabase
    .from('rotas_entrega')
    .insert({
      pedido_material_id: pedidoMaterialId,
      pedido_id:          null,
      numero_rota,
      endereco_completo:  '',
      endereco_cidade:    '',
      endereco_estado:    '',
      paradas:            [],
      prioridade,
      status:             'Aguardando Atribuição',
    })
    .select('*')
    .single()

  if (error) {
    console.error('[criarRotaMinima] error:', error)
    throw error
  }
  return data as RotaEntrega
}

/**
 * Atualizar os detalhes de uma rota já existente (modo edição no dialog).
 */
export type AtualizarRotaPayload = Omit<CriarRotaPayload, 'pedido_id' | 'pedido_material_id'>

export async function atualizarRotaDetalhes(
  rotaId: string,
  payload: AtualizarRotaPayload
): Promise<RotaEntrega> {
  const temAtribuicao = !!payload.motorista_id && !!payload.veiculo_id

  const update: Record<string, unknown> = {
    endereco_completo:     payload.endereco_completo,
    endereco_cidade:       payload.endereco_cidade   ?? '',
    endereco_estado:       payload.endereco_estado   ?? '',
    ponto_partida:         payload.ponto_partida     ?? null,
    paradas:               payload.paradas           ?? [],
    destinatario_nome:     payload.destinatario_nome ?? null,
    destinatario_tel:      payload.destinatario_tel  ?? null,
    destinatario_doc:      payload.destinatario_doc  ?? null,
    distancia_est_km:      payload.distancia_est_km  ?? null,
    tempo_est_min:         payload.tempo_est_min     ?? null,
    prioridade:            payload.prioridade        ?? 'Normal',
    observacoes:           payload.observacoes       ?? null,
    data_prevista_entrega: payload.data_prevista_entrega ?? null,
  }

  if (temAtribuicao) {
    update.motorista_id     = payload.motorista_id
    update.veiculo_id       = payload.veiculo_id
    update.status           = 'Atribuída'
    update.data_atribuicao  = new Date().toISOString()
    update.atribuido_por    = payload.atribuido_por ?? 'Sistema'
  }

  const { data, error } = await supabase
    .from('rotas_entrega')
    .update(update)
    .eq('id', rotaId)
    .select(`
      *,
      pedido:pedidos_supervisores(numero_pedido, supervisor_nome, contrato_nome, contrato_endereco),
      pedido_material:pedidos_materiais(numero_pedido, solicitante_nome, solicitante_setor),
      motorista:motoristas(nome, telefone),
      veiculo:veiculos(placa, modelo)
    `)
    .single()

  if (error) {
    console.error('[atualizarRotaDetalhes] error:', error)
    throw error
  }
  return data as RotaEntrega
}

/**
 * Buscar todas as rotas
 */
export async function fetchRotas(status?: string): Promise<RotaEntrega[]> {
  let query = supabase
    .from('rotas_entrega')
    .select(`
      *,
      pedido:pedidos_supervisores(numero_pedido, supervisor_nome, contrato_nome, contrato_endereco, created_at),
      pedido_material:pedidos_materiais(numero_pedido, solicitante_nome, solicitante_setor),
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


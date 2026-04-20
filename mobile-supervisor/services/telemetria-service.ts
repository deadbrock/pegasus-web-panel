import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Viagem {
  id: string
  supervisor_id?: string
  veiculo_id?: string
  veiculo_info?: string
  motorista_nome?: string
  data_inicio: string
  data_fim?: string
  km_percorrido: number
  status: 'ativa' | 'finalizada' | 'cancelada'
  observacoes?: string
  created_at: string
}

export interface PosicaoInput {
  veiculo_id?: string
  latitude: number
  longitude: number
  velocidade?: number
  timestamp: string
}

// ─── Haversine (distância em km entre dois pontos GPS) ────────────────────────

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ─── Viagens ──────────────────────────────────────────────────────────────────

export async function iniciarViagem(params: {
  supervisor_id: string
  motorista_nome: string
  veiculo_info?: string
}): Promise<Viagem | null> {
  const { data, error } = await supabase
    .from('viagens')
    .insert({
      supervisor_id: params.supervisor_id,
      motorista_nome: params.motorista_nome,
      veiculo_info: params.veiculo_info ?? null,
      data_inicio: new Date().toISOString(),
      km_percorrido: 0,
      status: 'ativa',
    })
    .select()
    .single()
  if (error) { console.error('iniciarViagem:', error.message); return null }
  return data as Viagem
}

export async function finalizarViagem(id: string, km_percorrido: number): Promise<boolean> {
  const { error } = await supabase
    .from('viagens')
    .update({
      data_fim: new Date().toISOString(),
      km_percorrido: Math.round(km_percorrido * 100) / 100,
      status: 'finalizada',
    })
    .eq('id', id)
  if (error) { console.error('finalizarViagem:', error.message); return false }
  return true
}

export async function cancelarViagem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('viagens')
    .update({ status: 'cancelada', data_fim: new Date().toISOString() })
    .eq('id', id)
  if (error) { console.error('cancelarViagem:', error.message); return false }
  return true
}

export async function fetchMinhasViagens(supervisor_id: string): Promise<Viagem[]> {
  const { data, error } = await supabase
    .from('viagens')
    .select('*')
    .eq('supervisor_id', supervisor_id)
    .order('data_inicio', { ascending: false })
    .limit(30)
  if (error) { console.warn('fetchMinhasViagens:', error.message); return [] }
  return (data as Viagem[]) || []
}

// ─── Posições GPS ─────────────────────────────────────────────────────────────

export async function enviarPosicao(pos: PosicaoInput): Promise<void> {
  const { error } = await supabase.from('posicoes_veiculo').insert(pos)
  if (error) console.warn('enviarPosicao:', error.message)
}

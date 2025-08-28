import { supabase } from '@/lib/supabaseClient'

export type VehicleRow = {
  id: string
  placa?: string
  motorista?: string
  modelo?: string
  status?: string | null
  latitude?: number | null
  longitude?: number | null
  ultima_atualizacao?: string | null
}

export async function fetchVeiculos(): Promise<VehicleRow[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, motorista, modelo, status, latitude, longitude, ultima_atualizacao')
  if (error) {
    console.warn('fetchVeiculos rastreamento:', error.message)
    return []
  }
  return (data as VehicleRow[]) || []
}

export function subscribePosicoes(onChange: () => void) {
  const channel = supabase
    .channel('posicoes-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'posicoes_veiculo' }, () => onChange())
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export function subscribeVeiculos(onChange: () => void) {
  const channel = supabase
    .channel('veiculos-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'veiculos' }, () => onChange())
    .subscribe()
  return () => supabase.removeChannel(channel)
}



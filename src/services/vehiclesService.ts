import { supabase } from '@/lib/supabaseClient'

export type VehicleStatusUI = 'Ativo' | 'Em Manutenção' | 'Inativo' | 'Vendido'

export interface VehicleRecord {
  id?: string
  placa: string
  marca: string
  modelo: string
  tipo?: string | null
  ano?: number | null
  cor?: string | null
  combustivel?: string | null
  capacidade?: number | null
  kmTotal?: number | null
  status?: VehicleStatusUI
  chassi?: string | null
  renavam?: string | null
  observacoes?: string | null
  created_at?: string
  updated_at?: string
}

function mapStatusToDb(status?: VehicleStatusUI): 'Ativo' | 'Inativo' | 'Manutenção' | null {
  if (!status) return null
  if (status === 'Em Manutenção') return 'Manutenção'
  if (status === 'Vendido') return 'Inativo' // não temos coluna específica, tratamos como inativo
  return status as 'Ativo' | 'Inativo'
}

function mapStatusFromDb(status?: string | null): VehicleStatusUI {
  if (!status) return 'Ativo'
  if (status === 'Manutenção') return 'Em Manutenção'
  if (status === 'Inativo') return 'Inativo'
  return 'Ativo'
}

function mapRowFromDb(row: any): VehicleRecord {
  return {
    id: row.id,
    placa: row.placa,
    marca: row.marca,
    modelo: row.modelo,
    tipo: row.tipo ?? null,
    ano: row.ano ?? null,
    cor: row.cor ?? null,
    combustivel: row.combustivel ?? null,
    capacidade: row.capacidade ?? null,
    kmTotal: row.km_atual ?? null,
    status: mapStatusFromDb(row.status),
    chassi: row.chassi ?? null,
    renavam: row.renavam ?? null,
    observacoes: row.observacoes ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapToDbPayload(v: VehicleRecord): any {
  return {
    placa: v.placa,
    marca: v.marca,
    modelo: v.modelo,
    tipo: v.tipo ?? null,
    ano: v.ano ?? null,
    cor: v.cor ?? null,
    chassi: v.chassi ?? null,
    renavam: v.renavam ?? null,
    km_atual: v.kmTotal ?? null,
    combustivel: v.combustivel ?? null,
    capacidade: v.capacidade ?? null,
    status: mapStatusToDb(v.status) ?? 'Ativo',
    updated_at: new Date().toISOString(),
  }
}

export async function fetchVehicles(): Promise<VehicleRecord[]> {
  const { data, error } = await supabase
    .from('veiculos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.warn('fetchVehicles error:', error.message)
    return []
  }
  return (data || []).map(mapRowFromDb)
}

export async function createVehicle(v: VehicleRecord): Promise<VehicleRecord | null> {
  const payload = {
    ...mapToDbPayload(v),
    created_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('veiculos')
    .insert(payload)
    .select('*')
    .single()
  if (error) {
    console.error('createVehicle error:', error.message)
    return null
  }
  return mapRowFromDb(data)
}

export async function updateVehicle(id: string, updates: Partial<VehicleRecord>): Promise<boolean> {
  const { error } = await supabase
    .from('veiculos')
    .update(mapToDbPayload(updates as VehicleRecord))
    .eq('id', id)
  if (error) {
    console.error('updateVehicle error:', error.message)
    return false
  }
  return true
}

export async function deleteVehicle(id: string): Promise<boolean> {
  const { error } = await supabase.from('veiculos').delete().eq('id', id)
  if (error) {
    console.error('deleteVehicle error:', error.message)
    return false
  }
  return true
}

export function subscribeVehicles(onChange: () => void) {
  const channel = supabase
    .channel('vehicles-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'veiculos' }, () => onChange())
    .subscribe()
  return () => supabase.removeChannel(channel)
}



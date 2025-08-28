import { supabase } from '@/lib/supabaseClient'

export interface ContractRecord {
  id?: string
  nome: string // ex: Assaí Paulista
  cnpj?: string | null
  cidade?: string | null
  estado?: string | null
  endereco?: string | null
  inicio_vigencia?: string | null
  fim_vigencia?: string | null
  status?: 'Ativo' | 'Suspenso' | 'Encerrado'
  responsavel?: string | null
  custo_material?: number | null
  created_at?: string
  updated_at?: string
}

export async function fetchContracts(): Promise<ContractRecord[]> {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .order('nome', { ascending: true })
  if (error) {
    console.warn('fetchContracts error:', error.message)
    return []
  }
  return (data as ContractRecord[]) || []
}

export interface FetchContractsParams {
  search?: string
  status?: ContractRecord['status']
}

export async function fetchContractsQuery(params: FetchContractsParams = {}): Promise<ContractRecord[]> {
  let query = supabase.from('contracts').select('*').order('nome', { ascending: true })
  if (params.status) query = query.eq('status', params.status)
  if (params.search && params.search.trim()) {
    const s = `%${params.search.trim()}%`
    query = query.or(`nome.ilike.${s},cidade.ilike.${s},estado.ilike.${s},cnpj.ilike.${s},responsavel.ilike.${s}`)
  }
  const { data, error } = await query
  if (error) {
    console.warn('fetchContractsQuery error:', error.message)
    return []
  }
  return (data as ContractRecord[]) || []
}

export async function createContract(contract: ContractRecord): Promise<ContractRecord | null> {
  const { data, error } = await supabase.from('contracts').insert(contract).select('*').single()
  if (error) {
    console.error('createContract error:', error.message)
    return null
  }
  return data as ContractRecord
}

export async function updateContract(id: string, updates: Partial<ContractRecord>): Promise<boolean> {
  const { error } = await supabase.from('contracts').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) {
    console.error('updateContract error:', error.message)
    return false
  }
  return true
}

export async function deleteContract(id: string): Promise<boolean> {
  const { error } = await supabase.from('contracts').delete().eq('id', id)
  if (error) {
    console.error('deleteContract error:', error.message)
    return false
  }
  return true
}

export async function upsertContractsBulk(rows: ContractRecord[]): Promise<number> {
  if (!rows.length) return 0
  const { data, error } = await supabase.from('contracts').upsert(rows, { onConflict: 'nome' }).select('id')
  if (error) {
    console.error('upsertContractsBulk error:', error.message)
    return 0
  }
  return (data || []).length
}



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



import { supabase } from './supabase'

export type Contrato = {
  id: string
  supervisor_id: string
  nome_contrato: string
  endereco_completo: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cidade?: string
  endereco_estado?: string
  endereco_cep?: string
  encarregado_nome?: string
  encarregado_telefone?: string
  encarregado_email?: string
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export type ContratoFormData = {
  nome_contrato: string
  endereco_completo: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cidade?: string
  endereco_estado?: string
  endereco_cep?: string
  encarregado_nome?: string
  encarregado_telefone?: string
  encarregado_email?: string
  observacoes?: string
}

/**
 * Busca todos os contratos ativos do supervisor
 */
export async function fetchContratosAtivos(supervisorId: string): Promise<Contrato[]> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .select('*')
      .eq('supervisor_id', supervisorId)
      .eq('ativo', true)
      .order('nome_contrato', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
    return []
  }
}

/**
 * Busca todos os contratos do supervisor (ativos e inativos)
 */
export async function fetchTodosContratos(supervisorId: string): Promise<Contrato[]> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .select('*')
      .eq('supervisor_id', supervisorId)
      .order('nome_contrato', { ascending: true })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Erro ao buscar contratos:', error)
    return []
  }
}

/**
 * Busca um contrato específico por ID
 */
export async function fetchContratoById(contratoId: string): Promise<Contrato | null> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .select('*')
      .eq('id', contratoId)
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Erro ao buscar contrato:', error)
    return null
  }
}

/**
 * Cria um novo contrato
 */
export async function criarContrato(
  supervisorId: string,
  formData: ContratoFormData
): Promise<{ success: boolean; contrato?: Contrato; message: string }> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .insert({
        supervisor_id: supervisorId,
        ...formData,
        ativo: true
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      contrato: data,
      message: 'Contrato cadastrado com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro ao criar contrato:', error)
    return {
      success: false,
      message: error.message || 'Erro ao cadastrar contrato'
    }
  }
}

/**
 * Atualiza um contrato existente
 */
export async function atualizarContrato(
  contratoId: string,
  formData: ContratoFormData
): Promise<{ success: boolean; contrato?: Contrato; message: string }> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .update(formData)
      .eq('id', contratoId)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      contrato: data,
      message: 'Contrato atualizado com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro ao atualizar contrato:', error)
    return {
      success: false,
      message: error.message || 'Erro ao atualizar contrato'
    }
  }
}

/**
 * Desativa um contrato (soft delete)
 */
export async function desativarContrato(contratoId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contratos_supervisores')
      .update({ ativo: false })
      .eq('id', contratoId)

    if (error) throw error

    return {
      success: true,
      message: 'Contrato desativado com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro ao desativar contrato:', error)
    return {
      success: false,
      message: error.message || 'Erro ao desativar contrato'
    }
  }
}

/**
 * Reativa um contrato
 */
export async function reativarContrato(contratoId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contratos_supervisores')
      .update({ ativo: true })
      .eq('id', contratoId)

    if (error) throw error

    return {
      success: true,
      message: 'Contrato reativado com sucesso!'
    }
  } catch (error: any) {
    console.error('Erro ao reativar contrato:', error)
    return {
      success: false,
      message: error.message || 'Erro ao reativar contrato'
    }
  }
}

/**
 * Deleta permanentemente um contrato (use com cuidado!)
 */
export async function deletarContrato(contratoId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar se há pedidos vinculados a este contrato
    const { data: pedidosVinculados, error: checkError } = await supabase
      .from('pedidos_supervisores')
      .select('id')
      .eq('contrato_id', contratoId)
      .limit(1)

    if (checkError) throw checkError

    if (pedidosVinculados && pedidosVinculados.length > 0) {
      return {
        success: false,
        message: 'Não é possível deletar este contrato pois há pedidos vinculados a ele. Desative-o em vez disso.'
      }
    }

    const { error } = await supabase
      .from('contratos_supervisores')
      .delete()
      .eq('id', contratoId)

    if (error) throw error

    return {
      success: true,
      message: 'Contrato deletado permanentemente!'
    }
  } catch (error: any) {
    console.error('Erro ao deletar contrato:', error)
    return {
      success: false,
      message: error.message || 'Erro ao deletar contrato'
    }
  }
}

/**
 * Formata o endereço completo para exibição
 */
export function formatarEnderecoCompleto(contrato: Contrato): string {
  const partes: string[] = []

  if (contrato.endereco_completo) {
    partes.push(contrato.endereco_completo)
  }

  if (contrato.endereco_numero) {
    partes.push(contrato.endereco_numero)
  }

  if (contrato.endereco_bairro) {
    partes.push(contrato.endereco_bairro)
  }

  if (contrato.endereco_cidade && contrato.endereco_estado) {
    partes.push(`${contrato.endereco_cidade}/${contrato.endereco_estado}`)
  } else if (contrato.endereco_cidade) {
    partes.push(contrato.endereco_cidade)
  }

  if (contrato.endereco_cep) {
    partes.push(`CEP: ${contrato.endereco_cep}`)
  }

  return partes.join(' - ')
}

/**
 * Formata o telefone para exibição
 */
export function formatarTelefone(telefone: string): string {
  const cleaned = telefone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // Celular: (99) 99999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    // Fixo: (99) 9999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return telefone
}

/**
 * Formata o CEP para exibição
 */
export function formatarCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  
  if (cleaned.length === 8) {
    // 99999-999
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  
  return cep
}


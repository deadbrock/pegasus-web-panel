import { supabase } from './supabase'

// Tipo para contratos ATRIBUÍDOS pela logística (nova estrutura)
export type ContratoAtribuido = {
  id: string
  numero_contrato: string
  cliente: string
  tipo: string
  descricao?: string
  valor_total: number
  valor_mensal?: number
  valor_mensal_material?: number // 💰 Teto de gastos mensal
  data_inicio: string
  data_fim: string
  status: string
  responsavel?: string
  email_contato?: string
  telefone_contato?: string
  observacoes?: string
  data_atribuicao?: string
}

// Tipo para contratos CRIADOS pelo supervisor (estrutura antiga - manter compatibilidade)
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
 * 🔒 SEGURANÇA: Verifica se o contrato pertence ao supervisor
 */
export async function fetchContratoById(contratoId: string, supervisorId: string): Promise<Contrato | null> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .select('*')
      .eq('id', contratoId)
      .eq('supervisor_id', supervisorId) // 🔒 Filtro de segurança
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
 * 🔒 SEGURANÇA: Verifica se o contrato pertence ao supervisor antes de atualizar
 */
export async function atualizarContrato(
  contratoId: string,
  supervisorId: string,
  formData: ContratoFormData
): Promise<{ success: boolean; contrato?: Contrato; message: string }> {
  try {
    const { data, error } = await supabase
      .from('contratos_supervisores')
      .update(formData)
      .eq('id', contratoId)
      .eq('supervisor_id', supervisorId) // 🔒 Filtro de segurança
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
 * 🔒 SEGURANÇA: Verifica se o contrato pertence ao supervisor antes de desativar
 */
export async function desativarContrato(contratoId: string, supervisorId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contratos_supervisores')
      .update({ ativo: false })
      .eq('id', contratoId)
      .eq('supervisor_id', supervisorId) // 🔒 Filtro de segurança

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
 * 🔒 SEGURANÇA: Verifica se o contrato pertence ao supervisor antes de reativar
 */
export async function reativarContrato(contratoId: string, supervisorId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('contratos_supervisores')
      .update({ ativo: true })
      .eq('id', contratoId)
      .eq('supervisor_id', supervisorId) // 🔒 Filtro de segurança

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

// =====================================================
// NOVAS FUNÇÕES: Contratos Atribuídos pela Logística
// =====================================================

/**
 * 🆕 Busca contratos ATRIBUÍDOS pela logística ao supervisor
 * Esta é a nova forma de trabalhar - contratos gerenciados centralmente
 */
export async function fetchContratosAtribuidosLogistica(supervisorId: string): Promise<ContratoAtribuido[]> {
  try {
    // Buscar via API do painel web
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/contratos-supervisor?supervisor_id=${supervisorId}`)
    
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao buscar contratos')
    }

    console.log(`✅ ${result.total} contrato(s) atribuído(s) pela logística`)
    return result.contratos || []
  } catch (error) {
    console.error('❌ Erro ao buscar contratos atribuídos:', error)
    
    // Fallback: buscar diretamente do Supabase
    console.log('⚠️ Tentando buscar diretamente do Supabase...')
    
    const { data, error: supabaseError } = await supabase
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
          data_atribuicao,
          ativo
        )
      `)
      .eq('contratos_supervisores_atribuicao.supervisor_id', supervisorId)
      .eq('contratos_supervisores_atribuicao.ativo', true)
      .eq('status', 'Ativo')
      .order('cliente', { ascending: true })

    if (supabaseError) {
      console.error('❌ Erro no fallback do Supabase:', supabaseError)
      return []
    }

    // Transformar dados
    const contratos = (data || []).map((item: any) => {
      const { contratos_supervisores_atribuicao, ...contrato } = item
      return {
        ...contrato,
        data_atribuicao: contratos_supervisores_atribuicao?.[0]?.data_atribuicao
      }
    })

    console.log(`✅ Fallback: ${contratos.length} contrato(s) encontrado(s)`)
    return contratos
  }
}

/**
 * 🆕 Busca TODOS os contratos do supervisor (atribuídos + criados por ele)
 * Retorna uma lista unificada
 */
export async function fetchTodosContratosUnificados(supervisorId: string): Promise<{
  atribuidos: ContratoAtribuido[]
  proprios: Contrato[]
  total: number
}> {
  const [atribuidos, proprios] = await Promise.all([
    fetchContratosAtribuidosLogistica(supervisorId),
    fetchContratosAtivos(supervisorId)
  ])

  return {
    atribuidos,
    proprios,
    total: atribuidos.length + proprios.length
  }
}

/**
 * 🆕 Sincroniza configurações do painel web (contratos + período)
 */
export async function sincronizarConfiguracoes(supervisorId: string): Promise<{
  success: boolean
  contratos?: ContratoAtribuido[]
  periodo_config?: any
  message: string
}> {
  try {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
    
    // Sincronizar contratos
    const responseContratos = await fetch(`${apiUrl}/api/contratos-supervisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supervisor_id: supervisorId,
        action: 'sync_contratos'
      })
    })

    // Sincronizar período
    const responsePeriodo = await fetch(`${apiUrl}/api/contratos-supervisor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supervisor_id: supervisorId,
        action: 'sync_periodo'
      })
    })

    const [contratosData, periodoData] = await Promise.all([
      responseContratos.json(),
      responsePeriodo.json()
    ])

    return {
      success: true,
      contratos: contratosData.contratos || [],
      periodo_config: periodoData.periodo_config,
      message: '✅ Configurações sincronizadas com sucesso'
    }
  } catch (error) {
    console.error('Erro ao sincronizar configurações:', error)
    return {
      success: false,
      message: '❌ Erro ao sincronizar configurações'
    }
  }
}

/**
 * 🆕 Formata informações do contrato atribuído para exibição
 */
export function formatarContratoAtribuidoCompleto(contrato: ContratoAtribuido): string {
  const partes: string[] = [contrato.cliente]

  if (contrato.tipo) {
    partes.push(`Tipo: ${contrato.tipo}`)
  }

  if (contrato.valor_mensal_material) {
    partes.push(`💰 Teto mensal: R$ ${contrato.valor_mensal_material.toFixed(2)}`)
  }

  if (contrato.responsavel) {
    partes.push(`Responsável: ${contrato.responsavel}`)
  }

  return partes.join(' | ')
}


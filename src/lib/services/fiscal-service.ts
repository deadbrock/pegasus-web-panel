import { supabase } from '@/lib/supabaseClient'
import { 
  NotaFiscal, 
  NotaFiscalInsert, 
  NotaFiscalUpdate,
  FiltroNotaFiscal,
  FiscalStats,
  Fornecedor,
  FornecedorInsert,
  FornecedorUpdate,
  ItemNotaFiscal,
  ItemNotaFiscalInsert,
  ProcessamentoNF,
  DadosXML
} from '@/types/fiscal'

class FiscalService {
  async getNotasFiscais(filtros: FiltroNotaFiscal = {}): Promise<NotaFiscal[]> {
    try {
      let query = supabase
        .from('notas_fiscais')
        .select(`
          *,
          fornecedor:fornecedores(id, razao_social, nome_fantasia, cpf_cnpj)
        `)
        .order('data_emissao', { ascending: false })

      // Aplicar filtros
      if (filtros.status && filtros.status.length > 0) {
        query = query.in('status', filtros.status)
      }
      
      if (filtros.tipo_operacao && filtros.tipo_operacao.length > 0) {
        query = query.in('tipo_operacao', filtros.tipo_operacao)
      }
      
      if (filtros.fornecedor_id) {
        query = query.eq('fornecedor_id', filtros.fornecedor_id)
      }
      
      if (filtros.numero) {
        query = query.ilike('numero', `%${filtros.numero}%`)
      }
      
      if (filtros.chave_acesso) {
        query = query.ilike('chave_acesso', `%${filtros.chave_acesso}%`)
      }
      
      if (filtros.data_inicio && filtros.data_fim) {
        query = query
          .gte('data_emissao', filtros.data_inicio)
          .lte('data_emissao', filtros.data_fim)
      } else if (filtros.data_inicio) {
        query = query.gte('data_emissao', filtros.data_inicio)
      } else if (filtros.data_fim) {
        query = query.lte('data_emissao', filtros.data_fim)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Erro ao buscar notas fiscais:', error)
        throw new Error('Erro ao buscar notas fiscais')
      }
      
      return data || []
    } catch (error) {
      console.error('Erro no serviço fiscal:', error)
      return []
    }
  }

  async getNotaFiscalById(id: string): Promise<NotaFiscal | null> {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select(`
          *,
          fornecedor:fornecedores(id, razao_social, nome_fantasia, cpf_cnpj),
          itens:itens_nota_fiscal(
            id,
            produto_codigo,
            quantidade,
            valor_unitario,
            valor_total,
            cfop,
            ncm,
            processado
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Erro ao buscar nota fiscal:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Erro ao buscar nota fiscal:', error)
      return null
    }
  }

  async createNotaFiscal(nota: NotaFiscalInsert): Promise<NotaFiscal> {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .insert(nota)
        .select(`
          *,
          fornecedor:fornecedores(id, razao_social, nome_fantasia, cpf_cnpj)
        `)
        .single()
      
      if (error) {
        console.error('Erro ao criar nota fiscal:', error)
        throw new Error('Erro ao criar nota fiscal')
      }
      
      return data
    } catch (error) {
      console.error('Erro ao criar nota fiscal:', error)
      throw error
    }
  }

  async updateNotaFiscal(id: string, nota: NotaFiscalUpdate): Promise<NotaFiscal> {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .update({
          ...nota,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          fornecedor:fornecedores(id, razao_social, nome_fantasia, cpf_cnpj)
        `)
        .single()
      
      if (error) {
        console.error('Erro ao atualizar nota fiscal:', error)
        throw new Error('Erro ao atualizar nota fiscal')
      }
      
      return data
    } catch (error) {
      console.error('Erro ao atualizar nota fiscal:', error)
      throw error
    }
  }

  async deleteNotaFiscal(id: string): Promise<boolean> {
    try {
      // Primeiro deletar os itens da nota
      await supabase
        .from('itens_nota_fiscal')
        .delete()
        .eq('nota_fiscal_id', id)

      // Depois deletar a nota
      const { error } = await supabase
        .from('notas_fiscais')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Erro ao deletar nota fiscal:', error)
        throw new Error('Erro ao deletar nota fiscal')
      }
      
      return true
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error)
      return false
    }
  }

  async getStats(): Promise<FiscalStats> {
    try {
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      
      // Buscar notas do mês atual
      const { data: notasMes, error: errorNotas } = await supabase
        .from('notas_fiscais')
        .select('status, tipo_operacao, valor_total, valor_icms')
        .gte('data_emissao', inicioMes.toISOString().split('T')[0])

      if (errorNotas) throw errorNotas

      // Buscar fornecedores ativos
      const { data: fornecedores, error: errorFornecedores } = await supabase
        .from('fornecedores')
        .select('id')
        .eq('ativo', true)

      if (errorFornecedores) throw errorFornecedores

      const totalNotas = notasMes.length
      const notasPendentes = notasMes.filter(n => n.status === 'Pendente').length
      const notasProcessadas = notasMes.filter(n => n.status === 'Processada').length
      const valorTotalMes = notasMes.reduce((sum, n) => sum + (n.valor_total || 0), 0)
      const valorIcmsMes = notasMes.reduce((sum, n) => sum + (n.valor_icms || 0), 0)
      const notasEntrada = notasMes.filter(n => n.tipo_operacao === 'entrada').length
      const notasSaida = notasMes.filter(n => n.tipo_operacao === 'saida').length

      return {
        total_notas: totalNotas,
        notas_pendentes: notasPendentes,
        notas_processadas: notasProcessadas,
        valor_total_mes: valorTotalMes,
        valor_icms_mes: valorIcmsMes,
        notas_entrada: notasEntrada,
        notas_saida: notasSaida,
        fornecedores_ativos: fornecedores.length,
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        total_notas: 0,
        notas_pendentes: 0,
        notas_processadas: 0,
        valor_total_mes: 0,
        valor_icms_mes: 0,
        notas_entrada: 0,
        notas_saida: 0,
        fornecedores_ativos: 0,
      }
    }
  }

  // Fornecedores
  async getFornecedores(): Promise<Fornecedor[]> {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .order('razao_social')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error)
      return []
    }
  }

  async createFornecedor(fornecedor: FornecedorInsert): Promise<Fornecedor> {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert(fornecedor)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error)
      throw error
    }
  }

  async updateFornecedor(id: string, fornecedor: FornecedorUpdate): Promise<Fornecedor> {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .update({
          ...fornecedor,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error)
      throw error
    }
  }

  // Itens de Nota Fiscal
  async getItensNotaFiscal(notaFiscalId: string): Promise<ItemNotaFiscal[]> {
    try {
      const { data, error } = await supabase
        .from('itens_nota_fiscal')
        .select('*')
        .eq('nota_fiscal_id', notaFiscalId)
        .order('created_at')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao buscar itens da nota:', error)
      return []
    }
  }

  async addItemNotaFiscal(item: ItemNotaFiscalInsert): Promise<ItemNotaFiscal> {
    try {
      const { data, error } = await supabase
        .from('itens_nota_fiscal')
        .insert(item)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
      throw error
    }
  }

  async deleteItemNotaFiscal(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('itens_nota_fiscal')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao deletar item:', error)
      return false
    }
  }

  // Processamento de NF
  async processarNotaFiscal(processamento: ProcessamentoNF): Promise<boolean> {
    try {
      // Atualizar status da nota para Processada
      await this.updateNotaFiscal(processamento.nota_id, {
        status: 'Processada',
        data_entrada: new Date().toISOString(),
        observacoes: processamento.observacoes
      })

      // Se solicitado, marcar itens como processados
      if (processamento.processar_estoque) {
        const { error } = await supabase
          .from('itens_nota_fiscal')
          .update({ processado: true })
          .eq('nota_fiscal_id', processamento.nota_id)
        
        if (error) throw error
      }

      return true
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error)
      return false
    }
  }

  // Validação de XML (simulação)
  async validarXML(arquivoXML: File): Promise<DadosXML | null> {
    try {
      // Simular processamento de XML
      // Em uma implementação real, aqui seria feito o parsing do XML da NFe
      
      const chaveAcesso = `35${Date.now()}${Math.random().toString().substr(2, 8)}`
      
      return {
        chave_acesso: chaveAcesso,
        numero: Math.floor(Math.random() * 999999).toString(),
        serie: '001',
        data_emissao: new Date().toISOString().split('T')[0],
        cnpj_emitente: '12.345.678/0001-90',
        razao_social_emitente: 'Empresa Teste LTDA',
        valor_total: Math.random() * 10000 + 1000,
        itens: [
          {
            codigo: 'PROD001',
            descricao: 'Produto de Teste',
            quantidade: Math.floor(Math.random() * 10) + 1,
            valor_unitario: Math.random() * 100 + 10,
            valor_total: 0,
            cfop: '5102',
            ncm: '12345678'
          }
        ].map(item => ({
          ...item,
          valor_total: item.quantidade * item.valor_unitario
        }))
      }
    } catch (error) {
      console.error('Erro ao validar XML:', error)
      return null
    }
  }

  // Buscar por chave de acesso
  async buscarPorChaveAcesso(chaveAcesso: string): Promise<NotaFiscal | null> {
    try {
      const { data, error } = await supabase
        .from('notas_fiscais')
        .select(`
          *,
          fornecedor:fornecedores(id, razao_social, nome_fantasia, cpf_cnpj),
          itens:itens_nota_fiscal(*)
        `)
        .eq('chave_acesso', chaveAcesso)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar por chave de acesso:', error)
        return null
      }
      
      return data || null
    } catch (error) {
      console.error('Erro ao buscar por chave de acesso:', error)
      return null
    }
  }

  // Relatórios
  async getRelatorioMensal(mes: number, ano: number): Promise<any> {
    try {
      const dataInicio = new Date(ano, mes - 1, 1).toISOString().split('T')[0]
      const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('notas_fiscais')
        .select(`
          *,
          fornecedor:fornecedores(razao_social)
        `)
        .gte('data_emissao', dataInicio)
        .lte('data_emissao', dataFim)
        .order('data_emissao')

      if (error) throw error

      return {
        notas: data,
        total_valor: data.reduce((sum, n) => sum + n.valor_total, 0),
        total_icms: data.reduce((sum, n) => sum + (n.valor_icms || 0), 0),
        quantidade: data.length
      }
    } catch (error) {
      console.error('Erro ao gerar relatório mensal:', error)
      return null
    }
  }
}

export const fiscalService = new FiscalService() 
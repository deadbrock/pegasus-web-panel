export interface NotaFiscal {
  id: string
  numero: string
  serie: string
  chave_acesso: string
  cnpj: string
  razao_social: string
  fornecedor_id?: string
  fornecedor?: Fornecedor
  data_emissao: string
  data_entrada?: string
  valor_total: number
  base_icms?: number
  valor_icms?: number
  valor_ipi?: number
  valor_pis?: number
  valor_cofins?: number
  tipo_operacao: 'entrada' | 'saida'
  cliente_id?: string
  pedido_id?: string
  observacoes?: string
  status: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
  xml_path?: string
  created_at: string
  updated_at: string
  itens?: ItemNotaFiscal[]
}

export interface NotaFiscalInsert {
  numero: string
  serie: string
  chave_acesso: string
  cnpj: string
  razao_social: string
  fornecedor_id?: string
  data_emissao: string
  data_entrada?: string
  valor_total: number
  base_icms?: number
  valor_icms?: number
  valor_ipi?: number
  valor_pis?: number
  valor_cofins?: number
  tipo_operacao: 'entrada' | 'saida'
  cliente_id?: string
  pedido_id?: string
  observacoes?: string
  status?: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
  xml_path?: string
}

export interface NotaFiscalUpdate {
  numero?: string
  serie?: string
  chave_acesso?: string
  cnpj?: string
  razao_social?: string
  fornecedor_id?: string
  data_emissao?: string
  data_entrada?: string
  valor_total?: number
  base_icms?: number
  valor_icms?: number
  valor_ipi?: number
  valor_pis?: number
  valor_cofins?: number
  tipo_operacao?: 'entrada' | 'saida'
  cliente_id?: string
  pedido_id?: string
  observacoes?: string
  status?: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
  xml_path?: string
}

export interface ItemNotaFiscal {
  id: string
  nota_fiscal_id: string
  produto_codigo: string
  produto?: {
    codigo: string
    descricao: string
    unidade: string
  }
  quantidade: number
  valor_unitario: number
  valor_total: number
  cfop?: string
  ncm?: string
  cst_icms?: string
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  processado: boolean
  created_at: string
}

export interface ItemNotaFiscalInsert {
  nota_fiscal_id: string
  produto_codigo: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  cfop?: string
  ncm?: string
  cst_icms?: string
  cst_ipi?: string
  cst_pis?: string
  cst_cofins?: string
  processado?: boolean
}

export interface Fornecedor {
  id: string
  razao_social: string
  nome_fantasia?: string
  cpf_cnpj: string
  rg_ie?: string
  endereco?: string
  telefone?: string
  email?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface FornecedorInsert {
  razao_social: string
  nome_fantasia?: string
  cpf_cnpj: string
  rg_ie?: string
  endereco?: string
  telefone?: string
  email?: string
  ativo?: boolean
}

export interface FornecedorUpdate {
  razao_social?: string
  nome_fantasia?: string
  cpf_cnpj?: string
  rg_ie?: string
  endereco?: string
  telefone?: string
  email?: string
  ativo?: boolean
}

export interface FiscalStats {
  total_notas: number
  notas_pendentes: number
  notas_processadas: number
  valor_total_mes: number
  valor_icms_mes: number
  notas_entrada: number
  notas_saida: number
  fornecedores_ativos: number
}

export interface FiltroNotaFiscal {
  status?: string[]
  tipo_operacao?: string[]
  fornecedor_id?: string
  data_inicio?: string
  data_fim?: string
  numero?: string
  chave_acesso?: string
}

export interface ProcessamentoNF {
  nota_id: string
  processar_estoque: boolean
  criar_movimentacoes: boolean
  observacoes?: string
}

export interface DadosXML {
  chave_acesso: string
  numero: string
  serie: string
  data_emissao: string
  cnpj_emitente: string
  razao_social_emitente: string
  valor_total: number
  itens: ItemXML[]
}

export interface ItemXML {
  codigo: string
  descricao: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  cfop: string
  ncm: string
} 
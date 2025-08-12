export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Tabela de Manutenções
      manutencoes: {
        Row: {
          id: string
          veiculo_id: string
          tipo: 'Preventiva' | 'Corretiva' | 'Revisão' | 'Agendada' | 'Outro'
          descricao: string | null
          data_prevista: string
          data_realizada: string | null
          status: 'Pendente' | 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada'
          custo_total: number | null
          observacoes: string | null
          prioridade: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          veiculo_id: string
          tipo: 'Preventiva' | 'Corretiva' | 'Revisão' | 'Agendada' | 'Outro'
          descricao?: string | null
          data_prevista: string
          data_realizada?: string | null
          status?: 'Pendente' | 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada'
          custo_total?: number | null
          observacoes?: string | null
          prioridade?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          veiculo_id?: string
          tipo?: 'Preventiva' | 'Corretiva' | 'Revisão' | 'Agendada' | 'Outro'
          descricao?: string | null
          data_prevista?: string
          data_realizada?: string | null
          status?: 'Pendente' | 'Agendada' | 'Em Andamento' | 'Concluída' | 'Cancelada'
          custo_total?: number | null
          observacoes?: string | null
          prioridade?: number | null
          updated_at?: string
        }
      }
      
      // Tabela de Veículos
      veiculos: {
        Row: {
          id: string
          placa: string
          modelo: string
          marca: string
          ano: number | null
          cor: string | null
          chassi: string | null
          renavam: string | null
          km_atual: number | null
          status: 'Ativo' | 'Inativo' | 'Manutenção'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          placa: string
          modelo: string
          marca: string
          ano?: number | null
          cor?: string | null
          chassi?: string | null
          renavam?: string | null
          km_atual?: number | null
          status?: 'Ativo' | 'Inativo' | 'Manutenção'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          placa?: string
          modelo?: string
          marca?: string
          ano?: number | null
          cor?: string | null
          chassi?: string | null
          renavam?: string | null
          km_atual?: number | null
          status?: 'Ativo' | 'Inativo' | 'Manutenção'
          updated_at?: string
        }
      }
      
      // Tabela de Motoristas
      motoristas: {
        Row: {
          id: string
          nome: string
          cpf: string
          cnh: string
          telefone: string | null
          email: string | null
          endereco: string | null
          status: 'Ativo' | 'Inativo'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          cpf: string
          cnh: string
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          status?: 'Ativo' | 'Inativo'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cpf?: string
          cnh?: string
          telefone?: string | null
          email?: string | null
          endereco?: string | null
          status?: 'Ativo' | 'Inativo'
          updated_at?: string
        }
      }
      
             // Tabela de Pedidos
       pedidos: {
         Row: {
           id: string
           cliente_id: string | null
           motorista_id: string | null
           veiculo_id: string | null
           origem: string
           destino: string
           data_pedido: string
           data_entrega_prevista: string
           data_entrega_realizada: string | null
           status: 'Pendente' | 'Em Andamento' | 'Entregue' | 'Cancelado'
           valor: number | null
           observacoes: string | null
           created_at: string
           updated_at: string
         }
         Insert: {
           id?: string
           cliente_id?: string | null
           motorista_id?: string | null
           veiculo_id?: string | null
           origem: string
           destino: string
           data_pedido: string
           data_entrega_prevista: string
           data_entrega_realizada?: string | null
           status?: 'Pendente' | 'Em Andamento' | 'Entregue' | 'Cancelado'
           valor?: number | null
           observacoes?: string | null
           created_at?: string
           updated_at?: string
         }
         Update: {
           id?: string
           cliente_id?: string | null
           motorista_id?: string | null
           veiculo_id?: string | null
           origem?: string
           destino?: string
           data_pedido?: string
           data_entrega_prevista?: string
           data_entrega_realizada?: string | null
           status?: 'Pendente' | 'Em Andamento' | 'Entregue' | 'Cancelado'
           valor?: number | null
           observacoes?: string | null
           updated_at?: string
         }
       }

       // Tabela de Notas Fiscais
       notas_fiscais: {
         Row: {
           id: string
           numero: string
           serie: string
           chave_acesso: string
           cnpj: string
           razao_social: string
           fornecedor_id: string | null
           data_emissao: string
           data_entrada: string | null
           valor_total: number
           base_icms: number | null
           valor_icms: number | null
           valor_ipi: number | null
           valor_pis: number | null
           valor_cofins: number | null
           tipo_operacao: 'entrada' | 'saida'
           cliente_id: string | null
           pedido_id: string | null
           observacoes: string | null
           status: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
           xml_path: string | null
           created_at: string
           updated_at: string
         }
         Insert: {
           id?: string
           numero: string
           serie: string
           chave_acesso: string
           cnpj: string
           razao_social: string
           fornecedor_id?: string | null
           data_emissao: string
           data_entrada?: string | null
           valor_total: number
           base_icms?: number | null
           valor_icms?: number | null
           valor_ipi?: number | null
           valor_pis?: number | null
           valor_cofins?: number | null
           tipo_operacao: 'entrada' | 'saida'
           cliente_id?: string | null
           pedido_id?: string | null
           observacoes?: string | null
           status?: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
           xml_path?: string | null
           created_at?: string
           updated_at?: string
         }
         Update: {
           id?: string
           numero?: string
           serie?: string
           chave_acesso?: string
           cnpj?: string
           razao_social?: string
           fornecedor_id?: string | null
           data_emissao?: string
           data_entrada?: string | null
           valor_total?: number
           base_icms?: number | null
           valor_icms?: number | null
           valor_ipi?: number | null
           valor_pis?: number | null
           valor_cofins?: number | null
           tipo_operacao?: 'entrada' | 'saida'
           cliente_id?: string | null
           pedido_id?: string | null
           observacoes?: string | null
           status?: 'Pendente' | 'Processada' | 'Cancelada' | 'Rejeitada' | 'Ativa'
           xml_path?: string | null
           updated_at?: string
         }
       }

       // Tabela de Fornecedores
       fornecedores: {
         Row: {
           id: string
           razao_social: string
           nome_fantasia: string | null
           cpf_cnpj: string
           rg_ie: string | null
           endereco: string | null
           telefone: string | null
           email: string | null
           ativo: boolean
           created_at: string
           updated_at: string
         }
         Insert: {
           id?: string
           razao_social: string
           nome_fantasia?: string | null
           cpf_cnpj: string
           rg_ie?: string | null
           endereco?: string | null
           telefone?: string | null
           email?: string | null
           ativo?: boolean
           created_at?: string
           updated_at?: string
         }
         Update: {
           id?: string
           razao_social?: string
           nome_fantasia?: string | null
           cpf_cnpj?: string
           rg_ie?: string | null
           endereco?: string | null
           telefone?: string | null
           email?: string | null
           ativo?: boolean
           updated_at?: string
         }
       }

       // Tabela de Itens de Nota Fiscal
       itens_nota_fiscal: {
         Row: {
           id: string
           nota_fiscal_id: string
           produto_codigo: string
           quantidade: number
           valor_unitario: number
           valor_total: number
           cfop: string | null
           ncm: string | null
           cst_icms: string | null
           cst_ipi: string | null
           cst_pis: string | null
           cst_cofins: string | null
           processado: boolean
           created_at: string
         }
         Insert: {
           id?: string
           nota_fiscal_id: string
           produto_codigo: string
           quantidade: number
           valor_unitario: number
           valor_total: number
           cfop?: string | null
           ncm?: string | null
           cst_icms?: string | null
           cst_ipi?: string | null
           cst_pis?: string | null
           cst_cofins?: string | null
           processado?: boolean
           created_at?: string
         }
         Update: {
           id?: string
           nota_fiscal_id?: string
           produto_codigo?: string
           quantidade?: number
           valor_unitario?: number
           valor_total?: number
           cfop?: string | null
           ncm?: string | null
           cst_icms?: string | null
           cst_ipi?: string | null
           cst_pis?: string | null
           cst_cofins?: string | null
           processado?: boolean
         }
       }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Types auxiliares
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Tipos específicos das entidades
export type Manutencao = Tables<'manutencoes'> & {
  veiculo?: {
    id: string
    placa: string
    modelo: string
    marca: string
  }
}
export type ManutencaoInsert = TablesInsert<'manutencoes'>
export type ManutencaoUpdate = TablesUpdate<'manutencoes'>

export type Veiculo = Tables<'veiculos'>
export type Motorista = Tables<'motoristas'>
export type Pedido = Tables<'pedidos'>

// Interfaces para filtros
export interface ManutencaoFilter {
  veiculo_id?: string
  status?: string
  tipo?: string
  data_inicio?: string
  data_fim?: string
} 
export interface StockProduct {
  id: number
  codigo: string
  nome: string
  categoria: string
  quantidade: number
  estoqueMinimo: number
  unidade: string
  valorUnitario: number
  localizacao: string
  fornecedor: string
  ultimaMovimentacao: string
}

// Mock inicial; substituir por dados vindos do Supabase quando disponível
export const stockData: StockProduct[] = [
  {
    id: 1,
    codigo: 'PRD001',
    nome: 'Parafuso M6x20',
    categoria: 'Fixação',
    quantidade: 850,
    estoqueMinimo: 100,
    unidade: 'UN',
    valorUnitario: 0.25,
    localizacao: 'A1-B3',
    fornecedor: 'Parafusos ABC',
    ultimaMovimentacao: '2024-01-15'
  },
  {
    id: 2,
    codigo: 'PRD002',
    nome: 'Óleo Lubrificante 1L',
    categoria: 'Lubrificantes',
    quantidade: 45,
    estoqueMinimo: 50,
    unidade: 'UN',
    valorUnitario: 18.50,
    localizacao: 'C2-A1',
    fornecedor: 'Petróleo XYZ',
    ultimaMovimentacao: '2024-01-14'
  },
  {
    id: 3,
    codigo: 'PRD003',
    nome: 'Filtro de Ar',
    categoria: 'Filtros',
    quantidade: 15,
    estoqueMinimo: 25,
    unidade: 'UN',
    valorUnitario: 45.90,
    localizacao: 'B1-C2',
    fornecedor: 'Filtros Brasil',
    ultimaMovimentacao: '2024-01-13'
  },
  {
    id: 4,
    codigo: 'PRD004',
    nome: 'Pneu 205/55R16',
    categoria: 'Pneus',
    quantidade: 8,
    estoqueMinimo: 12,
    unidade: 'UN',
    valorUnitario: 320.00,
    localizacao: 'D1-A1',
    fornecedor: 'Pneus Premium',
    ultimaMovimentacao: '2024-01-12'
  },
  {
    id: 5,
    codigo: 'PRD005',
    nome: 'Bateria 12V 60Ah',
    categoria: 'Elétricos',
    quantidade: 25,
    estoqueMinimo: 15,
    unidade: 'UN',
    valorUnitario: 280.00,
    localizacao: 'E1-B2',
    fornecedor: 'Energia Plus',
    ultimaMovimentacao: '2024-01-11'
  },
  {
    id: 6,
    codigo: 'PRD006',
    nome: 'Cabo de Vela',
    categoria: 'Elétricos',
    quantidade: 3,
    estoqueMinimo: 10,
    unidade: 'UN',
    valorUnitario: 85.00,
    localizacao: 'E2-C1',
    fornecedor: 'Peças Auto',
    ultimaMovimentacao: '2024-01-10'
  }
]

// Colunas obrigatórias alinhadas com o banco de dados
export const REQUIRED_COLUMNS = [
  'codigo',
  'nome',
  'categoria',
  'unidade',
  'estoque_minimo',
  'estoque_atual',
  'preco_unitario'
] as const

// Colunas opcionais
export const OPTIONAL_COLUMNS = [
  'localizacao',
  'fornecedor',
  'estoque_maximo',
  'data_validade',
  'lote',
  'descricao',
  'observacoes'
] as const



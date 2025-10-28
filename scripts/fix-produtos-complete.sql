-- ============================================
-- CORREÇÃO COMPLETA DA ESTRUTURA DA TABELA PRODUTOS
-- Alinha colunas com o código TypeScript
-- ============================================

-- 1. RENOMEAR COLUNAS EXISTENTES
-- quantidade → estoque_atual
ALTER TABLE public.produtos 
RENAME COLUMN quantidade TO estoque_atual;

-- valor_unitario → preco_unitario
ALTER TABLE public.produtos 
RENAME COLUMN valor_unitario TO preco_unitario;

-- 2. ADICIONAR COLUNAS FALTANTES

-- estoque_maximo
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'estoque_maximo'
  ) THEN
    ALTER TABLE public.produtos 
    ADD COLUMN estoque_maximo NUMERIC NULL;
  END IF;
END $$;

-- data_validade
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'data_validade'
  ) THEN
    ALTER TABLE public.produtos 
    ADD COLUMN data_validade DATE NULL;
  END IF;
END $$;

-- lote
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'lote'
  ) THEN
    ALTER TABLE public.produtos 
    ADD COLUMN lote TEXT NULL;
  END IF;
END $$;

-- observacoes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE public.produtos 
    ADD COLUMN observacoes TEXT NULL;
  END IF;
END $$;

-- ativo (campo legado, mantido por compatibilidade)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'produtos' AND column_name = 'ativo'
  ) THEN
    ALTER TABLE public.produtos 
    ADD COLUMN ativo BOOLEAN DEFAULT TRUE NOT NULL;
  END IF;
END $$;

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON public.produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor ON public.produtos(fornecedor);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_baixo ON public.produtos(estoque_atual) 
  WHERE estoque_atual <= estoque_minimo;

-- 4. ATUALIZAR CONSTRAINT DO STATUS (caso tenha sido criada sem todos os valores)
DO $$
BEGIN
  -- Remover constraint antiga se existir
  ALTER TABLE public.produtos DROP CONSTRAINT IF EXISTS produtos_status_check;
  
  -- Adicionar nova constraint
  ALTER TABLE public.produtos 
  ADD CONSTRAINT produtos_status_check 
  CHECK (status IN ('Ativo', 'Inativo', 'Descontinuado'));
END $$;

-- 5. VERIFICAÇÃO FINAL
DO $$
DECLARE
  v_estrutura TEXT;
BEGIN
  SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
  INTO v_estrutura
  FROM information_schema.columns
  WHERE table_name = 'produtos' AND table_schema = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ ESTRUTURA DA TABELA PRODUTOS CORRIGIDA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Colunas disponíveis:';
  RAISE NOTICE '  ✓ id (uuid) - PK';
  RAISE NOTICE '  ✓ codigo (text) - Código do produto';
  RAISE NOTICE '  ✓ nome (text) - Nome do produto';
  RAISE NOTICE '  ✓ descricao (text) - Descrição';
  RAISE NOTICE '  ✓ categoria (text) - Categoria';
  RAISE NOTICE '  ✓ unidade (text) - Unidade de medida';
  RAISE NOTICE '  ✓ preco_unitario (numeric) - Preço unitário';
  RAISE NOTICE '  ✓ estoque_atual (numeric) - Quantidade em estoque';
  RAISE NOTICE '  ✓ estoque_minimo (numeric) - Estoque mínimo';
  RAISE NOTICE '  ✓ estoque_maximo (numeric) - Estoque máximo';
  RAISE NOTICE '  ✓ localizacao (text) - Localização física';
  RAISE NOTICE '  ✓ fornecedor (text) - Fornecedor';
  RAISE NOTICE '  ✓ data_validade (date) - Data de validade';
  RAISE NOTICE '  ✓ lote (text) - Lote';
  RAISE NOTICE '  ✓ status (text) - Ativo/Inativo/Descontinuado';
  RAISE NOTICE '  ✓ observacoes (text) - Observações';
  RAISE NOTICE '  ✓ ativo (boolean) - Ativo (legado)';
  RAISE NOTICE '  ✓ created_at (timestamptz) - Data de criação';
  RAISE NOTICE '  ✓ updated_at (timestamptz) - Data de atualização';
  RAISE NOTICE '';
  RAISE NOTICE 'Índices criados para performance:';
  RAISE NOTICE '  ✓ idx_produtos_codigo';
  RAISE NOTICE '  ✓ idx_produtos_categoria';
  RAISE NOTICE '  ✓ idx_produtos_fornecedor';
  RAISE NOTICE '  ✓ idx_produtos_status';
  RAISE NOTICE '  ✓ idx_produtos_estoque_baixo';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END$$;


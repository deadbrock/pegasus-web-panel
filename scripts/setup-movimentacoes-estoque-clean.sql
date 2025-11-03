-- ============================================================================
-- VERSÃO CLEAN: Remove e recria tudo do zero
-- ============================================================================

-- PASSO 1: Remover triggers e funções antigas
DROP TRIGGER IF EXISTS trigger_registrar_movimentacao_estoque ON produtos;
DROP TRIGGER IF EXISTS trigger_update_movimentacoes_estoque_updated_at ON movimentacoes_estoque;
DROP FUNCTION IF EXISTS registrar_movimentacao_estoque();
DROP FUNCTION IF EXISTS update_movimentacoes_estoque_updated_at();

-- PASSO 2: Remover tabela antiga se existir
DROP TABLE IF EXISTS movimentacoes_estoque CASCADE;

DO $$
BEGIN
  RAISE NOTICE '🗑️  Tabela antiga removida (se existia)';
END $$;

-- PASSO 3: Verificar se produtos existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'produtos') THEN
    RAISE EXCEPTION '❌ Tabela produtos não encontrada! Crie a tabela produtos primeiro.';
  END IF;
  
  RAISE NOTICE '✅ Tabela produtos encontrada!';
END $$;

-- ============================================================================
-- PASSO 4: CRIAR TABELA movimentacoes_estoque DO ZERO
-- ============================================================================

CREATE TABLE movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento com produto
  produto_id UUID NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  
  -- Tipo de movimentação
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'transferencia')),
  
  -- Quantidades
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  estoque_anterior INTEGER,
  estoque_novo INTEGER,
  
  -- Informações adicionais
  motivo TEXT,
  documento VARCHAR(100),
  usuario VARCHAR(255),
  
  -- Timestamps
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DO $$
BEGIN
  RAISE NOTICE '✅ Tabela movimentacoes_estoque criada!';
END $$;

-- ============================================================================
-- PASSO 5: CRIAR ÍNDICES
-- ============================================================================

CREATE INDEX idx_movimentacoes_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_estoque(data_movimentacao DESC);
CREATE INDEX idx_movimentacoes_created_at ON movimentacoes_estoque(created_at DESC);

DO $$
BEGIN
  RAISE NOTICE '✅ Índices criados!';
END $$;

-- ============================================================================
-- PASSO 6: COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE movimentacoes_estoque IS 'Registra todas as movimentações de estoque';
COMMENT ON COLUMN movimentacoes_estoque.tipo IS 'Tipo: entrada, saida, ajuste, transferencia';
COMMENT ON COLUMN movimentacoes_estoque.quantidade IS 'Quantidade movimentada (sempre positivo)';

-- ============================================================================
-- PASSO 7: RLS (Row Level Security)
-- ============================================================================

ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Política: Todos autenticados podem ver
CREATE POLICY "Usuarios podem ver movimentações"
  ON movimentacoes_estoque
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Todos autenticados podem inserir
CREATE POLICY "Usuarios podem inserir movimentações"
  ON movimentacoes_estoque
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Todos autenticados podem atualizar
CREATE POLICY "Usuarios podem atualizar movimentações"
  ON movimentacoes_estoque
  FOR UPDATE
  TO authenticated
  USING (true);

DO $$
BEGIN
  RAISE NOTICE '✅ RLS configurado!';
END $$;

-- ============================================================================
-- PASSO 8: TRIGGER para updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_movimentacoes_estoque_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_movimentacoes_estoque_updated_at
  BEFORE UPDATE ON movimentacoes_estoque
  FOR EACH ROW
  EXECUTE FUNCTION update_movimentacoes_estoque_updated_at();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger updated_at criado!';
END $$;

-- ============================================================================
-- PASSO 9: TRIGGER para registrar movimentações automáticas
-- ============================================================================

CREATE OR REPLACE FUNCTION registrar_movimentacao_estoque()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registra se o estoque_atual mudou
  IF OLD.estoque_atual IS DISTINCT FROM NEW.estoque_atual THEN
    INSERT INTO movimentacoes_estoque (
      produto_id,
      tipo,
      quantidade,
      estoque_anterior,
      estoque_novo,
      motivo,
      usuario
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.estoque_atual > OLD.estoque_atual THEN 'entrada'
        WHEN NEW.estoque_atual < OLD.estoque_atual THEN 'saida'
        ELSE 'ajuste'
      END,
      ABS(NEW.estoque_atual - OLD.estoque_atual),
      OLD.estoque_atual,
      NEW.estoque_atual,
      'Atualização automática de estoque',
      'sistema'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_movimentacao_estoque
  AFTER UPDATE ON produtos
  FOR EACH ROW
  WHEN (OLD.estoque_atual IS DISTINCT FROM NEW.estoque_atual)
  EXECUTE FUNCTION registrar_movimentacao_estoque();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger de registro automático criado!';
END $$;

-- ============================================================================
-- PASSO 10: DADOS DE TESTE
-- ============================================================================

DO $$
DECLARE
  v_produto_id UUID;
  v_count INTEGER;
  v_estoque_atual NUMERIC;
BEGIN
  -- Verificar se existem produtos
  SELECT COUNT(*) INTO v_count FROM produtos;
  
  IF v_count > 0 THEN
    -- Pegar o primeiro produto
    SELECT id, COALESCE(estoque_atual, 0) INTO v_produto_id, v_estoque_atual 
    FROM produtos 
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Inserir 3 movimentações de teste
    INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, estoque_anterior, estoque_novo, motivo, documento, usuario)
    VALUES 
      (v_produto_id, 'entrada', 100, 0, 100, 'Teste - Compra inicial', 'NF-TEST-001', 'admin'),
      (v_produto_id, 'saida', 20, 100, 80, 'Teste - Saída', 'REQ-TEST-001', 'admin'),
      (v_produto_id, 'ajuste', 5, 80, 85, 'Teste - Ajuste', 'INV-TEST-001', 'admin');
    
    RAISE NOTICE '✅ 3 movimentações de teste inseridas!';
  ELSE
    RAISE NOTICE '⚠️  Nenhum produto encontrado. Pulando dados de teste.';
  END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  v_mov_count INTEGER;
  v_prod_count INTEGER;
  v_columns TEXT;
BEGIN
  -- Contar movimentações
  SELECT COUNT(*) INTO v_mov_count FROM movimentacoes_estoque;
  
  -- Contar produtos
  SELECT COUNT(*) INTO v_prod_count FROM produtos;
  
  -- Listar colunas
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'movimentacoes_estoque';
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '✅ SETUP CONCLUÍDO COM SUCESSO!';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'TABELA: movimentacoes_estoque';
  RAISE NOTICE '  - Movimentações: %', v_mov_count;
  RAISE NOTICE '  - Produtos no sistema: %', v_prod_count;
  RAISE NOTICE '  - Colunas: %', v_columns;
  RAISE NOTICE '';
  RAISE NOTICE 'FUNCIONALIDADES:';
  RAISE NOTICE '  ✓ Tabela criada do zero';
  RAISE NOTICE '  ✓ Foreign key para produtos';
  RAISE NOTICE '  ✓ 4 índices de performance';
  RAISE NOTICE '  ✓ RLS habilitado';
  RAISE NOTICE '  ✓ Trigger updated_at';
  RAISE NOTICE '  ✓ Trigger registro automático';
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMOS PASSOS:';
  RAISE NOTICE '  1. Acesse: Dashboard → Estoque → Movimentações';
  RAISE NOTICE '  2. Recarregue a página (F5)';
  RAISE NOTICE '  3. Deve aparecer a tabela com movimentações!';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
END $$;


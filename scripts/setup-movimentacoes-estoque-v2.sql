-- ============================================================================
-- VERSÃO 2: Setup Movimentações com Verificações
-- ============================================================================

-- Primeiro, vamos verificar se a tabela produtos existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'produtos') THEN
    RAISE EXCEPTION 'Tabela produtos não encontrada! Crie a tabela produtos primeiro.';
  END IF;
  
  RAISE NOTICE '✅ Tabela produtos encontrada!';
END $$;

-- Verificar colunas da tabela produtos
DO $$
DECLARE
  v_columns TEXT;
BEGIN
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'produtos';
  
  RAISE NOTICE 'Colunas disponíveis em produtos: %', v_columns;
END $$;

-- ============================================================================
-- CRIAR TABELA movimentacoes_estoque
-- ============================================================================

CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento com produto (UUID)
  produto_id UUID NOT NULL,
  
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

-- Adicionar foreign key DEPOIS de criar a tabela
DO $$
BEGIN
  -- Verificar se a constraint já existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_movimentacoes_produto'
    AND table_name = 'movimentacoes_estoque'
  ) THEN
    -- Adicionar foreign key
    ALTER TABLE movimentacoes_estoque
    ADD CONSTRAINT fk_movimentacoes_produto
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Foreign key adicionada!';
  ELSE
    RAISE NOTICE '⚠️  Foreign key já existe, pulando...';
  END IF;
END $$;

-- ============================================================================
-- CRIAR ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_estoque(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON movimentacoes_estoque(created_at DESC);

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Admins podem ver todas as movimentações" ON movimentacoes_estoque;
DROP POLICY IF EXISTS "Admins podem inserir movimentações" ON movimentacoes_estoque;
DROP POLICY IF EXISTS "Admins podem atualizar movimentações" ON movimentacoes_estoque;

-- Política: Todos autenticados podem ver (temporário para testes)
CREATE POLICY "Usuarios autenticados podem ver movimentações"
  ON movimentacoes_estoque
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Todos autenticados podem inserir (temporário para testes)
CREATE POLICY "Usuarios autenticados podem inserir movimentações"
  ON movimentacoes_estoque
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Todos autenticados podem atualizar (temporário para testes)
CREATE POLICY "Usuarios autenticados podem atualizar movimentações"
  ON movimentacoes_estoque
  FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- TRIGGER: Atualizar updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_movimentacoes_estoque_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_movimentacoes_estoque_updated_at ON movimentacoes_estoque;

CREATE TRIGGER trigger_update_movimentacoes_estoque_updated_at
  BEFORE UPDATE ON movimentacoes_estoque
  FOR EACH ROW
  EXECUTE FUNCTION update_movimentacoes_estoque_updated_at();

-- ============================================================================
-- TRIGGER: Registrar movimentação automática ao atualizar estoque
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
      'Atualização manual de estoque',
      'sistema'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_registrar_movimentacao_estoque ON produtos;

CREATE TRIGGER trigger_registrar_movimentacao_estoque
  AFTER UPDATE ON produtos
  FOR EACH ROW
  WHEN (OLD.estoque_atual IS DISTINCT FROM NEW.estoque_atual)
  EXECUTE FUNCTION registrar_movimentacao_estoque();

-- ============================================================================
-- DADOS DE TESTE
-- ============================================================================

DO $$
DECLARE
  v_produto_id UUID;
  v_count INTEGER;
  v_estoque_atual INTEGER;
BEGIN
  -- Verificar se existem produtos
  SELECT COUNT(*) INTO v_count FROM produtos;
  
  IF v_count > 0 THEN
    -- Pegar o primeiro produto
    SELECT id, estoque_atual INTO v_produto_id, v_estoque_atual 
    FROM produtos 
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Inserir movimentações de exemplo (só se não existirem)
    IF NOT EXISTS (SELECT 1 FROM movimentacoes_estoque WHERE produto_id = v_produto_id) THEN
      INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, estoque_anterior, estoque_novo, motivo, documento, usuario)
      VALUES 
        (v_produto_id, 'entrada', 100, v_estoque_atual - 100, v_estoque_atual, 'Movimentação de teste - Compra inicial', 'NF-TESTE-001', 'admin@pegasus.com'),
        (v_produto_id, 'saida', 20, v_estoque_atual, v_estoque_atual - 20, 'Movimentação de teste - Saída para produção', 'REQ-TESTE-001', 'admin@pegasus.com'),
        (v_produto_id, 'ajuste', 5, v_estoque_atual - 20, v_estoque_atual - 15, 'Movimentação de teste - Acerto de inventário', 'INV-TESTE-001', 'admin@pegasus.com');
      
      RAISE NOTICE '✅ 3 movimentações de teste inseridas!';
    ELSE
      RAISE NOTICE '⚠️  Movimentações de teste já existem, pulando...';
    END IF;
  ELSE
    RAISE NOTICE '⚠️  Nenhum produto encontrado. Pulando inserção de movimentações de teste.';
  END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
  v_produtos_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM movimentacoes_estoque;
  SELECT COUNT(*) INTO v_produtos_count FROM produtos;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SETUP CONCLUÍDO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tabela: movimentacoes_estoque';
  RAISE NOTICE 'Movimentações registradas: %', v_count;
  RAISE NOTICE 'Produtos no sistema: %', v_produtos_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Acesse Dashboard → Estoque → Movimentações';
  RAISE NOTICE '2. Edite um produto para gerar nova movimentação';
  RAISE NOTICE '3. Exporte relatórios em Estoque → Relatórios';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;


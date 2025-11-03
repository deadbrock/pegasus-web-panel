-- ============================================================================
-- TABELA: movimentacoes_estoque
-- DESCRIÇÃO: Registra todas as movimentações de entrada, saída e ajustes de estoque
-- ============================================================================

-- Criar tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
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
  documento VARCHAR(100), -- Número da NF, requisição, etc
  usuario VARCHAR(255), -- Quem fez a movimentação
  
  -- Timestamps
  data_movimentacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_id ON movimentacoes_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON movimentacoes_estoque(tipo);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON movimentacoes_estoque(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_created_at ON movimentacoes_estoque(created_at DESC);

-- Comentários
COMMENT ON TABLE movimentacoes_estoque IS 'Registra todas as movimentações de estoque (entradas, saídas, ajustes, transferências)';
COMMENT ON COLUMN movimentacoes_estoque.tipo IS 'Tipo: entrada, saida, ajuste, transferencia';
COMMENT ON COLUMN movimentacoes_estoque.quantidade IS 'Quantidade movimentada (sempre positivo)';
COMMENT ON COLUMN movimentacoes_estoque.estoque_anterior IS 'Estoque antes da movimentação';
COMMENT ON COLUMN movimentacoes_estoque.estoque_novo IS 'Estoque após a movimentação';
COMMENT ON COLUMN movimentacoes_estoque.documento IS 'Número da NF, requisição, ordem de compra, etc';
COMMENT ON COLUMN movimentacoes_estoque.usuario IS 'Usuário que realizou a movimentação';

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- Política: Admins podem ver tudo
CREATE POLICY "Admins podem ver todas as movimentações"
  ON movimentacoes_estoque
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente')
    )
  );

-- Política: Admins podem inserir movimentações
CREATE POLICY "Admins podem inserir movimentações"
  ON movimentacoes_estoque
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente')
    )
  );

-- Política: Admins podem atualizar movimentações
CREATE POLICY "Admins podem atualizar movimentações"
  ON movimentacoes_estoque
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'gerente')
    )
  );

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
      COALESCE(current_setting('request.jwt.claims', true)::json->>'email', 'sistema')
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

-- ============================================================================
-- DADOS DE TESTE (Opcional)
-- ============================================================================

-- Inserir algumas movimentações de exemplo (somente se houver produtos)
DO $$
DECLARE
  v_produto_id UUID;
  v_count INTEGER;
BEGIN
  -- Verificar se existem produtos
  SELECT COUNT(*) INTO v_count FROM produtos;
  
  IF v_count > 0 THEN
    -- Pegar o primeiro produto
    SELECT id INTO v_produto_id FROM produtos LIMIT 1;
    
    -- Inserir movimentações de exemplo
    INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, estoque_anterior, estoque_novo, motivo, documento, usuario)
    VALUES 
      (v_produto_id, 'entrada', 100, 0, 100, 'Compra inicial', 'NF-001234', 'admin@pegasus.com'),
      (v_produto_id, 'saida', 20, 100, 80, 'Saída para produção', 'REQ-5678', 'admin@pegasus.com'),
      (v_produto_id, 'ajuste', 5, 80, 85, 'Acerto de inventário', 'INV-2024-01', 'admin@pegasus.com');
    
    RAISE NOTICE 'Movimentações de teste inseridas com sucesso!';
  ELSE
    RAISE NOTICE 'Nenhum produto encontrado. Pulando inserção de movimentações de teste.';
  END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar criação
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM movimentacoes_estoque;
  RAISE NOTICE '✅ Tabela movimentacoes_estoque criada! Total de registros: %', v_count;
END $$;


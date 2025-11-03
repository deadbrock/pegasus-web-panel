-- ============================================================================
-- UNIFICAR SISTEMA DE MOVIMENTAÇÕES
-- Adapta para trabalhar com importação de notas fiscais
-- ============================================================================

-- PASSO 1: Verificar estrutura atual
DO $$
DECLARE
  v_columns TEXT;
BEGIN
  SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
  INTO v_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'movimentacoes_estoque';
  
  RAISE NOTICE '📋 Estrutura atual: %', v_columns;
END $$;

-- PASSO 2: Limpar TODOS os dados existentes (teste e reais)
DELETE FROM movimentacoes_estoque;

DO $$
BEGIN
  RAISE NOTICE '🗑️  Todas as movimentações antigas removidas';
END $$;

-- PASSO 3: Adicionar colunas necessárias se não existirem
DO $$ 
BEGIN
  -- nota_fiscal_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentacoes_estoque' AND column_name = 'nota_fiscal_id'
  ) THEN
    ALTER TABLE movimentacoes_estoque 
    ADD COLUMN nota_fiscal_id UUID REFERENCES notas_fiscais(id) ON DELETE SET NULL;
    RAISE NOTICE '✅ Coluna nota_fiscal_id adicionada';
  END IF;
  
  -- produto_codigo (para compatibilidade)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentacoes_estoque' AND column_name = 'produto_codigo'
  ) THEN
    ALTER TABLE movimentacoes_estoque 
    ADD COLUMN produto_codigo TEXT;
    RAISE NOTICE '✅ Coluna produto_codigo adicionada';
  END IF;
  
  -- custo_unitario
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'movimentacoes_estoque' AND column_name = 'custo_unitario'
  ) THEN
    ALTER TABLE movimentacoes_estoque 
    ADD COLUMN custo_unitario NUMERIC;
    RAISE NOTICE '✅ Coluna custo_unitario adicionada';
  END IF;
END $$;

-- PASSO 4: Tornar produto_id NULLABLE (para aceitar produto_codigo temporariamente)
ALTER TABLE movimentacoes_estoque 
ALTER COLUMN produto_id DROP NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ produto_id agora aceita NULL (para compatibilidade)';
END $$;

-- PASSO 5: Atualizar CHECK constraint do tipo
ALTER TABLE movimentacoes_estoque 
DROP CONSTRAINT IF EXISTS movimentacoes_estoque_tipo_check;

ALTER TABLE movimentacoes_estoque 
ADD CONSTRAINT movimentacoes_estoque_tipo_check 
CHECK (tipo IN ('entrada', 'saida', 'ajuste', 'transferencia', 'entrada_nota', 'saida_nota'));

DO $$
BEGIN
  RAISE NOTICE '✅ Tipos de movimentação atualizados (entrada_nota, saida_nota adicionados)';
END $$;

-- PASSO 6: Criar função para sincronizar produto_id baseado em produto_codigo
CREATE OR REPLACE FUNCTION sincronizar_produto_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Se tem produto_codigo mas não tem produto_id, buscar
  IF NEW.produto_codigo IS NOT NULL AND NEW.produto_id IS NULL THEN
    SELECT id INTO NEW.produto_id
    FROM produtos
    WHERE codigo = NEW.produto_codigo
    LIMIT 1;
  END IF;
  
  -- Se tem produto_id mas não tem produto_codigo, buscar
  IF NEW.produto_id IS NOT NULL AND NEW.produto_codigo IS NULL THEN
    SELECT codigo INTO NEW.produto_codigo
    FROM produtos
    WHERE id = NEW.produto_id
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sincronizar_produto_id ON movimentacoes_estoque;

CREATE TRIGGER trigger_sincronizar_produto_id
  BEFORE INSERT ON movimentacoes_estoque
  FOR EACH ROW
  EXECUTE FUNCTION sincronizar_produto_id();

DO $$
BEGIN
  RAISE NOTICE '✅ Trigger de sincronização criado';
END $$;

-- PASSO 7: Criar índices adicionais
CREATE INDEX IF NOT EXISTS idx_movimentacoes_nota_fiscal_id ON movimentacoes_estoque(nota_fiscal_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_produto_codigo ON movimentacoes_estoque(produto_codigo);

-- PASSO 8: Atualizar RLS para aceitar inserções do sistema fiscal
DROP POLICY IF EXISTS "Usuarios podem inserir movimentações" ON movimentacoes_estoque;

CREATE POLICY "Usuarios podem inserir movimentações"
  ON movimentacoes_estoque
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

DO $$
BEGIN
  RAISE NOTICE '✅ RLS atualizado para aceitar importações fiscais';
END $$;

-- PASSO 9: Recriar movimentações reais a partir de notas fiscais processadas
DO $$
DECLARE
  v_item RECORD;
  v_produto_id UUID;
  v_movimentacoes_criadas INTEGER := 0;
BEGIN
  -- Para cada item de nota fiscal processado, criar movimentação
  FOR v_item IN
    SELECT 
      inf.id,
      inf.nota_fiscal_id,
      inf.produto_codigo,
      inf.quantidade,
      inf.valor_unitario,
      inf.processado,
      nf.tipo_operacao,
      nf.data_emissao
    FROM itens_nota_fiscal inf
    JOIN notas_fiscais nf ON nf.id = inf.nota_fiscal_id
    WHERE inf.processado = true
    ORDER BY nf.data_emissao
  LOOP
    -- Buscar produto_id
    SELECT id INTO v_produto_id
    FROM produtos
    WHERE codigo = v_item.produto_codigo
    LIMIT 1;
    
    -- Criar movimentação
    INSERT INTO movimentacoes_estoque (
      nota_fiscal_id,
      produto_id,
      produto_codigo,
      tipo,
      quantidade,
      custo_unitario,
      motivo,
      documento,
      usuario,
      data_movimentacao
    ) VALUES (
      v_item.nota_fiscal_id,
      v_produto_id,
      v_item.produto_codigo,
      CASE 
        WHEN v_item.tipo_operacao = 'entrada' THEN 'entrada_nota'
        WHEN v_item.tipo_operacao = 'saida' THEN 'saida_nota'
        ELSE 'entrada_nota'
      END,
      v_item.quantidade,
      v_item.valor_unitario,
      'Importação de Nota Fiscal',
      'NF-' || v_item.nota_fiscal_id::TEXT,
      'sistema',
      v_item.data_emissao
    );
    
    v_movimentacoes_criadas := v_movimentacoes_criadas + 1;
  END LOOP;
  
  RAISE NOTICE '✅ % movimentações reais recriadas a partir de notas fiscais', v_movimentacoes_criadas;
END $$;

-- PASSO 10: Verificação final
DO $$
DECLARE
  v_mov_count INTEGER;
  v_nf_count INTEGER;
  v_itens_processados INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_mov_count FROM movimentacoes_estoque;
  SELECT COUNT(*) INTO v_nf_count FROM notas_fiscais WHERE status = 'Processada';
  SELECT COUNT(*) INTO v_itens_processados FROM itens_nota_fiscal WHERE processado = true;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '✅ UNIFICAÇÃO CONCLUÍDA!';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'ESTADO ATUAL:';
  RAISE NOTICE '  - Movimentações: %', v_mov_count;
  RAISE NOTICE '  - Notas fiscais processadas: %', v_nf_count;
  RAISE NOTICE '  - Itens processados: %', v_itens_processados;
  RAISE NOTICE '';
  RAISE NOTICE 'FUNCIONALIDADES:';
  RAISE NOTICE '  ✓ Suporte a produto_id E produto_codigo';
  RAISE NOTICE '  ✓ Sincronização automática entre os dois';
  RAISE NOTICE '  ✓ Tipos: entrada, saida, ajuste, entrada_nota, saida_nota';
  RAISE NOTICE '  ✓ Integração com notas fiscais';
  RAISE NOTICE '  ✓ Movimentações reais recriadas';
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMOS PASSOS:';
  RAISE NOTICE '  1. Recarregue a aba Movimentações (F5)';
  RAISE NOTICE '  2. Verifique se as movimentações estão corretas';
  RAISE NOTICE '  3. Importe nova nota fiscal para testar';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
END $$;


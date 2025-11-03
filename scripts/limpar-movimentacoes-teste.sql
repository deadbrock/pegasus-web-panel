-- ============================================================================
-- LIMPAR MOVIMENTAÇÕES DE TESTE
-- Remove todos os dados de teste e garante apenas dados reais
-- ============================================================================

-- PASSO 1: Remover todas as movimentações de teste
DELETE FROM movimentacoes_estoque
WHERE motivo LIKE '%Teste%' 
   OR motivo LIKE '%teste%'
   OR documento LIKE '%TEST%'
   OR usuario = 'admin';

DO $$
DECLARE
  v_deleted INTEGER;
BEGIN
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RAISE NOTICE '🗑️  % movimentações de teste removidas', v_deleted;
END $$;

-- PASSO 2: Remover trigger automático temporariamente
-- (Para evitar criar movimentações automáticas indesejadas)
DROP TRIGGER IF EXISTS trigger_registrar_movimentacao_estoque ON produtos;

DO $$
BEGIN
  RAISE NOTICE '⚠️  Trigger automático REMOVIDO temporariamente';
  RAISE NOTICE '    Agora as movimentações só serão criadas manualmente';
END $$;

-- PASSO 3: Verificar estado atual
DO $$
DECLARE
  v_mov_count INTEGER;
  v_prod_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_mov_count FROM movimentacoes_estoque;
  SELECT COUNT(*) INTO v_prod_count FROM produtos;
  
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '✅ LIMPEZA CONCLUÍDA!';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'ESTADO ATUAL:';
  RAISE NOTICE '  - Movimentações restantes: %', v_mov_count;
  RAISE NOTICE '  - Produtos no sistema: %', v_prod_count;
  RAISE NOTICE '';
  RAISE NOTICE 'COMPORTAMENTO AGORA:';
  RAISE NOTICE '  ❌ Trigger automático DESABILITADO';
  RAISE NOTICE '  ✅ Movimentações criadas APENAS ao importar NF';
  RAISE NOTICE '  ✅ Movimentações criadas APENAS ao fazer entrada/saída manual';
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMOS PASSOS:';
  RAISE NOTICE '  1. Recarregue a aba Movimentações (F5)';
  RAISE NOTICE '  2. Importe uma nota fiscal';
  RAISE NOTICE '  3. Verifique se a movimentação está correta';
  RAISE NOTICE '';
  RAISE NOTICE '=================================================================';
END $$;


-- ============================================
-- SCRIPT PARA LIMPAR DADOS DE TESTE
-- ============================================
-- Este script remove:
-- 1. Todos os pedidos (pedidos_supervisores)
-- 2. Todas as rotas (rotas_entrega)
-- 3. Motorista "DOUGLAS MARQUES DE SOUZA"
-- ============================================

-- ATENÇÃO: Este script irá deletar dados permanentemente!
-- Execute apenas se tiver certeza!

-- ============================================
-- 1. LIMPAR ROTAS DE ENTREGA
-- ============================================
DO $$ 
DECLARE
  total_rotas INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_rotas FROM rotas_entrega;
  
  IF total_rotas > 0 THEN
    DELETE FROM rotas_entrega;
    RAISE NOTICE '✅ % rotas excluídas com sucesso!', total_rotas;
  ELSE
    RAISE NOTICE 'ℹ️ Nenhuma rota encontrada para excluir.';
  END IF;
END $$;

-- ============================================
-- 2. LIMPAR PEDIDOS DOS SUPERVISORES (MOBILE)
-- ============================================
DO $$ 
DECLARE
  total_pedidos INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_pedidos FROM pedidos_supervisores;
  
  IF total_pedidos > 0 THEN
    DELETE FROM pedidos_supervisores;
    RAISE NOTICE '✅ % pedidos excluídos com sucesso!', total_pedidos;
  ELSE
    RAISE NOTICE 'ℹ️ Nenhum pedido encontrado para excluir.';
  END IF;
END $$;

-- ============================================
-- 3. EXCLUIR MOTORISTA "DOUGLAS MARQUES DE SOUZA"
-- ============================================
DO $$ 
DECLARE
  motorista_id UUID;
  motorista_nome TEXT;
BEGIN
  -- Buscar o motorista pelo nome
  SELECT id, nome INTO motorista_id, motorista_nome
  FROM motoristas
  WHERE UPPER(nome) LIKE '%DOUGLAS%'
  LIMIT 1;
  
  IF motorista_id IS NOT NULL THEN
    DELETE FROM motoristas WHERE id = motorista_id;
    RAISE NOTICE '✅ Motorista "%" (ID: %) excluído com sucesso!', motorista_nome, motorista_id;
  ELSE
    RAISE NOTICE 'ℹ️ Motorista "DOUGLAS" não encontrado.';
  END IF;
END $$;

-- ============================================
-- 4. VERIFICAR DADOS APÓS LIMPEZA
-- ============================================
DO $$ 
DECLARE
  count_rotas INTEGER;
  count_pedidos INTEGER;
  count_motoristas INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_rotas FROM rotas_entrega;
  SELECT COUNT(*) INTO count_pedidos FROM pedidos_supervisores;
  SELECT COUNT(*) INTO count_motoristas FROM motoristas;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMO APÓS LIMPEZA:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚚 Rotas restantes: %', count_rotas;
  RAISE NOTICE '📦 Pedidos restantes: %', count_pedidos;
  RAISE NOTICE '👤 Motoristas restantes: %', count_motoristas;
  RAISE NOTICE '========================================';
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================


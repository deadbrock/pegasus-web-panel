-- ========================================
-- VERIFICAR RLS COMPLETO DO SISTEMA
-- ========================================

-- 1. Verificar RLS nas tabelas de supervisores
SELECT 
  '🔒 PEDIDOS_SUPERVISORES' AS tabela,
  tablename,
  rowsecurity AS rls_ativado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'pedidos_supervisores';

-- 2. Verificar políticas de RLS para pedidos_supervisores
SELECT 
  '📋 POLÍTICAS - pedidos_supervisores' AS info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'pedidos_supervisores'
ORDER BY cmd;

-- 3. Verificar RLS na tabela de itens
SELECT 
  '🔒 ITENS_PEDIDO_SUPERVISOR' AS tabela,
  tablename,
  rowsecurity AS rls_ativado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'itens_pedido_supervisor';

-- 4. Verificar políticas de RLS para itens
SELECT 
  '📋 POLÍTICAS - itens_pedido_supervisor' AS info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'itens_pedido_supervisor'
ORDER BY cmd;

-- 5. Verificar RLS na tabela de contratos
SELECT 
  '🔒 CONTRATOS_SUPERVISORES' AS tabela,
  tablename,
  rowsecurity AS rls_ativado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'contratos_supervisores';

-- 6. Verificar políticas de RLS para contratos
SELECT 
  '📋 POLÍTICAS - contratos_supervisores' AS info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'contratos_supervisores'
ORDER BY cmd;

-- 7. Resumo final
SELECT 
  '✅ RESUMO GERAL' AS info,
  COUNT(DISTINCT tablename) AS tabelas_com_rls,
  COUNT(*) AS total_politicas
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('pedidos_supervisores', 'itens_pedido_supervisor', 'contratos_supervisores');


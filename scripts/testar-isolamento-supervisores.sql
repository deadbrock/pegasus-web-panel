-- ========================================
-- TESTAR ISOLAMENTO ENTRE SUPERVISORES
-- ========================================

-- INSTRUÇÕES:
-- Este script deve ser executado para verificar se o isolamento de dados está funcionando

-- 1. Contar supervisores cadastrados
SELECT 
  '👥 SUPERVISORES CADASTRADOS' AS info,
  COUNT(*) AS total_supervisores
FROM auth.users
WHERE user_metadata->>'role' = 'supervisor';

-- 2. Listar supervisores e seus pedidos
SELECT 
  '📊 SUPERVISORES E PEDIDOS' AS info,
  u.id AS supervisor_id,
  u.email AS supervisor_email,
  u.user_metadata->>'name' AS supervisor_nome,
  COUNT(p.id) AS total_pedidos,
  COALESCE(
    json_agg(
      json_build_object(
        'numero_pedido', p.numero_pedido,
        'status', p.status,
        'urgencia', p.urgencia,
        'created_at', p.created_at
      )
      ORDER BY p.created_at DESC
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'::json
  ) AS pedidos
FROM auth.users u
LEFT JOIN public.pedidos_supervisores p ON p.supervisor_id = u.id
WHERE u.user_metadata->>'role' = 'supervisor'
GROUP BY u.id, u.email, u.user_metadata->>'name'
ORDER BY u.email;

-- 3. Listar contratos por supervisor
SELECT 
  '📑 SUPERVISORES E CONTRATOS' AS info,
  u.id AS supervisor_id,
  u.email AS supervisor_email,
  u.user_metadata->>'name' AS supervisor_nome,
  COUNT(c.id) AS total_contratos
FROM auth.users u
LEFT JOIN public.contratos_supervisores c ON c.supervisor_id = u.id
WHERE u.user_metadata->>'role' = 'supervisor'
GROUP BY u.id, u.email, u.user_metadata->>'name'
ORDER BY u.email;

-- 4. Verificar se há "vazamento" de dados (pedidos sem supervisor)
SELECT 
  '⚠️ PEDIDOS ÓRFÃOS (SEM SUPERVISOR)' AS info,
  COUNT(*) AS total_orfaos
FROM public.pedidos_supervisores p
LEFT JOIN auth.users u ON u.id = p.supervisor_id
WHERE u.id IS NULL;

-- 5. Verificar se há contratos órfãos
SELECT 
  '⚠️ CONTRATOS ÓRFÃOS (SEM SUPERVISOR)' AS info,
  COUNT(*) AS total_orfaos
FROM public.contratos_supervisores c
LEFT JOIN auth.users u ON u.id = c.supervisor_id
WHERE u.id IS NULL;

-- 6. Resumo final de isolamento
SELECT 
  '✅ RESUMO DO ISOLAMENTO' AS info,
  (SELECT COUNT(*) FROM auth.users WHERE user_metadata->>'role' = 'supervisor') AS total_supervisores,
  (SELECT COUNT(DISTINCT supervisor_id) FROM public.pedidos_supervisores) AS supervisores_com_pedidos,
  (SELECT COUNT(DISTINCT supervisor_id) FROM public.contratos_supervisores) AS supervisores_com_contratos,
  (SELECT COUNT(*) FROM public.pedidos_supervisores WHERE supervisor_id NOT IN (SELECT id FROM auth.users WHERE user_metadata->>'role' = 'supervisor')) AS pedidos_vazados,
  (SELECT COUNT(*) FROM public.contratos_supervisores WHERE supervisor_id NOT IN (SELECT id FROM auth.users WHERE user_metadata->>'role' = 'supervisor')) AS contratos_vazados;


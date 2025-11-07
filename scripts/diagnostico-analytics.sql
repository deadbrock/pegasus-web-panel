-- ============================================================================
-- DIAGNÓSTICO RÁPIDO: Analytics
-- ============================================================================

SELECT 
  '📊 DIAGNÓSTICO COMPLETO' AS info,
  
  -- Rotas
  (SELECT COUNT(*) FROM rotas_entrega) AS total_rotas,
  (SELECT COUNT(*) FROM rotas_entrega WHERE motorista_id IS NOT NULL) AS rotas_com_motorista,
  (SELECT COUNT(*) FROM rotas_entrega WHERE status = 'Entregue') AS rotas_entregues,
  
  -- Motoristas
  (SELECT COUNT(*) FROM motoristas) AS total_motoristas,
  (SELECT COUNT(*) FROM motoristas WHERE status = 'Ativo') AS motoristas_ativos,
  
  -- Manutenções
  (SELECT COUNT(*) FROM manutencoes) AS total_manutencoes,
  (SELECT COUNT(*) FROM manutencoes WHERE custo IS NOT NULL AND custo > 0) AS manutencoes_com_custo,
  (SELECT COALESCE(SUM(custo), 0)::NUMERIC(10,2) FROM manutencoes) AS custo_total,
  
  -- Status
  CASE 
    WHEN (SELECT COUNT(*) FROM rotas_entrega) = 0 THEN '⚠️ SEM ROTAS - Crie rotas em Rastreamento'
    WHEN (SELECT COUNT(*) FROM rotas_entrega WHERE motorista_id IS NOT NULL) = 0 THEN '⚠️ ROTAS SEM MOTORISTAS - Atribua motoristas às rotas'
    WHEN (SELECT COUNT(*) FROM motoristas WHERE status = 'Ativo') = 0 THEN '⚠️ SEM MOTORISTAS ATIVOS - Cadastre motoristas'
    ELSE '✅ DADOS OK - Analytics funcionará normalmente'
  END AS diagnostico;


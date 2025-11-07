-- ============================================================================
-- VERIFICAÇÃO SIMPLES: Dados para Analytics
-- DESCRIÇÃO: Versão simplificada e robusta
-- ============================================================================

-- 1. ROTAS DE ENTREGA
SELECT 
  '📦 ROTAS' AS tipo,
  COUNT(*) AS total,
  COUNT(CASE WHEN motorista_id IS NOT NULL THEN 1 END) AS com_motorista,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) AS entregues
FROM rotas_entrega;

-- 2. MOTORISTAS
SELECT 
  '👤 MOTORISTAS' AS tipo,
  COUNT(*) AS total,
  COUNT(CASE WHEN status = 'Ativo' THEN 1 END) AS ativos
FROM motoristas;

-- 3. MANUTENÇÕES
SELECT 
  '🔧 MANUTENÇÕES' AS tipo,
  COUNT(*) AS total,
  COUNT(CASE WHEN custo IS NOT NULL AND custo > 0 THEN 1 END) AS com_custo,
  COALESCE(SUM(custo), 0)::NUMERIC(10,2) AS custo_total
FROM manutencoes;

-- 4. ROTAS POR STATUS
SELECT 
  '📊 STATUS' AS tipo,
  status,
  COUNT(*) AS quantidade
FROM rotas_entrega
GROUP BY status
ORDER BY quantidade DESC;

-- 5. TOP 5 MOTORISTAS COM ROTAS
SELECT 
  '🚗 TOP MOTORISTAS' AS tipo,
  m.nome,
  COUNT(r.id) AS total_rotas,
  COUNT(CASE WHEN r.status = 'Entregue' THEN 1 END) AS entregas
FROM motoristas m
LEFT JOIN rotas_entrega r ON r.motorista_id = m.id
WHERE m.status = 'Ativo'
GROUP BY m.id, m.nome
ORDER BY total_rotas DESC
LIMIT 5;

-- 6. ROTAS DOS ÚLTIMOS 7 DIAS
SELECT 
  '📅 ÚLTIMOS 7 DIAS' AS tipo,
  DATE(data_criacao) AS data,
  COUNT(*) AS rotas,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) AS entregues
FROM rotas_entrega
WHERE data_criacao >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(data_criacao)
ORDER BY data DESC;

-- 7. DIAGNÓSTICO FINAL
SELECT 
  '✅ DIAGNÓSTICO' AS resultado,
  (SELECT COUNT(*) FROM rotas_entrega) AS rotas_total,
  (SELECT COUNT(*) FROM rotas_entrega WHERE motorista_id IS NOT NULL) AS rotas_com_motorista,
  (SELECT COUNT(*) FROM motoristas WHERE status = 'Ativo') AS motoristas_ativos,
  (SELECT COUNT(*) FROM manutencoes WHERE custo IS NOT NULL) AS manutencoes_com_custo,
  CASE 
    WHEN (SELECT COUNT(*) FROM rotas_entrega) = 0 THEN '⚠️ SEM ROTAS - Crie rotas para ver dados'
    WHEN (SELECT COUNT(*) FROM rotas_entrega WHERE motorista_id IS NOT NULL) = 0 THEN '⚠️ ROTAS SEM MOTORISTAS - Atribua motoristas'
    WHEN (SELECT COUNT(*) FROM motoristas WHERE status = 'Ativo') = 0 THEN '⚠️ SEM MOTORISTAS - Cadastre motoristas'
    ELSE '✅ DADOS OK - Analytics funcionará'
  END AS status;

SELECT '✅ VERIFICAÇÃO CONCLUÍDA' AS resultado;


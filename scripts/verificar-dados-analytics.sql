-- ============================================================================
-- VERIFICAÇÃO: Dados para Analytics
-- DESCRIÇÃO: Verifica se há dados suficientes para o módulo Analytics
-- ============================================================================

-- 1. Verificar rotas de entrega
SELECT 
  '📦 ROTAS DE ENTREGA' AS info,
  COUNT(*) AS total,
  COUNT(CASE WHEN motorista_id IS NOT NULL THEN 1 END) AS com_motorista,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) AS entregues,
  COUNT(CASE WHEN status = 'Aguardando Atribuição' THEN 1 END) AS aguardando,
  MIN(data_criacao) AS primeira_rota,
  MAX(data_criacao) AS ultima_rota
FROM rotas_entrega;

-- 2. Verificar motoristas
SELECT 
  '👤 MOTORISTAS' AS info,
  COUNT(*) AS total,
  COUNT(CASE WHEN status = 'Ativo' THEN 1 END) AS ativos
FROM motoristas;

-- 3. Verificar manutenções
SELECT 
  '🔧 MANUTENÇÕES' AS info,
  COUNT(*) AS total,
  COUNT(CASE WHEN custo IS NOT NULL THEN 1 END) AS com_custo,
  SUM(COALESCE(custo, 0)) AS custo_total,
  MIN(data_agendada) AS primeira_manutencao,
  MAX(data_agendada) AS ultima_manutencao
FROM manutencoes;

-- 4. Verificar pedidos mobile
SELECT 
  '📱 PEDIDOS MOBILE' AS info,
  COUNT(*) AS total,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) AS entregues,
  COUNT(CASE WHEN status = 'Aprovado' THEN 1 END) AS aprovados,
  MIN(created_at) AS primeiro_pedido,
  MAX(created_at) AS ultimo_pedido
FROM pedidos_supervisores;

-- 5. Verificar rotas por status
SELECT 
  '📊 ROTAS POR STATUS' AS info,
  status,
  COUNT(*) AS quantidade
FROM rotas_entrega
GROUP BY status
ORDER BY quantidade DESC;

-- 6. Verificar motoristas com rotas
SELECT 
  '🚗 MOTORISTAS COM ROTAS' AS info,
  m.nome,
  COUNT(r.id) AS total_rotas,
  COUNT(CASE WHEN r.status = 'Entregue' THEN 1 END) AS entregas_completas
FROM motoristas m
LEFT JOIN rotas_entrega r ON r.motorista_id = m.id
WHERE m.status = 'Ativo'
GROUP BY m.id, m.nome
ORDER BY total_rotas DESC
LIMIT 10;

-- 7. Verificar manutenções por tipo
SELECT 
  '💰 CUSTOS POR TIPO' AS info,
  tipo,
  COUNT(*) AS quantidade,
  SUM(COALESCE(custo, 0)) AS custo_total
FROM manutencoes
WHERE custo IS NOT NULL
GROUP BY tipo
ORDER BY custo_total DESC;

-- 8. Verificar rotas dos últimos 30 dias
SELECT 
  '📅 ROTAS ÚLTIMOS 30 DIAS' AS info,
  DATE(data_criacao) AS data,
  COUNT(*) AS total_rotas,
  COUNT(CASE WHEN status = 'Entregue' THEN 1 END) AS entregues
FROM rotas_entrega
WHERE data_criacao >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(data_criacao)
ORDER BY data DESC
LIMIT 10;

-- 9. Verificar estrutura da tabela rotas_entrega
SELECT 
  '🔍 ESTRUTURA: rotas_entrega' AS info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'rotas_entrega'
ORDER BY ordinal_position;

-- 10. Verificar se há dados para analytics
SELECT 
  '✅ RESUMO PARA ANALYTICS' AS status,
  (SELECT COUNT(*) FROM rotas_entrega) AS total_rotas,
  (SELECT COUNT(*) FROM rotas_entrega WHERE motorista_id IS NOT NULL) AS rotas_com_motorista,
  (SELECT COUNT(*) FROM motoristas WHERE status = 'Ativo') AS motoristas_ativos,
  (SELECT COUNT(*) FROM manutencoes WHERE custo IS NOT NULL) AS manutencoes_com_custo,
  CASE 
    WHEN (SELECT COUNT(*) FROM rotas_entrega) = 0 THEN '⚠️ SEM ROTAS'
    WHEN (SELECT COUNT(*) FROM rotas_entrega WHERE motorista_id IS NOT NULL) = 0 THEN '⚠️ ROTAS SEM MOTORISTAS'
    WHEN (SELECT COUNT(*) FROM motoristas WHERE status = 'Ativo') = 0 THEN '⚠️ SEM MOTORISTAS ATIVOS'
    ELSE '✅ DADOS OK'
  END AS diagnostico;

SELECT '✅ VERIFICAÇÃO CONCLUÍDA' AS resultado;


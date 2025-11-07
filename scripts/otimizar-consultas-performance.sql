-- ============================================================================
-- OTIMIZAÇÃO DE CONSULTAS DE PERFORMANCE DE MOTORISTAS
-- ============================================================================

-- Verificar índices existentes em rotas_entrega
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'rotas_entrega'
ORDER BY indexname;

-- Criar índices adicionais para otimizar consultas de performance
-- (Se não existirem)

-- Índice composto para buscar rotas de um motorista por status
CREATE INDEX IF NOT EXISTS idx_rotas_motorista_status 
ON rotas_entrega(motorista_id, status);

-- Índice para buscar rotas por data de criação (últimas viagens)
CREATE INDEX IF NOT EXISTS idx_rotas_data_criacao 
ON rotas_entrega(data_criacao DESC);

-- Índice para buscar rotas entregues com data de entrega
CREATE INDEX IF NOT EXISTS idx_rotas_entregue_data 
ON rotas_entrega(status, data_entrega) 
WHERE status = 'Entregue';

-- Índice para buscar rotas com data prevista (calcular atrasos)
CREATE INDEX IF NOT EXISTS idx_rotas_data_prevista 
ON rotas_entrega(data_prevista_entrega, data_entrega);

-- Estatísticas
SELECT 
  '✅ ÍNDICES CRIADOS' AS status,
  COUNT(*) AS total_indices
FROM pg_indexes
WHERE tablename = 'rotas_entrega';

-- Verificar quantidade de rotas por motorista
SELECT 
  m.nome AS motorista,
  COUNT(r.id) AS total_rotas,
  COUNT(CASE WHEN r.status = 'Entregue' THEN 1 END) AS entregues,
  COUNT(CASE WHEN r.status = 'Em Rota' THEN 1 END) AS em_andamento,
  COUNT(CASE WHEN r.status = 'Atrasada' THEN 1 END) AS atrasadas,
  MAX(r.data_criacao) AS ultima_rota
FROM motoristas m
LEFT JOIN rotas_entrega r ON r.motorista_id = m.id
GROUP BY m.id, m.nome
ORDER BY total_rotas DESC;


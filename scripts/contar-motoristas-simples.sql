-- ============================================
-- CONTAGEM SIMPLES DE MOTORISTAS
-- ============================================

-- Total de motoristas
SELECT 
  'TOTAL DE MOTORISTAS' as label,
  COUNT(*) as quantidade
FROM motoristas;

-- Últimos 5 motoristas criados
SELECT 
  id,
  nome,
  cpf,
  status,
  created_at
FROM motoristas
ORDER BY created_at DESC
LIMIT 5;


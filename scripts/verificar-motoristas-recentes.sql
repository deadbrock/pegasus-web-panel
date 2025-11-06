-- ============================================
-- VERIFICAR MOTORISTAS RECENTES
-- ============================================

-- 1. Total de motoristas
SELECT 
  '📊 TOTAL DE MOTORISTAS' as info,
  COUNT(*) as total
FROM motoristas;

-- 2. Últimos 10 motoristas cadastrados
SELECT 
  '📋 ÚLTIMOS 10 MOTORISTAS' as info,
  id,
  nome,
  cpf,
  cnh,
  categoria_cnh,
  telefone,
  status,
  created_at::timestamp(0) as criado_em
FROM motoristas
ORDER BY created_at DESC
LIMIT 10;

-- 3. Motoristas cadastrados hoje
SELECT 
  '📅 MOTORISTAS CADASTRADOS HOJE' as info,
  COUNT(*) as total_hoje
FROM motoristas
WHERE DATE(created_at) = CURRENT_DATE;

-- 4. Últimos motoristas cadastrados hoje (detalhes)
SELECT 
  '🆕 DETALHES DOS MOTORISTAS DE HOJE' as info,
  id,
  nome,
  cpf,
  cnh,
  categoria_cnh,
  status,
  TO_CHAR(created_at, 'HH24:MI:SS') as hora_criacao
FROM motoristas
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- 5. Verificar se há algum problema com RLS
SELECT 
  '🔒 POLÍTICAS RLS' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'motoristas';

-- 6. Estatísticas por status
SELECT 
  '📈 ESTATÍSTICAS POR STATUS' as info,
  status,
  COUNT(*) as quantidade
FROM motoristas
GROUP BY status
ORDER BY quantidade DESC;


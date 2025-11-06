-- ============================================
-- SCRIPT PARA VERIFICAR TABELA MANUTENCOES
-- ============================================

-- 1. Verificar se a tabela existe
SELECT 
  'Tabela manutencoes existe!' as status,
  count(*) as total_registros
FROM manutencoes;

-- 2. Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'manutencoes'
ORDER BY ordinal_position;

-- 3. Verificar índices
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'manutencoes';

-- 4. Verificar políticas RLS
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'manutencoes';

-- 5. Listar todas as manutenções (se houver)
SELECT 
  id,
  veiculo_id,
  tipo,
  descricao,
  data_agendada,
  status,
  custo,
  created_at
FROM manutencoes
ORDER BY created_at DESC
LIMIT 10;


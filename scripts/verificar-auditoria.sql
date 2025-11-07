-- ============================================================================
-- VERIFICAÇÃO: Tabelas de Auditoria
-- DESCRIÇÃO: Verifica se as tabelas foram criadas corretamente
-- ============================================================================

-- 1. Verificar se as tabelas existem
SELECT 
  '✅ TABELAS CRIADAS' AS status,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name IN ('auditoria_logs', 'auditoria_tasks')
ORDER BY table_name;

-- 2. Verificar estrutura da auditoria_logs
SELECT 
  '📋 ESTRUTURA: auditoria_logs' AS info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'auditoria_logs'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da auditoria_tasks
SELECT 
  '📋 ESTRUTURA: auditoria_tasks' AS info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'auditoria_tasks'
ORDER BY ordinal_position;

-- 4. Verificar índices
SELECT 
  '🔍 ÍNDICES' AS info,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('auditoria_logs', 'auditoria_tasks')
ORDER BY tablename, indexname;

-- 5. Verificar políticas RLS
SELECT 
  '🔒 POLÍTICAS RLS: auditoria_logs' AS info,
  policyname,
  cmd,
  qual::text AS using_expression
FROM pg_policies
WHERE tablename = 'auditoria_logs'
ORDER BY policyname;

SELECT 
  '🔒 POLÍTICAS RLS: auditoria_tasks' AS info,
  policyname,
  cmd,
  qual::text AS using_expression
FROM pg_policies
WHERE tablename = 'auditoria_tasks'
ORDER BY policyname;

-- 6. Verificar se RLS está habilitado
SELECT 
  '🔐 RLS STATUS' AS info,
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('auditoria_logs', 'auditoria_tasks')
ORDER BY tablename;

-- 7. Contar registros
SELECT 
  '📊 CONTAGEM DE REGISTROS' AS info,
  'auditoria_logs' AS tabela,
  COUNT(*) AS total
FROM auditoria_logs
UNION ALL
SELECT 
  '📊 CONTAGEM DE REGISTROS' AS info,
  'auditoria_tasks' AS tabela,
  COUNT(*) AS total
FROM auditoria_tasks;

-- 8. Inserir log de teste
INSERT INTO auditoria_logs (
  timestamp,
  usuario,
  acao,
  modulo,
  descricao,
  ip,
  status,
  detalhes
) VALUES (
  NOW(),
  'sistema@pegasus.com',
  'SYSTEM_CHECK',
  'Auditoria',
  'Verificação de instalação do módulo de auditoria',
  '127.0.0.1',
  'sucesso',
  '{"tipo": "verificacao", "modulo": "auditoria"}'::jsonb
)
RETURNING 
  '✅ LOG DE TESTE CRIADO' AS status,
  id,
  timestamp,
  usuario,
  acao,
  modulo,
  status;

-- 9. Buscar logs criados
SELECT 
  '📝 LOGS EXISTENTES' AS info,
  id,
  timestamp,
  usuario,
  acao,
  modulo,
  descricao,
  status
FROM auditoria_logs
ORDER BY timestamp DESC
LIMIT 10;

SELECT '✅ VERIFICAÇÃO CONCLUÍDA - MÓDULO DE AUDITORIA INSTALADO COM SUCESSO!' AS resultado;


-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DA IMPLEMENTAÇÃO
-- Sistema de Contratos com Supervisores
-- =====================================================

\echo '🔍 VERIFICANDO IMPLEMENTAÇÃO...\n'

-- =====================================================
-- 1. VERIFICAR ESTRUTURA DO BANCO
-- =====================================================

\echo '1️⃣ Verificando estrutura do banco de dados...\n'

-- Verificar se a coluna valor_mensal_material existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns
      WHERE table_name = 'contratos' 
        AND column_name = 'valor_mensal_material'
    ) THEN '✅ Coluna valor_mensal_material encontrada em contratos'
    ELSE '❌ ERRO: Coluna valor_mensal_material NÃO encontrada!'
  END as resultado;

-- Verificar se a tabela contratos_supervisores_atribuicao existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables
      WHERE table_name = 'contratos_supervisores_atribuicao'
    ) THEN '✅ Tabela contratos_supervisores_atribuicao encontrada'
    ELSE '❌ ERRO: Tabela contratos_supervisores_atribuicao NÃO encontrada!'
  END as resultado;

-- Verificar se a função get_contratos_supervisor existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE n.nspname = 'public' 
        AND p.proname = 'get_contratos_supervisor'
    ) THEN '✅ Função get_contratos_supervisor encontrada'
    ELSE '❌ ERRO: Função get_contratos_supervisor NÃO encontrada!'
  END as resultado;

-- Verificar se a view contratos_com_supervisores existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.views
      WHERE table_name = 'contratos_com_supervisores'
    ) THEN '✅ View contratos_com_supervisores encontrada'
    ELSE '❌ ERRO: View contratos_com_supervisores NÃO encontrada!'
  END as resultado;

\echo '\n'

-- =====================================================
-- 2. VERIFICAR DADOS
-- =====================================================

\echo '2️⃣ Verificando dados...\n'

-- Contar contratos
SELECT 
  COUNT(*) as total_contratos,
  COUNT(*) FILTER (WHERE status = 'Ativo') as contratos_ativos,
  COUNT(*) FILTER (WHERE valor_mensal_material > 0) as contratos_com_teto
FROM contratos;

-- Contar supervisores cadastrados
SELECT 
  COUNT(*) as total_supervisores
FROM users
WHERE role = 'supervisor';

-- Contar atribuições ativas
SELECT 
  COUNT(*) as total_atribuicoes,
  COUNT(DISTINCT contrato_id) as contratos_com_supervisores,
  COUNT(DISTINCT supervisor_id) as supervisores_atribuidos
FROM contratos_supervisores_atribuicao
WHERE ativo = true;

\echo '\n'

-- =====================================================
-- 3. TESTAR FUNÇÕES
-- =====================================================

\echo '3️⃣ Testando funções...\n'

-- Listar contratos com supervisores
\echo 'Contratos com supervisores atribuídos:\n'
SELECT 
  c.cliente,
  c.numero_contrato,
  c.valor_mensal_material,
  c.status,
  COUNT(a.id) FILTER (WHERE a.ativo = true) as qtd_supervisores
FROM contratos c
LEFT JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id
GROUP BY c.id, c.cliente, c.numero_contrato, c.valor_mensal_material, c.status
ORDER BY qtd_supervisores DESC, c.cliente
LIMIT 10;

\echo '\n'

-- Listar supervisores e seus contratos
\echo 'Supervisores e quantidade de contratos atribuídos:\n'
SELECT 
  u.nome as supervisor_nome,
  u.email as supervisor_email,
  COUNT(a.id) FILTER (WHERE a.ativo = true) as qtd_contratos_atribuidos
FROM users u
LEFT JOIN contratos_supervisores_atribuicao a ON u.id = a.supervisor_id AND a.ativo = true
WHERE u.role = 'supervisor'
GROUP BY u.id, u.nome, u.email
ORDER BY qtd_contratos_atribuidos DESC, u.nome
LIMIT 10;

\echo '\n'

-- =====================================================
-- 4. VERIFICAR CONFIGURAÇÕES DE PERÍODO
-- =====================================================

\echo '4️⃣ Verificando configurações de período de pedidos...\n'

-- Verificar se a tabela configuracoes_periodo_pedidos existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables
      WHERE table_name = 'configuracoes_periodo_pedidos'
    ) THEN '✅ Tabela configuracoes_periodo_pedidos encontrada'
    ELSE '⚠️  AVISO: Tabela configuracoes_periodo_pedidos NÃO encontrada (opcional)'
  END as resultado;

-- Listar configurações ativas
SELECT 
  nome,
  ativo,
  dia_inicio,
  dia_fim,
  mensagem_bloqueio
FROM configuracoes_periodo_pedidos
WHERE ativo = true
ORDER BY created_at DESC
LIMIT 1;

\echo '\n'

-- =====================================================
-- 5. EXEMPLO DE CONSULTA PARA O MOBILE
-- =====================================================

\echo '5️⃣ Exemplo de consulta para o mobile...\n'

\echo 'Para testar a consulta que o mobile usa, execute:'
\echo 'SELECT * FROM get_contratos_supervisor(''UUID_DO_SUPERVISOR'');'
\echo ''
\echo 'Substitua UUID_DO_SUPERVISOR pelo ID real de um supervisor.'
\echo 'Você pode pegar um ID de supervisor executando:'
\echo 'SELECT id, nome, email FROM users WHERE role = ''supervisor'' LIMIT 1;'

\echo '\n'

-- =====================================================
-- 6. VERIFICAÇÕES DE INTEGRIDADE
-- =====================================================

\echo '6️⃣ Verificações de integridade...\n'

-- Verificar atribuições órfãs (sem contrato válido)
SELECT 
  COUNT(*) as atribuicoes_orfas
FROM contratos_supervisores_atribuicao a
LEFT JOIN contratos c ON a.contrato_id = c.id
WHERE c.id IS NULL;

-- Verificar atribuições para supervisores inexistentes
SELECT 
  COUNT(*) as supervisores_invalidos
FROM contratos_supervisores_atribuicao a
LEFT JOIN users u ON a.supervisor_id = u.id
WHERE u.id IS NULL;

-- Verificar contratos com datas inválidas
SELECT 
  COUNT(*) as contratos_datas_invalidas
FROM contratos
WHERE data_inicio > data_fim;

\echo '\n'

-- =====================================================
-- 7. ESTATÍSTICAS FINAIS
-- =====================================================

\echo '7️⃣ Estatísticas finais...\n'

SELECT 
  '📊 RESUMO GERAL' as categoria,
  '' as detalhe;

SELECT 
  '  Total de Contratos' as metrica,
  COUNT(*)::text as valor
FROM contratos
UNION ALL
SELECT 
  '  Contratos Ativos' as metrica,
  COUNT(*)::text as valor
FROM contratos
WHERE status = 'Ativo'
UNION ALL
SELECT 
  '  Contratos com Teto Mensal' as metrica,
  COUNT(*)::text as valor
FROM contratos
WHERE valor_mensal_material > 0
UNION ALL
SELECT 
  '  Total de Supervisores' as metrica,
  COUNT(*)::text as valor
FROM users
WHERE role = 'supervisor'
UNION ALL
SELECT 
  '  Atribuições Ativas' as metrica,
  COUNT(*)::text as valor
FROM contratos_supervisores_atribuicao
WHERE ativo = true
UNION ALL
SELECT 
  '  Supervisores com Contratos' as metrica,
  COUNT(DISTINCT supervisor_id)::text as valor
FROM contratos_supervisores_atribuicao
WHERE ativo = true;

\echo '\n'

-- =====================================================
-- 8. TESTES DE PERMISSÕES (RLS)
-- =====================================================

\echo '8️⃣ Verificando políticas de segurança (RLS)...\n'

-- Verificar se RLS está habilitado nas tabelas
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ RLS habilitado'
    ELSE '⚠️  RLS desabilitado'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('contratos', 'contratos_supervisores_atribuicao')
ORDER BY tablename;

\echo '\n'

-- =====================================================
-- FIM DA VERIFICAÇÃO
-- =====================================================

\echo '✅ VERIFICAÇÃO CONCLUÍDA!\n'
\echo 'Se todos os itens acima mostraram ✅, a implementação está correta.'
\echo 'Se algum item mostrou ❌, execute o script de migração novamente.\n'
\echo 'Para verificar um supervisor específico, use:'
\echo '  SELECT * FROM get_contratos_supervisor(''UUID_DO_SUPERVISOR'');\n'

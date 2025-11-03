-- ================================================================
-- SCRIPT: CRIAÇÃO DE USUÁRIOS DE LOGÍSTICA
-- ================================================================
-- Este script cria usuários com perfil "logistica" com permissões
-- específicas para módulos operacionais, frota, fiscal e análise.
-- ================================================================

BEGIN;

-- ================================================================
-- 1. VERIFICAR SE A TABELA USERS EXISTE
-- ================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    RAISE EXCEPTION 'Tabela users não existe. Execute o script de setup básico primeiro.';
  END IF;
END $$;

-- ================================================================
-- 2. CRIAR USUÁRIO 1: EDUARDO (LOGÍSTICA)
-- ================================================================
INSERT INTO users (
  id,
  email,
  name,
  role,
  password,
  active,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'logistica@fgservices.com.br',
  'Eduardo',
  'logistica',
  crypt('logisticadafg2026', gen_salt('bf')),
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  active = EXCLUDED.active,
  updated_at = now();

-- ================================================================
-- 3. CRIAR USUÁRIO 2: EMERSON (LOGÍSTICA)
-- ================================================================
INSERT INTO users (
  id,
  email,
  name,
  role,
  password,
  active,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'logistica-2@fgservices.com.br',
  'Emerson',
  'logistica',
  crypt('logisticadafgsegundo2026', gen_salt('bf')),
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  active = EXCLUDED.active,
  updated_at = now();

-- ================================================================
-- 4. VERIFICAR CRIAÇÃO
-- ================================================================
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count
  FROM users
  WHERE email IN ('logistica@fgservices.com.br', 'logistica-2@fgservices.com.br');
  
  IF user_count = 2 THEN
    RAISE NOTICE '✅ Sucesso! 2 usuários de logística criados/atualizados.';
  ELSE
    RAISE WARNING '⚠️  Apenas % usuário(s) encontrado(s). Verifique os dados.', user_count;
  END IF;
END $$;

-- ================================================================
-- 5. LISTAR USUÁRIOS CRIADOS
-- ================================================================
SELECT
  '✅ Usuário criado' as status,
  name as "Nome",
  email as "Email",
  role as "Perfil",
  active as "Ativo",
  created_at as "Criado em"
FROM users
WHERE email IN ('logistica@fgservices.com.br', 'logistica-2@fgservices.com.br')
ORDER BY name;

COMMIT;

-- ================================================================
-- 📋 INFORMAÇÕES DOS USUÁRIOS CRIADOS
-- ================================================================
-- 
-- USUÁRIO 1:
-- Nome: Eduardo
-- Email: logistica@fgservices.com.br
-- Senha: logisticadafg2026
-- Perfil: logistica
--
-- USUÁRIO 2:
-- Nome: Emerson
-- Email: logistica-2@fgservices.com.br
-- Senha: logisticadafgsegundo2026
-- Perfil: logistica
--
-- ================================================================
-- 📊 PERMISSÕES DO PERFIL "LOGISTICA"
-- ================================================================
--
-- ✅ ACESSO PERMITIDO:
--
-- 🏠 Dashboard
--
-- 💼 OPERAÇÕES:
--   - Pedidos
--   - Estoque
--   - Contratos
--   - Rastreamento
--
-- 💰 FINANCEIRO:
--   - Centro de Custos (apenas)
--
-- 🚛 FROTA:
--   - Veículos
--   - Motoristas
--   - Manutenção
--
-- 📄 FISCAL:
--   - Fiscal
--   - Documentos
--   - Auditoria
--
-- 📈 ANÁLISE:
--   - Analytics
--   - Relatórios
--   - Data Hub
--   - Forecast
--   - Planejamento
--
-- ================================================================
-- ❌ ACESSO NEGADO:
-- ================================================================
--
-- - Financeiro (overview)
-- - Custos
-- - Planejamento Financeiro
-- - Insights
-- - Radar Logístico
-- - PegAI
-- - Gamificação
-- - Configurações (usuários, workflows)
--
-- ================================================================


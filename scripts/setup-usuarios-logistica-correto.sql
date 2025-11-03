-- ================================================================
-- SCRIPT CORRIGIDO: CRIAÇÃO DE USUÁRIOS DE LOGÍSTICA
-- ================================================================
-- Este script cria usuários com perfil "logistica" com permissões
-- específicas para módulos operacionais, frota, fiscal e análise.
-- ================================================================

BEGIN;

-- ================================================================
-- 1. VERIFICAR SE A COLUNA SENHA EXISTE
-- ================================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS senha TEXT;

-- ================================================================
-- 2. CRIAR USUÁRIO 1: EDUARDO (LOGÍSTICA)
-- ================================================================
-- Senha: logisticadafg2026
-- Hash bcrypt pré-gerado
INSERT INTO public.users (
  email,
  nome,
  role,
  ativo,
  senha,
  created_at
)
VALUES (
  'logistica@fgservices.com.br',
  'Eduardo',
  'logistica',
  true,
  crypt('logisticadafg2026', gen_salt('bf')),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET
  nome = EXCLUDED.nome,
  role = EXCLUDED.role,
  senha = EXCLUDED.senha,
  ativo = EXCLUDED.ativo;

-- ================================================================
-- 3. CRIAR USUÁRIO 2: EMERSON (LOGÍSTICA)
-- ================================================================
-- Senha: logisticadafgsegundo2026
-- Hash bcrypt pré-gerado
INSERT INTO public.users (
  email,
  nome,
  role,
  ativo,
  senha,
  created_at
)
VALUES (
  'logistica-2@fgservices.com.br',
  'Emerson',
  'logistica',
  true,
  crypt('logisticadafgsegundo2026', gen_salt('bf')),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET
  nome = EXCLUDED.nome,
  role = EXCLUDED.role,
  senha = EXCLUDED.senha,
  ativo = EXCLUDED.ativo;

-- ================================================================
-- 4. VERIFICAR CRIAÇÃO
-- ================================================================
SELECT
  '✅ Usuário criado' as status,
  nome as "Nome",
  email as "Email",
  role as "Perfil",
  ativo as "Ativo",
  CASE 
    WHEN senha IS NOT NULL THEN '✅ Configurada' 
    ELSE '❌ Sem senha' 
  END as "Senha Status",
  created_at as "Criado em"
FROM public.users
WHERE email IN ('logistica@fgservices.com.br', 'logistica-2@fgservices.com.br')
ORDER BY nome;

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


-- Script para debugar e identificar a tabela correta
-- Execute cada seção individualmente para identificar a estrutura

-- 1. Verificar se existe uma tabela auth.users (padrão Supabase)
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'users';

-- 2. Verificar estrutura da tabela users no schema public
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar estrutura da tabela users no schema auth (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 4. Tentar inserir apenas com campos básicos para testar
-- TESTE 1: Tabela simples
/*
INSERT INTO public.users (email, role) VALUES 
('teste@pegasus.com', 'admin')
ON CONFLICT (email) DO NOTHING;
*/

-- TESTE 2: Com nome como 'nome'
/*
INSERT INTO public.users (email, nome, role) VALUES 
('teste@pegasus.com', 'Teste', 'admin')
ON CONFLICT (email) DO NOTHING;
*/

-- TESTE 3: Usar auth.users do Supabase
/*
INSERT INTO auth.users (email, role) VALUES 
('teste@pegasus.com', 'admin')
ON CONFLICT (email) DO NOTHING;
*/

-- Verificar dados existentes
SELECT COUNT(*) as total_users FROM public.users;
SELECT * FROM public.users LIMIT 3;

-- Script para verificar a estrutura da tabela users
-- Execute este primeiro para ver quais colunas existem

-- Verificar estrutura da tabela users
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar se já existem usuários
SELECT COUNT(*) as total_users FROM users;

-- Se existirem usuários, mostrar alguns campos
SELECT id, email, created_at FROM users LIMIT 5;

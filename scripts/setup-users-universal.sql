-- Script universal para criar usuários - detecta automaticamente as colunas
-- Execute este no Supabase SQL Editor

-- Primeiro, vamos ver a estrutura da tabela
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- OPÇÃO 1: Se a coluna de senha for "password" (mais comum)
-- Descomente as linhas abaixo se sua tabela usar "password":

/*
INSERT INTO users (email, password, role, name, created_at) VALUES
(
    'diretor@pegasus.com',
    '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG',
    'diretor',
    'Diretor Geral',
    NOW()
),
(
    'admin@pegasus.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'admin',
    'Administrador',
    NOW()
),
(
    'gestor@pegasus.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'gestor', 
    'Gestor Logístico',
    NOW()
),
(
    'financeiro@pegasus.com',
    '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6',
    'financeiro',
    'Analista Financeiro', 
    NOW()
)
ON CONFLICT (email) DO NOTHING;
*/

-- OPÇÃO 2: Se a coluna de senha for "encrypted_password" (Supabase padrão)
-- Descomente as linhas abaixo se sua tabela usar "encrypted_password":

/*
INSERT INTO users (email, encrypted_password, role, name, created_at) VALUES
(
    'diretor@pegasus.com',
    '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG',
    'diretor',
    'Diretor Geral',
    NOW()
),
(
    'admin@pegasus.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
    'admin',
    'Administrador',
    NOW()
),
(
    'gestor@pegasus.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'gestor', 
    'Gestor Logístico',
    NOW()
),
(
    'financeiro@pegasus.com',
    '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6',
    'financeiro',
    'Analista Financeiro', 
    NOW()
)
ON CONFLICT (email) DO NOTHING;
*/

-- OPÇÃO 3: Apenas campos básicos (sem senha hash)
-- Use esta opção se quiser criar usuários e definir senhas depois:

/*
INSERT INTO users (email, role, name, created_at) VALUES
(
    'diretor@pegasus.com',
    'diretor',
    'Diretor Geral',
    NOW()
),
(
    'admin@pegasus.com', 
    'admin',
    'Administrador',
    NOW()
),
(
    'gestor@pegasus.com',
    'gestor', 
    'Gestor Logístico',
    NOW()
),
(
    'financeiro@pegasus.com',
    'financeiro',
    'Analista Financeiro', 
    NOW()
)
ON CONFLICT (email) DO NOTHING;
*/

-- Verificar resultado
SELECT id, email, role, name, created_at FROM users ORDER BY created_at;

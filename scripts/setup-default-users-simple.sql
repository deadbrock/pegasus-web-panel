-- Script simplificado para criar usuários padrão do Sistema Pegasus
-- Use este se a tabela users já existir sem a coluna username

-- Opção 1: Se sua tabela users NÃO tem coluna username, use este:
INSERT INTO users (email, hashed_password, role, name, created_at) VALUES
(
    'diretor@pegasus.com',
    '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG', -- senha: diretor123
    'diretor',
    'Diretor Geral',
    NOW()
),
(
    'admin@pegasus.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: admin123
    'admin',
    'Administrador',
    NOW()
),
(
    'gestor@pegasus.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: gestor123
    'gestor', 
    'Gestor Logístico',
    NOW()
),
(
    'financeiro@pegasus.com',
    '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6', -- senha: financeiro123
    'financeiro',
    'Analista Financeiro', 
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se os usuários foram criados
SELECT id, email, role, name, created_at FROM users ORDER BY created_at;

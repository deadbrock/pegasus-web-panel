-- Script correto para a estrutura do Supabase identificada
-- Sua tabela usa: email, encrypted_password, nome, role, ativo, created_at

INSERT INTO users (
    email, 
    encrypted_password, 
    nome, 
    role, 
    ativo, 
    created_at
) VALUES
(
    'diretor@pegasus.com',
    '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG', -- senha: diretor123
    'Diretor Geral',
    'diretor',
    true,
    NOW()
),
(
    'admin@pegasus.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: admin123
    'Administrador',
    'admin',
    true,
    NOW()
),
(
    'gestor@pegasus.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: gestor123
    'Gestor Logístico',
    'gestor',
    true,
    NOW()
),
(
    'financeiro@pegasus.com',
    '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6', -- senha: financeiro123
    'Analista Financeiro',
    'financeiro',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se os usuários foram criados
SELECT id, email, nome, role, ativo, created_at 
FROM users 
WHERE email IN ('diretor@pegasus.com', 'admin@pegasus.com', 'gestor@pegasus.com', 'financeiro@pegasus.com')
ORDER BY created_at;

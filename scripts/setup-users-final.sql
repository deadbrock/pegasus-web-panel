-- SCRIPT FINAL CORRETO para public.users
-- Sua tabela não tem coluna de senha, vamos adicionar e depois inserir usuários

-- 1. Primeiro, adicionar coluna de senha na tabela public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS senha TEXT;

-- 2. Agora inserir os usuários com senhas
INSERT INTO public.users (email, nome, role, ativo, senha, created_at) VALUES
(
    'admin@pegasus.com', 
    'Administrador',
    'admin',
    true,
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: admin123
    NOW()
),
(
    'gestor@pegasus.com',
    'Gestor Logístico',
    'gestor',
    true,
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: gestor123
    NOW()
),
(
    'financeiro@pegasus.com',
    'Analista Financeiro',
    'financeiro',
    true,
    '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6', -- senha: financeiro123
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- 3. Atualizar o usuário diretor que já existe
UPDATE public.users 
SET senha = '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG' -- senha: diretor123
WHERE email = 'diretor@pegasus.com';

-- 4. Verificar resultado final
SELECT id, email, nome, role, ativo, 
       CASE WHEN senha IS NOT NULL THEN 'Configurada' ELSE 'Sem senha' END as senha_status,
       created_at 
FROM public.users 
WHERE email LIKE '%@pegasus.com' 
ORDER BY created_at;

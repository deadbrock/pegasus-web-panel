-- Script minimalista - apenas campos que certamente existem
-- Baseado no JSON: email, nome, role, ativo, created_at

-- VERSÃO 1: Campos mínimos sem senha (para testar estrutura)
INSERT INTO users (email, nome, role, ativo, created_at) VALUES
(
    'diretor@pegasus.com',
    'Diretor Geral',
    'diretor',
    true,
    NOW()
),
(
    'admin@pegasus.com', 
    'Administrador',
    'admin',
    true,
    NOW()
),
(
    'gestor@pegasus.com',
    'Gestor Logístico',
    'gestor',
    true,
    NOW()
),
(
    'financeiro@pegasus.com',
    'Analista Financeiro',
    'financeiro',
    true,
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar resultado
SELECT id, email, nome, role, ativo, created_at FROM users 
WHERE email LIKE '%@pegasus.com' 
ORDER BY created_at;

-- Se funcionou até aqui, agora vamos tentar adicionar senha
-- Execute uma dessas opções de UPDATE depois:

-- OPÇÃO A: Se tiver coluna 'password'
/*
UPDATE users SET password = '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG' 
WHERE email = 'diretor@pegasus.com';

UPDATE users SET password = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' 
WHERE email = 'admin@pegasus.com';

UPDATE users SET password = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'gestor@pegasus.com';

UPDATE users SET password = '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6' 
WHERE email = 'financeiro@pegasus.com';
*/

-- OPÇÃO B: Se tiver coluna 'senha'
/*
UPDATE users SET senha = '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG' 
WHERE email = 'diretor@pegasus.com';

UPDATE users SET senha = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW' 
WHERE email = 'admin@pegasus.com';

UPDATE users SET senha = '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email = 'gestor@pegasus.com';

UPDATE users SET senha = '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6' 
WHERE email = 'financeiro@pegasus.com';
*/

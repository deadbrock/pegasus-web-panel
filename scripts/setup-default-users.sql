-- Script para criar usuários padrão do Sistema Pegasus
-- Execute este script no seu Supabase para criar os usuários iniciais

-- Verificar se a tabela users existe, se não, criá-la
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    fcm_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna username se não existir (para compatibilidade)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(255) UNIQUE;
    END IF;
END $$;

-- Adicionar coluna name se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'name') THEN
        ALTER TABLE users ADD COLUMN name VARCHAR(255);
    END IF;
END $$;

-- Adicionar coluna fcm_token se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'fcm_token') THEN
        ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255);
    END IF;
END $$;

-- Inserir usuários padrão (senhas já hasheadas com bcrypt)
INSERT INTO users (username, email, hashed_password, role, name, created_at) VALUES
(
    'diretor@pegasus.com',
    'diretor@pegasus.com',
    '$2b$12$LQv3c1yqBwEHdukIAOYeMub/SNddHNaJF.gTK8xRlmeYJkd5rlWvG', -- senha: diretor123
    'diretor',
    'Diretor Geral',
    NOW()
),
(
    'admin@pegasus.com',
    'admin@pegasus.com', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', -- senha: admin123
    'admin',
    'Administrador',
    NOW()
),
(
    'gestor@pegasus.com',
    'gestor@pegasus.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: gestor123
    'gestor', 
    'Gestor Logístico',
    NOW()
),
(
    'financeiro@pegasus.com',
    'financeiro@pegasus.com',
    '$2b$12$gSvs2UDtT5JeuLPiiRr3dO.VQv/4mh8Gc.YNhEQHwVZH.gXlLGUi6', -- senha: financeiro123
    'financeiro',
    'Analista Financeiro', 
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Verificar se os usuários foram criados
SELECT id, email, role, name, created_at FROM users ORDER BY created_at;

-- ============================================
-- CRIAR USUÁRIO SUPERVISOR PARA O APP MOBILE
-- ============================================

-- ATENÇÃO: Este script cria um usuário diretamente no auth.users
-- Use apenas em ambiente de desenvolvimento/teste

-- ============================================
-- MÉTODO 1: Via SQL (Recomendado para teste)
-- ============================================

-- Deletar usuário se já existir
DELETE FROM auth.users WHERE email = 'supervisor@pegasus.com';

-- Inserir usuário na tabela auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'supervisor@pegasus.com',
  crypt('supervisor123', gen_salt('bf')), -- Senha: supervisor123
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Supervisor Teste","role":"supervisor"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Verificar se o usuário foi criado
SELECT 
  id,
  email,
  email_confirmed_at,
  raw_user_meta_data->>'name' as nome,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email = 'supervisor@pegasus.com';

-- ============================================
-- INFORMAÇÕES DO USUÁRIO CRIADO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ USUÁRIO SUPERVISOR CRIADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'CREDENCIAIS DE ACESSO:';
  RAISE NOTICE '  📧 Email: supervisor@pegasus.com';
  RAISE NOTICE '  🔒 Senha: supervisor123';
  RAISE NOTICE '';
  RAISE NOTICE 'DADOS DO PERFIL:';
  RAISE NOTICE '  👤 Nome: Supervisor Teste';
  RAISE NOTICE '  🎯 Role: supervisor';
  RAISE NOTICE '';
  RAISE NOTICE 'USE ESTAS CREDENCIAIS NO APP MOBILE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END$$;

-- ============================================
-- MÉTODO 2: Via Supabase Dashboard (Manual)
-- ============================================

-- Se preferir criar manualmente:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Vá em: Authentication > Users
-- 3. Clique em: "Add User"
-- 4. Preencha:
--    - Email: supervisor@pegasus.com
--    - Password: supervisor123
--    - Auto Confirm: YES (marcar)
-- 5. Clique em: "Create User"
-- 6. Depois, edite o usuário e adicione em "User Metadata":
--    {
--      "name": "Supervisor Teste",
--      "role": "supervisor"
--    }

-- ============================================
-- OPCIONAL: Criar mais usuários
-- ============================================

-- Descomente as linhas abaixo para criar mais usuários:

-- INSERT INTO auth.users (
--   id,
--   instance_id,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_app_meta_data,
--   raw_user_meta_data,
--   is_super_admin,
--   role,
--   aud
-- )
-- VALUES (
--   gen_random_uuid(),
--   '00000000-0000-0000-0000-000000000000',
--   'joao.silva@pegasus.com',
--   crypt('senha123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"provider":"email","providers":["email"]}',
--   '{"name":"João Silva","role":"supervisor"}',
--   false,
--   'authenticated',
--   'authenticated'
-- )
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- TESTAR LOGIN
-- ============================================

-- Para testar se o usuário foi criado corretamente:
SELECT 
  email,
  raw_user_meta_data->>'name' as nome,
  email_confirmed_at IS NOT NULL as email_confirmado,
  created_at
FROM auth.users
WHERE email LIKE '%@pegasus.com'
ORDER BY created_at DESC;


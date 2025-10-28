# 👤 Criar Usuário Supervisor para App Mobile

Este documento explica como criar um usuário para acessar o aplicativo mobile Pegasus Supervisor.

---

## 📱 Credenciais de Acesso Padrão

```
📧 Email: supervisor@pegasus.com
🔒 Senha: supervisor123
👤 Nome: Supervisor Teste
🎯 Role: supervisor
```

---

## 🎯 Método 1: Via Supabase Dashboard (RECOMENDADO - Mais Fácil)

### Passo a Passo:

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard
   ```

2. **Selecione seu projeto** (pegasus-web-panel)

3. **Navegue até Authentication:**
   - No menu lateral, clique em **"Authentication"**
   - Clique em **"Users"**

4. **Adicione um novo usuário:**
   - Clique no botão **"Add User"** (ou **"Invite"**)
   - Selecione **"Create new user"**

5. **Preencha os dados:**
   ```
   Email: supervisor@pegasus.com
   Password: supervisor123
   Auto Confirm User: ✅ (MARCAR ESTA OPÇÃO!)
   ```

6. **Clique em "Create User"**

7. **Adicione metadados do usuário:**
   - Na lista de usuários, clique no email do usuário recém-criado
   - Role até a seção **"User Metadata"**
   - Clique em **"Edit"**
   - Cole o seguinte JSON:
   ```json
   {
     "name": "Supervisor Teste",
     "role": "supervisor"
   }
   ```
   - Clique em **"Save"**

8. **✅ Pronto!** O usuário está criado e pronto para usar no app.

---

## 🔧 Método 2: Via Script SQL

### Opção A: Executar via Node.js

```bash
# No terminal, execute:
node scripts/create_supervisor_user.js "postgresql://postgres:SUA_SENHA@db.xxx.supabase.co:5432/postgres"
```

### Opção B: Executar via SQL Editor no Supabase

1. Acesse: **SQL Editor** no Supabase Dashboard
2. Clique em **"New query"**
3. Copie e cole o conteúdo do arquivo: `scripts/create-supervisor-user.sql`
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Verifique a saída no console

---

## 🧪 Método 3: Via Supabase CLI (Para Desenvolvedores)

```bash
# 1. Instalar Supabase CLI
npm install -g supabase

# 2. Fazer login
supabase login

# 3. Linkar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# 4. Executar SQL
supabase db push < scripts/create-supervisor-user.sql
```

---

## 🔍 Como Verificar se o Usuário Foi Criado

### Via Dashboard:
1. **Authentication** > **Users**
2. Procure por `supervisor@pegasus.com`
3. Verifique se está marcado como **"Confirmed"** ✅

### Via SQL:
```sql
SELECT 
  email,
  raw_user_meta_data->>'name' as nome,
  email_confirmed_at IS NOT NULL as confirmado,
  created_at
FROM auth.users
WHERE email = 'supervisor@pegasus.com';
```

---

## 📱 Como Fazer Login no App Mobile

1. **Abra o app Pegasus Supervisor**
2. **Aguarde a splash screen** (logo Pegasus 🐴✨)
3. **Na tela de login**, digite:
   ```
   Email Corporativo: supervisor@pegasus.com
   Senha: supervisor123
   ```
4. **Clique em "Entrar no Sistema"** 🔓
5. **✅ Pronto!** Você será redirecionado para o Dashboard

---

## 🔒 Criar Usuários Adicionais

### Via Dashboard (Recomendado):

Repita o **Método 1** com dados diferentes:

```
Email: joao.silva@pegasus.com
Senha: senha123
Metadata:
{
  "name": "João Silva",
  "role": "supervisor"
}
```

### Via SQL:

Edite o arquivo `scripts/create-supervisor-user.sql` e descomente/modifique a seção:

```sql
INSERT INTO auth.users (...)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'seu.email@pegasus.com',  -- ← Altere aqui
  crypt('sua_senha', gen_salt('bf')),  -- ← Altere aqui
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Seu Nome","role":"supervisor"}',  -- ← Altere aqui
  false,
  'authenticated',
  'authenticated'
);
```

---

## 🐛 Solução de Problemas

### ❌ Erro: "Email não confirmado"

**Solução:**
1. Vá em **Authentication** > **Users**
2. Clique no usuário
3. Marque **"Email Confirmed"**
4. Salve

### ❌ Erro: "Invalid login credentials"

**Possíveis causas:**
- Email digitado incorretamente
- Senha digitada incorretamente
- Usuário não foi criado
- Email não foi confirmado

**Solução:**
1. Verifique se o usuário existe no Dashboard
2. Confirme que o email está marcado como **"Confirmed"**
3. Tente resetar a senha do usuário
4. Se necessário, delete e recrie o usuário

### ❌ Erro: "User not found"

**Solução:**
O usuário não existe. Crie usando o **Método 1** (Dashboard).

---

## 📝 Notas Importantes

1. ✅ **Sempre marque "Auto Confirm User"** ao criar usuários via Dashboard
2. ✅ **Use senhas fortes** em produção (não use `supervisor123`)
3. ✅ **Adicione os metadados** (name, role) para funcionar corretamente no app
4. ⚠️ **Não compartilhe credenciais** em repositórios públicos
5. 🔒 **Em produção**, use autenticação via email/SMS ou OAuth

---

## 🎉 Pronto!

Agora você tem um usuário supervisor configurado e pode fazer login no app mobile!

**Se tiver problemas, verifique:**
- ✅ Usuário criado no Supabase
- ✅ Email confirmado
- ✅ Metadados configurados (name, role)
- ✅ App mobile buildando sem erros
- ✅ Conexão com internet ativa


# 🚀 CRIAR USUÁRIOS DE LOGÍSTICA - PASSO A PASSO

## ✅ **MÉTODO MAIS SIMPLES:**

Execute o SQL diretamente no Supabase Dashboard.

---

## 📋 **PASSO A PASSO:**

### **1️⃣ Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard
```

### **2️⃣ Selecione seu projeto**
- Projeto: **moswhtqcgjcpsideykzw**

### **3️⃣ Vá em SQL Editor**
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"+ New query"**

### **4️⃣ Copie e Cole o SQL Abaixo**

```sql
-- ================================================================
-- CRIAR USUÁRIOS DE LOGÍSTICA
-- ================================================================

BEGIN;

-- Criar usuário 1: Eduardo
INSERT INTO users (
  id,
  email,
  name,
  role,
  password,
  active,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'logistica@fgservices.com.br',
  'Eduardo',
  'logistica',
  crypt('logisticadafg2026', gen_salt('bf')),
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  active = EXCLUDED.active,
  updated_at = now();

-- Criar usuário 2: Emerson
INSERT INTO users (
  id,
  email,
  name,
  role,
  password,
  active,
  created_at,
  updated_at
)
VALUES (
  gen_random_uuid(),
  'logistica-2@fgservices.com.br',
  'Emerson',
  'logistica',
  crypt('logisticadafgsegundo2026', gen_salt('bf')),
  true,
  now(),
  now()
)
ON CONFLICT (email) DO UPDATE
SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password,
  active = EXCLUDED.active,
  updated_at = now();

-- Verificar criação
SELECT
  '✅ Usuário criado' as status,
  name as "Nome",
  email as "Email",
  role as "Perfil",
  active as "Ativo"
FROM users
WHERE email IN ('logistica@fgservices.com.br', 'logistica-2@fgservices.com.br')
ORDER BY name;

COMMIT;
```

### **5️⃣ Execute o SQL**
- Clique em **"Run"** (botão verde no canto inferior direito)
- Aguarde a execução

### **6️⃣ Verifique o Resultado**
Você deve ver uma tabela com:

| status | Nome | Email | Perfil | Ativo |
|--------|------|-------|--------|-------|
| ✅ Usuário criado | Eduardo | logistica@fgservices.com.br | logistica | true |
| ✅ Usuário criado | Emerson | logistica-2@fgservices.com.br | logistica | true |

---

## 👤 **CREDENCIAIS CRIADAS:**

### **USUÁRIO 1: Eduardo**
```
Email: logistica@fgservices.com.br
Senha: logisticadafg2026
Perfil: logistica
```

### **USUÁRIO 2: Emerson**
```
Email: logistica-2@fgservices.com.br
Senha: logisticadafgsegundo2026
Perfil: logistica
```

---

## ✅ **PERMISSÕES DO PERFIL "LOGISTICA":**

### **✅ PODE ACESSAR:**

- 🏠 **Dashboard**
- 💼 **OPERAÇÕES:** Pedidos, Estoque, Contratos, Rastreamento
- 💰 **FINANCEIRO:** Centro de Custos (apenas)
- 🚛 **FROTA:** Veículos, Motoristas, Manutenção
- 📄 **FISCAL:** Fiscal, Documentos, Auditoria
- 📈 **ANÁLISE:** Analytics, Relatórios, Data Hub, Forecast, Planejamento

### **❌ NÃO PODE ACESSAR:**

- ❌ Financeiro (overview)
- ❌ Custos
- ❌ Planejamento Financeiro
- ❌ Insights, Radar, PegAI, Gamificação
- ❌ Configurações (usuários, workflows)

---

## 🧪 **TESTAR O LOGIN:**

1. **Faça logout** do painel admin
2. **Acesse:** https://seusite.com.br/login
3. **Use as credenciais:**
   - Email: `logistica@fgservices.com.br`
   - Senha: `logisticadafg2026`
4. **Verifique** que a sidebar mostra **apenas os módulos permitidos**

---

## 📸 **O QUE VOCÊ DEVE VER NA SIDEBAR:**

```
📊 Dashboard
━━━━━━━━━━━━━━━━

💼 OPERAÇÕES ▼
  ├─ 🛒 Pedidos
  ├─ 📦 Estoque
  ├─ 📄 Contratos
  └─ 📍 Rastreamento

💰 FINANCEIRO ▶
  └─ 🏢 Centro de Custos

🚛 FROTA ▶
  ├─ 🚚 Veículos
  ├─ 👥 Motoristas
  └─ 🔧 Manutenção

📄 FISCAL ▶
  ├─ 📋 Fiscal
  ├─ 📁 Documentos
  └─ 🔍 Auditoria

📈 ANÁLISE ▶
  ├─ 📊 Analytics
  ├─ 📑 Relatórios
  ├─ 💾 Data Hub
  ├─ 📈 Forecast
  └─ 📋 Planejamento
```

---

## ❓ **TROUBLESHOOTING:**

### **Erro: "crypt function not found"**
Execute este SQL primeiro:
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

### **Erro: "table users does not exist"**
A tabela `users` precisa existir. Execute o script de setup básico primeiro.

### **Usuários não aparecem**
Verifique se executou o SQL completo e se o `COMMIT;` foi incluído.

---

## ✅ **PRONTO!**

Após executar o SQL, os usuários estarão prontos para uso! 🎉

**Teste agora mesmo fazendo login!** 🚀


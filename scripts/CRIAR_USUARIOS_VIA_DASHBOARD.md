# 🚀 CRIAR USUÁRIOS NO SUPABASE AUTH VIA DASHBOARD

## ⚠️ **IMPORTANTE:**

O sistema usa **Supabase Auth**, então os usuários precisam ser criados na **Authentication** do Supabase, **não via SQL na tabela users**.

---

## 📋 **MÉTODO MAIS SIMPLES: VIA DASHBOARD**

### **1️⃣ Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard
```

### **2️⃣ Selecione seu projeto**
- Projeto: **moswhtqcgjcpsideykzw**

### **3️⃣ Vá em Authentication**
- No menu lateral, clique em **"Authentication"**
- Clique em **"Users"**

### **4️⃣ Criar Usuário 1: Eduardo**

Clique em **"Add user"** → **"Create new user"**

Preencha:
```
Email: logistica@fgservices.com.br
Password: logisticadafg2026
Auto Confirm User: ✅ Sim (marque)
```

**User Metadata (importante!):**

Clique em **"Add metadata"** e adicione:

```json
{
  "name": "Eduardo",
  "role": "logistica"
}
```

Clique em **"Create user"**

---

### **5️⃣ Criar Usuário 2: Emerson**

Clique em **"Add user"** → **"Create new user"**

Preencha:
```
Email: logistica-2@fgservices.com.br
Password: logisticadafgsegundo2026
Auto Confirm User: ✅ Sim (marque)
```

**User Metadata (importante!):**

Clique em **"Add metadata"** e adicione:

```json
{
  "name": "Emerson",
  "role": "logistica"
}
```

Clique em **"Create user"**

---

## ✅ **VERIFICAR CRIAÇÃO:**

Na lista de usuários, você deve ver:

| Email | Confirmed | Metadata |
|-------|-----------|----------|
| logistica@fgservices.com.br | ✅ | name: Eduardo, role: logistica |
| logistica-2@fgservices.com.br | ✅ | name: Emerson, role: logistica |

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

## 🧪 **TESTAR O LOGIN:**

1. **Faça logout** do painel admin
2. **Acesse:** seu site de login
3. **Use as credenciais:**
   - Email: `logistica@fgservices.com.br`
   - Senha: `logisticadafg2026`
4. **Verifique** que a sidebar mostra **apenas os módulos permitidos**

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

## 📸 **O QUE VOCÊ DEVE VER NA SIDEBAR:**

```
📊 Dashboard
━━━━━━━━━━━━

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

## ⚙️ **ALTERNATIVA: VIA SCRIPT NODE.JS**

Se você tiver o arquivo `.env.local` configurado:

```bash
cd scripts
node criar-usuarios-logistica-auth.js
```

---

## ❓ **TROUBLESHOOTING:**

### **Erro: "Invalid login credentials"**
- ✅ Certifique-se de marcar **"Auto Confirm User"**
- ✅ Verifique se o **user_metadata** foi adicionado corretamente
- ✅ Confirme que o email e senha estão corretos

### **Usuário criado mas sem permissões**
- ✅ Verifique se o **role** no metadata está como `"logistica"`
- ✅ Recarregue a página do painel (Ctrl+F5)

### **Metadata não aparece**
- ✅ Edite o usuário no Dashboard
- ✅ Adicione manualmente o metadata JSON:
```json
{
  "name": "Eduardo",
  "role": "logistica"
}
```

---

## ✅ **PRONTO!**

Após criar os usuários via Dashboard, **teste o login imediatamente!** 🚀✨

**Os usuários já podem fazer login com as credenciais acima.** 🎉


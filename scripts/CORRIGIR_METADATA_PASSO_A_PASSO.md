# 🔧 CORRIGIR METADATA DOS USUÁRIOS - PASSO A PASSO

## ⚠️ **PROBLEMA IDENTIFICADO:**

O `user_metadata` está **vazio**, por isso o sistema usa role "admin" por padrão.

```json
"raw_user_meta_data": {
  "email_verified": true
}
```

**Precisa estar assim:**
```json
"raw_user_meta_data": {
  "email_verified": true,
  "name": "Eduardo",
  "role": "logistica"
}
```

---

## ✅ **SOLUÇÃO VIA SUPABASE DASHBOARD:**

### **1️⃣ Acesse o Supabase Dashboard**
```
https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw/auth/users
```

### **2️⃣ Atualizar Usuário: Eduardo**

1. **Encontre** o usuário: `logistica@fgservices.com.br`
2. **Clique** no usuário para abrir detalhes
3. **Procure** a seção **"User Metadata"**
4. **Clique** no botão **"Edit"** (ícone de lápis)
5. **Cole este JSON** (substituindo o conteúdo existente):

```json
{
  "email_verified": true,
  "name": "Eduardo",
  "role": "logistica"
}
```

6. **Clique** em **"Save"** ou **"Update"**

---

### **3️⃣ Atualizar Usuário: Emerson**

1. **Encontre** o usuário: `logistica-2@fgservices.com.br`
2. **Clique** no usuário para abrir detalhes
3. **Procure** a seção **"User Metadata"**
4. **Clique** no botão **"Edit"** (ícone de lápis)
5. **Cole este JSON**:

```json
{
  "email_verified": true,
  "name": "Emerson",
  "role": "logistica"
}
```

6. **Clique** em **"Save"** ou **"Update"**

---

## 🔄 **APÓS ATUALIZAR:**

### **1️⃣ Limpar sessão do usuário logado:**

No navegador, abra o **Console** (F12) e execute:

```javascript
localStorage.clear()
sessionStorage.clear()
window.location.href = '/login'
```

### **2️⃣ Fazer login novamente:**

```
Email: logistica@fgservices.com.br
Senha: logisticadafg2026
```

### **3️⃣ Verificar no console:**

Deve aparecer:
```
[Sidebar] User role: logistica
```

**NÃO** deve aparecer:
```
[Sidebar] User role: admin
```

---

## ✅ **RESULTADO ESPERADO:**

No grupo **FINANCEIRO**, você deve ver **APENAS**:

```
💰 FINANCEIRO ▶
  └─ 🏢 Centro de Custos
```

**NÃO** devem aparecer:
- ❌ Financeiro (overview)
- ❌ Custos
- ❌ Planejamento Financeiro

---

## 📊 **PERMISSÕES CORRETAS DO PERFIL "LOGISTICA":**

### **✅ DEVE APARECER:**

- 🏠 **Dashboard**
- 💼 **OPERAÇÕES:**
  - Pedidos
  - Estoque
  - Contratos
  - Rastreamento
- 💰 **FINANCEIRO:**
  - Centro de Custos ✅ (APENAS)
- 🚛 **FROTA:**
  - Veículos
  - Motoristas
  - Manutenção
- 📄 **FISCAL:**
  - Fiscal
  - Documentos
  - Auditoria
- 📈 **ANÁLISE:**
  - Analytics
  - Relatórios
  - Data Hub
  - Forecast
  - Planejamento

### **❌ NÃO DEVE APARECER:**

- ❌ Financeiro (overview)
- ❌ Custos
- ❌ Planejamento Financeiro
- ❌ Insights
- ❌ Radar
- ❌ PegAI
- ❌ Gamificação
- ❌ Configurações

---

## 🧪 **TESTE FINAL:**

1. **Faça login** com: `logistica@fgservices.com.br`
2. **Expanda** o grupo "FINANCEIRO"
3. **Deve ver APENAS:** Centro de Custos
4. **Tente acessar:** `/dashboard/financeiro` diretamente
5. **Deve ser bloqueado** ou redirecionar

---

## ❓ **TROUBLESHOOTING:**

### **Ainda aparece role "admin"**
- ✅ Verifique se salvou o metadata no Supabase
- ✅ Limpe localStorage e sessionStorage
- ✅ Feche e abra o navegador
- ✅ Teste em aba anônima

### **Metadata não salva**
- ✅ Certifique-se de que está usando SUPABASE_SERVICE_ROLE_KEY
- ✅ Verifique permissões do projeto
- ✅ Tente via script Node.js (se tiver .env.local)

### **Ainda vê todos os módulos financeiros**
- ✅ Confirme que o role no console é "logistica"
- ✅ Recarregue a página com Ctrl+F5
- ✅ Verifique se o código foi deployado

---

## 🚀 **ALTERNATIVA: VIA SCRIPT (se tiver .env.local)**

```bash
cd scripts
node atualizar-metadata-logistica.js
```

---

## ✅ **PRONTO!**

Após seguir esses passos, o grupo FINANCEIRO mostrará **apenas Centro de Custos**! 🎉

**Me avise quando atualizar o metadata e fazer login novamente!** 🚀


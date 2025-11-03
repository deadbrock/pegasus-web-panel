# 👥 CRIAÇÃO DE USUÁRIOS DE LOGÍSTICA

## 📋 **SOBRE**

Este script cria 2 usuários com perfil **"logistica"** com permissões específicas para módulos operacionais, frota, fiscal e análise.

---

## 👤 **USUÁRIOS QUE SERÃO CRIADOS:**

### **1. Eduardo**
- **Email:** logistica@fgservices.com.br
- **Senha:** logisticadafg2026
- **Perfil:** logistica

### **2. Emerson**
- **Email:** logistica-2@fgservices.com.br
- **Senha:** logisticadafgsegundo2026
- **Perfil:** logistica

---

## ✅ **PERMISSÕES DO PERFIL "LOGISTICA":**

### **✅ PODE ACESSAR:**

#### **🏠 Dashboard**
- Visão geral do sistema

#### **💼 OPERAÇÕES**
- 🛒 Pedidos
- 📦 Estoque
- 📄 Contratos
- 📍 Rastreamento

#### **💰 FINANCEIRO (limitado)**
- 🏢 Centro de Custos (apenas)

#### **🚛 FROTA**
- 🚚 Veículos
- 👥 Motoristas
- 🔧 Manutenção

#### **📄 FISCAL**
- 📋 Fiscal
- 📁 Documentos
- 🔍 Auditoria

#### **📈 ANÁLISE**
- 📊 Analytics
- 📑 Relatórios
- 💾 Data Hub
- 📈 Forecast
- 📋 Planejamento

---

### **❌ NÃO PODE ACESSAR:**

- ❌ Financeiro (overview)
- ❌ Custos
- ❌ Planejamento Financeiro
- ❌ Insights
- ❌ Radar Logístico
- ❌ PegAI
- ❌ Gamificação
- ❌ Configurações (usuários, workflows)

---

## 🚀 **COMO EXECUTAR:**

### **Opção 1: Script Node.js (Recomendado)**

```bash
cd scripts
node apply_usuarios_logistica.js
```

### **Opção 2: SQL Direto no Supabase**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie o conteúdo de `setup-usuarios-logistica.sql`
4. Cole e execute

---

## 📊 **RESULTADO ESPERADO:**

```
🚀 Iniciando criação de usuários de logística...
📄 Arquivo SQL carregado
🔄 Executando SQL no Supabase...

============================================================
✅ USUÁRIOS DE LOGÍSTICA CRIADOS COM SUCESSO!
============================================================

📋 CREDENCIAIS DE ACESSO:

👤 USUÁRIO 1:
   Nome: Eduardo
   Email: logistica@fgservices.com.br
   Senha: logisticadafg2026
   Perfil: logistica

👤 USUÁRIO 2:
   Nome: Emerson
   Email: logistica-2@fgservices.com.br
   Senha: logisticadafgsegundo2026
   Perfil: logistica

============================================================

✅ PERMISSÕES DO PERFIL "LOGISTICA":

✅ PODE ACESSAR:
   🏠 Dashboard
   💼 OPERAÇÕES: Pedidos, Estoque, Contratos, Rastreamento
   💰 FINANCEIRO: Centro de Custos
   🚛 FROTA: Veículos, Motoristas, Manutenção
   📄 FISCAL: Fiscal, Documentos, Auditoria
   📈 ANÁLISE: Analytics, Relatórios, Data Hub, Forecast, Planejamento

❌ NÃO PODE ACESSAR:
   ❌ Financeiro (overview)
   ❌ Custos
   ❌ Planejamento Financeiro
   ❌ Configurações e Administração

============================================================

🎉 Configuração concluída! Os usuários já podem fazer login.
```

---

## 🧪 **COMO TESTAR:**

1. **Faça logout** do painel admin
2. **Acesse** a tela de login
3. **Use** as credenciais:
   - Email: `logistica@fgservices.com.br`
   - Senha: `logisticadafg2026`
4. **Verifique** que apenas os módulos permitidos aparecem na sidebar
5. **Tente acessar** módulos bloqueados (deve redirecionar)

---

## 📝 **ARQUIVOS CRIADOS:**

```
scripts/
├── setup-usuarios-logistica.sql      # Script SQL
├── apply_usuarios_logistica.js       # Script Node.js
└── USUARIOS_LOGISTICA_README.md      # Esta documentação
```

---

## 🔧 **TROUBLESHOOTING:**

### **Erro: Variáveis de ambiente não encontradas**
```
❌ Certifique-se de que .env.local existe com:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
```

**Solução:** Verifique se o arquivo `.env.local` existe na raiz do projeto.

---

### **Erro: User already exists**
```
✅ Isso é normal! O script atualiza o usuário existente.
```

---

### **Erro: Permission denied**
```
❌ Verifique se você está usando SUPABASE_SERVICE_ROLE_KEY
   (não o ANON_KEY)
```

---

## 🎯 **PRÓXIMOS PASSOS:**

1. ✅ Execute o script
2. ✅ Teste o login com ambos usuários
3. ✅ Verifique as permissões na sidebar
4. ✅ Teste navegação nos módulos permitidos
5. ✅ Confirme que módulos bloqueados não aparecem

---

## 📞 **SUPORTE:**

Se encontrar problemas:
1. Verifique os logs do console
2. Confirme credenciais do Supabase
3. Teste SQL diretamente no Supabase Dashboard
4. Verifique permissões RLS na tabela `users`

---

## 🎉 **PRONTO!**

Execute o script e os usuários estarão prontos para uso! 🚀


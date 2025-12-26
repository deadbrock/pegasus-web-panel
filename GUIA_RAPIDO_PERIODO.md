# ⚡ GUIA RÁPIDO - CONFIGURAR PERÍODO DE PEDIDOS

## ✅ CHECKLIST COMPLETO

### 1️⃣ Executar SQL no Supabase

**Já fez?** Se não, faça agora:

1. Abrir Supabase Dashboard
2. Ir em **SQL Editor**
3. Clicar em **New Query**
4. Copiar e colar conteúdo de: `database/configuracoes-periodo-pedidos.sql`
5. Clicar em **Run** ▶️

**Resultado esperado:**
```
✅ Table created: configuracoes_periodo_pedidos
✅ Function created: verificar_periodo_permitido
✅ Default config inserted
```

---

### 2️⃣ Fazer Commit e Deploy

```bash
# Fazer commit
git add .
git commit -m "feat: adicionar configuração de período de pedidos"

# Deploy (Vercel)
git push origin main
```

Aguarde deploy terminar (2-3 minutos).

---

### 3️⃣ Acessar no Painel Web

1. Abrir painel web
2. Login como **logística**
3. Menu lateral > **ADMINISTRAÇÃO**
4. Clicar em **"Período de Pedidos"** 📅

**URL direta:** `https://seu-dominio.com/dashboard/configuracoes-periodo`

---

### 4️⃣ Configurar Primeira Regra

Na página, você verá um formulário:

```
┌─────────────────────────────────────────┐
│ Configurações de Período de Pedidos     │
├─────────────────────────────────────────┤
│                                         │
│ Nome: [Período Padrão Mensal    ]       │
│ Ativa: [✓]                              │
│                                         │
│ Período do Mês:                         │
│ Dia Início: [15] Dia Fim: [23]          │
│                                         │
│ Dias da Semana:                         │
│ [Segunda][Terça][Quarta][Quinta][Sexta] │
│                                         │
│ Horário: [08:00] até [18:00]            │
│                                         │
│ Autorização após: [1] pedido(s)         │
│                                         │
│ [💾 Salvar Configuração]                │
└─────────────────────────────────────────┘
```

**Campos principais:**
- ✅ Nome: Dê um nome descritivo
- ✅ Ativa: Marcar para ativar
- ✅ Dia Início/Fim: Período do mês (1-31)
- ✅ Dias da Semana: Selecione os dias permitidos
- ✅ Horário: Horário permitido

Clicar em **"Salvar Configuração"** ✅

---

### 5️⃣ Testar no App Mobile

1. Abrir app mobile (Expo Go ou APK)
2. Fazer login como supervisor
3. Ir para **"Pedidos"**
4. Verificar banner no topo:
   - ✅ **Verde:** "Período aberto até dia 23"
   - 🔒 **Vermelho:** "Período encerrado"
   - ⚠️ **Amarelo:** "Restam 2 dias"

5. Tentar criar pedido:
   - Dentro do período: ✅ Permitido
   - Fora do período: 🚫 Bloqueado com mensagem

---

## 🎯 EXEMPLO PRÁTICO

### Cenário: Pedidos apenas na semana 15-23

```json
Nome: "Período Mensal Padrão"
Ativa: true
Dia Início: 15
Dia Fim: 23
Dias da Semana: [Segunda, Terça, Quarta, Quinta, Sexta]
Horário Início: 08:00
Horário Fim: 18:00
Autorização após: 1 pedido
```

**Resultado:**
- ✅ Supervisor pode fazer pedido dia 17 (terça) às 10h
- 🚫 Supervisor NÃO pode dia 17 (terça) às 20h (fora do horário)
- 🚫 Supervisor NÃO pode no sábado
- 🚫 Supervisor NÃO pode dia 10 (antes do período)
- ⚠️ Segundo pedido requer justificativa

---

## 🐛 TROUBLESHOOTING

### Problema: Menu não aparece

**Solução:**
1. Verificar se fez deploy
2. Limpar cache do navegador (Ctrl+Shift+R)
3. Fazer logout/login novamente

### Problema: Erro ao salvar configuração

**Solução:**
1. Verificar se executou o SQL no Supabase
2. Verificar console do navegador (F12)
3. Verificar se API está respondendo: `/api/configuracoes-periodo`

### Problema: App mobile não respeita período

**Solução:**
1. Verificar se configuração está ATIVA ✅
2. Aguardar 5 minutos (cache)
3. Fazer "Pull to Refresh" no app
4. Verificar logs no console do app

---

## 📊 VERIFICAR SE ESTÁ FUNCIONANDO

### No Painel Web:
1. Acessar `/dashboard/configuracoes-periodo`
2. Ver configuração salva
3. Editar e salvar novamente

### No App Mobile:
1. Abrir tela de Pedidos
2. Ver banner informativo no topo
3. Tentar criar pedido
4. Ver validação sendo aplicada

### No Banco de Dados (Supabase):
```sql
-- Ver configuração ativa
SELECT * FROM configuracoes_periodo_pedidos 
WHERE ativo = true;

-- Testar função
SELECT * FROM verificar_periodo_permitido();
```

---

## 🎉 SUCESSO!

Se tudo funcionou, você verá:

✅ Link no menu "Período de Pedidos"  
✅ Página abre e carrega configuração  
✅ Consegue salvar alterações  
✅ App mobile mostra banner correto  
✅ Validação funciona ao criar pedido  

---

## 📞 PRECISA DE AJUDA?

**Documentação completa:**
- `SISTEMA_PERIODO_CONFIGURAVEL.md`

**Arquivos importantes:**
- SQL: `database/configuracoes-periodo-pedidos.sql`
- API: `src/app/api/configuracoes-periodo/route.ts`
- Página: `src/app/dashboard/configuracoes-periodo/page.tsx`
- Menu: `src/components/layout/sidebar.tsx`

---

**Data:** 26/12/2025  
**Versão:** 1.0.0  
**Status:** Pronto para Uso ✅


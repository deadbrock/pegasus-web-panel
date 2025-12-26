# 🔗 VERIFICAR INTEGRAÇÃO PAINEL WEB ↔ APP MOBILE

## ❓ PROBLEMA REPORTADO

Usuário configurou período no painel web, mas **não surtiu efeito no app mobile**.

---

## ✅ CHECKLIST DE VERIFICAÇÃO

### 1️⃣ **SQL FOI EXECUTADO NO SUPABASE?** ⚠️ CRÍTICO

**Arquivo:** `database/configuracoes-periodo-pedidos.sql`

**Como verificar:**

1. Abrir Supabase Dashboard: https://supabase.com/dashboard
2. Selecionar projeto
3. Menu lateral: **Table Editor**
4. Procurar tabela: **`configuracoes_periodo_pedidos`**

**Resultado esperado:**
- ✅ Tabela existe
- ✅ Tem pelo menos 1 linha (configuração padrão)

**Se tabela NÃO existe:**
```sql
-- Executar no SQL Editor do Supabase
-- Copiar TODO o conteúdo de: database/configuracoes-periodo-pedidos.sql
-- Colar e executar
```

---

### 2️⃣ **CONFIGURAÇÃO FOI SALVA NO BANCO?**

**No painel web:**

1. Acessar: `/dashboard/configuracoes-periodo`
2. Configurar período desejado
3. Clicar em **"Salvar Configuração"**
4. Ver mensagem de sucesso: "✅ Configuração salva!"

**Verificar no Supabase:**

1. Table Editor > `configuracoes_periodo_pedidos`
2. Ver linha com suas configurações
3. Coluna `ativo` = **true** ✅

**SQL para verificar:**
```sql
SELECT * FROM configuracoes_periodo_pedidos WHERE ativo = true;
```

---

### 3️⃣ **APP MOBILE ESTÁ ATUALIZADO?**

**Verificar versão do código:**

O app mobile precisa ter o código atualizado que busca do banco.

**Arquivo:** `mobile-supervisor/services/periodo-pedidos-service.ts`

**Deve ter:**
- ✅ Função `buscarConfiguracaoAtiva()`
- ✅ Função `verificarPeriodoPedidos()` assíncrona
- ✅ Busca do Supabase

**Se você está usando Expo Go:**
- Fechar app completamente
- Reabrir Expo Go
- Recarregar projeto (R no terminal)

**Se você gerou APK:**
- Precisa gerar **novo APK** com código atualizado
- Instalar novo APK no celular

---

### 4️⃣ **CACHE DO APP MOBILE**

O app tem cache de **5 minutos**.

**Para limpar cache:**

1. **Pull to Refresh:** Puxar tela de pedidos para baixo
2. **Ou aguardar 5 minutos**
3. **Ou fechar e reabrir app**

---

### 5️⃣ **AMBIENTE CORRETO (.env)**

**Verificar se app mobile está conectado ao mesmo Supabase:**

**Arquivo:** `mobile-supervisor/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-key-aqui
```

**Deve ser o MESMO projeto do painel web!**

---

## 🧪 TESTE PASSO A PASSO

### Teste 1: Verificar Tabela Existe

**No Supabase SQL Editor:**

```sql
-- Deve retornar a tabela
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'configuracoes_periodo_pedidos';
```

**Resultado esperado:** 1 linha

---

### Teste 2: Ver Configuração Ativa

**No Supabase SQL Editor:**

```sql
SELECT * FROM configuracoes_periodo_pedidos WHERE ativo = true;
```

**Resultado esperado:**
- Nome: "Período Padrão Mensal" (ou seu nome)
- ativo: true
- dia_inicio: 15 (ou seu valor)
- dia_fim: 23 (ou seu valor)

---

### Teste 3: Testar Função do Banco

**No Supabase SQL Editor:**

```sql
SELECT * FROM verificar_periodo_permitido();
```

**Resultado esperado:**
```
permitido | mensagem                      | config_id
---------|-------------------------------|----------
true     | Período permitido para pedidos| [uuid]
```

---

### Teste 4: Ver Logs do App Mobile

**No terminal onde roda Expo:**

Procurar por:
```
✅ Configuração de período carregada: [nome]
```

**Se aparecer:**
```
ℹ️ Nenhuma configuração de período ativa
```

**Significa:** Tabela não existe ou não tem configuração ativa.

---

## 🔧 DIAGNÓSTICO RÁPIDO

Execute estes comandos no Supabase SQL Editor:

```sql
-- 1. Tabela existe?
SELECT COUNT(*) as tabela_existe 
FROM information_schema.tables 
WHERE table_name = 'configuracoes_periodo_pedidos';

-- 2. Quantas configurações?
SELECT COUNT(*) as total_configs 
FROM configuracoes_periodo_pedidos;

-- 3. Configuração ativa?
SELECT 
  id,
  nome,
  ativo,
  dia_inicio,
  dia_fim,
  created_at
FROM configuracoes_periodo_pedidos 
WHERE ativo = true;

-- 4. Todas as configurações
SELECT 
  id,
  nome,
  ativo,
  dia_inicio,
  dia_fim
FROM configuracoes_periodo_pedidos 
ORDER BY created_at DESC;
```

---

## 🎯 SOLUÇÃO MAIS PROVÁVEL

### Cenário 1: SQL não foi executado ❌

**Solução:**
1. Abrir Supabase SQL Editor
2. Copiar conteúdo de `database/configuracoes-periodo-pedidos.sql`
3. Colar e executar
4. Recarregar app mobile

---

### Cenário 2: Configuração não está ativa ❌

**Solução:**
1. No painel web: `/dashboard/configuracoes-periodo`
2. Marcar checkbox "Ativa" ✅
3. Salvar novamente
4. Recarregar app mobile

---

### Cenário 3: App mobile não atualizado ❌

**Solução (Expo Go):**
```bash
# No terminal
cd mobile-supervisor
npx expo start --clear
```

**Solução (APK):**
```bash
# Gerar novo APK
cd mobile-supervisor
eas build --platform android --profile production
```

---

### Cenário 4: Apps em bancos diferentes ❌

**Solução:**

Verificar se `.env` do app mobile tem mesma URL do painel:

**Painel Web (.env):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

**App Mobile (.env):**
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

**Devem ser IGUAIS!**

---

## 📱 COMO DEVE FUNCIONAR

### Fluxo Correto:

```
1. Admin configura no painel web
   ↓
2. Salva no banco Supabase
   ↓
3. App mobile busca do banco (automático)
   ↓
4. Mostra banner com período
   ↓
5. Valida ao criar pedido
```

### O que você deve ver no app:

**Antes de configurar:**
```
Banner: ✅ Período aberto até dia 23
(Usa configuração padrão)
```

**Depois de configurar (ex: dia 10 ao 15):**
```
Banner: ✅ Período aberto até dia 15
(Usa configuração do banco)
```

---

## 🐛 DEBUG NO APP MOBILE

**Adicionar logs temporários:**

No arquivo `mobile-supervisor/app/(tabs)/pedidos.tsx`:

```typescript
useEffect(() => {
  const init = async () => {
    console.log('🔍 Verificando período...')
    const status = await verificarPeriodoPedidos()
    console.log('📊 Status do período:', status)
    setStatusPeriodo(status)
  }
  init()
}, [])
```

**Ver logs:**
- Expo Go: Ver no terminal
- APK: Ver no Logcat do Android Studio

---

## ✅ TESTE FINAL

**Configuração de teste simples:**

1. **No painel web:**
   - Dia início: 1
   - Dia fim: 31
   - Dias: Todos
   - Horário: 00:00 - 23:59
   - Salvar e ativar ✅

2. **No app mobile:**
   - Fechar e abrir
   - Ir em Pedidos
   - Deve mostrar: "✅ Período aberto até dia 31"

3. **Teste bloqueio:**
   - No painel: Mudar dia fim para ontem
   - Salvar
   - No app: Puxar para atualizar
   - Deve mostrar: "🔒 Período encerrado"

---

## 📞 SE AINDA NÃO FUNCIONAR

**Me envie os resultados de:**

1. **Query no Supabase:**
```sql
SELECT * FROM configuracoes_periodo_pedidos WHERE ativo = true;
```

2. **Logs do app mobile** (terminal Expo)

3. **Screenshot do banner** no app

4. **Versão do app:**
   - Expo Go ou APK?
   - Última vez que atualizou o código?

---

**Criado em:** 26/12/2025  
**Status:** Guia de troubleshooting


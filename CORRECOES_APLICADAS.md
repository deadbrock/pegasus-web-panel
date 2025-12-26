# 🔧 Correções Aplicadas - Pegasus Web Panel

## 📅 Data: 26 de Dezembro de 2025

---

## 🐛 Problemas Identificados e Corrigidos

### 1. ❌ `fetchManutencoesStats is not a function`

**Erro Original:**
```
TypeError: (0 , $.fetchManutencoesStats) is not a function
```

**Causa:** A função estava sendo importada mas não existia no arquivo de serviço.

**Solução Aplicada:**
- **Arquivo:** `src/lib/services/manutencoes-service.ts`
- **Ação:** Adicionada função alias `fetchManutencoesStats()` que chama `calcularEstatisticasManutencoes()`

```typescript
export async function fetchManutencoesStats() {
  return calcularEstatisticasManutencoes()
}
```

---

### 2. ❌ `column pedidos.peso does not exist`

**Erro Original:**
```
{code: '42703', message: 'column pedidos.peso does not exist'}
```

**Causa:** O código tentava buscar a coluna `peso` que não existe na tabela `pedidos`.

**Solução Aplicada:**
- **Arquivo:** `src/lib/services/pedidos-service.ts`
- **Ação:** Removida coluna `peso` da query SQL e definido `peso_total = 0`

```typescript
// ANTES
.select('status, valor, peso, data_entrega, data_entrega_prevista')
const peso_total = data?.reduce((sum, p) => sum + (p.peso || 0), 0) || 0

// DEPOIS
.select('status, valor, data_entrega, data_entrega_prevista')
const peso_total = 0 // Coluna não existe no banco
```

**Nota:** Se precisar da funcionalidade de peso, execute:
```sql
ALTER TABLE pedidos ADD COLUMN peso NUMERIC;
```

---

### 3. ❌ `AuthApiError: User not allowed` (Supervisores)

**Erro Original:**
```
Erro ao carregar supervisores: AuthApiError: User not allowed
```

**Causa:** Usuário com role `logistica` não tem permissão para usar `supabase.auth.admin.listUsers()`.

**Solução Aplicada:**
- **Arquivos Criados:**
  - `src/app/api/supervisores/route.ts` (nova rota API)
  
- **Arquivos Modificados:**
  - `src/app/dashboard/supervisores/page.tsx`

- **Ação:** 
  - Criada rota API que usa `SUPABASE_SERVICE_ROLE_KEY` (permissões de admin)
  - Página de supervisores agora chama a API em vez de usar auth.admin diretamente

**Endpoints Criados:**
- `GET /api/supervisores` - Listar supervisores
- `POST /api/supervisores` - Criar supervisor
- `PATCH /api/supervisores` - Atualizar status

---

### 4. ❌ `Erro ao carregar centros de custo`

**Erro Original:**
```
Error: Erro ao carregar centros de custo
```

**Causa:** Rota API `/api/backend/centro-custo/centros-custo` não existia.

**Solução Aplicada:**
- **Arquivo Criado:** `src/app/api/backend/centro-custo/centros-custo/route.ts`
- **Ação:** Criada API com dados simulados de centros de custo

**Endpoints Criados:**
- `GET /api/backend/centro-custo/centros-custo` - Listar centros
- `POST /api/backend/centro-custo/centros-custo` - Criar centro
- `PUT /api/backend/centro-custo/centros-custo` - Atualizar centro
- `DELETE /api/backend/centro-custo/centros-custo` - Excluir centro

---

### 5. ❌ `supabaseKey is required` (Deploy Vercel)

**Erro Original:**
```
Error: supabaseKey is required.
Build error occurred
```

**Causa:** Variável de ambiente `SUPABASE_SERVICE_ROLE_KEY` não configurada na Vercel.

**Solução Aplicada:**
- **Arquivo Modificado:** `src/app/api/supervisores/route.ts`
- **Ação:** Adicionada validação de variáveis de ambiente com mensagem de erro clara

```typescript
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Variáveis de ambiente obrigatórias não configuradas')
  }

  return createClient(supabaseUrl, supabaseServiceKey, { ... })
}
```

**Arquivos de Documentação Criados:**
- `DEPLOY_VERCEL.md` - Guia completo de deploy
- `scripts/check-env.js` - Script verificador de variáveis
- `.env.example` - Template de configuração

---

## 📦 Arquivos Criados

### Novos Arquivos de Código
1. `src/app/api/supervisores/route.ts` - API de supervisores
2. `src/app/api/backend/centro-custo/centros-custo/route.ts` - API de centros de custo

### Novos Arquivos de Documentação
1. `DEPLOY_VERCEL.md` - Guia de deploy na Vercel
2. `CORRECOES_APLICADAS.md` - Este arquivo
3. `.env.example` - Template de variáveis de ambiente

### Novos Scripts
1. `scripts/check-env.js` - Verificador de variáveis de ambiente

---

## 📝 Arquivos Modificados

1. `src/lib/services/manutencoes-service.ts` - Adicionada função `fetchManutencoesStats()`
2. `src/lib/services/pedidos-service.ts` - Removida coluna `peso`
3. `src/app/dashboard/supervisores/page.tsx` - Migrado para usar API
4. `package.json` - Adicionado script `check-env`

---

## 🚀 Próximos Passos para Deploy

### 1. Configure Variáveis de Ambiente na Vercel

Acesse: **vercel.com → seu projeto → Settings → Environment Variables**

Adicione estas **3 variáveis obrigatórias**:

| Variável | Onde Encontrar | Ambiente |
|----------|----------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon/public | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role | Production, Preview, Development |

### 2. Faça Redeploy

1. Vá em **Deployments**
2. Clique nos **3 pontinhos (...)** do último deploy
3. Clique em **Redeploy**
4. Confirme o redeploy

### 3. Verifique o Deploy

Após o deploy, teste:
- ✅ `/dashboard/supervisores` - Deve carregar sem erros
- ✅ `/dashboard/centro-custos` - Deve carregar sem erros
- ✅ Console do navegador - Sem erros de variáveis de ambiente

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Proteção da Service Role Key

A `SUPABASE_SERVICE_ROLE_KEY` tem **permissões de administrador completas**.

**NUNCA:**
- ❌ Exponha no código front-end
- ❌ Faça commit no Git
- ❌ Compartilhe publicamente

**USE APENAS:**
- ✅ Em rotas API (server-side)
- ✅ Quando realmente necessário
- ✅ Com autenticação/autorização adicional em produção

---

## 🛠️ Comandos Úteis

```bash
# Verificar variáveis de ambiente localmente
npm run check-env

# Limpar cache do Next.js
npm run clean

# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start
```

---

## 📖 Documentação Adicional

- **Deploy na Vercel:** Consulte `DEPLOY_VERCEL.md`
- **Configuração Local:** Consulte `.env.example`
- **Variáveis de Ambiente:** Execute `npm run check-env`

---

## ✅ Checklist de Verificação

### Desenvolvimento Local
- [ ] Arquivo `.env.local` criado com todas as variáveis
- [ ] `npm run check-env` executado sem erros
- [ ] Servidor reiniciado após configurar variáveis
- [ ] Páginas de supervisores e centro-custos funcionando

### Deploy na Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] Todas as variáveis marcadas para todos os ambientes
- [ ] Redeploy executado
- [ ] Build concluído com sucesso
- [ ] Aplicação funcionando em produção

---

## 🆘 Suporte

Se ainda houver problemas:

1. **Logs de Build:** Verifique na aba Deployments da Vercel
2. **Logs de Runtime:** Verifique na aba Functions da Vercel
3. **Variáveis:** Execute `npm run check-env` localmente
4. **Documentação:** Consulte `DEPLOY_VERCEL.md`

---

**Última atualização:** 26 de Dezembro de 2025


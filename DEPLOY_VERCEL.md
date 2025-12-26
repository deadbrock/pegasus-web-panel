# 🚀 Deploy na Vercel - Guia de Configuração

## ⚠️ Variáveis de Ambiente Obrigatórias

Para que o deploy funcione corretamente na Vercel, você **DEVE** configurar as seguintes variáveis de ambiente:

### 1. Acesse o Painel da Vercel

1. Vá para [vercel.com](https://vercel.com)
2. Acesse seu projeto `pegasus-web-panel`
3. Clique em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)

### 2. Adicione as Variáveis de Ambiente

Adicione as seguintes variáveis:

#### **NEXT_PUBLIC_SUPABASE_URL** (obrigatória)
- **Nome:** `NEXT_PUBLIC_SUPABASE_URL`
- **Valor:** URL do seu projeto Supabase (ex: `https://xxxxxxxxxxxxx.supabase.co`)
- **Ambientes:** Production, Preview, Development (marque todos)

#### **NEXT_PUBLIC_SUPABASE_ANON_KEY** (obrigatória)
- **Nome:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Valor:** Chave anônima (anon/public) do Supabase
- **Ambientes:** Production, Preview, Development (marque todos)

#### **SUPABASE_SERVICE_ROLE_KEY** (obrigatória)
- **Nome:** `SUPABASE_SERVICE_ROLE_KEY`
- **Valor:** Chave service_role do Supabase (⚠️ NUNCA compartilhe esta chave!)
- **Ambientes:** Production, Preview, Development (marque todos)

#### **DATABASE_URL** (opcional, para scripts SQL diretos)
- **Nome:** `DATABASE_URL`
- **Valor:** String de conexão PostgreSQL do Supabase
- **Formato:** `postgresql://postgres:[SENHA]@db.[PROJETO].supabase.co:5432/postgres`
- **Ambientes:** Production, Preview, Development (marque todos)

### 3. Onde Encontrar as Chaves do Supabase

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **Project Settings** → **API**
4. Você verá:
   - **Project URL** → use em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** → use em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → use em `SUPABASE_SERVICE_ROLE_KEY` (⚠️ secreta!)

5. Para `DATABASE_URL`:
   - Vá em **Project Settings** → **Database**
   - Copie a **Connection String** no formato URI

### 4. Redeploy Após Configurar

Após adicionar todas as variáveis:

1. Volte para a aba **Deployments**
2. Clique nos 3 pontinhos (...) do último deploy
3. Clique em **Redeploy**
4. Confirme o redeploy

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Proteção da Service Role Key

A `SUPABASE_SERVICE_ROLE_KEY` tem **permissões de administrador** completas no banco de dados.

**NUNCA:**
- Exponha esta chave no código front-end
- Commit esta chave no Git
- Compartilhe esta chave publicamente

**USO CORRETO:**
- Use apenas em rotas API do Next.js (server-side)
- Use apenas quando realmente necessário (ex: admin operations)
- Em produção, adicione camadas extras de autenticação/autorização

---

## ✅ Verificação de Deploy

Após o deploy, teste:

1. **Página de Supervisores**
   - Acesse `/dashboard/supervisores`
   - Deve carregar lista de supervisores sem erros

2. **Centro de Custos**
   - Acesse `/dashboard/centro-custos`
   - Deve carregar centros de custo sem erros

3. **Console do Navegador**
   - Abra DevTools (F12)
   - Verifique se não há erros relacionados a variáveis de ambiente

---

## 🐛 Troubleshooting

### Erro: "supabaseKey is required"

**Causa:** Variável `SUPABASE_SERVICE_ROLE_KEY` não configurada

**Solução:**
1. Adicione a variável nas configurações da Vercel
2. Faça redeploy do projeto

### Erro: "Failed to collect page data"

**Causa:** Alguma variável de ambiente está faltando durante o build

**Solução:**
1. Verifique se todas as 3 variáveis obrigatórias estão configuradas
2. Certifique-se de ter marcado todos os ambientes (Production, Preview, Development)
3. Faça redeploy

### Build funciona localmente mas falha na Vercel

**Causa:** Variáveis de ambiente locais (.env.local) não são automaticamente enviadas para Vercel

**Solução:**
1. Configure manualmente cada variável no painel da Vercel
2. Não confie em arquivos .env* para deploy na Vercel

---

## 📝 Checklist de Deploy

- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] Todas as variáveis marcadas para todos os ambientes
- [ ] Redeploy executado após configurar variáveis
- [ ] Páginas de supervisores e centro-custos testadas
- [ ] Nenhum erro no console do navegador

---

## 🆘 Suporte

Se ainda houver problemas:

1. Verifique os logs de build na Vercel
2. Verifique os logs de runtime na aba Functions
3. Confirme que as chaves do Supabase estão corretas
4. Teste as chaves localmente antes de fazer deploy

---

**Última atualização:** Dezembro 2025


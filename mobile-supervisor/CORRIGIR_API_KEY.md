# 🔧 CORRIGIR API KEY DO SUPABASE

## ❌ **ERRO ATUAL:**
```
Invalid API key
```

Isso significa que a chave da API está incorreta ou desatualizada.

---

## ✅ **SOLUÇÃO (3 PASSOS):**

### **PASSO 1: Pegar a chave correta do Supabase**

1. Acesse: https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw/settings/api

2. Você verá duas chaves importantes:
   ```
   ┌─────────────────────────────────────┐
   │ Project URL:                        │
   │ https://moswhtqcgjcpsideykzw        │
   │ .supabase.co                        │
   └─────────────────────────────────────┘
   
   ┌─────────────────────────────────────┐
   │ anon / public                       │
   │ eyJhbGciOiJIUzI1NiIsInR5cCI6...   │
   │ [Clique para copiar]                │
   └─────────────────────────────────────┘
   ```

3. **Copie a chave `anon / public`** (clique no botão de copiar)

---

### **PASSO 2: Criar/Atualizar arquivo .env**

Na pasta `mobile-supervisor/`, crie um arquivo chamado **`.env`** com:

```env
EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=COLE_AQUI_A_CHAVE_QUE_VOCE_COPIOU
```

**⚠️ IMPORTANTE:** Substitua `COLE_AQUI_A_CHAVE_QUE_VOCE_COPIOU` pela chave real que você copiou!

**Exemplo de como deve ficar:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc3dodHFjZ2pjcHNpZGVreXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ4OTYwMDAsImV4cCI6MjA1MDQ3MjAwMH0.abc123xyz
```

---

### **PASSO 3: Limpar cache e reiniciar**

```bash
cd mobile-supervisor
npx expo start -c
```

O `-c` limpa o cache e carrega as novas variáveis.

---

## 🎯 **ATALHO RÁPIDO**

Se você tiver acesso ao terminal do Supabase ou ao painel admin web que está funcionando, execute este comando no console do navegador:

```javascript
// No painel admin (localhost:3000 ou vercel)
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
```

Copie os valores que aparecerem e use no `.env` do mobile.

---

## 📝 **TEMPLATE DO ARQUIVO .env**

Crie o arquivo: `mobile-supervisor/.env`

```env
# ==============================================
# CONFIGURAÇÃO DO SUPABASE
# ==============================================
# IMPORTANTE: Use as chaves do painel do Supabase
# https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw/settings/api

# URL do projeto (já está correta)
EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co

# Chave anônima (COPIE DO DASHBOARD)
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui

# ==============================================
# DEPOIS DE SALVAR:
# 1. Feche o Expo (Ctrl+C no terminal)
# 2. Limpe o cache: npx expo start -c
# 3. Escaneie o QR code novamente
# ==============================================
```

---

## ✅ **VERIFICAR SE FUNCIONOU**

Após reiniciar o app, você deve ver no terminal:

```
🔍 Verificando configuração do Supabase...
📍 Supabase URL: https://moswhtqcgjcpsideykzw.supabase.co
🔑 Supabase Key: ✅ Configurada
```

Se aparecer `❌ NÃO CONFIGURADA`, o arquivo `.env` não foi carregado corretamente.

---

## 🐛 **AINDA NÃO FUNCIONA?**

### **Problema 1: Arquivo .env não carrega**

**Solução:**
```bash
# Deletar completamente a pasta .expo
rm -rf .expo

# Ou no Windows:
rmdir /s /q .expo

# Reiniciar
npx expo start -c
```

### **Problema 2: Chave ainda inválida**

**Verificar no código:**

Abra `mobile-supervisor/services/supabase.ts` e adicione logs temporários:

```typescript
console.log('🔍 DEBUG - URL:', supabaseUrl)
console.log('🔍 DEBUG - Key:', supabaseAnonKey)
```

Se aparecer `undefined`, o `.env` não está sendo lido.

### **Problema 3: .env na pasta errada**

**Estrutura correta:**
```
pegasus-web-panel/
├── mobile-supervisor/
│   ├── .env          ← DEVE ESTAR AQUI
│   ├── app.config.js
│   ├── package.json
│   └── ...
└── src/
```

**❌ ERRADO:**
```
pegasus-web-panel/
├── .env          ← NÃO AQUI (essa é do Next.js)
└── mobile-supervisor/
```

---

## 🆘 **AINDA COM PROBLEMAS?**

Execute este comando para diagnóstico:

```bash
cd mobile-supervisor
node -e "require('dotenv').config(); console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL); console.log('KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Indefinida')"
```

Se der erro `Cannot find module 'dotenv'`, instale:
```bash
npm install dotenv --save-dev
```

---

## 📋 **CHECKLIST**

- [ ] Acessei o dashboard do Supabase
- [ ] Copiei a chave `anon / public`
- [ ] Criei o arquivo `.env` na pasta `mobile-supervisor/`
- [ ] Colei a chave no arquivo
- [ ] Salvei o arquivo
- [ ] Executei `npx expo start -c`
- [ ] App não mostra mais erro "Invalid API key"

---

## ✅ **PRONTO!**

Com a chave correta, o app funcionará perfeitamente em qualquer rede.

**Me avise quando corrigir!** 🚀


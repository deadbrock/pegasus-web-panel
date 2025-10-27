# 🔧 Solução de Problemas - Pegasus Supervisor App

## ⚪ TELA BRANCA após escanear QR code

### Causa Mais Comum: `.env` não configurado

O app precisa das credenciais do Supabase para iniciar.

### ✅ SOLUÇÃO RÁPIDA:

#### Passo 1: Criar arquivo `.env`

No Windows (PowerShell):
```powershell
cd mobile-supervisor
New-Item -Path ".env" -ItemType File -Force
notepad .env
```

#### Passo 2: Adicionar as credenciais

Cole este conteúdo no arquivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

#### Passo 3: Pegar as credenciais do Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings → API**
4. Copie:
   - **Project URL** → cole no `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** → cole no `EXPO_PUBLIC_SUPABASE_ANON_KEY`

#### Passo 4: Reiniciar o servidor

No terminal do projeto:
```powershell
# Parar o servidor (Ctrl+C)

# Limpar cache
npx expo start -c

# OU simplesmente
npm start
```

#### Passo 5: Escanear o QR code novamente

Abra o Expo Go e escaneie o novo QR code.

---

## 🔍 DIAGNÓSTICO: Como identificar o problema

### 1. Verificar Logs no Terminal

Olhe o terminal onde rodou `npm start`. Procure por:

❌ **Erro de ambiente:**
```
Error: Supabase URL e Anon Key são obrigatórias
```
**Solução:** Configure o `.env`

❌ **Erro de sintaxe:**
```
SyntaxError: Unexpected token
```
**Solução:** Há erro no código (pule para seção "Erro de Código")

❌ **Erro de rede:**
```
Network request failed
```
**Solução:** Verifique conexão Wi-Fi

### 2. Verificar Logs no Expo Go (Celular)

No app Expo Go:
- Agite o celular
- Toque em "Show Dev Menu"
- Selecione "Debug Remote JS"
- Abra o Chrome DevTools (abre automaticamente)
- Vá na aba **Console**

Procure por erros em vermelho.

---

## 🛠️ SOLUÇÕES DETALHADAS

### Solução 1: Limpar Cache

```powershell
cd mobile-supervisor

# Limpar cache do Expo
npx expo start -c

# Limpar cache do Metro (alternativa)
npx react-native start --reset-cache

# Limpar tudo (última opção)
rm -rf node_modules
npm install
npx expo start -c
```

### Solução 2: Verificar Arquivo .env

```powershell
# Ver se o arquivo existe
ls .env

# Ver conteúdo
cat .env
```

Deve mostrar:
```
EXPO_PUBLIC_SUPABASE_URL=https://...
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### Solução 3: Testar Credenciais do Supabase

Crie um arquivo de teste `mobile-supervisor/test-supabase.js`:

```javascript
require('dotenv').config()

console.log('EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL)
console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada ✅' : 'FALTANDO ❌')

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.error('❌ ERRO: EXPO_PUBLIC_SUPABASE_URL não está definida!')
  process.exit(1)
}

if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ ERRO: EXPO_PUBLIC_SUPABASE_ANON_KEY não está definida!')
  process.exit(1)
}

console.log('✅ Variáveis de ambiente configuradas corretamente!')
```

Execute:
```powershell
node test-supabase.js
```

### Solução 4: Modo de Desenvolvimento Simplificado

Edite `mobile-supervisor/services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

// TEMPORÁRIO: Valores hardcoded para teste
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'COLE_SUA_URL_AQUI'
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'COLE_SUA_CHAVE_AQUI'

console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Configurada ✅' : 'FALTANDO ❌')

if (!supabaseUrl || supabaseUrl === 'COLE_SUA_URL_AQUI') {
  console.error('❌ ERRO: Supabase URL não configurada!')
  throw new Error('Configure EXPO_PUBLIC_SUPABASE_URL no arquivo .env')
}

if (!supabaseAnonKey || supabaseAnonKey === 'COLE_SUA_CHAVE_AQUI') {
  console.error('❌ ERRO: Supabase Anon Key não configurada!')
  throw new Error('Configure EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// ... resto do código
```

### Solução 5: Verificar Conexão

```powershell
# Testar se o Supabase está acessível
curl https://seu-projeto.supabase.co

# OU no PowerShell
Invoke-WebRequest -Uri "https://seu-projeto.supabase.co"
```

---

## 📱 PROBLEMAS ESPECÍFICOS

### Problema: "Network request failed"

**Causa:** Celular e PC não estão na mesma rede Wi-Fi

**Solução:**
1. Conecte ambos na mesma rede
2. Desative VPN (se tiver)
3. Desative firewall/antivírus temporariamente
4. Use conexão via cabo USB (Tunnel):
   ```powershell
   npx expo start --tunnel
   ```

### Problema: "Unable to resolve module"

**Causa:** Dependências não instaladas

**Solução:**
```powershell
cd mobile-supervisor
rm -rf node_modules
npm install
npx expo start -c
```

### Problema: "Something went wrong"

**Causa:** Erro genérico no código

**Solução:**
1. Veja os logs detalhados no terminal
2. Ative modo debug no Expo Go (agite → Debug Remote JS)
3. Verifique o Chrome DevTools

### Problema: App fecha sozinho

**Causa:** Erro fatal no código

**Solução:**
```powershell
# Iniciar com logs detalhados
npx expo start --dev-client
```

---

## 🔥 SOLUÇÃO DEFINITIVA (Se nada funcionar)

### Modo de Teste Sem Supabase

Edite `mobile-supervisor/services/supabase.ts` para modo offline:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'

// MODO TESTE: Cliente fake do Supabase
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async (credentials: any) => ({
      data: {
        user: {
          id: '1',
          email: credentials.email,
          user_metadata: { name: 'Teste', role: 'supervisor' }
        },
        session: { access_token: 'fake-token' }
      },
      error: null
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback: any) => ({
      data: { subscription: { unsubscribe: () => {} } }
    })
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({ data: [], error: null }),
      in: () => ({ data: [], error: null }),
      lte: () => ({ data: [], error: null }),
      lt: () => ({ data: [], error: null }),
      gte: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ single: async () => ({ data: null, error: null }) })
    })
  }),
  channel: () => ({
    on: () => ({ subscribe: () => ({}) })
  })
}

export const isAuthenticated = async () => false
export const getCurrentUser = async () => null
export const signOut = async () => {}

console.log('⚠️ MODO TESTE: Usando Supabase fake')
```

Isso fará o app abrir em modo de demonstração.

---

## ✅ CHECKLIST DE DIAGNÓSTICO

Marque cada item conforme testa:

- [ ] Arquivo `.env` existe?
- [ ] `.env` tem as duas variáveis?
- [ ] Credenciais do Supabase estão corretas?
- [ ] Servidor foi reiniciado após criar `.env`?
- [ ] Cache foi limpo (`npx expo start -c`)?
- [ ] Celular e PC na mesma rede Wi-Fi?
- [ ] Firewall/antivírus desativado?
- [ ] Logs do terminal mostram erros?
- [ ] Expo Go está atualizado?

---

## 🆘 AINDA COM PROBLEMAS?

### 1. Ver Logs Completos

```powershell
npx expo start --dev-client --clear
```

### 2. Testar no Navegador (Web)

```powershell
npx expo start
# Pressione 'w' para abrir no navegador
```

Se funcionar no navegador, o problema é no Expo Go.

### 3. Reinstalar Expo Go

No celular:
1. Desinstale o Expo Go
2. Reinstale da Play Store
3. Tente novamente

### 4. Usar Emulador Android

```powershell
# Baixe Android Studio
# Inicie um emulador (AVD)
npx expo start
# Pressione 'a' para abrir no Android
```

---

## 📞 Informações Úteis

**Versões Necessárias:**
- Node.js: 18+
- Expo Go: Última versão (Play Store)
- npm: 9+

**Comandos Úteis:**
```powershell
# Ver versões
node -v
npm -v
npx expo --version

# Resetar tudo
rm -rf node_modules .expo
npm install
npx expo start -c
```

---

## 🎯 RESUMO: Solução Mais Provável

**99% dos casos de tela branca:**

1. Crie `.env` com credenciais do Supabase
2. Reinicie: `npx expo start -c`
3. Escaneie QR code novamente
4. Aguarde 10-15 segundos

**Se não resolver, me avise com:**
- 📸 Print dos logs do terminal
- 📸 Print da tela do celular
- ⚙️ Sistema do celular (Android/iOS)

---

*Última atualização: 27/10/2025*


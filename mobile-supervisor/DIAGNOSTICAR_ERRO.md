# 🔍 DIAGNÓSTICO DE ERROS - "Something Went Wrong"

## 📱 Como Identificar o Erro Específico

Quando você vê "Something went wrong" no Expo Go, siga estes passos:

### **1️⃣ Ver Logs Detalhados no Terminal**

No terminal onde está rodando `npx expo start`, procure por:
```
ERROR
```

Copie e cole toda a mensagem de erro aqui.

---

### **2️⃣ Ver Logs no App Expo Go**

1. Abra o **Expo Go**
2. **Sacuda o celular** (ou pressione Ctrl+M no Android)
3. Selecione **"Show Dev Menu"**
4. Toque em **"Debug Remote JS"** ou **"Show Element Inspector"**
5. Tire um **print da tela de erro**

---

### **3️⃣ Verificar no Metro Bundler**

Quando você scaneou o QR Code, o Metro Bundler deve mostrar:
```
✓ Bundled ...
ou
ERROR in ...
```

Se houver `ERROR`, copie a mensagem completa.

---

## 🐛 ERROS COMUNS E SOLUÇÕES

### **Erro 1: "Unable to resolve module"**
```
ERROR: Unable to resolve "date-fns" from "..."
ERROR: Unable to resolve "expo-notifications" from "..."
```

**Solução:**
```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
npm install date-fns expo-notifications --legacy-peer-deps
npx expo start --clear
```

---

### **Erro 2: "Element type is invalid"**
```
ERROR: Element type is invalid: expected a string or a class/function
```

**Solução:**
- Problema com importações de componentes
- Verifique se todos os arquivos `.tsx` estão exportando corretamente

---

### **Erro 3: "Cannot read property '...' of undefined"**
```
TypeError: Cannot read property 'map' of undefined
TypeError: Cannot read property 'toFixed' of undefined
```

**Solução:**
- Problema com dados não carregados
- Adicionar validações de dados nos componentes

---

### **Erro 4: "Supabase credentials not configured"**
```
ERROR: Invalid API key
ERROR: Supabase URL e Anon Key são obrigatórias
```

**Solução:**
```bash
# Verificar se o .env existe
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
Get-Content .env

# Se estiver vazio ou incorreto, reconfigure:
EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### **Erro 5: "expo-notifications not working in Expo Go"**
```
ERROR: expo-notifications was removed from Expo Go
```

**Solução:**
- ✅ **IGNORAR** - As notificações não funcionam no Expo Go
- ✅ O app deve funcionar normalmente **sem** notificações push
- ✅ O banner visual de período funciona normalmente

---

## ✅ TESTE RÁPIDO

Execute este comando para verificar se o projeto está OK:

```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
npx expo-doctor
```

**Resultado esperado:**
```
✓ 16/17 checks passed
✖ Check that no duplicate dependencies (PODE IGNORAR - é do projeto raiz)
```

---

## 🚀 SOLUÇÃO DEFINITIVA

Se nenhuma das soluções acima funcionou:

### **Opção 1: Reinstalação Completa**
```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install --legacy-peer-deps
npx expo start --clear
```

### **Opção 2: Build de Desenvolvimento (Recomendado)**
```bash
# Expo Go tem limitações. Gere um development build:
eas build --profile development --platform android
```

---

## 📸 ENVIE ESSAS INFORMAÇÕES

Para eu te ajudar melhor, envie:

1. ✅ **Print da tela de erro** no Expo Go
2. ✅ **Logs do terminal** (copiar e colar)
3. ✅ **Resultado do comando**: `npx expo-doctor`
4. ✅ **Qual tela está causando o erro?** (splash, login, dashboard, pedidos?)

---

## 💡 DICA

Se o erro acontecer em uma tela específica:
- **Splash/Index** → Problema no `app/index.tsx`
- **Login** → Problema no `app/(auth)/login.tsx`
- **Dashboard** → Problema no `app/(tabs)/dashboard.tsx`
- **Pedidos** → Problema no `app/(tabs)/pedidos.tsx`

Me avise qual tela está dando erro!


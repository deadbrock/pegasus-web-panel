# 🔧 RESOLVER ERRO: Invalid UUID appId

## ❌ **ERRO:**
```
Invalid UUID appId
Error: GraphQL request failed.
```

## ✅ **SOLUÇÃO APLICADA:**

Removi o `projectId` inválido do `app.config.js`.

---

## 🚀 **COMANDOS PARA CORRIGIR:**

### **Opção 1: Deixar EAS Criar Automaticamente (RECOMENDADO)**

```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor

# Tentar build novamente - EAS vai criar o projeto
eas build --platform android --profile preview
```

O EAS vai perguntar:
```
? Would you like to create a project for @seu-usuario/pegasus-supervisor? (Y/n)
```

**Responda:** `Y` (sim)

O EAS vai:
1. ✅ Criar o projeto automaticamente
2. ✅ Gerar um UUID válido
3. ✅ Atualizar o app.config.js
4. ✅ Iniciar o build

---

### **Opção 2: Criar Projeto Manualmente**

```bash
cd mobile-supervisor

# Inicializar projeto EAS
eas init

# Depois fazer build
eas build --platform android --profile preview
```

---

### **Opção 3: Usar Outro Perfil de Build**

```bash
# Tentar build de produção
eas build --platform android --profile production
```

---

## 📝 **O QUE ACONTECEU:**

### **Antes:**
```javascript
extra: {
  eas: {
    projectId: "pegasus-supervisor-2025"  // ❌ Não é UUID válido
  }
}
```

### **Depois:**
```javascript
extra: {
  // EAS vai adicionar automaticamente:
  // eas: {
  //   projectId: "abc123-def456-..."  // ✅ UUID válido
  // }
}
```

---

## 🎯 **PASSO A PASSO COMPLETO:**

### **1. Verificar Login EAS:**

```bash
eas whoami
```

Se não estiver logado:
```bash
eas login
```

### **2. Tentar Build Novamente:**

```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
eas build --platform android --profile preview
```

### **3. Confirmar Criação do Projeto:**

Quando perguntar:
```
? Would you like to create a project for @seu-usuario/pegasus-supervisor? (Y/n)
```

Digite: **Y** (Enter)

### **4. Aguardar Build:**

⏱️ **Tempo estimado:** 10-20 minutos

O terminal vai mostrar:
```
✔ Build started
🔗 Build URL: https://expo.dev/accounts/.../builds/...
```

### **5. Baixar APK:**

Quando finalizar:
```
✔ Build finished
📥 Download: [link]
```

Clique no link ou vá no painel EAS.

---

## 🐛 **OUTROS ERROS POSSÍVEIS:**

### **Erro: "Not logged in"**

**Solução:**
```bash
eas login
```

### **Erro: "No bundle identifier"**

**Solução:** Já configurado no `app.config.js`:
```javascript
android: {
  package: "com.pegasus.supervisor"  // ✅ OK
}
```

### **Erro: "Missing credentials"**

**Solução:** EAS vai gerar automaticamente. Só confirmar quando perguntar.

### **Erro: "Build failed"**

**Ver logs:**
```bash
# Ver último build
eas build:list
```

---

## 📱 **ALTERNATIVA: BUILD LOCAL**

Se EAS não funcionar, pode fazer build local:

```bash
# Instalar Android Studio primeiro
# Depois:

cd mobile-supervisor
npx expo prebuild
cd android
./gradlew assembleRelease
```

APK vai estar em: `android/app/build/outputs/apk/release/`

---

## ✅ **CHECKLIST:**

- [ ] Verificar login EAS: `eas whoami`
- [ ] Commit feito (já está ✅)
- [ ] Tentar build: `eas build --platform android --profile preview`
- [ ] Confirmar criação do projeto quando perguntar
- [ ] Aguardar build (10-20 min)
- [ ] Baixar APK
- [ ] Instalar no celular
- [ ] Testar app com logo

---

## 🚀 **COMANDO RESUMIDO:**

```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
eas build --platform android --profile preview
```

Quando perguntar se quer criar projeto: **Y**

Aguardar build e baixar APK! ✅

---

## 📞 **SE AINDA DER ERRO:**

Me envie a mensagem de erro completa que eu ajudo a resolver!

**Agora tente novamente! 🚀**


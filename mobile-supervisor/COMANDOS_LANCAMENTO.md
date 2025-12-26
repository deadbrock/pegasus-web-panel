# ⚡ COMANDOS RÁPIDOS DE LANÇAMENTO

## 🚀 PASSO A PASSO SIMPLIFICADO

### 1️⃣ PREPARAÇÃO (Fazer uma vez)
```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Fazer login no Expo (criar conta se não tiver)
eas login

# Navegar para pasta do app
cd mobile-supervisor

# Configurar projeto para builds
eas build:configure
```

---

### 2️⃣ GERAR APK DE PRODUÇÃO (Principal)
```bash
# Build de produção - APK para distribuição interna
eas build --platform android --profile production
```

**O que esperar:**
- ⏱️ Tempo: 30-40 minutos
- 💰 Custo: GRÁTIS
- 📦 Resultado: Link para download do APK
- 📱 Uso: Distribuir via WhatsApp/Email/Link

---

### 3️⃣ GERAR AAB PARA PLAY STORE (Opcional)
```bash
# Build para Google Play Store
eas build --platform android --profile production-store
```

**O que esperar:**
- ⏱️ Tempo: 30-40 minutos
- 💰 Custo: GRÁTIS (mas precisa pagar $25 para conta Play Store)
- 📦 Resultado: Arquivo AAB para upload na Play Store
- 🏢 Uso: Publicação oficial na loja

---

## 📋 VERIFICAÇÕES ANTES DO BUILD

### Verificar arquivo .env existe:
```bash
# Windows PowerShell
Get-Content mobile-supervisor\.env

# Deve mostrar:
# EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-key-aqui
```

### Verificar versão do app:
```bash
# Abrir app.config.js e verificar:
# version: "1.0.0"
# versionCode: 1
```

---

## 🔄 OUTROS COMANDOS ÚTEIS

### Ver lista de builds:
```bash
eas build:list
```

### Ver detalhes de um build específico:
```bash
eas build:view [BUILD_ID]
```

### Cancelar build em andamento:
```bash
eas build:cancel
```

### Ver status do projeto:
```bash
eas project:info
```

---

## 🎯 EXEMPLO DE FLUXO COMPLETO

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Entrar na pasta do app
cd mobile-supervisor

# 4. Configurar (apenas primeira vez)
eas build:configure

# 5. Gerar APK de produção
eas build --platform android --profile production

# 6. Aguardar build terminar (30-40 min)
# ⏳ Você pode fechar o terminal, o build continua na nuvem

# 7. Após concluído, copiar link do APK
# 🔗 https://expo.dev/artifacts/eas/xxxxx.apk

# 8. Distribuir para supervisores! 🎉
```

---

## 📱 APÓS RECEBER O LINK DO APK

### Distribuir:
1. Copie o link fornecido pelo EAS
2. Envie para supervisores via:
   - WhatsApp
   - Email
   - SMS
   - Link na intranet

### Instruções para Supervisores:
```
🎉 PEGASUS SUPERVISOR - INSTALAÇÃO

1. Abra este link no seu celular Android:
   [LINK_DO_APK_AQUI]

2. Clique em "Download"

3. Quando aparecer aviso de segurança:
   - Toque em "Configurações"
   - Ative "Permitir desta fonte"
   - Volte e clique em "Instalar"

4. Após instalação, abra o app

5. Faça login com suas credenciais:
   Email: [seu-email]
   Senha: [sua-senha]

⚠️ Primeiro acesso pode demorar alguns segundos.

📞 Dúvidas? Entre em contato: [seu-contato]
```

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Para versão 1.0.1, 1.0.2, etc:

```bash
# 1. Atualizar código conforme necessário

# 2. Editar app.config.js:
#    version: "1.0.1"    (era "1.0.0")
#    versionCode: 2      (era 1)

# 3. Gerar novo build
eas build --platform android --profile production

# 4. Distribuir nova versão
```

---

## ⚠️ TROUBLESHOOTING

### "Command not found: eas"
```bash
# Reinstalar globalmente
npm install -g eas-cli
```

### "Not logged in"
```bash
# Fazer login novamente
eas login
```

### "Build failed"
```bash
# Limpar cache e tentar novamente
eas build --platform android --profile production --clear-cache
```

### "No EXPO_PUBLIC_SUPABASE_URL found"
```bash
# Verificar se .env existe
Get-Content mobile-supervisor\.env

# Se não existir, criar:
New-Item -Path "mobile-supervisor\.env" -ItemType File
# E adicionar as variáveis manualmente
```

---

## 🎉 PRONTO!

Agora você está pronto para lançar o app oficialmente! 🚀

**Dica:** Mantenha este arquivo aberto durante o processo de build.

**Próximo passo:** Execute o comando de build e aguarde!

```bash
eas build --platform android --profile production
```

✨ **BOA SORTE COM O LANÇAMENTO!** ✨


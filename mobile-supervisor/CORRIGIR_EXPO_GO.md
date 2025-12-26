# 🔧 CORREÇÃO: App Não Inicia no Expo Go

## ❌ Problema:
- Erro "Something went wrong" no celular
- App não inicia via QR code

## ✅ Solução Aplicada:

### 1. Variáveis de Ambiente Configuradas
- ✅ Criado arquivo `.env` com credenciais Supabase
- ✅ App agora tem acesso às variáveis necessárias

### 2. Web Desabilitada
- ✅ Removido erro de build web
- ✅ Foco apenas em Android/iOS

### 3. Cache Limpo
- ✅ Removido cache corrompido

---

## 🚀 COMO TESTAR AGORA:

### **Opção 1: Limpar Tudo e Reiniciar** (RECOMENDADO)

```bash
cd mobile-supervisor

# 1. Parar o Expo (Ctrl+C)

# 2. Limpar TUDO
npx expo start --clear

# 3. Aguardar carregar completamente

# 4. Escanear QR code novamente com Expo Go
```

### **Opção 2: Reinstalar no Celular**

```bash
# 1. No celular:
#    - Fechar o app Expo Go completamente
#    - Limpar dados do Expo Go (configurações do Android)
#    - Abrir Expo Go novamente

# 2. No computador:
cd mobile-supervisor
npx expo start --clear

# 3. Escanear QR code novamente
```

### **Opção 3: Usar Tunnel (Se Wi-Fi não funcionar)**

```bash
cd mobile-supervisor
npx expo start --tunnel --clear

# Escanear o novo QR code
# Pode ser mais lento mas funciona melhor em algumas redes
```

---

## 🐛 SE AINDA NÃO FUNCIONAR:

### **Erro Comum: Permissões**

O app precisa de algumas permissões. Na primeira vez que abrir, aceite:
- ✅ Notificações
- ✅ Localização (quando usar mapas)

### **Erro Comum: Versão do Expo Go**

Certifique-se de ter a **versão mais recente** do Expo Go:
- Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

### **Erro Comum: Cache do Celular**

```bash
# No celular:
1. Abrir Expo Go
2. Menu (3 pontinhos)
3. "Clear cache" ou "Limpar cache"
4. Fechar e abrir novamente
```

---

## 📱 ALTERNATIVA: FAZER BUILD DIRETO

Se o Expo Go continuar com problemas, você pode fazer o build direto:

```bash
cd mobile-supervisor

# Build de desenvolvimento (mais rápido)
eas build --profile development --platform android

# Aguardar ~10-15 minutos
# Download do APK quando terminar
# Instalar no celular

# Este APK funciona independente do Expo Go!
```

---

## ✅ VERIFICAÇÕES:

Antes de tentar novamente, confira:

- [ ] Arquivo `.env` existe em `mobile-supervisor/`
- [ ] Expo foi reiniciado com `--clear`
- [ ] Expo Go está atualizado no celular
- [ ] Celular e computador na mesma rede Wi-Fi
- [ ] Nenhum firewall bloqueando a conexão

---

## 🎯 COMANDOS ÚTEIS:

```bash
# Limpar e reiniciar
npx expo start --clear

# Usar tunnel (mais compatível)
npx expo start --tunnel --clear

# Ver logs detalhados
npx expo start --clear --verbose

# Resetar tudo
rm -rf node_modules .expo
npm install
npx expo start --clear
```

---

## 📞 AINDA COM PROBLEMAS?

**Tente fazer o build direto:**
```bash
eas build --profile development --platform android
```

Isso gera um APK independente que funciona 100% no seu celular!

---

**Tempo estimado:** 5-10 minutos para corrigir
**Build APK alternativo:** 15-20 minutos


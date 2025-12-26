# 🚀 GUIA DE LANÇAMENTO OFICIAL - APP SUPERVISOR PEGASUS

## 📋 ÍNDICE
1. [Pré-requisitos](#pré-requisitos)
2. [Opção 1: Build Standalone (APK)](#opção-1-build-standalone-apk)
3. [Opção 2: Google Play Store](#opção-2-google-play-store)
4. [Distribuição e Instalação](#distribuição-e-instalação)
5. [Pós-Lançamento](#pós-lançamento)

---

## 🔧 PRÉ-REQUISITOS

### 1. Instalar EAS CLI (Expo Application Services)
```bash
npm install -g eas-cli
```

### 2. Login no Expo
```bash
eas login
```
- Se não tiver conta Expo, crie em: https://expo.dev/signup
- É **GRÁTIS** para builds básicos!

### 3. Verificar configurações do projeto
```bash
cd mobile-supervisor
```

---

## 🎯 OPÇÃO 1: BUILD STANDALONE (APK)
**⭐ RECOMENDADO PARA COMEÇAR**

### Vantagens:
- ✅ Rápido (30-40 minutos para gerar)
- ✅ Grátis
- ✅ Distribuição imediata
- ✅ Não precisa de aprovação
- ✅ Ideal para equipe interna

### Passo 1: Configurar projeto para build
```bash
cd mobile-supervisor
eas build:configure
```

### Passo 2: Gerar APK de Produção
```bash
eas build --platform android --profile production
```

**O que acontece:**
1. ⏱️ Expo compila o app na nuvem
2. 📦 Gera arquivo APK otimizado
3. 🔗 Fornece link para download
4. 💾 APK fica disponível por 30 dias

### Passo 3: Baixar o APK
Após a compilação, você receberá:
```
✅ Build concluído!
📦 APK disponível em: https://expo.dev/artifacts/eas/[ID-DO-BUILD].apk
```

### Passo 4: Distribuir
- Baixe o APK
- Envie via WhatsApp/Email
- Ou hospede em seu servidor
- Supervisores instalam direto no celular

---

## 📱 OPÇÃO 2: GOOGLE PLAY STORE
**🏢 LANÇAMENTO PROFISSIONAL**

### Pré-requisitos Adicionais:
1. **Conta Google Play Console** ($25 taxa única)
   - Criar em: https://play.google.com/console
   
2. **Informações necessárias:**
   - Nome do app: **Pegasus Supervisor**
   - Descrição curta
   - Descrição longa
   - Screenshots (mínimo 2)
   - Ícone 512x512
   - Banner promocional
   - Política de privacidade (URL)

### Passo 1: Gerar AAB (Android App Bundle)
```bash
eas build --platform android --profile production
```

### Passo 2: Configurar eas.json para Play Store
Arquivo já configurado com:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Passo 3: Upload no Google Play Console
1. Acesse: https://play.google.com/console
2. Criar novo aplicativo
3. Upload do AAB gerado
4. Preencher informações da loja
5. Adicionar screenshots
6. Enviar para revisão

### Passo 4: Aguardar Aprovação
- ⏱️ Tempo de revisão: 1-3 dias
- 📧 Google envia email quando aprovado
- 🎉 App fica disponível na Play Store!

---

## 📦 CONFIGURAÇÃO ATUAL DO APP

### app.config.js
```javascript
{
  name: "Pegasus Supervisor",
  slug: "pegasus-supervisor",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1e40af"
  },
  assetBundlePatterns: ["**/*"],
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#1e40af"
    },
    package: "com.pegasus.supervisor",
    versionCode: 1,
    permissions: [
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE"
    ]
  },
  extra: {
    eas: {
      projectId: "SEU_PROJECT_ID_AQUI"
    }
  }
}
```

---

## 🔐 VARIÁVEIS DE AMBIENTE (SEGURANÇA)

### ⚠️ IMPORTANTE: Nunca commite .env no Git!

### Opção 1: EAS Secrets (Recomendado)
```bash
# Configurar secrets no EAS
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "sua-url-aqui"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sua-key-aqui"
```

### Opção 2: Arquivo .env local
O arquivo `.env` é usado apenas em desenvolvimento.
Para produção, use EAS Secrets.

---

## 📸 ASSETS NECESSÁRIOS

### ✅ Já configurado:
- [x] Logo (logo-pegasus-mobile.png)
- [x] Ícone (icon.png - 1024x1024)
- [x] Splash Screen (splash.png)
- [x] Adaptive Icon (adaptive-icon.png)

### 📷 Para Google Play Store (criar):
- [ ] Screenshot 1 (celular) - Tela de Login
- [ ] Screenshot 2 (celular) - Dashboard
- [ ] Screenshot 3 (celular) - Tela de Pedidos
- [ ] Screenshot 4 (celular) - Tela de Contratos
- [ ] Banner promocional (1024x500)
- [ ] Ícone da Play Store (512x512)

---

## 🎨 PREPARAR SCREENSHOTS

### Como tirar screenshots:
1. Abra o app no Expo Go
2. Navegue até a tela desejada
3. Tire screenshot no celular
4. Ou use emulador e capture

### Tamanhos requeridos (Play Store):
- **Mínimo:** 320px
- **Máximo:** 3840px
- **Proporção:** 16:9 ou 9:16
- **Formato:** PNG ou JPEG

---

## 🚀 COMANDOS RÁPIDOS

### Build APK (Desenvolvimento/Teste)
```bash
cd mobile-supervisor
eas build --platform android --profile development
```

### Build APK (Produção)
```bash
cd mobile-supervisor
eas build --platform android --profile production
```

### Build AAB (Google Play Store)
```bash
cd mobile-supervisor
eas build --platform android --profile production
```

### Verificar status do build
```bash
eas build:list
```

### Cancelar build em andamento
```bash
eas build:cancel
```

---

## 📱 DISTRIBUIÇÃO E INSTALAÇÃO

### Método 1: Link Direto
1. Após build, copie o link do APK
2. Envie para os supervisores
3. Eles abrem o link no celular
4. Download e instalação automáticos

### Método 2: WhatsApp/Email
1. Baixe o APK no computador
2. Envie via WhatsApp ou Email
3. Supervisores baixam e instalam

### Método 3: QR Code
1. Gere QR Code com o link do APK
2. Supervisores escaneiam com câmera
3. Redirecionamento para download

### Método 4: Servidor Próprio
1. Hospede o APK em seu servidor
2. Crie página de download
3. Compartilhe o link

---

## ⚠️ INSTALAÇÃO EM ANDROID

### Habilitar "Fontes Desconhecidas":
1. Abrir **Configurações**
2. **Segurança** ou **Privacidade**
3. Habilitar **"Instalar apps de fontes desconhecidas"**
4. Ou permitir para o navegador/WhatsApp específico

### Processo de Instalação:
1. Baixar APK
2. Abrir arquivo
3. Clicar em "Instalar"
4. Aguardar instalação
5. Abrir app

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Versão 1.0.1, 1.0.2, etc:
1. Fazer mudanças no código
2. Atualizar `version` e `versionCode` em `app.config.js`:
   ```javascript
   version: "1.0.1",  // +0.0.1
   versionCode: 2,    // +1
   ```
3. Gerar novo build:
   ```bash
   eas build --platform android --profile production
   ```
4. Distribuir nova versão

### OTA Updates (Over-The-Air):
Com EAS Update, você pode enviar atualizações menores sem gerar novo APK:
```bash
eas update --branch production --message "Correção de bug"
```

**Limitações OTA:**
- ✅ Funciona para: código JavaScript, assets, estilos
- ❌ NÃO funciona para: código nativo, permissões, dependências nativas

---

## 📊 MONITORAMENTO PÓS-LANÇAMENTO

### 1. Sentry (Crash Reporting)
```bash
npm install @sentry/react-native
```

### 2. Google Analytics
```bash
npm install @react-native-firebase/analytics
```

### 3. Logs Customizados
Já implementados no código:
```typescript
console.log('✅ Login bem-sucedido')
console.error('❌ Erro ao criar pedido')
```

---

## ✅ CHECKLIST PRÉ-LANÇAMENTO

### Configurações:
- [x] Logo configurado
- [x] Splash screen configurado
- [x] Cores do tema definidas (azul metálico)
- [x] Variáveis de ambiente (.env)
- [ ] EAS Secrets configurados (se for build remoto)

### Funcionalidades:
- [x] Login funcionando
- [x] Dashboard carregando dados
- [x] Pedidos sendo criados
- [x] Contratos sendo gerenciados
- [x] Isolamento de dados por supervisor
- [x] Validações de segurança

### Testes:
- [ ] Testar login com credenciais válidas
- [ ] Testar login com credenciais inválidas
- [ ] Testar criação de pedido
- [ ] Testar criação de contrato
- [ ] Testar em diferentes tamanhos de tela
- [ ] Testar em Android 10, 11, 12, 13, 14

### Documentação:
- [x] AUDITORIA_SEGURANCA.md
- [x] FLUXO_CREDENCIAIS.md
- [x] STATUS_DESENVOLVIMENTO.md
- [x] GUIA_LANCAMENTO.md (este arquivo)

---

## 🎉 PÓS-LANÇAMENTO

### Para Supervisores:
1. **Criar Manual do Usuário**
   - Como fazer login
   - Como criar pedido
   - Como gerenciar contratos
   - FAQ

2. **Vídeo Tutorial**
   - Gravar walkthrough do app
   - Mostrar funcionalidades principais
   - Disponibilizar no YouTube/Drive

3. **Suporte**
   - WhatsApp de suporte
   - Email de contato
   - FAQ online

### Para Administração:
1. **Painel de Monitoramento**
   - Quantos supervisores ativos
   - Quantos pedidos criados
   - Problemas reportados

2. **Feedback**
   - Coletar feedback dos supervisores
   - Priorizar melhorias
   - Planejar próximas versões

---

## 🐛 TROUBLESHOOTING

### Build falhou:
```bash
# Limpar cache e tentar novamente
rm -rf node_modules
npm install
eas build --platform android --profile production --clear-cache
```

### App não conecta com Supabase:
1. Verificar arquivo `.env`
2. Verificar EAS Secrets
3. Verificar URL e chaves no Supabase

### App não instala no Android:
1. Habilitar "Fontes Desconhecidas"
2. Verificar espaço disponível
3. Verificar versão do Android (mínimo SDK 21)

---

## 📞 SUPORTE

### Expo Docs:
- https://docs.expo.dev/build/setup/

### EAS Build:
- https://docs.expo.dev/build/introduction/

### Supabase:
- https://supabase.com/docs

### React Native:
- https://reactnative.dev/docs/getting-started

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Configurar EAS CLI
2. ✅ Fazer login no Expo
3. ✅ Gerar primeiro build de produção
4. ✅ Testar instalação em celular real
5. ✅ Distribuir para supervisores
6. ✅ Coletar feedback
7. ✅ Planejar melhorias v1.1

---

**Bom lançamento! 🚀**

**Versão do Guia:** 1.0.0  
**Data:** 26/12/2025  
**Status:** Pronto para Produção ✅


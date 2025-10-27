# 📦 Guia Rápido: Gerar APK do Pegasus Supervisor

## 🎯 Métodos para Gerar o APK

### Método 1: EAS Build (Recomendado)

O **EAS (Expo Application Services)** é a forma mais fácil e confiável de gerar o APK.

#### Passo 1: Instalar EAS CLI
```bash
npm install -g eas-cli
```

#### Passo 2: Login no Expo
```bash
eas login
```

#### Passo 3: Configurar o Projeto
```bash
cd mobile-supervisor
eas build:configure
```

#### Passo 4: Build de Desenvolvimento (com internet)
```bash
eas build --profile development --platform android
```

#### Passo 5: Build de Produção (sem internet necessária)
```bash
eas build --profile production --platform android
```

O APK será gerado na nuvem e você receberá um link para download.

---

### Método 2: Build Local (Requer Android Studio)

Se preferir gerar localmente sem usar a nuvem:

#### Pré-requisitos
- Android Studio instalado
- Java JDK 17 ou superior
- Android SDK configurado

#### Passo 1: Instalar dependências
```bash
cd mobile-supervisor
npm install
```

#### Passo 2: Gerar arquivos nativos
```bash
npx expo prebuild
```

#### Passo 3: Build com Gradle
```bash
cd android
./gradlew assembleRelease
```

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

---

### Método 3: Expo Go (Sem APK - Para Testes)

Para testes rápidos sem gerar APK:

#### Passo 1: Instalar Expo Go no celular
Baixe o app "Expo Go" na Play Store

#### Passo 2: Iniciar servidor de desenvolvimento
```bash
cd mobile-supervisor
npm start
```

#### Passo 3: Escanear QR Code
Use o Expo Go para escanear o QR code que aparece no terminal

---

## ⚙️ Configuração do EAS (eas.json)

Crie um arquivo `eas.json` na raiz do projeto:

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔐 Assinar o APK (Para Publicação)

### Gerar Keystore
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore pegasus-supervisor.keystore -alias pegasus -keyalg RSA -keysize 2048 -validity 10000
```

### Configurar no app.json
```json
{
  "expo": {
    "android": {
      "package": "com.pegasus.supervisor",
      "versionCode": 1
    }
  }
}
```

---

## 📱 Distribuir o APK

### Opção 1: Link Direto
- Hospede o APK no Google Drive, Dropbox ou servidor
- Compartilhe o link com os supervisores
- Eles precisarão permitir "Instalar de fontes desconhecidas"

### Opção 2: Play Store (Internal Testing)
```bash
eas submit --platform android
```

### Opção 3: Firebase App Distribution
```bash
npm install -g firebase-tools
firebase appdistribution:distribute app-release.apk \
  --app SEU_APP_ID \
  --groups supervisores
```

---

## ✅ Checklist Antes do Build

- [ ] Variáveis de ambiente configuradas (`.env`)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` definida
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` definida
- [ ] Versão incrementada em `app.json`
- [ ] Ícones e splash screen configurados
- [ ] Permissões necessárias declaradas
- [ ] Testado no emulador Android

---

## 🐛 Problemas Comuns

### Erro: "SDK location not found"
**Solução:** Configure o ANDROID_HOME:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Erro: "Gradle build failed"
**Solução:** Limpe o cache:
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
```

### APK muito grande (>100MB)
**Solução:** Use Android App Bundle (AAB) em vez de APK:
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

---

## 📊 Tamanho Estimado do APK

- **Desenvolvimento:** ~60-80 MB
- **Produção (otimizado):** ~40-50 MB
- **Com ProGuard/R8:** ~30-40 MB

---

## 🚀 Comandos Rápidos

```bash
# Build rápido de desenvolvimento
eas build --profile development --platform android --local

# Build de produção
eas build --profile production --platform android

# Ver status dos builds
eas build:list

# Baixar último build
eas build:download --platform android
```

---

## 📝 Notas Importantes

1. **Build na nuvem (EAS)** é GRATUITO para projetos open source
2. **Build local** requer ~10GB de espaço no HD
3. **Primeira build** pode levar 15-30 minutos
4. **Builds subsequentes** são mais rápidas (5-10 min)
5. APK de produção é **assinado automaticamente** pelo EAS

---

**Pronto!** Agora você pode gerar o APK e distribuir para os supervisores! 🎉


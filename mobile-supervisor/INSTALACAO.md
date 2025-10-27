# 🚀 Instalação e Configuração - Pegasus Supervisor App

## 📋 Pré-requisitos

### Software Necessário

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** (vem com Node.js) ou **yarn**
- **Git** - [Download](https://git-scm.com/)

### Para Desenvolvimento

- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (para builds): `npm install -g eas-cli`

### Para Testes

- **Expo Go** (no celular Android/iOS) - [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) | [App Store](https://apps.apple.com/app/expo-go/id982107779)

OU

- **Android Studio** (emulador Android) - [Download](https://developer.android.com/studio)
- **Xcode** (emulador iOS - somente Mac) - [Download](https://apps.apple.com/app/xcode/id497799835)

---

## 📦 Instalação

### Passo 1: Clonar o Repositório (ou acessar a pasta)

```bash
cd mobile-supervisor
```

### Passo 2: Instalar Dependências

```bash
npm install
```

Isso pode levar alguns minutos. Aguarde até finalizar.

### Passo 3: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto:

```bash
touch .env
```

2. Copie o conteúdo de `ENV_EXAMPLE.txt` para o `.env`

3. Edite o `.env` com suas credenciais do Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

**Como obter as credenciais:**
- Acesse https://supabase.com/dashboard
- Selecione seu projeto
- Vá em **Settings → API**
- Copie **Project URL** e **anon public key**

---

## 🏃 Executar o App

### Opção 1: Expo Go (Mais Rápido)

```bash
npm start
```

Isso abrirá o Metro Bundler. Use uma destas opções:

- **Android:** Pressione `a` no terminal OU escaneie o QR code com o Expo Go
- **iOS:** Pressione `i` no terminal OU escaneie o QR code com o Expo Go
- **Web:** Pressione `w` no terminal

### Opção 2: Emulador Android (Android Studio)

1. Abra o Android Studio
2. Inicie um emulador (AVD Manager)
3. Execute:

```bash
npm run android
```

### Opção 3: Emulador iOS (somente Mac)

1. Abra o Xcode
2. Inicie um simulador iOS
3. Execute:

```bash
npm run ios
```

---

## 🔐 Criar Usuário de Teste

### No Supabase Dashboard:

1. Vá em **Authentication → Users**
2. Clique em **Add User**
3. Preencha:
   - Email: `supervisor@teste.com`
   - Password: `supervisor123`
   - User Metadata (JSON):
   ```json
   {
     "name": "Supervisor Teste",
     "role": "supervisor"
   }
   ```
4. Clique em **Create User**

### Via SQL Editor:

Execute no Supabase SQL Editor:

```sql
-- Criar usuário supervisor
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  user_metadata
)
VALUES (
  'supervisor@teste.com',
  crypt('supervisor123', gen_salt('bf')),
  now(),
  '{"name": "Supervisor Teste", "role": "supervisor"}'::jsonb
);
```

---

## 🎯 Testar o App

### Login
1. Abra o app
2. Entre com:
   - Email: `supervisor@teste.com`
   - Senha: `supervisor123`

### Funcionalidades Disponíveis

✅ **Dashboard**
- Visualizar estatísticas em tempo real
- Ver pedidos ativos
- Verificar alertas críticos

✅ **Pedidos**
- Listar todos os pedidos
- Filtrar por status (Ativos, Entregues)
- Ver detalhes (origem, destino, cliente)

✅ **Rastreamento**
- Ver veículos em mapa (se houver dados de GPS)
- Listar veículos em rota
- Verificar status de rastreamento

✅ **Perfil**
- Ver informações do usuário
- Configurações
- Logout

---

## 📱 Gerar APK

Veja o guia completo em **[BUILD_APK.md](./BUILD_APK.md)**

### Resumo Rápido:

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar
eas build:configure

# Build de produção
eas build --profile production --platform android
```

O APK será gerado na nuvem e você receberá um link para download.

---

## 🐛 Solução de Problemas

### Erro: "Cannot find module 'expo-router'"

**Solução:**
```bash
rm -rf node_modules
npm install
```

### Erro: "Supabase URL não configurada"

**Solução:**
- Verifique se o arquivo `.env` existe
- Confirme que as variáveis estão corretas
- Reinicie o servidor: `npm start`

### Erro: "Network request failed"

**Solução:**
- Verifique sua conexão com internet
- Confirme que o Supabase está acessível
- Teste a URL do Supabase no navegador

### App não abre no Expo Go

**Solução:**
- Certifique-se que o celular está na mesma rede Wi-Fi do computador
- Desative firewall/antivírus temporariamente
- Use conexão via LAN (pressione `c` no Metro Bundler)

---

## 📊 Estrutura do Projeto

```
mobile-supervisor/
├── app/                    # Telas (Expo Router)
│   ├── (auth)/            # Login
│   ├── (tabs)/            # Dashboard, Pedidos, Rastreamento, Perfil
│   ├── _layout.tsx        # Layout principal
│   └── index.tsx          # Splash/redirect
├── services/              # Integração Supabase
│   └── supabase.ts
├── app.json              # Configuração Expo
├── package.json          # Dependências
├── tsconfig.json         # TypeScript config
├── eas.json              # EAS Build config
└── .env                  # Variáveis de ambiente (CRIAR)
```

---

## ✅ Checklist de Instalação

- [ ] Node.js 18+ instalado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado e configurado
- [ ] Supabase URL e chave configuradas
- [ ] Usuário de teste criado no Supabase
- [ ] App rodando com `npm start`
- [ ] Login funcional no app

---

## 📚 Recursos Úteis

- [Documentação Expo](https://docs.expo.dev/)
- [Documentação Supabase](https://supabase.com/docs)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Expo Router](https://expo.github.io/router/docs/)

---

## 🆘 Suporte

Se encontrar problemas:

1. Verifique a [seção de Solução de Problemas](#-solução-de-problemas)
2. Consulte o arquivo [BUILD_APK.md](./BUILD_APK.md) para builds
3. Veja os logs do Metro Bundler para erros detalhados
4. Verifique o console do Expo Go no celular

---

**Pronto!** Agora você está pronto para desenvolver e testar o app mobile! 🎉

Para gerar o APK final, consulte **[BUILD_APK.md](./BUILD_APK.md)**.


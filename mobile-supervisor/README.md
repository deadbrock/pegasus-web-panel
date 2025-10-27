# 📱 Pegasus Supervisor App

Aplicativo mobile para supervisores de campo do sistema Pegasus.

## 🚀 Tecnologias

- **React Native** com Expo
- **TypeScript**
- **Supabase** (Auth + Database)
- **React Navigation**
- **Async Storage**

## 📋 Funcionalidades

✅ Login com Supabase Auth  
✅ Dashboard com métricas em tempo real  
✅ Gestão de Pedidos (criar, visualizar, atualizar)  
✅ Rastreamento de Veículos ao vivo  
✅ Checklist de Vistoria  
✅ Perfil do Supervisor  
✅ Notificações Push  
✅ Modo Offline (cache local)  

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Android Studio (para emulador Android)
- Xcode (para emulador iOS - somente Mac)

### Passo a Passo

1. **Instalar dependências:**
```bash
cd mobile-supervisor
npm install
```

2. **Configurar variáveis de ambiente:**
Crie um arquivo `.env` na raiz:
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

3. **Iniciar o app:**
```bash
npm start
```

4. **Executar em dispositivo:**
- Android: pressione `a`
- iOS: pressione `i`
- Web: pressione `w`
- Dispositivo físico: escaneie o QR code com o app Expo Go

## 📦 Build do APK

### Android

```bash
# Build de desenvolvimento
eas build --profile development --platform android

# Build de produção
eas build --profile production --platform android
```

O APK será gerado e você poderá baixá-lo.

### iOS (requer conta Apple Developer)

```bash
eas build --profile production --platform ios
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Inicia o Expo
npm run android    # Roda no emulador Android
npm run ios        # Roda no emulador iOS
npm run web        # Roda no navegador
npm run build      # Build de produção
npm run lint       # Verifica código
npm run type-check # Verifica tipos TypeScript
```

## 📱 Estrutura de Pastas

```
mobile-supervisor/
├── app/                    # Screens (Expo Router)
│   ├── (auth)/            # Telas de autenticação
│   │   └── login.tsx
│   ├── (tabs)/            # Telas principais
│   │   ├── dashboard.tsx
│   │   ├── pedidos.tsx
│   │   ├── rastreamento.tsx
│   │   └── perfil.tsx
│   └── _layout.tsx
├── components/            # Componentes reutilizáveis
│   ├── PedidoCard.tsx
│   ├── VeiculoMarker.tsx
│   └── ChecklistItem.tsx
├── services/             # Integração com APIs
│   ├── supabase.ts
│   ├── pedidos.ts
│   └── rastreamento.ts
├── types/                # Tipos TypeScript
│   └── index.ts
├── utils/                # Funções utilitárias
│   └── formatters.ts
├── app.json             # Configuração do Expo
└── package.json
```

## 🔐 Autenticação

O app usa **Supabase Auth** com as mesmas credenciais do painel web.

**Roles suportadas:**
- `supervisor` - Acesso completo ao app
- `motorista` - Visualização limitada
- `admin` - Acesso administrativo

## 📊 Sincronização de Dados

- **Tempo Real:** Usa Supabase Realtime para atualizações instantâneas
- **Offline:** Cache local com AsyncStorage
- **Sync:** Sincroniza automaticamente quando online

## 🧪 Testando o App

1. **Usuário de Teste:**
   - Email: `supervisor@pegasus.com`
   - Senha: `supervisor123`

2. **Criar no Supabase:**
```sql
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, user_metadata)
VALUES (
  'supervisor@pegasus.com',
  crypt('supervisor123', gen_salt('bf')),
  now(),
  '{"role": "supervisor", "name": "Supervisor Teste"}'::jsonb
);
```

## 📄 Licença

MIT

---

**Desenvolvido pela equipe Pegasus** 🚀


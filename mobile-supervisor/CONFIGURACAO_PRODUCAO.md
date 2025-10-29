# 📱 CONFIGURAÇÃO PARA PRODUÇÃO - APP PEGASUS SUPERVISOR

## 🎯 **OBJETIVO**
Preparar o aplicativo para funcionar em **qualquer rede** (WiFi, 4G, 5G) para apresentação à diretoria.

---

## ✅ **PASSO 1: CRIAR ARQUIVO .env**

Na pasta `mobile-supervisor/`, crie um arquivo chamado **`.env`** (exatamente esse nome) com o seguinte conteúdo:

```env
# URL do Supabase (servidor em nuvem)
EXPO_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co

# Chave pública do Supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vc3dodHFjZ2pjcHNpZGVreXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwODU0OTksImV4cCI6MjA0MzY2MTQ5OX0.PYlbZ_YfqWoX0D2xW9L-nQfJv1wfwJnX7cU_jGn7pxE
```

---

## 🚀 **PASSO 2: REINICIAR O APP**

Após criar o `.env`, reinicie o servidor Expo:

```bash
cd mobile-supervisor
npx expo start -c
```

O `-c` limpa o cache e carrega as novas variáveis de ambiente.

---

## 📱 **PASSO 3: INSTALAR NO DISPOSITIVO**

### **Opção A: Expo Go (Mais Rápido)**

1. Instale o app **Expo Go** no celular:
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

2. Abra o Expo Go e escaneie o QR Code que apareceu no terminal

3. ✅ **Pronto!** O app funcionará em qualquer rede!

### **Opção B: Build Standalone (Profissional)**

Para um APK/IPA independente (sem precisar do Expo Go):

#### **Android (APK):**

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login na conta Expo (criar conta grátis em expo.dev)
eas login

# 3. Configurar projeto
eas build:configure

# 4. Gerar APK
eas build --profile production --platform android
```

Após o build, você receberá um link para baixar o APK.

#### **iOS (IPA):**

```bash
# Gerar IPA (requer conta Apple Developer)
eas build --profile production --platform ios
```

---

## ✅ **COMO TESTAR SE ESTÁ FUNCIONANDO**

1. **Desconecte o celular do WiFi** (use apenas 4G/5G)
2. Abra o app Pegasus Supervisor
3. Faça login com:
   - Email: `supervisor@pegasus.com`
   - Senha: `senha123`
4. Teste criar um pedido
5. Veja o pedido aparecer no painel admin

**Se funcionar assim, funcionará em qualquer rede!** ✅

---

## 🎭 **DICAS PARA APRESENTAÇÃO**

### **1. Prepare Dados de Demonstração**

Antes da apresentação:
- ✅ Crie 2-3 pedidos de exemplo
- ✅ Tenha produtos cadastrados
- ✅ Configure contratos de exemplo

### **2. Teste em Diferentes Redes**

- ✅ Teste com WiFi corporativo
- ✅ Teste com 4G/5G
- ✅ Teste com hotspot de outro celular

### **3. Prepare um Roteiro**

**Exemplo de demonstração de 5 minutos:**

```
1️⃣ Login (30s)
   → Mostrar tela profissional de login

2️⃣ Dashboard (1min)
   → Mostrar estatísticas em tempo real
   → Explicar KPIs

3️⃣ Criar Pedido (2min)
   → Mostrar seleção de contrato
   → Adicionar múltiplos produtos
   → Definir urgência
   → Adicionar observação

4️⃣ Visualizar Pedidos (1min)
   → Mostrar lista organizada
   → Abrir detalhes
   → Mostrar status de autorização

5️⃣ Painel Admin (30s)
   → Mostrar que o pedido chegou em tempo real
   → Demonstrar aprovação
```

---

## 🔒 **SEGURANÇA**

### **Credenciais Públicas vs Privadas**

- ✅ **EXPO_PUBLIC_SUPABASE_URL**: Pode ser compartilhada (é pública)
- ✅ **EXPO_PUBLIC_SUPABASE_ANON_KEY**: Pode ser compartilhada (tem permissões limitadas)
- ❌ **SUPABASE_SERVICE_ROLE_KEY**: NUNCA compartilhe (só no backend)

### **RLS (Row Level Security)**

O Supabase já está configurado com RLS para:
- Usuários só veem seus próprios pedidos
- Admin vê tudo
- Ninguém pode excluir dados de outros

---

## 📊 **MONITORAMENTO DURANTE A APRESENTAÇÃO**

Abra em outra aba (para acompanhar em tempo real):
- https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw

Você poderá ver:
- ✅ Logs de requisições
- ✅ Pedidos sendo criados
- ✅ Usuários conectados

---

## 🐛 **TROUBLESHOOTING**

### **Erro: "Supabase URL não configurada"**
```
Solução: Verifique se o arquivo .env está na pasta mobile-supervisor/
```

### **App não conecta em 4G**
```
Solução: Limpe o cache do Expo
npx expo start -c
```

### **Login não funciona**
```
Solução: Execute o script de criação de usuário:
cd scripts
node create_supervisor_user.js
```

### **Pedidos não aparecem no admin**
```
Solução: Verifique RLS no Supabase:
- Execute: scripts/fix-rls-pedidos-admin.sql
```

---

## 📞 **SUPORTE TÉCNICO**

Durante a apresentação, tenha à mão:
- Este documento
- Acesso ao painel Supabase
- Backup de dados de demonstração

---

## ✅ **CHECKLIST FINAL**

Antes da apresentação, confirme:

- [ ] Arquivo `.env` criado
- [ ] App testado em 4G/5G
- [ ] Login funcionando
- [ ] Pedidos de exemplo criados
- [ ] Painel admin acessível
- [ ] Bateria do celular carregada (≥80%)
- [ ] Plano de dados ativo e com saldo
- [ ] QR Code do Expo Go salvo (se usar)
- [ ] Roteiro de apresentação ensaiado
- [ ] Backup do APK (se tiver build standalone)

---

## 🎯 **RESULTADO ESPERADO**

Com esta configuração:
- ✅ App funciona em **qualquer lugar**
- ✅ Não depende de rede local
- ✅ Sincronização em **tempo real**
- ✅ Profissional e estável
- ✅ Pronto para produção

**Boa apresentação! 🚀**


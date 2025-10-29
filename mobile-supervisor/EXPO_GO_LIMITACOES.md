# ⚠️ LIMITAÇÕES DO EXPO GO

## 🔔 **NOTIFICAÇÕES PUSH NÃO FUNCIONAM NO EXPO GO**

A partir do **Expo SDK 53+**, as notificações push (`expo-notifications`) foram **removidas do Expo Go**.

**Isso significa:**
- ❌ Não recebe notificações push no Expo Go
- ✅ Banner visual do período funciona normalmente
- ✅ Validação do período funciona normalmente
- ✅ Bloqueio de pedidos fora do período funciona

---

## ✅ **O QUE FUNCIONA NO EXPO GO**

### **1. Banner Visual (Funcionando 100%)**
```
┌──────────────────────────────────────┐
│ ✓  ✅ Período aberto. Você tem até  │
│    o dia 23 para fazer pedidos       │
│    (5 dias restantes)                │
└──────────────────────────────────────┘
```

O banner aparece no topo da tela de pedidos mostrando:
- Verde: Período aberto
- Amarelo: Alerta (faltam 2 dias ou menos)
- Vermelho: Período fechado

### **2. Validação do Período (Funcionando 100%)**

Tentativa de criar pedido fora do período:
```
❌ ERRO
🔒 Período de pedidos encerrado.
[OK]
```

### **3. Todas as Outras Funcionalidades**
- ✅ Login
- ✅ Dashboard
- ✅ Criar pedidos (dentro do período)
- ✅ Ver pedidos
- ✅ Cancelar pedidos
- ✅ Ver contratos
- ✅ Etc.

---

## 🚀 **PARA TER NOTIFICAÇÕES PUSH**

Você precisa criar um **Development Build** ou **Production Build**:

### **Opção 1: Development Build (Recomendado para Teste)**

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Fazer login
eas login

# Configurar projeto
eas build:configure

# Criar build de desenvolvimento para Android
eas build --profile development --platform android

# Instalar no celular
# O EAS vai gerar um APK que você baixa e instala
```

### **Opção 2: Production Build (Para Produção)**

```bash
# Build de produção para Android
eas build --profile production --platform android

# Build de produção para iOS (requer conta Apple Developer)
eas build --profile production --platform ios
```

**Com o build instalado, as notificações funcionarão!**

---

## 📱 **PARA A APRESENTAÇÃO À DIRETORIA**

### **Recomendação:**

**Use o Expo Go mesmo sem notificações!**

**Por quê?**
1. ✅ O banner visual é **suficiente** para mostrar o período
2. ✅ A validação de período **funciona perfeitamente**
3. ✅ Setup **instantâneo** (só escanear QR code)
4. ✅ **Não precisa** gerar APK e instalar

**Explique na apresentação:**
> "As notificações funcionam apenas no app final instalado. No Expo Go (versão de desenvolvimento rápido), usamos o banner visual que vocês estão vendo no topo da tela."

---

## 🔄 **DIFERENÇAS**

| Funcionalidade | Expo Go | Development Build | Production Build |
|---------------|---------|-------------------|------------------|
| **Banner Visual** | ✅ | ✅ | ✅ |
| **Validação Período** | ✅ | ✅ | ✅ |
| **Notificações Push** | ❌ | ✅ | ✅ |
| **Setup** | Instantâneo | 10-15 min | 10-15 min |
| **Instalar** | Não precisa | APK/IPA | APK/IPA |

---

## 💡 **ALTERNATIVA: USAR APENAS BANNER**

Se você quiser **evitar a complexidade** de builds, pode simplesmente:

1. **Manter apenas o banner visual** (já funciona!)
2. **Remover a funcionalidade de notificações** completamente
3. **O sistema de período continuará 100% funcional**

O banner é **suficiente** porque:
- ✅ Supervisor vê o status toda vez que abre o app
- ✅ Cores chamam atenção (verde/amarelo/vermelho)
- ✅ Mensagens claras
- ✅ Mostra dias restantes

---

## 🧪 **TESTANDO AGORA NO EXPO GO**

1. **Abra o app**
2. **Vá para "Pedidos"**
3. **Veja o banner no topo** ← Isso funciona!
4. **Tente criar um pedido** ← Validação funciona!

**Não aparecerá notificação push, mas isso é esperado no Expo Go.**

---

## 📊 **LOGS NO CONSOLE**

Você verá no Metro Bundler:

```
ℹ️ Notificações não disponíveis (Expo Go).
   Funcionalidade de período funcionará sem notificações.
```

**Isso é normal e esperado!**

---

## ✅ **CONCLUSÃO**

**Para apresentação à diretoria:**
- ✅ Use o Expo Go (mais rápido e fácil)
- ✅ Banner visual é suficiente
- ✅ Todas as funcionalidades importantes funcionam

**Para produção final:**
- 🚀 Crie um build de produção
- 🔔 Notificações funcionarão perfeitamente
- 📱 Distribua via Play Store ou TestFlight

---

## 🆘 **AINDA QUER NOTIFICAÇÕES AGORA?**

Se você **realmente precisa** testar notificações antes da apresentação:

```bash
# 1. Criar development build
eas build --profile development --platform android

# 2. Aguardar build (~10-15 minutos)
# 3. Baixar e instalar APK no celular
# 4. Abrir o app
# 5. Notificações funcionarão!
```

**Mas sinceramente:** O banner visual é **mais que suficiente** para demonstrar a funcionalidade! 🎯


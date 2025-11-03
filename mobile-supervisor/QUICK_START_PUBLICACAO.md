# ⚡ QUICK START: PUBLICAR NA PLAY STORE

## 🚀 **PASSO A PASSO RÁPIDO**

### **1️⃣ INSTALAR EAS CLI**
```bash
npm install -g eas-cli
eas login
```

### **2️⃣ CONFIGURAR PROJETO**
```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
eas build:configure
```

### **3️⃣ ATUALIZAR app.json**
```json
{
  "expo": {
    "name": "Pegasus Supervisor",
    "version": "1.0.0",
    "android": {
      "package": "com.pegasus.supervisor",
      "versionCode": 1
    }
  }
}
```

### **4️⃣ CRIAR ASSETS**

**Necessários:**
- [ ] Ícone: 1024x1024 px
- [ ] Splash: 1284x2778 px  
- [ ] Feature Graphic: 1024x500 px
- [ ] Screenshots: 4-8 imagens (1080x1920 px)

### **5️⃣ BUILD DE PRODUÇÃO**
```bash
eas build --platform android --profile production
```

⏱️ **Aguardar 10-20 minutos** → Baixar AAB

### **6️⃣ CRIAR CONTA PLAY CONSOLE**

1. Acesse: https://play.google.com/console
2. Pague taxa: **$25 USD** (único)
3. Crie novo app
4. Preencha informações

### **7️⃣ UPLOAD E PUBLICAÇÃO**

1. Upload do AAB
2. Adicionar screenshots
3. Preencher descrição
4. **Enviar para análise**

⏱️ **Aguardar 1-7 dias** → App aprovado!

---

## 📋 **CHECKLIST MÍNIMO**

- [ ] EAS CLI instalado
- [ ] Build gerado (AAB)
- [ ] Conta Play Console criada
- [ ] Ícone e screenshots prontos
- [ ] Descrição escrita
- [ ] AAB enviado
- [ ] Aguardando aprovação

---

## 🔗 **LINKS IMPORTANTES**

- [Guia Completo](./PUBLICACAO_PLAY_STORE.md)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Play Console](https://play.google.com/console)

---

## 💰 **CUSTO TOTAL: ~$25 USD**

✅ **Tempo estimado:** 2-3 horas + análise do Google


# 📱 ADICIONAR LOGO - INSTRUÇÕES

## 🎯 Você tem: `logo-pegasus-mobile.png`

## 📂 Onde Colocar:

### **Opção 1: Copiar Manualmente**

```bash
# Copie o arquivo logo-pegasus-mobile.png para:
mobile-supervisor/assets/logo-pegasus-mobile.png
```

### **Opção 2: Usando Comando (Windows)**

```cmd
# Abra o PowerShell na raiz do projeto e execute:
copy "logo-pegasus-mobile.png" "mobile-supervisor\assets\logo-pegasus-mobile.png"
```

### **Opção 3: Usando Windows Explorer**

1. Localize o arquivo `logo-pegasus-mobile.png`
2. Copie (Ctrl+C)
3. Navegue até: `pegasus-web-panel\mobile-supervisor\assets\`
4. Cole (Ctrl+V)

---

## ✅ Depois de Copiar:

Execute este comando para configurar automaticamente:

```bash
cd mobile-supervisor
node configurar-logo.js
```

Ou se preferir, eu faço a configuração manual agora!

---

## 📍 Estrutura Final:

```
mobile-supervisor/
├── assets/
│   ├── logo-pegasus-mobile.png  ← Arquivo original
│   ├── icon.png                 ← Gerado automaticamente (1024x1024)
│   ├── adaptive-icon.png        ← Gerado automaticamente (1024x1024)
│   └── splash.png               ← Gerado automaticamente (2048x2048)
└── app.config.js                ← Atualizado automaticamente
```

---

## 🚀 Próximo Passo:

Após copiar o arquivo, me avise que eu:
1. ✅ Crio os assets necessários
2. ✅ Atualizo o app.config.js
3. ✅ Testo no emulador
4. ✅ Faço o build!


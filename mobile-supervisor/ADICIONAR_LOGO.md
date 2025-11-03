# 📱 COMO ADICIONAR LOGO/ÍCONE DO APP

## 🎯 **ARQUIVOS NECESSÁRIOS:**

### **1. Ícone Principal (icon.png)**
- **Tamanho:** 1024x1024 pixels
- **Formato:** PNG (sem transparência)
- **Local:** `mobile-supervisor/assets/icon.png`

### **2. Adaptive Icon (adaptive-icon.png)**
- **Tamanho:** 1024x1024 pixels
- **Formato:** PNG (pode ter transparência)
- **Local:** `mobile-supervisor/assets/adaptive-icon.png`

### **3. Splash Screen (splash.png)**
- **Tamanho:** 1284x2778 pixels
- **Formato:** PNG
- **Local:** `mobile-supervisor/assets/splash.png`

---

## 📋 **PASSO A PASSO:**

### **1. Preparar a Imagem:**

Se você tem o logo da Pegasus:

#### **Opção A: Criar Ícone Simples**
```
1. Abra a imagem no editor (Photoshop, Canva, etc.)
2. Redimensione para 1024x1024 pixels
3. Adicione fundo vermelho Pegasus (#a2122a)
4. Centralize o logo
5. Salve como PNG
```

#### **Opção B: Usar Ferramenta Online**
- **Website:** https://icon.kitchen/ (gratuito)
- **Ou:** https://www.canva.com/create/app-icons/

### **2. Colocar os Arquivos:**

```
mobile-supervisor/
  ├── assets/
  │   ├── icon.png          ← Seu logo aqui (1024x1024)
  │   ├── adaptive-icon.png ← Mesma imagem
  │   ├── splash.png        ← Splash screen
  │   └── favicon.png       ← (opcional, para web)
  └── app.json
```

### **3. Configurar app.json:**

O arquivo já deve estar configurado assim:

```json
{
  "expo": {
    "name": "Pegasus Supervisor",
    "slug": "pegasus-supervisor",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#a2122a"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#a2122a"
      }
    }
  }
}
```

---

## 🎨 **DESIGN SUGERIDO PARA O ÍCONE:**

### **Opção 1: Logo Centralizado**
```
┌─────────────────┐
│                 │
│   [LOGO         │
│    PEGASUS]     │
│                 │
└─────────────────┘
Fundo: Vermelho #a2122a
Logo: Branco ou transparente
```

### **Opção 2: Inicial + Cor**
```
┌─────────────────┐
│                 │
│       P         │
│                 │
│   Supervisor    │
└─────────────────┘
Fundo: Gradiente (vermelho → azul)
Texto: Branco
```

### **Opção 3: Ícone Moderno**
```
┌─────────────────┐
│  ┌───────────┐  │
│  │    📦     │  │
│  │  PEGASUS  │  │
│  └───────────┘  │
└─────────────────┘
Fundo: Vermelho #a2122a
Card: Branco com sombra
```

---

## 💻 **COMANDOS PARA APLICAR:**

### **Depois de colocar as imagens:**

```bash
cd mobile-supervisor

# Limpar cache
npx expo start --clear

# Ou rebuild
eas build --platform android --profile production
```

---

## 🔧 **FERRAMENTAS ÚTEIS:**

### **Para Criar Ícones:**
1. **Canva** - https://canva.com (fácil, online)
2. **Figma** - https://figma.com (profissional)
3. **Photoshop** - (avançado)
4. **GIMP** - https://gimp.org (gratuito, desktop)

### **Para Redimensionar:**
1. **TinyPNG** - https://tinypng.com (compactar)
2. **ImageResizer** - https://imageresizer.com (redimensionar)

### **Gerar Adaptive Icon:**
1. **Icon Kitchen** - https://icon.kitchen/

---

## ✅ **CHECKLIST:**

- [ ] Logo da Pegasus obtido
- [ ] Imagem redimensionada para 1024x1024
- [ ] Fundo vermelho #a2122a aplicado
- [ ] Arquivo salvo como PNG
- [ ] `icon.png` colocado em `assets/`
- [ ] `adaptive-icon.png` colocado em `assets/`
- [ ] `app.json` configurado
- [ ] App testado no Expo Go
- [ ] Build gerado com novo ícone

---

## 📱 **COMO TESTAR:**

### **No Expo Go:**
```bash
npx expo start --clear
```
O ícone pode não aparecer no Expo Go, apenas no build final.

### **No Build:**
```bash
eas build --platform android --profile preview
```
Instale o APK e veja o ícone na home do Android.

---

## 🎯 **PRÓXIMOS PASSOS:**

1. **Envie a imagem do logo Pegasus**
2. **Eu ajusto e coloco nos assets**
3. **Testamos no app**
4. **Fazemos o build final**

**Aguardando a imagem do logo! 📸**


# 🔬 VERSÃO SIMPLIFICADA PARA DIAGNÓSTICO

## ⚠️ **O QUE FIZ:**

Criei uma versão **minimalista** do app para identificar qual componente está causando o erro "Something went wrong".

---

## 🔧 **MUDANÇAS APLICADAS:**

### **1. app/_layout.tsx**
❌ **REMOVIDO**: `react-native-paper` (PaperProvider)  
✅ **MANTIDO**: Apenas Stack e StatusBar (componentes nativos do Expo)

### **2. app/index.tsx**
❌ **REMOVIDO**: `expo-linear-gradient`, `MaterialCommunityIcons`  
✅ **MANTIDO**: View, Text, ActivityIndicator básicos

### **3. app/(auth)/login.tsx**
❌ **REMOVIDO**: `react-native-paper` (TextInput, Button complexos)  
❌ **REMOVIDO**: `expo-linear-gradient`, `MaterialCommunityIcons`  
✅ **MANTIDO**: TextInput e TouchableOpacity nativos
✅ **MANTIDO**: Integração com Supabase (essencial para login)

---

## 📱 **TESTE AGORA:**

### **1. Escaneie o QR Code**
O servidor Expo foi reiniciado com as versões simplificadas.

### **2. Observe o Comportamento:**

#### **✅ SE FUNCIONAR:**
```
App carrega → Tela simples "PEGASUS" → Tela de login simples → Login funciona
```

**Isso significa:** O problema está em um dos componentes removidos:
- `react-native-paper`
- `expo-linear-gradient`  
- `@expo/vector-icons` (MaterialCommunityIcons)

#### **❌ SE CONTINUAR COM ERRO:**
```
App trava → "Something went wrong"
```

**Isso significa:** O problema é mais profundo:
- Problema no `supabase.ts`
- Problema nas rotas (expo-router)
- Problema na configuração do Expo
- Conflito de dependências mais grave

---

## 🔍 **CENÁRIOS E PRÓXIMOS PASSOS:**

### **Cenário A: App funciona agora ✅**

**Diagnóstico:** Um dos componentes visuais está com problema.

**Próximos passos:**
1. Reativar componentes um por um:
   - Primeiro: `expo-linear-gradient`
   - Segundo: `MaterialCommunityIcons`
   - Terceiro: `react-native-paper`
2. Testar após cada reativação
3. Identificar qual causa o erro

---

### **Cenário B: App continua com erro ❌**

**Diagnóstico:** Problema mais profundo.

**Próximos passos:**
1. Simplificar ainda mais: remover Supabase temporariamente
2. Testar rotas básicas
3. Verificar logs do Metro Bundler
4. Possivelmente reinstalar dependências do zero

---

## 📋 **ARQUIVOS DE BACKUP CRIADOS:**

Se precisar restaurar as versões originais:

```bash
# Restaurar _layout.tsx
Copy-Item app\_layout.backup.tsx app\_layout.tsx -Force

# Restaurar index.tsx
Copy-Item app\index.backup.tsx app\index.tsx -Force

# Restaurar login.tsx
Copy-Item "app\(auth)\login.backup.tsx" "app\(auth)\login.tsx" -Force
```

---

## 🎯 **O QUE PRECISO SABER:**

**Por favor, teste agora e me diga:**

1. ✅ **Funcionou?**
   - App abre?
   - Tela de splash aparece?
   - Tela de login aparece?
   - Consegue fazer login?

2. ❌ **Continua com erro?**
   - Copie e cole TODOS os logs do terminal Expo
   - Tire print da tela de erro no Expo Go
   - Me avise em que momento exato trava

---

## 💡 **DICA:**

Enquanto você testa, observe o terminal do Expo. Procure por:

```
ERROR
Failed to...
Unable to resolve...
Cannot find module...
TypeError...
```

**Copie e cole QUALQUER mensagem de erro que aparecer!**

---

## 🚀 **TESTE E ME AVISE O RESULTADO!**

Estou esperando seu feedback para continuar o diagnóstico! 🔍


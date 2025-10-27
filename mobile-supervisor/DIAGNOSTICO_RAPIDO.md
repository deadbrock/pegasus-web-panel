# 🔍 DIAGNÓSTICO: App não inicia e sem logs

## Problema Identificado

Se o app falha mesmo na versão simplificada e **não há logs no terminal**, o problema é:

1. **Dependências incompatíveis ou faltando**
2. **Cache corrompido do Metro/Expo**
3. **Estrutura do Expo Router com problema**

---

## ✅ SOLUÇÃO: Reinstalar TUDO do Zero

### Passo 1: Parar o servidor
```powershell
# Pressione Ctrl+C no terminal
```

### Passo 2: Limpar TUDO
```powershell
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor

# Remover node_modules e cache
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
Remove-Item -Force package-lock.json

# Limpar cache do npm
npm cache clean --force
```

### Passo 3: Reinstalar dependências
```powershell
npm install
```

Aguarde terminar (pode levar 2-5 minutos).

### Passo 4: Iniciar com cache limpo
```powershell
npx expo start -c
```

### Passo 5: Testar novamente
Escaneie o QR code com o Expo Go.

---

## 🎯 SE AINDA NÃO FUNCIONAR

### Opção A: Criar projeto NOVO do zero

```powershell
cd C:\Users\user\Documents\pegasus\pegasus-web-panel

# Criar projeto novo
npx create-expo-app pegasus-mobile-novo --template blank-typescript

cd pegasus-mobile-novo

# Instalar dependências do nosso app
npm install @supabase/supabase-js @react-native-async-storage/async-storage react-native-paper expo-router

# Iniciar
npx expo start
```

Se este projeto NOVO funcionar, significa que há problema com o projeto atual.

### Opção B: Atualizar Expo Go no celular

1. Abra a Play Store
2. Procure "Expo Go"
3. Atualize para a última versão
4. Tente novamente

### Opção C: Verificar requisitos do sistema

**Windows:**
```powershell
# Verificar Node.js (deve ser 18+)
node -v

# Verificar npm (deve ser 9+)
npm -v

# Se estiver desatualizado:
# Baixe a última versão em https://nodejs.org/
```

---

## 🆘 ALTERNATIVA RÁPIDA: Usar apenas o Web

Se o mobile não estiver funcionando, você pode usar o app no navegador:

```powershell
cd mobile-supervisor
npx expo start
# Pressione 'w' para abrir no navegador
```

Isso vai abrir o app como PWA no navegador do PC.

---

## 📊 Checklist de Problemas Comuns

- [ ] Node.js versão 18 ou superior?
- [ ] npm versão 9 ou superior?
- [ ] Expo Go atualizado no celular?
- [ ] Celular e PC na mesma rede Wi-Fi?
- [ ] Firewall/antivírus desabilitado?
- [ ] Pasta node_modules limpa e reinstalada?
- [ ] Cache do Expo limpo (.expo removido)?
- [ ] Iniciou com `npx expo start -c`?
- [ ] Arquivo .env existe com credenciais?

---

## 🔧 Comando Completo de Limpeza

Copie e cole TUDO de uma vez:

```powershell
cd C:\Users\user\Documents\pegasus\pegasus-web-panel\mobile-supervisor
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
npx expo start -c
```

---

## 💡 Próximo Passo

**Execute os comandos acima e me avise:**

1. ✅ Se a reinstalação funcionou
2. ❌ Se deu algum erro durante npm install (copie o erro)
3. 📱 O que aparece no celular após escanear o novo QR code


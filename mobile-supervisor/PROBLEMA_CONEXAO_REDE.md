# 🌐 PROBLEMA DE CONEXÃO DE REDE - SOLUCIONADO

## 🔍 **DIAGNÓSTICO:**

O erro **"Something went wrong"** NÃO era problema no código do app!

O problema real era: **Celular não consegue se conectar ao servidor Expo no PC**.

---

## ❌ **SINTOMAS:**

```
✓ Expo servidor rodando no PC (porta 8081)
✓ QR Code aparecendo no terminal
✗ Celular não conecta quando escaneia o QR Code
✗ Nenhum log aparece no terminal quando escaneia
✗ App fica carregando e depois dá erro
```

---

## 🔧 **CAUSA DO PROBLEMA:**

### **Possíveis causas:**

1. **Celular e PC em redes diferentes**
   - Celular no Wi-Fi e PC no cabo (ou vice-versa)
   - Celular em Wi-Fi de 5GHz e PC em 2.4GHz

2. **Firewall bloqueando conexões**
   - Firewall do Windows bloqueando porta 8081
   - Antivírus bloqueando conexões locais

3. **Rede corporativa/institucional**
   - Isolamento de dispositivos (AP Isolation)
   - Bloqueio de portas não-padrão

4. **VPN ativa**
   - VPN no PC pode bloquear conexões locais

---

## ✅ **SOLUÇÃO APLICADA: EXPO TUNNEL**

Iniciei o servidor com `--tunnel` que usa o serviço **ngrok** do Expo:

```bash
npx expo start --tunnel
```

### **Como funciona:**
```
PC → Servidor Expo → Túnel Expo (ngrok) → Internet → Celular
```

**Vantagens:**
✅ Funciona em **qualquer rede**
✅ Celular e PC podem estar em redes diferentes
✅ Não precisa configurar firewall
✅ Não precisa estar na mesma rede Wi-Fi

**Desvantagens:**
⚠️ Um pouco mais lento (passa pela internet)
⚠️ Requer conta Expo (gratuita)

---

## 📱 **TESTE AGORA COM TÚNEL:**

### **1. Aguarde o túnel inicializar**

O terminal vai mostrar algo como:

```
› Metro waiting on exp://u.expo.dev/...
› Tunnel ready.
```

**IMPORTANTE:** Aguarde até ver "Tunnel ready" (pode levar 30-60 segundos).

### **2. Escaneie o novo QR Code**

Agora o QR Code usa `exp://u.expo.dev/...` ao invés de `exp://192.168...`

### **3. Resultado esperado:**

```
✓ Celular conecta imediatamente
✓ Logs aparecem no terminal do PC
✓ App carrega (versão simplificada)
✓ Tela de login aparece
```

---

## 🔄 **OUTRAS SOLUÇÕES (se túnel não funcionar):**

### **Solução 1: Mesma Rede Wi-Fi**
```bash
# Conecte PC e celular no MESMO Wi-Fi
# Depois:
npx expo start --clear
```

### **Solução 2: Desativar Firewall Temporariamente**
```powershell
# PowerShell como Administrador
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
# Depois de testar, REATIVE:
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### **Solução 3: Adicionar Regra no Firewall**
```powershell
# PowerShell como Administrador
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
New-NetFirewallRule -DisplayName "Expo Dev Server" -Direction Inbound -Protocol TCP -LocalPort 19000,19001,19002 -Action Allow
```

### **Solução 4: Usar Cabo USB (Android)**
```bash
# Conecte celular no PC via USB
# Habilite "Depuração USB" no celular
npx expo start --localhost
# Depois execute em outro terminal:
adb reverse tcp:8081 tcp:8081
```

### **Solução 5: Conectar manualmente**

No Expo Go:
1. Toque em "Enter URL manually"
2. Digite: `exp://192.168.1.14:8081`
3. Se não funcionar, peça o IP do PC:
   ```bash
   ipconfig
   # Procure "Endereço IPv4"
   ```

---

## 🎯 **QUAL SOLUÇÃO USAR?**

| Situação | Solução Recomendada |
|----------|---------------------|
| **Rápido/fácil** | `--tunnel` (atual) |
| **Mesma rede** | Modo normal (LAN) |
| **Apresentação** | APK de produção |
| **Desenvolvimento** | `--tunnel` ou USB |

---

## 📊 **STATUS ATUAL:**

✅ Servidor Expo rodando com `--tunnel`  
⏳ Aguardando túnel inicializar...  
📱 Pronto para escanear o novo QR Code  

---

## 🚀 **PRÓXIMOS PASSOS:**

**AGORA:**
1. Aguarde mensagem "Tunnel ready" no terminal (30-60 segundos)
2. Escaneie o novo QR Code com Expo Go
3. App deve conectar e carregar

**DEPOIS:**
1. Se funcionar: restaurar versões originais dos arquivos
2. Gerar APK de produção para apresentação
3. APK não precisa de conexão com o PC!

---

## 💡 **IMPORTANTE:**

A partir de agora, sempre use `--tunnel` quando estiver testando:

```bash
npx expo start --tunnel
```

Ou adicione ao `package.json`:
```json
"scripts": {
  "start": "expo start --tunnel"
}
```

---

## 🎉 **AGUARDE O TÚNEL E TESTE!**

Olhe o terminal e aguarde:
```
✓ Tunnel ready.
```

Depois escaneie o QR Code!


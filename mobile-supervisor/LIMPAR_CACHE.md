# 🔄 LIMPAR CACHE DO EXPO

## O app ainda mostra código antigo?

Siga estes passos para forçar atualização:

## 📱 **MÉTODO 1: Pelo App (Mais Rápido)**

1. **No terminal do Expo, pressione:**
   - `r` → Recarregar o app
   - `Shift + m` → Abrir menu do desenvolvedor

2. **No menu do app, toque em:**
   - "Reload" ou "Recarregar"

---

## 🔧 **MÉTODO 2: Limpar Cache Completo**

### **Windows/PowerShell:**
```powershell
# 1. Pare o servidor Expo (Ctrl+C)

# 2. Limpe o cache
npx expo start --clear

# Ou use o comando mais completo:
npx expo start -c --reset-cache
```

### **Alternativa com npm:**
```bash
# Limpar cache do npm também
npm cache clean --force

# Depois reiniciar
npx expo start -c
```

---

## 🗑️ **MÉTODO 3: Limpeza Profunda (Se nada funcionar)**

```bash
# 1. Feche o Expo (Ctrl+C)

# 2. Delete node_modules e reinstale
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps

# 3. Limpe o cache do Expo
npx expo start --clear
```

---

## ✅ **VERIFICAR SE FUNCIONOU:**

Após recarregar, teste novamente:

1. Abra a tela de **Pedidos**
2. Clique em **"Cancelar"** em um pedido pendente
3. Confirme o cancelamento
4. **Deve aparecer:**
   - Loading brevemente
   - Alerta: "✅ Sucesso! Pedido PED-XXX cancelado com sucesso!"
   - **NÃO** deve aparecer: "será implementada em breve"

---

## 🐛 **AINDA NÃO FUNCIONA?**

Se mesmo após limpar o cache não funcionar:

1. **Feche completamente o app** no celular/emulador
2. **Pare o servidor Expo** (Ctrl+C)
3. **Execute:**
   ```bash
   npx expo start -c
   ```
4. **Abra o app novamente** e teste

---

## 📞 **CHECKLIST:**

- [ ] Pressionei 'r' no terminal do Expo
- [ ] O bundle foi recompilado (viu no terminal)
- [ ] O app recarregou na tela
- [ ] Testei cancelar um pedido
- [ ] Vi o alerta de confirmação
- [ ] Confirmei o cancelamento
- [ ] Vi "✅ Sucesso!" (não "em breve")

Se todos os itens estão marcados, está funcionando! ✅


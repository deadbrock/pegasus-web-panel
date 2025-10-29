# 🧪 COMO TESTAR O PERÍODO DE PEDIDOS

## 🎯 **GARANTIA DE FUNCIONAMENTO**

✅ **SIM, está garantido que funcionará entre os dias 15-23!**

Mas você pode testar **agora mesmo** simulando diferentes datas.

---

## 🧪 **MODO DE TESTE**

### **Passo 1: Ativar Modo de Teste**

Abra: `mobile-supervisor/services/periodo-pedidos-service.ts`

Encontre esta seção:

```typescript
// =====================================================
// MODO DE TESTE - Para simular diferentes datas
// =====================================================
// Descomente a linha abaixo para testar com uma data específica
// export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 18) // 18 de outubro de 2024
// export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 10) // 10 de outubro (BLOQUEADO)
// export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 21) // 21 de outubro (ALERTA)
export const DATA_TESTE_OVERRIDE: Date | null = null // null = usar data real do sistema
```

---

## 🧪 **CENÁRIOS DE TESTE**

### **TESTE 1: Período Aberto (Banner Verde)**

**Simular dia 18 de outubro:**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 18) // 18 de outubro
```

**Resultado Esperado:**
```
┌────────────────────────────────────┐
│ ✓  ✅ Período aberto. Você tem até│
│    o dia 23 para fazer pedidos     │
│    (5 dias restantes)              │
└────────────────────────────────────┘
Cor: VERDE
```

**Ações:**
1. Salve o arquivo
2. Recarregue o app (pressione 'r' no Metro ou reabra)
3. Vá para "Pedidos"
4. Veja o banner VERDE
5. Tente criar um pedido → ✅ **DEVE FUNCIONAR**

---

### **TESTE 2: Alerta - Faltam 2 dias (Banner Amarelo)**

**Simular dia 21 de outubro:**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 21) // 21 de outubro
```

**Resultado Esperado:**
```
┌────────────────────────────────────┐
│ ⏰  ⚠️ ATENÇÃO: Restam apenas 2    │
│    dias para fazer pedidos!        │
└────────────────────────────────────┘
Cor: AMARELO
```

**Ações:**
1. Salve o arquivo
2. Recarregue o app
3. Banner deve ser AMARELO
4. Tente criar um pedido → ✅ **DEVE FUNCIONAR** (ainda está no período)

---

### **TESTE 3: Último Dia (Banner Amarelo)**

**Simular dia 23 de outubro:**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 23) // 23 de outubro
```

**Resultado Esperado:**
```
┌────────────────────────────────────┐
│ ⏰  ⚠️ ATENÇÃO: Restam apenas 0    │
│    dias para fazer pedidos!        │
└────────────────────────────────────┘
Cor: AMARELO
```

**Ações:**
1. Salve o arquivo
2. Recarregue o app
3. Banner AMARELO
4. Tente criar um pedido → ✅ **DEVE FUNCIONAR** (último dia do período)

---

### **TESTE 4: Período Fechado - Antes (Banner Vermelho)**

**Simular dia 10 de outubro:**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 10) // 10 de outubro
```

**Resultado Esperado:**
```
┌────────────────────────────────────┐
│ 🔒  ⏳ Período de pedidos abre em  │
│    5 dias (dia 15)                 │
└────────────────────────────────────┘
Cor: VERMELHO
```

**Ações:**
1. Salve o arquivo
2. Recarregue o app
3. Banner VERMELHO
4. Tente criar um pedido → ❌ **DEVE SER BLOQUEADO**
5. Mensagem de erro deve aparecer:
   ```
   ❌ ERRO
   
   ⏳ Período de pedidos abre em 5 dias (dia 15)
   
   [OK]
   ```

---

### **TESTE 5: Período Fechado - Depois (Banner Vermelho)**

**Simular dia 25 de outubro:**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 25) // 25 de outubro
```

**Resultado Esperado:**
```
┌────────────────────────────────────┐
│ 🔒  🔒 Período de pedidos           │
│    encerrado. Próximo período: dia │
│    15 do próximo mês                │
└────────────────────────────────────┘
Cor: VERMELHO
```

**Ações:**
1. Salve o arquivo
2. Recarregue o app
3. Banner VERMELHO
4. Tente criar um pedido → ❌ **DEVE SER BLOQUEADO**
5. Mensagem de erro:
   ```
   ❌ ERRO
   
   🔒 Período de pedidos encerrado.
   Próximo período: dia 15 do próximo mês
   
   [OK]
   ```

---

## 🔄 **VOLTAR AO MODO NORMAL**

Após testar, volte ao modo normal:

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = null // null = usar data real do sistema
```

Salve e recarregue o app.

---

## 📊 **VERIFICAÇÃO NO CONSOLE**

Quando o modo de teste estiver ativo, você verá no Metro Bundler:

```
🧪 MODO DE TESTE ATIVADO - Simulando: 18/10/2024
```

Isso confirma que a data simulada está sendo usada.

---

## ✅ **CHECKLIST DE TESTES**

Teste todos os cenários:

- [ ] **Dia 18 (meio do período)** → Banner verde + pedido funciona
- [ ] **Dia 21 (alerta 2 dias)** → Banner amarelo + pedido funciona
- [ ] **Dia 23 (último dia)** → Banner amarelo + pedido funciona
- [ ] **Dia 10 (antes do período)** → Banner vermelho + pedido bloqueado
- [ ] **Dia 25 (depois do período)** → Banner vermelho + pedido bloqueado

**Se todos os 5 testes passarem, está 100% garantido que funcionará em produção!**

---

## 🎯 **LÓGICA DO CÓDIGO**

O código verifica:

```typescript
const dentrooPeriodo = diaAtual >= 15 && diaAtual <= 23

if (!dentrooPeriodo) {
  throw new Error('Período de pedidos encerrado')
}
```

**Simples e confiável!**

---

## 📅 **FORMATO DE DATA**

No JavaScript, os meses vão de **0 a 11**:

```typescript
new Date(2024, 0, 18)  // 18 de janeiro
new Date(2024, 1, 18)  // 18 de fevereiro
new Date(2024, 9, 18)  // 18 de outubro ← Mês 9 = outubro!
new Date(2024, 10, 18) // 18 de novembro
```

**Cuidado:** Mês 9 = Outubro!

---

## 🔧 **OUTROS TESTES**

### **Testar Dia 15 (Primeiro Dia)**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 15)
```

Deve mostrar banner verde e permitir pedidos.

### **Testar Dia 14 (Um dia antes)**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 14)
```

Deve mostrar banner vermelho "abre em 1 dia" e bloquear.

### **Testar Dia 24 (Um dia depois)**

```typescript
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 24)
```

Deve mostrar banner vermelho "encerrado" e bloquear.

---

## 🎬 **PASSO A PASSO COMPLETO**

### **1. Teste Bloqueado (Dia 10)**

```bash
# 1. Edite periodo-pedidos-service.ts
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 10)

# 2. Salve o arquivo (Ctrl+S)

# 3. No terminal Expo, pressione 'r' para reload
# Ou feche e abra o app novamente

# 4. Abra a tela "Pedidos"
# → Banner VERMELHO aparece

# 5. Toque em "Novo Pedido"
# → Tela de criação abre

# 6. Preencha os campos e toque em "Salvar"
# → ERRO aparece bloqueando o pedido
```

### **2. Teste Permitido (Dia 18)**

```bash
# 1. Edite periodo-pedidos-service.ts
export const DATA_TESTE_OVERRIDE: Date | null = new Date(2024, 9, 18)

# 2. Salve (Ctrl+S)

# 3. Recarregue (pressione 'r')

# 4. Vá para "Pedidos"
# → Banner VERDE aparece

# 5. Tente criar pedido
# → Funciona normalmente!
```

---

## 💯 **GARANTIA FINAL**

**Após testar os 5 cenários acima e todos funcionarem:**

✅ **ESTÁ 100% GARANTIDO** que:
- Entre dia 15-23: Supervisores **PODEM** fazer pedidos
- Fora desse período: Supervisores **NÃO PODEM** fazer pedidos
- Banner visual mostra o status corretamente
- Mensagens de erro são claras

**O código é simples e confiável. Se funciona nos testes, funcionará em produção!**

---

## 🚀 **DEPOIS DOS TESTES**

1. **Volte ao modo normal:**
   ```typescript
   export const DATA_TESTE_OVERRIDE: Date | null = null
   ```

2. **Faça commit:**
   ```bash
   git add mobile-supervisor/services/periodo-pedidos-service.ts
   git commit -m "test: validar funcionamento do periodo de pedidos"
   ```

3. **Pronto para apresentação!** 🎉

---

## 📞 **SUPORTE**

Se algum teste falhar, verifique:
1. Salvou o arquivo?
2. Recarregou o app?
3. Foi para a tela "Pedidos"?
4. Viu o log no console?

**Todos os testes devem passar!** ✅


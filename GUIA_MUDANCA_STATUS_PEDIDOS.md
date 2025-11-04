# 📋 GUIA: COMO MUDAR STATUS DOS PEDIDOS

## 🎯 **ONDE MUDAR O STATUS:**

---

## 📱 **PEDIDOS DO APP MOBILE (Supervisores):**

### **Localização:**
```
Dashboard → Pedidos → Aba "Pedidos Mobile"
```

### **Passo a Passo:**

1. **Acesse:** Dashboard → Pedidos
2. **Clique** na aba **"Pedidos Mobile"** (segunda aba)
3. **Encontre** o pedido na lista
4. **Clique** no ícone do **olho** (👁️) para visualizar
5. **Dialog abre** com detalhes completos
6. **Veja os botões** baseados no status atual:

---

## 🔄 **BOTÕES POR STATUS:**

### **📋 Status: PENDENTE**
```
Botões disponíveis:
├─ ✅ Aprovar (verde)
└─ ❌ Rejeitar (vermelho)
```

### **✅ Status: APROVADO**
```
Botão disponível:
└─ 📦 Iniciar Separação (azul)
```

### **📦 Status: EM SEPARAÇÃO**
```
Botão disponível:
└─ ✅ Concluir Separação (roxo)
    → Isso CRIA uma ROTA automaticamente!
```

### **✅ Status: SEPARADO**
```
Botão disponível:
└─ 🚚 Saiu para Entrega (laranja)
```

### **🚚 Status: SAIU PARA ENTREGA**
```
Botão disponível:
└─ ✅ Confirmar Entrega (verde)
```

### **✅ Status: ENTREGUE**
```
Sem botões (final do fluxo)
Apenas: 📥 Baixar PDF
```

---

## 📊 **FLUXO COMPLETO:**

```
1. Supervisor cria pedido no app
   ↓ Status: Pendente
   
2. Admin abre pedido no painel
   ↓ Clica "Aprovar"
   ↓ Status: Aprovado
   
3. Admin clica "Iniciar Separação"
   ↓ Almoxarifado separa materiais
   ↓ Status: Em Separação
   
4. Admin clica "Concluir Separação"
   ↓ Status: Separado
   ↓ 🤖 ROTA CRIADA AUTOMATICAMENTE!
   
5. Logística vai em Rastreamento → Rotas
   ↓ Atribui motorista + veículo
   ↓ Rota: Atribuída
   
6. Motorista inicia entrega (app futuro)
   ↓ Status: Em Rota
   
7. Admin clica "Confirmar Entrega"
   ↓ Status: Entregue
   ↓ ✅ Concluído!
```

---

## 🌐 **PEDIDOS DO PAINEL WEB (Orders):**

### **Localização:**
```
Dashboard → Pedidos → Aba "Pedidos"
```

### **Passo a Passo:**

1. **Acesse:** Dashboard → Pedidos
2. **Aba padrão:** "Pedidos" (primeira aba)
3. **Clique** no pedido para editar
4. **Mude** o campo **"Status"** no formulário
5. **Clique** em "Salvar"

### **Status Disponíveis:**
- Pendente
- Em Separação
- Em Rota
- Entregue
- Atrasado
- Cancelado

---

## 🔍 **TROUBLESHOOTING:**

### **"Nenhum produto cadastrado"**

**Solução:**
1. Vá em **Dashboard → Estoque → Produtos**
2. Clique em **"Novo Produto"**
3. Cadastre alguns produtos
4. Volte em Pedidos e tente novamente

### **"Nenhum motorista cadastrado"**

**Solução:**
1. Vá em **Dashboard → Frota → Motoristas**
2. Cadastre motoristas
3. Volte em Pedidos

### **Botões não aparecem**

**Causa:** Status do pedido não permite ação
**Solução:** Verifique o status atual do pedido

---

## 📸 **EXEMPLOS VISUAIS:**

### **Dialog de Pedido Mobile:**
```
┌──────────────────────────────────────┐
│ Pedido PED-2025-0001                │
│                                      │
│ [Informações do pedido]              │
│                                      │
│ Botões (baseados no status):        │
│ ┌──────────┐ ┌──────────┐           │
│ │ 📥 PDF   │ │ Fechar   │           │
│ └──────────┘ └──────────┘           │
│ ┌──────────────────────────────────┐ │
│ │ ✅ Aprovar (verde)              │ │
│ └──────────────────────────────────┘ │
│ ┌──────────────────────────────────┐ │
│ │ ❌ Rejeitar (vermelho)          │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

---

## 💡 **DICA:**

**Sempre use o Dialog de visualização** para mudar status de pedidos mobile!

**Não use** o campo "Status" no formulário de edição para pedidos mobile, pois não vai atualizar corretamente.

**Use os botões específicos** que aparecem no `MobileOrderViewDialog`.

---

## ✅ **RESUMO:**

```
Pedidos Mobile:
  → Abrir com ícone 👁️
  → Botões aparecem automaticamente
  → Clique no botão correspondente ao status
  
Pedidos Web:
  → Editar pedido
  → Mudar campo "Status"
  → Salvar
```

---

**Agora você sabe exatamente onde e como mudar os status!** 🎉


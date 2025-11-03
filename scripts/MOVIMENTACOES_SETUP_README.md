# 📦 SETUP: Tabela movimentacoes_estoque

## ⚠️ **IMPORTANTE: Execute este setup para corrigir o erro de movimentações**

O erro que você está vendo:
```
Erro ao buscar movimentações: Object
```

Acontece porque a tabela `movimentacoes_estoque` ainda não foi criada no Supabase.

---

## 🚀 **OPÇÃO 1: Executar via Script Node.js**

### **Passo 1: Rodar o script**

```bash
cd C:\Users\user\Documents\pegasus\pegasus-web-panel
node scripts/apply_movimentacoes_estoque.js
```

### **Resultado esperado:**

```
============================================================
🚀 SETUP: Tabela movimentacoes_estoque
============================================================

📦 Lendo arquivo SQL...
🚀 Aplicando SQL no Supabase...
✅ SQL aplicado com sucesso!
✅ Tabela movimentacoes_estoque confirmada!
📊 Total de movimentações: 0

✅ SETUP COMPLETO!
```

---

## 🚀 **OPÇÃO 2: Executar Manualmente no Supabase (RECOMENDADO)**

### **Passo 1: Acessar SQL Editor**

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New query"**

### **Passo 2: Copiar e colar o SQL**

Abra o arquivo:
```
C:\Users\user\Documents\pegasus\pegasus-web-panel\scripts\setup-movimentacoes-estoque.sql
```

**Copie TODO o conteúdo** e cole no SQL Editor.

### **Passo 3: Executar**

1. Clique no botão **"Run"** (ou pressione `Ctrl+Enter`)
2. Aguarde a mensagem de sucesso
3. Você verá:
   ```
   ✅ Tabela movimentacoes_estoque criada! Total de registros: X
   ```

---

## ✅ **VERIFICAR SE DEU CERTO:**

### **No Supabase:**

1. Vá em **"Table Editor"**
2. Procure por `movimentacoes_estoque` na lista de tabelas
3. Se aparecer, está tudo certo! ✅

### **No Painel Web:**

1. Acesse: `Dashboard → Estoque`
2. Clique na aba **"Movimentações"**
3. Deve aparecer: "Nenhuma movimentação registrada" (em vez do erro)

---

## 📊 **O QUE FOI CRIADO:**

### **Tabela: `movimentacoes_estoque`**

**Colunas:**
- `id` - UUID (chave primária)
- `produto_id` - UUID (referência para produtos)
- `tipo` - VARCHAR (entrada, saida, ajuste, transferencia)
- `quantidade` - INTEGER
- `estoque_anterior` - INTEGER
- `estoque_novo` - INTEGER
- `motivo` - TEXT
- `documento` - VARCHAR (número de NF, requisição, etc)
- `usuario` - VARCHAR (quem fez a movimentação)
- `data_movimentacao` - TIMESTAMP
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

**Índices:**
- `idx_movimentacoes_produto_id`
- `idx_movimentacoes_tipo`
- `idx_movimentacoes_data`
- `idx_movimentacoes_created_at`

**RLS (Segurança):**
- Admins podem ver, inserir e atualizar
- Triggers automáticos para updated_at
- Registro automático de movimentações ao atualizar estoque de produtos

---

## 🔄 **TRIGGER AUTOMÁTICO:**

A partir de agora, **sempre que você atualizar o estoque de um produto**, uma movimentação será registrada automaticamente:

**Exemplo:**
```
Produto: Parafuso M6x20
Estoque anterior: 100
Estoque novo: 120

→ Movimentação criada automaticamente:
  - Tipo: entrada
  - Quantidade: 20
  - Motivo: "Atualização manual de estoque"
```

---

## 📝 **DADOS DE TESTE:**

O script cria 3 movimentações de exemplo para o primeiro produto encontrado:

1. **Entrada:** +100 unidades (Compra inicial)
2. **Saída:** -20 unidades (Saída para produção)
3. **Ajuste:** +5 unidades (Acerto de inventário)

---

## 🐛 **SE DER ERRO:**

### **Erro: "relation produtos does not exist"**

**Causa:** A tabela `produtos` não existe  
**Solução:** Crie a tabela produtos primeiro

### **Erro: "permission denied"**

**Causa:** Você não tem permissão de admin  
**Solução:** Use a OPÇÃO 2 (SQL Editor manual)

### **Erro: "duplicate key value"**

**Causa:** A tabela já existe  
**Solução:** Tudo certo! Recarregue a página do painel

---

## ✅ **APÓS O SETUP:**

### **Testar:**

1. ✅ Acesse: `Dashboard → Estoque → Movimentações`
2. ✅ Deve aparecer a tabela (mesmo que vazia)
3. ✅ Edite um produto e altere o estoque
4. ✅ Volte em Movimentações
5. ✅ Deve aparecer a nova movimentação!

### **Gerar Relatório:**

1. ✅ Vá em: `Dashboard → Estoque → Relatórios`
2. ✅ Clique em "Movimentações por Período"
3. ✅ Deve baixar um XLSX com as movimentações

---

## 🆘 **PRECISA DE AJUDA?**

Se ainda der erro após seguir este guia:

1. Tire um print do erro
2. Verifique se a tabela foi criada (Table Editor no Supabase)
3. Me envie o erro completo

---

## 🎯 **RESUMO:**

```bash
# Opção mais fácil:
node scripts/apply_movimentacoes_estoque.js

# Ou copie/cole manualmente no SQL Editor:
scripts/setup-movimentacoes-estoque.sql
```

**Depois:** Recarregue a página do Estoque e pronto! ✅


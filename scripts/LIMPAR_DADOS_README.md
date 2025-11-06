# 🧹 Limpar Dados de Teste

## ⚠️ **ATENÇÃO**

Este script irá **EXCLUIR PERMANENTEMENTE**:
- ✅ Todos os pedidos da tabela `pedidos_supervisores`
- ✅ Todas as rotas da tabela `rotas_entrega`
- ✅ O motorista "DOUGLAS MARQUES DE SOUZA"

---

## 📋 **Passo a Passo**

### **1. Acesse o Supabase Dashboard**
- Vá em: https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw
- Faça login

### **2. Abra o SQL Editor**
- No menu lateral, clique em **SQL Editor**
- Clique em **New Query**

### **3. Execute o Script**
- Copie todo o conteúdo do arquivo `scripts/limpar-dados-teste.sql`
- Cole no editor
- Clique em **Run** (ou pressione `Ctrl+Enter`)

---

## 📊 **O que o Script Faz**

### **1. Limpa Rotas de Entrega**
```sql
DELETE FROM rotas_entrega;
```
- Exclui todas as rotas criadas automaticamente
- Mostra quantas rotas foram excluídas

### **2. Limpa Pedidos**
```sql
DELETE FROM pedidos_supervisores;
```
- Exclui todos os pedidos mobile
- Mostra quantos pedidos foram excluídos

### **3. Exclui Motorista Douglas**
```sql
DELETE FROM motoristas WHERE UPPER(nome) LIKE '%DOUGLAS%';
```
- Busca e exclui o motorista de teste
- Mostra o ID e nome do motorista excluído

### **4. Mostra Resumo**
Após a execução, mostra:
```
========================================
📊 RESUMO APÓS LIMPEZA:
========================================
🚚 Rotas restantes: 0
📦 Pedidos restantes: 0
👤 Motoristas restantes: X
========================================
```

---

## ✅ **Verificação Manual (Opcional)**

Após executar o script, você pode verificar manualmente:

```sql
-- Verificar rotas
SELECT COUNT(*) as total_rotas FROM rotas_entrega;

-- Verificar pedidos
SELECT COUNT(*) as total_pedidos FROM pedidos_supervisores;

-- Verificar motoristas
SELECT id, nome, cpf FROM motoristas ORDER BY created_at DESC;
```

---

## 🔄 **Reverter (Não é possível!)**

⚠️ **ATENÇÃO**: Este script **NÃO TEM ROLLBACK**!

- Os dados excluídos **NÃO PODEM SER RECUPERADOS**
- Execute apenas se tiver **CERTEZA ABSOLUTA**
- Considere fazer um backup antes (se necessário)

---

## 🎯 **Próximos Passos**

Após limpar os dados:
1. ✅ O módulo **Pedidos** estará vazio
2. ✅ O módulo **Rastreamento > Rotas** estará vazio
3. ✅ O módulo **Motoristas** não terá o Douglas
4. ✅ O sistema está pronto para dados reais!

---

## 🆘 **Problemas?**

Se encontrar algum erro:
1. Copie a mensagem de erro completa
2. Verifique se as tabelas existem no banco
3. Verifique permissões de RLS (Row Level Security)

---

**Pronto para limpar? Execute o script! 🚀**


# 🚨 CORREÇÕES URGENTES - Motoristas e Veículos

## 📋 **PROBLEMAS IDENTIFICADOS:**

### 1. **Tabela `veiculos`** 
- ❌ Código tentando buscar coluna `motorista_id` que não existe
- ✅ **Solução**: Remover `motorista_id` da query (já corrigido no código)

### 2. **Tabela `motoristas`**
- ❌ Interface usa `categoria` mas tabela tem `categoria_cnh`
- ❌ Componentes tentam salvar em coluna `categoria` que não existe
- ✅ **Solução**: Padronizar para `categoria_cnh`

### 3. **Listas Vazias**
- ❌ 0 motoristas encontrados
- ❌ 0 veículos encontrados
- ✅ **Solução**: Verificar se as tabelas existem e têm dados

---

## 🔧 **AÇÕES NECESSÁRIAS:**

### **PASSO 1: Execute o SQL de Verificação**

```sql
-- Copie e execute no Supabase SQL Editor:
-- scripts/verificar-estrutura-tabelas.sql
```

Isso mostrará:
- ✅ Quais colunas existem em `veiculos`
- ✅ Quais colunas existem em `motoristas`
- ✅ Quantos registros existem

### **PASSO 2: Me envie os resultados**

Com base nos resultados, vou:
1. Corrigir a interface TypeScript
2. Ajustar os componentes
3. Criar SQL para adicionar colunas faltantes (se necessário)

---

## 📊 **ESTRUTURA ESPERADA:**

### `motoristas`
```sql
- id (uuid)
- nome (text)
- cpf (text)
- cnh (text)
- categoria_cnh (text)  ← IMPORTANTE
- validade_cnh (date)
- telefone (text)
- email (text)
- endereco (text)
- data_nascimento (date)
- data_admissao (date)
- status (text)
- observacoes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### `veiculos`
```sql
- id (uuid)
- placa (text)
- modelo (text)
- ano (integer)
- cor (text)
- status (text)
- km_atual (numeric)
- ultima_revisao (date)
- proxima_revisao (date)
- observacoes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## ⚡ **CORREÇÕES JÁ APLICADAS NO CÓDIGO:**

1. ✅ Removido `motorista_id` de `rastreamento-realtime.ts`
2. ✅ Query de veículos corrigida para não buscar `motorista_id`

---

**EXECUTE O SQL DE VERIFICAÇÃO E ME ENVIE OS RESULTADOS!** 🔍


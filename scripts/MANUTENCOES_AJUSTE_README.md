# 🔧 Ajustar Tabela Manutenções Existente

## ⚠️ **SITUAÇÃO**

A tabela `manutencoes` **JÁ EXISTE** no banco de dados, mas pode estar com estrutura diferente da esperada pelo código.

---

## 📋 **SOLUÇÃO - 3 OPÇÕES**

### **OPÇÃO 1: Verificar a Estrutura Atual** ⭐ RECOMENDADO

Execute o script de verificação para ver o que já existe:

```sql
-- Execute: scripts/verificar-manutencoes.sql
```

Este script vai mostrar:
- ✅ Se a tabela existe
- ✅ Todas as colunas e seus tipos
- ✅ Índices criados
- ✅ Políticas RLS
- ✅ Dados existentes (se houver)

---

### **OPÇÃO 2: Ajustar a Tabela Existente** ⭐ RECOMENDADO

Se a tabela existe mas falta colunas, execute:

```sql
-- Execute: scripts/ajustar-manutencoes-existente.sql
```

Este script:
- ✅ Adiciona colunas faltantes (sem apagar nada)
- ✅ Cria índices necessários
- ✅ Habilita RLS
- ✅ Cria políticas de acesso
- ✅ **NÃO apaga dados existentes**

---

### **OPÇÃO 3: Recriar do Zero** ⚠️ **CUIDADO - APAGA DADOS!**

Se quiser apagar tudo e começar do zero:

```sql
-- 1. APAGA TUDO (CUIDADO!)
DROP TABLE IF EXISTS manutencoes CASCADE;

-- 2. Depois execute o SQL original do MODULO_MANUTENCAO_LIMPO.md
```

---

## 🚀 **PASSO A PASSO RECOMENDADO**

### **1. Verificar o que existe**
```
1. Abra o Supabase Dashboard
2. Vá em "SQL Editor"
3. Copie o conteúdo de: scripts/verificar-manutencoes.sql
4. Cole e execute
5. Veja a estrutura atual
```

### **2. Ajustar a tabela**
```
1. Ainda no SQL Editor
2. Copie o conteúdo de: scripts/ajustar-manutencoes-existente.sql
3. Cole e execute
4. Veja as mensagens de sucesso
```

### **3. Testar no painel**
```
1. Acesse o painel web
2. Vá em "Manutenção"
3. Veja se os dados carregam
4. Tente criar uma nova manutenção
```

---

## 📊 **COLUNAS ESPERADAS**

A tabela `manutencoes` deve ter estas colunas:

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Sim | ID único (PK) |
| `veiculo_id` | UUID | Sim | Referência ao veículo |
| `tipo` | TEXT | Sim | Tipo de manutenção |
| `descricao` | TEXT | Sim | Descrição da manutenção |
| `data_agendada` | TIMESTAMP | Sim | Data programada |
| `data_inicio` | TIMESTAMP | Não | Data de início |
| `data_conclusao` | TIMESTAMP | Não | Data de conclusão |
| `quilometragem` | INTEGER | Sim | KM do veículo |
| `status` | TEXT | Sim | Status atual |
| `custo` | DECIMAL | Não | Custo da manutenção |
| `responsavel` | TEXT | Não | Responsável |
| `oficina` | TEXT | Não | Oficina executora |
| `observacoes` | TEXT | Não | Observações |
| `pecas_trocadas` | TEXT | Não | Peças trocadas |
| `created_at` | TIMESTAMP | Sim | Data de criação |
| `updated_at` | TIMESTAMP | Sim | Data de atualização |

---

## ✅ **RESULTADO ESPERADO**

Após executar o script de ajuste, você deve ver:

```
ℹ️ Coluna veiculo_id já existe
ℹ️ Coluna tipo já existe
✅ Coluna observacoes adicionada
✅ Coluna pecas_trocadas adicionada
...
✅ Índices verificados/criados
✅ RLS habilitado
✅ Política de SELECT criada
✅ Política de INSERT criada
✅ Política de UPDATE criada
✅ Política de DELETE criada

========================================
✅ TABELA MANUTENCOES AJUSTADA!
========================================
```

---

## 🆘 **PROBLEMAS?**

### **Erro: "column violates not-null constraint"**
- Significa que você tentou adicionar uma coluna NOT NULL em uma tabela que já tem dados
- **Solução**: O script de ajuste adiciona valores padrão automaticamente

### **Erro: "permission denied"**
- Significa que você não tem permissão de modificar a tabela
- **Solução**: Execute como administrador do Supabase

### **Erro: "policy already exists"**
- Significa que a política RLS já existe
- **Solução**: O script ignora isso automaticamente (IF NOT EXISTS)

---

## 📝 **LOGS DE DEBUG**

Se nada funcionar, execute e me envie o resultado:

```sql
-- 1. Verificar colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'manutencoes';

-- 2. Contar registros
SELECT COUNT(*) FROM manutencoes;

-- 3. Ver exemplo de registro
SELECT * FROM manutencoes LIMIT 1;
```

---

**Pronto! Use a OPÇÃO 1 (verificar) primeiro, depois a OPÇÃO 2 (ajustar).** 🚀


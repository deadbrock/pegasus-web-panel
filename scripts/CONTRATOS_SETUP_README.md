# 📋 SETUP: Contratos dos Supervisores

Este setup adiciona a funcionalidade de **contratos/clientes** vinculados aos supervisores.

## 🎯 O QUE SERÁ CRIADO:

### **1. Tabela: `contratos_supervisores`**
Armazena os contratos/clientes que cada supervisor gerencia.

**Campos principais:**
- `nome_contrato` - Nome do cliente/obra
- `endereco_completo` - Endereço formatado
- `endereco_numero`, `endereco_bairro`, `endereco_cidade`, `endereco_estado`, `endereco_cep`
- `encarregado_nome`, `encarregado_telefone`, `encarregado_email`
- `ativo` - Se o contrato está ativo

### **2. Campos Adicionados em `pedidos_supervisores`:**
- `contrato_id` - Referência ao contrato
- `contrato_nome` - Nome do contrato (cache)
- `contrato_endereco` - Endereço do contrato (cache)

### **3. RLS (Row Level Security):**
- Supervisores só veem/editam seus próprios contratos
- Políticas de SELECT, INSERT, UPDATE, DELETE configuradas

---

## 🚀 COMO APLICAR:

### **Opção 1: Via Node.js (Recomendado)**

```bash
# 1. Instalar dependência (se ainda não instalou)
npm install pg

# 2. Executar o script
node scripts/apply_contratos_supervisores.js "sua-connection-string-aqui"
```

**Connection String:**
```
postgresql://postgres:SUA-SENHA@db.SEU-PROJETO.supabase.co:5432/postgres
```

**Exemplo:**
```bash
node scripts/apply_contratos_supervisores.js "postgresql://postgres:superman19!gaelsofia@db.moswhtqcgjcpsideykzw.supabase.co:5432/postgres"
```

---

### **Opção 2: Via Dashboard do Supabase**

1. Acesse: https://supabase.com/dashboard/project/SEU-PROJETO/sql/new
2. Copie todo o conteúdo de `setup-contratos-supervisores.sql`
3. Cole no editor SQL
4. Clique em **"Run"**

---

## ✅ VERIFICAR SE FUNCIONOU:

Após executar, verifique no Dashboard do Supabase:

### **1. Tabela criada:**
- Database → Tables → Procure por `contratos_supervisores`

### **2. Campos adicionados em pedidos:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pedidos_supervisores' 
  AND column_name IN ('contrato_id', 'contrato_nome', 'contrato_endereco');
```

### **3. RLS habilitado:**
- Database → Tables → contratos_supervisores → RLS deve estar **ON**

---

## 📝 ESTRUTURA DO CONTRATO:

```typescript
{
  id: "uuid",
  supervisor_id: "uuid",
  nome_contrato: "Obra Centro - Edifício Comercial",
  endereco_completo: "Av. Paulista, 1000 - Bela Vista",
  endereco_numero: "1000",
  endereco_complemento: "Torre A",
  endereco_bairro: "Bela Vista",
  endereco_cidade: "São Paulo",
  endereco_estado: "SP",
  endereco_cep: "01310-100",
  encarregado_nome: "João Silva",
  encarregado_telefone: "(11) 98765-4321",
  encarregado_email: "joao@obra.com",
  observacoes: "Entregas pela manhã",
  ativo: true,
  created_at: "2025-10-28T...",
  updated_at: "2025-10-28T..."
}
```

---

## 🔄 FLUXO DE USO:

### **No App Mobile:**

1. **Supervisor cadastra contratos:**
   - Nome do cliente/obra
   - Endereço completo
   - Dados do encarregado

2. **Ao criar pedido:**
   - Seleciona o contrato de destino
   - Adiciona produtos
   - Envia pedido

3. **Pedido é vinculado ao contrato**

### **No Painel Admin:**

1. **Lista de pedidos mostra:**
   - Nome do contrato
   - Endereço de entrega
   - Dados do encarregado

---

## 🐛 SOLUÇÃO DE PROBLEMAS:

### **Erro: "pg module not found"**
```bash
npm install pg
```

### **Erro: "permission denied"**
Verifique se a connection string está correta e tem permissões de admin.

### **Erro: "relation already exists"**
Pode ignorar - significa que já foi criado antes. O script usa `IF NOT EXISTS`.

### **Campos não aparecem em pedidos_supervisores**
Execute manualmente:
```sql
ALTER TABLE public.pedidos_supervisores
  ADD COLUMN IF NOT EXISTS contrato_id UUID,
  ADD COLUMN IF NOT EXISTS contrato_nome TEXT,
  ADD COLUMN IF NOT EXISTS contrato_endereco TEXT;
```

---

## 📊 CONSULTAS ÚTEIS:

### **Listar todos os contratos:**
```sql
SELECT * FROM public.contratos_supervisores 
WHERE ativo = true 
ORDER BY nome_contrato;
```

### **Contar contratos por supervisor:**
```sql
SELECT 
  supervisor_id,
  COUNT(*) as total_contratos
FROM public.contratos_supervisores
WHERE ativo = true
GROUP BY supervisor_id;
```

### **Pedidos por contrato:**
```sql
SELECT 
  c.nome_contrato,
  COUNT(p.id) as total_pedidos
FROM public.contratos_supervisores c
LEFT JOIN public.pedidos_supervisores p ON p.contrato_id = c.id
GROUP BY c.nome_contrato;
```

---

## 🎉 PRONTO!

Após executar este setup, você pode:
- ✅ Criar serviço de contratos no app
- ✅ Criar tela de cadastro de contratos
- ✅ Vincular pedidos a contratos
- ✅ Mostrar dados do contrato no painel admin


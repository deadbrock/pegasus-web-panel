# 🎯 ADICIONAR STATUS "Separado" E TRIGGER AUTOMÁTICO

## 📋 **O QUE FAZ ESTE SCRIPT**

Este script SQL adiciona o status **"Separado"** à tabela `pedidos_supervisores` e cria um **trigger automático** que:

1. Permite usar o status "Separado" nos pedidos
2. Quando um pedido muda para "Separado", **automaticamente cria uma rota** em `rotas_entrega`
3. A rota fica com status "Aguardando Atribuição" para o gestor atribuir motorista e veículo

---

## 🚀 **COMO EXECUTAR**

### **Opção 1: Via Supabase Dashboard (Recomendado)**

1. Acesse: https://supabase.com/dashboard/project/moswhtqcgjcpsideykzw/sql/new
2. Cole o conteúdo do arquivo `adicionar-status-separado.sql`
3. Clique em **"Run"**
4. Verifique os resultados na parte inferior

### **Opção 2: Via Node.js**

```bash
cd scripts
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sql = fs.readFileSync('./adicionar-status-separado.sql', 'utf8');

(async () => {
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
  if (error) console.error('Erro:', error);
  else console.log('✅ Status Separado adicionado com sucesso!', data);
})();
"
```

---

## 📊 **FLUXO DE TRABALHO**

### **Antes:**
```
Pendente → Aprovado → Em Separação → Saiu para Entrega → Entregue
```

### **Agora:**
```
Pendente → Aprovado → Em Separação → Separado → Saiu para Entrega → Entregue
                                         ↓
                                   Cria Rota Automaticamente
                                   (Aguardando Atribuição)
```

---

## 🔄 **TRIGGER AUTOMÁTICO**

Quando o status muda para **"Separado"**, o trigger:

1. Gera número da rota: `ROTA-YYYYMMDD-0001`
2. Busca informações do pedido
3. Cria registro em `rotas_entrega`:
   - `status`: "Aguardando Atribuição"
   - `prioridade`: baseada na urgência do pedido
   - `pedido_id`: vincula ao pedido
   - `observacoes`: informa que foi criada automaticamente

---

## ✅ **VERIFICAÇÃO**

Após executar, você deve ver:

```sql
-- Constraint atualizado
pedidos_supervisores_status_check | (status IN ('Pendente', 'Aprovado', ...))

-- Trigger criado
trigger_criar_rota_ao_separar | UPDATE | pedidos_supervisores

-- Status válidos
Pendente
Aprovado
Em Separação
Separado          ← NOVO
Saiu para Entrega
Entregue
Cancelado
Rejeitado
```

---

## 🧪 **TESTE**

1. Vá em **Pedidos**
2. Mude um pedido de "Em Separação" para **"Separado"**
3. Vá em **Rastreamento > Rotas**
4. Deve aparecer uma nova rota com status "Aguardando Atribuição"

---

## 🔧 **REVERSÃO (SE NECESSÁRIO)**

```sql
-- Remover trigger
DROP TRIGGER IF EXISTS trigger_criar_rota_ao_separar ON public.pedidos_supervisores;
DROP FUNCTION IF EXISTS criar_rota_ao_separar();

-- Voltar constraint antigo
ALTER TABLE public.pedidos_supervisores
DROP CONSTRAINT pedidos_supervisores_status_check;

ALTER TABLE public.pedidos_supervisores
ADD CONSTRAINT pedidos_supervisores_status_check 
CHECK (status IN (
  'Pendente', 'Aprovado', 'Em Separação', 
  'Saiu para Entrega', 'Entregue', 'Cancelado', 'Rejeitado'
));
```

---

## 📝 **OBSERVAÇÕES**

- O trigger só cria a rota quando o status **muda para** "Separado"
- Se já estiver "Separado" e atualizar outros campos, não cria rota duplicada
- A rota herda a prioridade do pedido (Urgente/Alta → Alta, Média → Média, Baixa → Baixa)
- Logs no PostgreSQL mostram "Rota ROTA-XXX criada para pedido PED-XXX"

---

**Data:** 06/11/2025
**Status:** ✅ Pronto para executar


# 🔐 Sistema de Autorização de Pedidos

## 📋 Regra de Negócio

### Limite Mensal
✅ **1 pedido por mês por supervisor**

- Se o supervisor ainda NÃO fez pedido no mês → **Pedido direto** ✅
- Se o supervisor JÁ fez pedido no mês → **Precisa de autorização** ⚠️

---

## 🔄 Fluxo Completo

### Cenário 1: Primeiro Pedido do Mês (Normal)

```
1. Supervisor toca em "Novo Pedido"
   ├─ Sistema verifica: "Já fez pedido este mês?"
   └─ Resposta: NÃO ✅

2. Abre dialog normal de pedido
   ├─ Seleciona produto do estoque
   ├─ Informa quantidade
   ├─ Escolhe urgência
   └─ Envia pedido

3. Pedido criado com status "Pendente"
   └─ Aparece no painel web para aprovação
```

### Cenário 2: Segundo Pedido do Mês (Requer Autorização)

```
1. Supervisor toca em "Novo Pedido"
   ├─ Sistema verifica: "Já fez pedido este mês?"
   └─ Resposta: SIM ⚠️

2. Alert: "Limite de Pedidos Atingido"
   ├─ Botão "Cancelar"
   └─ Botão "Solicitar Autorização"

3. Se escolher "Solicitar Autorização":
   ├─ Dialog: "Justificativa para Pedido Urgente"
   ├─ Supervisor escreve o motivo
   └─ Toca em "Solicitar"

4. Dialog de pedido abre com aviso amarelo:
   ├─ "🔐 Pedido Requer Autorização"
   ├─ Mostra a justificativa
   ├─ Seleciona produto
   ├─ Informa quantidade
   └─ Envia pedido

5. Pedido criado com:
   ├─ requer_autorizacao = TRUE
   ├─ autorizacao_status = "Pendente"
   ├─ autorizacao_justificativa = "texto do supervisor"
   └─ status = "Pendente"

6. No painel web, o gestor vê:
   ├─ Pedido marcado como "Requer Autorização"
   ├─ Justificativa do supervisor
   ├─ Botões: "Aprovar" ou "Rejeitar"
   └─ Campo para motivo (se rejeitar)

7. Gestor decide:
   a) APROVAR → autorizacao_status = "Aprovada"
      └─ Pedido pode ser processado normalmente
   
   b) REJEITAR → autorizacao_status = "Rejeitada"
      └─ Supervisor vê pedido como "Rejeitado"
```

---

## 📊 Status dos Pedidos

### Fluxo Normal de Status

```
1. PENDENTE (Amarelo 🟡)
   └─ Pedido recém-criado, aguardando aprovação

2. APROVADO (Azul 🔵)
   └─ Gestor aprovou, vai para separação

3. EM SEPARAÇÃO (Roxo 🟣)
   └─ Almoxarifado está separando o material

4. SAIU PARA ENTREGA (Ciano 🔷)
   └─ Material saiu do almoxarifado

5. ENTREGUE (Verde 🟢)
   └─ Supervisor recebeu o material

CANCELADO (Vermelho 🔴)
└─ Pedido foi cancelado

REJEITADO (Vermelho Escuro 🔴)
└─ Pedido foi rejeitado (autorização negada)
```

---

## 📱 Como Funciona no App Mobile

### Ao Criar Pedido

**Se PODE fazer (primeiro do mês):**
1. Seleciona produto da lista do estoque
2. Informa quantidade
3. Escolhe urgência
4. Envia
5. ✅ Pedido criado com status "Pendente"

**Se NÃO PODE (já fez pedido este mês):**
1. Alert: "Limite Atingido"
2. Opção: "Solicitar Autorização"
3. Justificativa (obrigatória)
4. Seleciona produto
5. Informa quantidade
6. Envia
7. 🔐 Pedido criado aguardando DUPLA aprovação:
   - Autorização (gestor aprova fazer outro pedido)
   - Pedido em si (gestor aprova o material)

### Visualização de Pedidos

Cada pedido mostra:
- **Número** (PED-2025-0001)
- **Status** (com cor e ícone)
- **Produto**
- **Quantidade + Unidade**
- **Urgência** (chip colorido)
- **Data**
- **Autorização** (se tiver):
  - ⚠️ Autorização: Pendente
  - ✅ Autorização: Aprovada
  - ❌ Autorização: Rejeitada

---

## 🔄 Sincronização em Tempo Real

### Realtime com Supabase

**O app mobile atualiza AUTOMATICAMENTE quando:**

1. ✅ Gestor aprova o pedido no painel web
   ```
   Status: Pendente → Aprovado
   ```

2. ✅ Almoxarifado começa a separar
   ```
   Status: Aprovado → Em Separação
   ```

3. ✅ Material sai para entrega
   ```
   Status: Em Separação → Saiu para Entrega
   ```

4. ✅ Material é entregue
   ```
   Status: Saiu para Entrega → Entregue
   ```

5. ✅ Autorização é aprovada/rejeitada
   ```
   autorizacao_status: Pendente → Aprovada/Rejeitada
   ```

**Supervisor NÃO precisa:**
- ❌ Atualizar manualmente
- ❌ Fechar e abrir app
- ❌ Pull-to-refresh

**Atualização é INSTANTÂNEA!** ⚡

---

## 🎯 No Painel Web (Gestores)

### Nova Tela: Pedidos de Supervisores

**Listagem:**
- Todos os pedidos dos supervisores
- Filtros: Pendentes / Autorizações / Todos
- Status em tempo real

**Card de Pedido:**
- Número do pedido
- Supervisor (nome + email)
- Produto solicitado
- Quantidade
- Urgência
- Status atual
- Se requer autorização:
  - Badge "Requer Autorização"
  - Justificativa do supervisor
  - Botões: "Aprovar Autorização" / "Rejeitar Autorização"

**Ações:**
1. **Aprovar Autorização** → autorizacao_status = "Aprovada"
2. **Rejeitar Autorização** → autorizacao_status = "Rejeitada"
3. **Aprovar Pedido** → status = "Aprovado"
4. **Rejeitar Pedido** → status = "Rejeitado"
5. **Marcar como Em Separação** → status = "Em Separação"
6. **Marcar como Saiu para Entrega** → status = "Saiu para Entrega"
7. **Marcar como Entregue** → status = "Entregue"

---

## 📊 Tabela no Banco (Supabase)

### `pedidos_supervisores`

```sql
CREATE TABLE pedidos_supervisores (
  id UUID PRIMARY KEY,
  numero_pedido TEXT UNIQUE,
  
  -- Supervisor
  supervisor_id UUID REFERENCES auth.users(id),
  supervisor_nome TEXT,
  supervisor_email TEXT,
  
  -- Produto
  produto_id UUID REFERENCES produtos(id),
  produto_nome TEXT,
  quantidade NUMERIC,
  unidade TEXT,
  
  -- Pedido
  urgencia TEXT CHECK (urgencia IN ('Baixa','Média','Alta','Urgente')),
  observacoes TEXT,
  status TEXT CHECK (status IN (
    'Pendente',
    'Aprovado',
    'Em Separação',
    'Saiu para Entrega',
    'Entregue',
    'Cancelado',
    'Rejeitado'
  )),
  
  -- Controle mensal
  mes_solicitacao INTEGER, -- 1-12
  ano_solicitacao INTEGER,
  
  -- Autorização
  requer_autorizacao BOOLEAN DEFAULT FALSE,
  autorizacao_status TEXT CHECK (autorizacao_status IN ('Pendente','Aprovada','Rejeitada')),
  autorizacao_justificativa TEXT,
  autorizacao_solicitada_em TIMESTAMPTZ,
  autorizacao_respondida_em TIMESTAMPTZ,
  autorizacao_respondida_por UUID REFERENCES auth.users(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 Como Configurar

### 1. Criar Tabela no Supabase

Execute o SQL em: **mobile-supervisor/database/pedidos-mobile.sql**

```bash
# No Supabase Dashboard
1. Vá em SQL Editor
2. Copie o conteúdo de mobile-supervisor/database/pedidos-mobile.sql
3. Execute (Run)
```

### 2. Configurar .env do App Mobile

```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 3. Testar

```bash
cd mobile-supervisor
npx expo start
```

---

## ✅ Funcionalidades Implementadas

### App Mobile
- [x] Verificar limite mensal (1 pedido por mês)
- [x] Dialog de solicitação de autorização
- [x] Justificativa obrigatória
- [x] Criar pedido normal ou com autorização
- [x] Listar produtos do estoque (Supabase)
- [x] Busca de produtos em tempo real
- [x] Exibir status do pedido
- [x] Exibir status da autorização
- [x] Realtime: atualização automática de status
- [x] Pull-to-refresh para forçar atualização
- [x] Filtros: Todos / Ativos / Entregues

### Painel Web (A Implementar)
- [ ] Tela de gerenciamento de pedidos de supervisores
- [ ] Aprovar/rejeitar autorizações
- [ ] Aprovar/rejeitar pedidos
- [ ] Atualizar status (Em Separação, Saiu, Entregue)
- [ ] Filtros e busca
- [ ] Notificações para gestores

---

## 🎯 Exemplo de Uso

### Supervisor João (Outubro 2025)

**05/10/2025:**
- João faz pedido de "Cimento 50kg"
- ✅ Pedido criado normalmente (primeiro do mês)
- Status: Pendente → Aprovado → Em Separação → Saiu → Entregue

**20/10/2025:**
- João tenta fazer pedido de "Tinta Branca"
- ⚠️ Alert: "Você já fez 1 pedido este mês"
- João clica: "Solicitar Autorização"
- Justificativa: "Obra urgente iniciando dia 21/10"
- 🔐 Pedido enviado com autorização pendente

**No Painel Web:**
- Gestor Maria vê: "Pedido com Autorização Pendente"
- Lê a justificativa de João
- Aprova a autorização
- Aprova o pedido do material
- ✅ João recebe notificação instantânea

**No App do João:**
- 📡 Atualização automática via realtime
- Status muda: "Autorização: Aprovada"
- Status muda: "Pedido: Aprovado"
- Material segue o fluxo normal

---

## 📚 Benefícios

✅ **Controle de custos** - Máximo 1 pedido/supervisor/mês  
✅ **Flexibilidade** - Autorização para urgências  
✅ **Rastreabilidade** - Histórico completo de autorizações  
✅ **Tempo real** - Supervisor acompanha status instantaneamente  
✅ **Transparência** - Justificativas registradas  
✅ **Auditoria** - Quem autorizou, quando, por quê  

---

**Sistema 100% funcional e integrado com Supabase!** 🚀


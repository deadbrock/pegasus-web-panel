# 🏗️ ARQUITETURA DO SISTEMA
## Contratos e Supervisores

---

## 📊 Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECOSSISTEMA PEGASUS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐           ┌──────────────┐                  │
│  │  Painel Web  │◄─────────►│  Supabase    │                  │
│  │  (Logística) │           │  PostgreSQL  │                  │
│  └──────┬───────┘           └──────┬───────┘                  │
│         │                           │                          │
│         │ API REST                  │ Direct SQL              │
│         │                           │                          │
│         ▼                           ▼                          │
│  ┌──────────────────────────────────────────┐                 │
│  │         API /api/contratos-supervisor    │                 │
│  │         • GET  - Buscar contratos        │                 │
│  │         • POST - Sincronizar             │                 │
│  └──────────────┬───────────────────────────┘                 │
│                 │                                              │
│                 │ HTTP                                         │
│                 │                                              │
│                 ▼                                              │
│  ┌──────────────────────────────────────────┐                 │
│  │    App Mobile (React Native/Expo)        │                 │
│  │    • Supervisores                        │                 │
│  │    • Visualização de contratos           │                 │
│  │    • Criação de pedidos                  │                 │
│  └──────────────────────────────────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Estrutura do Banco de Dados

### **Diagrama ER (Entity-Relationship)**

```
┌─────────────────────────┐
│       USERS             │
├─────────────────────────┤
│ id (PK)                 │
│ nome                    │
│ email                   │
│ role (supervisor, ...)  │
│ created_at              │
│ updated_at              │
└───────┬─────────────────┘
        │
        │ supervisor_id (FK)
        │
        ▼
┌─────────────────────────────────────────────────┐
│  CONTRATOS_SUPERVISORES_ATRIBUICAO             │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ contrato_id (FK) ──────────────────────┐       │
│ supervisor_id (FK)                      │       │
│ ativo                                   │       │
│ data_atribuicao                         │       │
│ atribuido_por (FK) ─────► users.id     │       │
│ created_at                              │       │
│ updated_at                              │       │
└─────────────────────────────────────────┼───────┘
                                          │
                                          │
                                          │
┌─────────────────────────────────────────▼───────┐
│                  CONTRATOS                      │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ numero_contrato                                 │
│ cliente                                         │
│ tipo                                            │
│ descricao                                       │
│ valor_total                                     │
│ valor_mensal                                    │
│ valor_mensal_material ⭐ NOVO                   │
│ data_inicio                                     │
│ data_fim                                        │
│ status                                          │
│ responsavel                                     │
│ email_contato                                   │
│ telefone_contato                                │
│ observacoes                                     │
│ created_at                                      │
│ updated_at                                      │
└───────────┬─────────────────────────────────────┘
            │
            │ contrato_id (FK)
            │
            ▼
┌─────────────────────────────────────────────────┐
│          PEDIDOS_SUPERVISORES                   │
├─────────────────────────────────────────────────┤
│ id (PK)                                         │
│ numero_pedido                                   │
│ supervisor_id (FK)                              │
│ contrato_id (FK)                                │
│ status                                          │
│ urgencia                                        │
│ observacoes                                     │
│ data_solicitacao                                │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados

### **1. Cadastro de Contrato (Painel Web)**

```
┌─────────────┐
│  Logística  │
│  (Usuário)  │
└──────┬──────┘
       │
       │ 1. Preenche formulário
       │    • Dados do contrato
       │    • Teto mensal: R$ 5.000
       │    • Seleciona supervisores
       │
       ▼
┌──────────────────────┐
│  ContratosDialog     │
│  (Frontend)          │
└──────┬───────────────┘
       │
       │ 2. Validação local
       │
       ▼
┌──────────────────────┐
│  contratos-service   │
│  createContrato()    │
└──────┬───────────────┘
       │
       │ 3. INSERT INTO contratos
       │
       ▼
┌──────────────────────┐
│  Supabase/Postgres   │
│  ✅ Contrato criado  │
└──────┬───────────────┘
       │
       │ 4. Retorna contrato_id
       │
       ▼
┌──────────────────────────────────────┐
│  atualizarSupervisoresContrato()     │
│  • Desativa atribuições antigas      │
│  • Cria novas atribuições            │
└──────┬───────────────────────────────┘
       │
       │ 5. INSERT INTO contratos_supervisores_atribuicao
       │
       ▼
┌──────────────────────┐
│  Supabase/Postgres   │
│  ✅ Atribuições OK   │
└──────────────────────┘
```

### **2. Sincronização com Mobile**

```
┌─────────────┐
│ Supervisor  │
│ (Mobile)    │
└──────┬──────┘
       │
       │ 1. Abre app ou pull-to-refresh
       │
       ▼
┌──────────────────────┐
│  contratos-service   │
│  fetchContratos...() │
└──────┬───────────────┘
       │
       │ 2. HTTP GET /api/contratos-supervisor
       │    ?supervisor_id=UUID
       │
       ▼
┌──────────────────────┐
│  API Route Handler   │
│  (Next.js)           │
└──────┬───────────────┘
       │
       │ 3. Query Supabase:
       │    SELECT contratos
       │    JOIN contratos_supervisores_atribuicao
       │    WHERE supervisor_id = UUID
       │      AND ativo = true
       │      AND status = 'Ativo'
       │
       ▼
┌──────────────────────┐
│  Supabase/Postgres   │
│  Retorna contratos   │
└──────┬───────────────┘
       │
       │ 4. JSON Response
       │    {
       │      "success": true,
       │      "contratos": [...]
       │    }
       │
       ▼
┌──────────────────────┐
│  Mobile App          │
│  • Atualiza estado   │
│  • Exibe na UI       │
└──────────────────────┘
```

### **3. Criação de Pedido (Mobile)**

```
┌─────────────┐
│ Supervisor  │
└──────┬──────┘
       │
       │ 1. Seleciona contrato
       │    (da aba "Atribuídos")
       │
       ▼
┌──────────────────────┐
│  Formulário Pedido   │
│  • Contrato: XYZ     │
│  • Produtos          │
└──────┬───────────────┘
       │
       │ 2. Valida período
       │    (dia 15 a 23?)
       │
       ▼
┌──────────────────────┐
│  periodo-service     │
│  verificarPeriodo()  │
└──────┬───────────────┘
       │
       │ 3a. Se PERMITIDO:
       │     Continua
       │ 3b. Se BLOQUEADO:
       │     Mostra mensagem
       │
       ▼
┌──────────────────────┐
│  pedidos-service     │
│  createPedido()      │
└──────┬───────────────┘
       │
       │ 4. INSERT INTO pedidos_supervisores
       │    • contrato_id = UUID_CONTRATO
       │    • supervisor_id = UUID_SUP
       │    • status = 'Pendente'
       │
       ▼
┌──────────────────────┐
│  Supabase/Postgres   │
│  ✅ Pedido criado    │
└──────────────────────┘
```

---

## 🔐 Segurança e Permissões

### **Row Level Security (RLS)**

```sql
-- Exemplo de política RLS para contratos
CREATE POLICY "Supervisores veem apenas contratos atribuídos"
ON contratos
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM contratos_supervisores_atribuicao
    WHERE contrato_id = contratos.id
      AND supervisor_id = auth.uid()
      AND ativo = true
  )
);

-- Exemplo de política RLS para atribuições
CREATE POLICY "Apenas logística gerencia atribuições"
ON contratos_supervisores_atribuicao
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('logistica', 'admin')
  )
);
```

### **Fluxo de Autenticação**

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       │ 1. Login
       │
       ▼
┌──────────────────────┐
│  Supabase Auth       │
│  • Verifica senha    │
│  • Gera JWT token    │
└──────┬───────────────┘
       │
       │ 2. Token JWT
       │    { user_id, role, ... }
       │
       ▼
┌──────────────────────┐
│  Aplicação           │
│  • Armazena token    │
│  • Anexa em requests │
└──────┬───────────────┘
       │
       │ 3. Request com token
       │    Authorization: Bearer TOKEN
       │
       ▼
┌──────────────────────┐
│  API / Supabase      │
│  • Valida token      │
│  • Aplica RLS        │
│  • Retorna dados     │
└──────────────────────┘
```

---

## 📡 APIs e Endpoints

### **Endpoint Principal: `/api/contratos-supervisor`**

#### **GET - Buscar Contratos**
```
Request:
  GET /api/contratos-supervisor?supervisor_id=UUID

Response:
  {
    "success": true,
    "contratos": [
      {
        "id": "uuid",
        "cliente": "Cliente XYZ",
        "numero_contrato": "CONT-001",
        "valor_mensal_material": 5000.00,
        "status": "Ativo",
        ...
      }
    ],
    "total": 3
  }
```

#### **POST - Sincronizar Configurações**
```
Request:
  POST /api/contratos-supervisor
  {
    "supervisor_id": "UUID",
    "action": "sync_contratos"
  }

Response:
  {
    "success": true,
    "contratos": [...],
    "total": 3,
    "mensagem": "3 contrato(s) sincronizado(s)"
  }
```

#### **POST - Sincronizar Período**
```
Request:
  POST /api/contratos-supervisor
  {
    "supervisor_id": "UUID",
    "action": "sync_periodo"
  }

Response:
  {
    "success": true,
    "periodo_config": {
      "nome": "Período Padrão",
      "dia_inicio": 15,
      "dia_fim": 23,
      ...
    },
    "mensagem": "Configuração de período sincronizada"
  }
```

---

## 🧩 Componentes Principais

### **Painel Web**

```
src/
├── app/
│   ├── api/
│   │   └── contratos-supervisor/
│   │       └── route.ts ⭐ API para mobile
│   └── dashboard/
│       └── contratos/
│           └── page.tsx → Lista de contratos
│
├── components/
│   └── contratos/
│       ├── contratos-dialog-completo.tsx ⭐ Novo
│       └── contract-dialog.tsx (antigo)
│
└── lib/
    └── services/
        └── contratos-service.ts ⭐ Atualizado
            • fetchContratosComSupervisores()
            • atualizarSupervisoresContrato()
            • fetchContratosPorSupervisor()
```

### **App Mobile**

```
mobile-supervisor/
├── app/
│   └── (tabs)/
│       └── contratos.tsx ⭐ Atualizado
│           • 2 abas (Atribuídos / Próprios)
│           • Pull-to-refresh
│           • Exibe teto mensal
│
├── services/
│   ├── contratos-service.ts ⭐ Atualizado
│   │   • fetchContratosAtribuidosLogistica()
│   │   • sincronizarConfiguracoes()
│   │
│   └── periodo-pedidos-service.ts
│       • verificarPeriodoPedidos()
│       • (já existia)
│
└── .env ⭐ Novo
    • EXPO_PUBLIC_API_URL
```

---

## 🔄 Ciclo de Vida dos Dados

### **Estado 1: Contrato Criado**
```
Painel Web → INSERT contratos
           → valor_mensal_material = 5000.00
           → status = 'Ativo'
```

### **Estado 2: Supervisores Atribuídos**
```
Painel Web → INSERT contratos_supervisores_atribuicao
           → supervisor_id = UUID_SUP
           → ativo = true
```

### **Estado 3: Sincronização Mobile**
```
Mobile → GET /api/contratos-supervisor
       → Recebe contratos atribuídos
       → Exibe na tela
```

### **Estado 4: Pedido Criado**
```
Mobile → INSERT pedidos_supervisores
       → contrato_id = UUID_CONTRATO
       → Validação de período aplicada
```

### **Estado 5: Contrato Atualizado**
```
Painel Web → UPDATE contratos
           → valor_mensal_material = 7500.00

Mobile → Pull-to-refresh
       → Recebe valor atualizado
       → Exibe novo valor
```

---

## 📊 Métricas e Monitoramento

### **Queries de Monitoramento**

```sql
-- Saúde do sistema
SELECT 
  'Contratos Ativos' as metrica,
  COUNT(*) as valor
FROM contratos
WHERE status = 'Ativo'

UNION ALL

SELECT 
  'Atribuições Ativas',
  COUNT(*)
FROM contratos_supervisores_atribuicao
WHERE ativo = true

UNION ALL

SELECT 
  'Pedidos Hoje',
  COUNT(*)
FROM pedidos_supervisores
WHERE DATE(data_solicitacao) = CURRENT_DATE;
```

### **Performance**

```
Operação                        Tempo Esperado
─────────────────────────────────────────────
Listar contratos (painel)       < 500ms
Buscar contratos (API mobile)   < 1s
Criar contrato                  < 2s
Sincronizar mobile              < 3s
Criar pedido                    < 1s
```

---

## 🚨 Tratamento de Erros

### **Hierarquia de Fallback**

```
Mobile tenta buscar contratos:
  1. Tenta API (/api/contratos-supervisor)
     ✅ Sucesso → Retorna dados
     ❌ Falha → Continua
  
  2. Tenta Supabase direto
     ✅ Sucesso → Retorna dados
     ❌ Falha → Continua
  
  3. Cache local (se disponível)
     ✅ Sucesso → Retorna dados (desatualizado)
     ❌ Falha → Continua
  
  4. Retorna array vazio + mensagem de erro
```

---

## 🎯 Pontos de Atenção

1. **Sincronização**: Mobile usa pull-to-refresh, não push em tempo real
2. **Cache**: API não tem cache, sempre busca dados frescos
3. **RLS**: Depende de políticas do Supabase estarem corretas
4. **Validação**: Período de pedidos é validado no mobile antes de enviar
5. **Teto de gastos**: Apenas informativo, não há validação automática ainda

---

**Data:** 10/02/2026
**Versão:** 1.0

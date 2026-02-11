# 📋 Implementação: Gestão de Contratos com Supervisores

## 🎯 Objetivo

Implementar sistema completo de gestão de contratos com:
1. ✅ Campo de **valor mensal de material** para controle de teto de gastos
2. ✅ **Atribuição de supervisores** responsáveis por contratos
3. ✅ **Sincronização automática** entre painel web e aplicativo mobile
4. ✅ **Controle de período de pedidos** já sincronizado

---

## 🚀 O que foi implementado

### 1. **Banco de Dados** 

#### Novo Campo em `contratos`:
- `valor_mensal_material` (DECIMAL) - Teto de gastos mensal para material de consumo

#### Nova Tabela `contratos_supervisores_atribuicao`:
```sql
- contrato_id (UUID) → FK para contratos
- supervisor_id (UUID) → FK para users
- ativo (BOOLEAN)
- data_atribuicao (TIMESTAMP)
- atribuido_por (UUID) → FK para users (quem fez a atribuição)
```

#### Funções e Views:
- `get_contratos_supervisor(supervisor_uuid)` - Busca contratos de um supervisor
- `contratos_com_supervisores` - View com lista de supervisores por contrato
- `gastos_por_contrato_mes` - View para relatórios de gastos

### 2. **Painel Web (Next.js)**

#### Services Atualizados:
- `src/lib/services/contratos-service.ts`
  - `fetchContratosComSupervisores()` - Busca contratos com supervisores
  - `fetchSupervisoresDisponiveis()` - Lista supervisores disponíveis
  - `atribuirSupervisorContrato()` - Atribui supervisor a contrato
  - `removerSupervisorContrato()` - Remove atribuição
  - `atualizarSupervisoresContrato()` - Atualiza múltiplos supervisores
  - `fetchContratosPorSupervisor()` - Busca contratos de um supervisor

#### Componentes Novos:
- `src/components/contratos/contratos-dialog-completo.tsx`
  - Formulário completo de contrato
  - Campo de **valor mensal de material** destacado
  - Seleção múltipla de supervisores responsáveis
  - Validações completas

#### API Criada:
- `src/app/api/contratos-supervisor/route.ts`
  - **GET** `?supervisor_id=XXX` - Busca contratos atribuídos
  - **POST** `action=sync_contratos` - Sincroniza contratos
  - **POST** `action=sync_periodo` - Sincroniza configuração de período

### 3. **Aplicativo Mobile (React Native)**

#### Services Atualizados:
- `mobile-supervisor/services/contratos-service.ts`
  - `fetchContratosAtribuidosLogistica()` - Busca contratos via API
  - `fetchTodosContratosUnificados()` - Busca atribuídos + próprios
  - `sincronizarConfiguracoes()` - Sincroniza tudo com painel
  - `formatarContratoAtribuidoCompleto()` - Formatação para exibição

#### Telas Atualizadas:
- `mobile-supervisor/app/(tabs)/contratos.tsx`
  - **Duas abas**: "Atribuídos" e "Meus Cadastros"
  - Exibe **teto mensal de material** em destaque
  - Badge indicando contratos gerenciados pela logística
  - Botão de sincronização com pull-to-refresh

---

## 📥 Como Aplicar as Mudanças

### **Passo 1: Migração do Banco de Dados**

Execute o script SQL no seu banco Supabase/PostgreSQL:

```bash
# Via psql (linha de comando)
psql -U seu_usuario -d seu_banco -f database/contratos-supervisores-atribuicao.sql

# OU via Supabase Dashboard:
# 1. Acesse o SQL Editor
# 2. Cole o conteúdo do arquivo database/contratos-supervisores-atribuicao.sql
# 3. Execute
```

**Importante**: Este script é idempotente (pode ser executado múltiplas vezes sem problemas).

### **Passo 2: Verificar o Banco**

Após executar o script, verifique se tudo foi criado:

```sql
-- Verificar coluna nova
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'contratos' 
  AND column_name = 'valor_mensal_material';

-- Verificar tabela nova
SELECT * FROM contratos_supervisores_atribuicao LIMIT 1;

-- Verificar view
SELECT * FROM contratos_com_supervisores LIMIT 1;
```

### **Passo 3: Reiniciar Aplicações**

#### Painel Web:
```bash
cd pegasus-web-panel
npm run dev
```

#### Mobile (Expo):
```bash
cd mobile-supervisor
npm start
# OU
npx expo start
```

---

## 🧪 Como Testar

### **Teste 1: Cadastrar Contrato com Teto de Gastos**

1. Acesse o painel web: `/dashboard/contratos`
2. Clique em "Novo Contrato"
3. Preencha os dados:
   - Número do contrato: `CONT-2024-001`
   - Cliente: `Cliente Teste`
   - **💰 Teto Mensal de Material**: `5000.00`
   - Data início/fim
4. Na seção "Supervisores Responsáveis":
   - Selecione 1 ou mais supervisores
5. Salve

**Resultado Esperado**: Contrato criado com valor mensal de material e supervisores atribuídos.

### **Teste 2: Verificar no Mobile**

1. Abra o app mobile do supervisor
2. Vá para a aba "Contratos"
3. Selecione a aba "📋 Atribuídos"
4. Arraste para baixo (pull-to-refresh) para sincronizar

**Resultado Esperado**: 
- Contrato aparece na lista
- Mostra o "Teto Mensal de Material" em destaque (amarelo)
- Badge "📌 Gerenciado pela logística"

### **Teste 3: Criar Pedido com Contrato Atribuído**

1. No app mobile, vá para "Novo Pedido"
2. Selecione o contrato atribuído
3. Adicione produtos
4. Finalize o pedido

**Resultado Esperado**: Pedido criado com `contrato_id` vinculado.

### **Teste 4: Período de Pedidos Sincronizado**

1. No painel web, vá para `/dashboard/configuracoes-periodo`
2. Configure um período (ex: dia 15 a 23)
3. Ative a configuração
4. No mobile, feche e abra o app novamente

**Resultado Esperado**: Banner no app mobile mostra o período configurado.

---

## 🔍 Verificações de Sincronização

### **Verificar se a API está respondendo:**

```bash
# Buscar contratos de um supervisor (substitua o ID)
curl "http://localhost:3000/api/contratos-supervisor?supervisor_id=SEU_ID_AQUI"

# Sincronizar configurações
curl -X POST "http://localhost:3000/api/contratos-supervisor" \
  -H "Content-Type: application/json" \
  -d '{"supervisor_id":"SEU_ID_AQUI","action":"sync_contratos"}'
```

### **Verificar logs no mobile:**

Quando o app mobile sincroniza, você verá logs como:

```
✅ 3 contrato(s) atribuído(s) pela logística
✅ Configurações sincronizadas com sucesso
```

---

## 📊 Estrutura de Dados

### **Exemplo de Contrato com Supervisores:**

```json
{
  "id": "uuid-do-contrato",
  "numero_contrato": "CONT-2024-001",
  "cliente": "Assaí Paulista",
  "tipo": "Prestação de Serviço",
  "valor_mensal_material": 5000.00,
  "data_inicio": "2024-01-01",
  "data_fim": "2024-12-31",
  "status": "Ativo",
  "supervisores": [
    {
      "supervisor_id": "uuid-supervisor-1",
      "supervisor_nome": "João Silva",
      "supervisor_email": "joao@empresa.com",
      "data_atribuicao": "2024-02-10T10:00:00Z"
    }
  ]
}
```

### **Exemplo de Resposta da API Mobile:**

```json
{
  "success": true,
  "contratos": [
    {
      "id": "uuid-contrato",
      "cliente": "Assaí Paulista",
      "valor_mensal_material": 5000.00,
      "status": "Ativo",
      "data_atribuicao": "2024-02-10T10:00:00Z"
    }
  ],
  "total": 1
}
```

---

## 🎨 Interface do Usuário

### **Painel Web - Nova Tela de Contratos:**

```
┌─────────────────────────────────────────────┐
│ 📋 Informações Básicas                      │
│  • Número do Contrato                       │
│  • Cliente                                  │
│  • Tipo, Status, Descrição                  │
├─────────────────────────────────────────────┤
│ 💰 Valores e Pagamento                      │
│  • Valor Total                              │
│  • Valor Mensal                             │
│  • 💰 Teto Mensal de Material ⭐            │
│  • Forma de Pagamento                       │
├─────────────────────────────────────────────┤
│ 📅 Vigência                                 │
│  • Data Início / Fim                        │
├─────────────────────────────────────────────┤
│ 👥 Supervisores Responsáveis ⭐             │
│  • João Silva [X]                           │
│  • Maria Santos [X]                         │
│  • [+ Adicionar Supervisor]                 │
└─────────────────────────────────────────────┘
```

### **Mobile - Tela de Contratos:**

```
┌─────────────────────────────────────────────┐
│ Meus Contratos                              │
│ 3 atribuído(s) • 2 próprio(s)               │
├─────────────────────────────────────────────┤
│ [📋 Atribuídos (3)] [📝 Meus Cadastros (2)]│
├─────────────────────────────────────────────┤
│ ℹ️ Contratos gerenciados pela logística     │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ Assaí Paulista                          │ │
│ │ CONT-2024-001                           │ │
│ │ ✓ Ativo                                 │ │
│ │                                         │ │
│ │ 🏷️ Prestação de Serviço                 │ │
│ │                                         │ │
│ │ 💰 Teto Mensal de Material              │ │
│ │    R$ 5.000,00                          │ │
│ │                                         │ │
│ │ 📌 Gerenciado pela logística            │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## ⚙️ Configurações Importantes

### **Variável de Ambiente (Mobile):**

Adicione no `.env` do mobile:

```env
EXPO_PUBLIC_API_URL=http://SEU_SERVIDOR:3000
```

Para desenvolvimento local com Expo:
- Android: `http://10.0.2.2:3000`
- iOS: `http://localhost:3000`
- Rede local: `http://192.168.X.X:3000`

### **Permissões do Supabase:**

Certifique-se de que as políticas RLS permitem:
- Supervisores lerem `contratos` onde têm atribuição
- Logística gerenciar `contratos_supervisores_atribuicao`

---

## 🐛 Troubleshooting

### **Problema: Mobile não sincroniza contratos**

**Solução:**
1. Verifique se `EXPO_PUBLIC_API_URL` está correta
2. Teste a API diretamente no navegador
3. Verifique logs do console mobile
4. Tente o fallback do Supabase (deve funcionar automaticamente)

### **Problema: Supervisor não vê contratos no mobile**

**Verifique:**
1. Se o contrato foi salvo com supervisores atribuídos
2. Se a atribuição está com `ativo = true`
3. Se o contrato está com `status = 'Ativo'`
4. Consulta SQL de verificação:

```sql
SELECT c.cliente, a.ativo, u.nome as supervisor_nome
FROM contratos c
JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id
JOIN users u ON a.supervisor_id = u.id
WHERE u.email = 'email@supervisor.com';
```

### **Problema: Período de pedidos não sincroniza**

**Verifique:**
1. Se existe uma configuração com `ativo = true` em `configuracoes_periodo_pedidos`
2. Se a tabela existe (deve ter sido criada antes)
3. Teste no painel web: `/dashboard/configuracoes-periodo`

---

## 📌 Próximos Passos Sugeridos

1. **Relatório de Gastos por Contrato:**
   - Usar a view `gastos_por_contrato_mes`
   - Mostrar se o supervisor está dentro do teto

2. **Notificações:**
   - Alertar quando atingir 80% do teto mensal
   - Alertar quando período de pedidos está acabando

3. **Dashboard:**
   - Gráfico de gastos por contrato
   - Ranking de supervisores por volume de pedidos

---

## ✅ Checklist de Implementação

- [x] Criar script de migração do banco
- [x] Adicionar campo `valor_mensal_material`
- [x] Criar tabela `contratos_supervisores_atribuicao`
- [x] Atualizar service de contratos (painel web)
- [x] Criar componente de dialog completo
- [x] Criar API `/api/contratos-supervisor`
- [x] Atualizar service de contratos (mobile)
- [x] Atualizar tela de contratos (mobile)
- [x] Adicionar abas no mobile
- [x] Implementar sincronização
- [ ] **Executar migração do banco** ⭐
- [ ] **Testar no painel web** ⭐
- [ ] **Testar no mobile** ⭐
- [ ] **Treinar usuários** ⭐

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do console (web e mobile)
2. Consulte este documento
3. Verifique o banco de dados diretamente
4. Entre em contato com o time de desenvolvimento

---

**Data de Implementação:** 10/02/2026
**Versão:** 1.0
**Status:** ✅ Pronto para deploy

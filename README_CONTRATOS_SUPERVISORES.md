# 📋 Sistema de Gestão de Contratos com Supervisores

> **Implementação Completa**: Controle de teto de gastos por contrato e atribuição de supervisores com sincronização automática entre painel web e app mobile.

---

## 🎯 O Que Foi Implementado

### ✅ Funcionalidades Principais

1. **💰 Teto de Gastos por Contrato**
   - Campo de valor mensal de material em cada contrato
   - Controle centralizado de limites de gastos
   - Visualização destacada no app mobile

2. **👥 Atribuição de Supervisores**
   - Seleção múltipla de supervisores por contrato
   - Gestão centralizada pela equipe de logística
   - Apenas supervisores atribuídos visualizam contratos no app

3. **🔄 Sincronização Automática**
   - Mudanças no painel refletem instantaneamente no mobile
   - Pull-to-refresh para atualização sob demanda
   - Fallback automático para acesso direto ao banco

4. **📅 Período de Pedidos (já existente)**
   - Continua sincronizado automaticamente
   - Configuração flexível (dias, horários, dias da semana)

---

## 📚 Documentação Completa

### 🚀 Para Começar
- **[CHECKLIST_IMPLEMENTACAO.md](./CHECKLIST_IMPLEMENTACAO.md)** ⭐ **COMECE AQUI!**
  - Passo a passo completo
  - Checklist de verificação
  - Testes funcionais

### 📖 Documentação Técnica
- **[IMPLEMENTACAO_CONTRATOS_SUPERVISORES.md](./IMPLEMENTACAO_CONTRATOS_SUPERVISORES.md)**
  - Guia completo de implementação
  - Detalhes técnicos
  - Instruções de deploy

- **[RESUMO_ALTERACOES.md](./RESUMO_ALTERACOES.md)**
  - Resumo executivo
  - Fluxo de trabalho
  - Perguntas frequentes

- **[ARQUITETURA_SISTEMA.md](./ARQUITETURA_SISTEMA.md)**
  - Diagramas de arquitetura
  - Fluxo de dados
  - Estrutura do banco

- **[COMANDOS_UTEIS.md](./COMANDOS_UTEIS.md)**
  - Queries SQL úteis
  - Comandos de debug
  - Relatórios e análises

---

## 🗂️ Estrutura de Arquivos

### **Banco de Dados**
```
database/
└── contratos-supervisores-atribuicao.sql    ⭐ Script de migração
```

### **Scripts**
```
scripts/
└── verificar-implementacao.sql              ⭐ Verificação pós-deploy
```

### **Painel Web**
```
src/
├── app/
│   ├── api/
│   │   └── contratos-supervisor/
│   │       └── route.ts                     ⭐ API para mobile
│   └── dashboard/
│       └── contratos/
│           └── page.tsx
│
├── components/
│   └── contratos/
│       └── contratos-dialog-completo.tsx    ⭐ Novo dialog
│
└── lib/
    └── services/
        └── contratos-service.ts             ⭐ Atualizado
```

### **App Mobile**
```
mobile-supervisor/
├── app/
│   └── (tabs)/
│       └── contratos.tsx                    ⭐ 2 abas
│
├── services/
│   └── contratos-service.ts                 ⭐ Sincronização
│
├── .env.example                             ⭐ Config exemplo
└── .env                                     (criar este)
```

---

## ⚡ Quick Start

### **1. Migrar Banco de Dados**
```bash
# Via Supabase Dashboard
# 1. Acesse SQL Editor
# 2. Cole conteúdo de database/contratos-supervisores-atribuicao.sql
# 3. Execute
```

### **2. Configurar Mobile**
```bash
cd mobile-supervisor
cp .env.example .env
# Editar .env com URL correta
```

### **3. Iniciar Aplicações**

**Painel Web:**
```bash
cd pegasus-web-panel
npm run dev
```

**Mobile:**
```bash
cd mobile-supervisor
npx expo start
```

### **4. Testar**
```bash
# Verificar banco
psql -f scripts/verificar-implementacao.sql

# Ou via Supabase Dashboard SQL Editor
```

---

## 🎨 Preview das Interfaces

### **Painel Web - Cadastro de Contrato**
```
┌──────────────────────────────────────────┐
│ 📋 Novo Contrato                         │
├──────────────────────────────────────────┤
│ Número: [CONT-2024-001___________]       │
│ Cliente: [Cliente XYZ_____________]       │
│                                          │
│ 💰 Teto Mensal de Material               │
│ R$ [5000.00___]                          │
│                                          │
│ 👥 Supervisores Responsáveis             │
│ ☑ João Silva                             │
│ ☑ Maria Santos                           │
│ ☐ Pedro Costa                            │
│                                          │
│ [Cancelar]  [Salvar Contrato]           │
└──────────────────────────────────────────┘
```

### **App Mobile - Lista de Contratos**
```
┌──────────────────────────────────────────┐
│ Meus Contratos                           │
│ 5 atribuído(s) • 2 próprio(s)            │
├──────────────────────────────────────────┤
│ [📋 Atribuídos]  [📝 Meus Cadastros]     │
├──────────────────────────────────────────┤
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Cliente XYZ                          │ │
│ │ CONT-2024-001                        │ │
│ │ ✓ Ativo                              │ │
│ │                                      │ │
│ │ 💰 Teto Mensal de Material           │ │
│ │    R$ 5.000,00                       │ │
│ │                                      │ │
│ │ 📌 Gerenciado pela logística         │ │
│ └──────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘
```

---

## 📊 Tabelas do Banco de Dados

### **Nova Coluna em `contratos`**
```sql
valor_mensal_material  DECIMAL(15,2)  -- Teto de gastos mensal
```

### **Nova Tabela `contratos_supervisores_atribuicao`**
```sql
id                   UUID (PK)
contrato_id          UUID (FK → contratos.id)
supervisor_id        UUID (FK → users.id)
ativo                BOOLEAN
data_atribuicao      TIMESTAMP
atribuido_por        UUID (FK → users.id)
created_at           TIMESTAMP
updated_at           TIMESTAMP

UNIQUE(contrato_id, supervisor_id)
```

### **Novas Funções**
- `get_contratos_supervisor(supervisor_uuid)` - Busca contratos de um supervisor
- `contratos_com_supervisores` (VIEW) - Lista contratos com supervisores
- `gastos_por_contrato_mes` (VIEW) - Relatório de gastos

---

## 🔧 Configuração

### **Variáveis de Ambiente (Mobile)**

Criar arquivo `mobile-supervisor/.env`:

```env
# URL da API do Painel Web
EXPO_PUBLIC_API_URL=http://SEU_IP:3000

# Supabase (se necessário)
EXPO_PUBLIC_SUPABASE_URL=https://projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave
```

**IPs comuns para desenvolvimento:**
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`
- Dispositivo físico: `http://192.168.X.X:3000`

---

## ✅ Checklist Rápido

- [ ] Executar migração do banco
- [ ] Verificar com `verificar-implementacao.sql`
- [ ] Configurar `.env` no mobile
- [ ] Testar cadastro de contrato no painel
- [ ] Testar visualização no mobile
- [ ] Treinar equipes

**✅ Tudo OK? Sistema pronto para uso!**

---

## 🐛 Troubleshooting

### **Problema: Mobile não sincroniza contratos**

**Soluções:**
1. Verificar `EXPO_PUBLIC_API_URL` no `.env`
2. Testar API no navegador: `http://SEU_IP:3000/api/contratos-supervisor?supervisor_id=UUID`
3. Verificar logs do Expo DevTools
4. Verificar logs do Next.js
5. Sistema tem fallback automático para Supabase direto

### **Problema: Supervisor não vê contrato**

**Verificar:**
```sql
-- Contrato existe?
SELECT * FROM contratos WHERE id = 'UUID';

-- Atribuição existe e está ativa?
SELECT * FROM contratos_supervisores_atribuicao 
WHERE contrato_id = 'UUID' 
  AND supervisor_id = 'UUID_SUP'
  AND ativo = true;

-- Contrato está ativo?
SELECT status FROM contratos WHERE id = 'UUID';
```

### **Problema: Período não sincroniza**

**Verificar:**
```sql
-- Configuração existe e está ativa?
SELECT * FROM configuracoes_periodo_pedidos 
WHERE ativo = true;
```

---

## 📞 Suporte

### **Antes de Reportar Problemas:**
1. Consultar [COMANDOS_UTEIS.md](./COMANDOS_UTEIS.md)
2. Executar `verificar-implementacao.sql`
3. Verificar logs (Next.js e Expo)
4. Testar queries SQL diretamente

### **Ao Reportar:**
Incluir:
- Mensagem de erro completa
- Logs do console
- Query SQL (se aplicável)
- Resultado de `verificar-implementacao.sql`

---

## 🎓 Treinamento

### **Equipe de Logística**
- Como cadastrar contratos
- Como definir teto mensal
- Como atribuir supervisores
- Como editar e remover atribuições

### **Supervisores**
- Diferença entre "Atribuídos" e "Meus Cadastros"
- O que é "Teto Mensal de Material"
- Como sincronizar (pull-to-refresh)
- Respeitar período de pedidos (dia 15-23)

---

## 📈 Próximos Passos Sugeridos

1. **Dashboard de Gastos**
   - Gráfico de gastos vs teto por contrato
   - Alertas quando atingir 80% do teto

2. **Notificações**
   - Push quando período está acabando
   - Push quando contrato está vencendo

3. **Relatórios**
   - Relatório de pedidos por contrato
   - Relatório de gastos por supervisor
   - Exportação para Excel/PDF

4. **Validação Automática**
   - Bloquear pedido se ultrapassar teto
   - Sugerir redistribuição de supervisores

---

## 🏆 Status do Projeto

```
✅ Banco de Dados - Implementado
✅ Painel Web - Implementado
✅ API REST - Implementado
✅ App Mobile - Implementado
✅ Documentação - Completa
✅ Scripts de Verificação - Prontos
⏳ Deploy - Aguardando execução
⏳ Testes - Aguardando
⏳ Treinamento - Aguardando
```

---

## 📝 Changelog

### **Versão 1.0 - 10/02/2026**
- ✅ Adicionado campo `valor_mensal_material` em contratos
- ✅ Criada tabela `contratos_supervisores_atribuicao`
- ✅ Implementado sistema de atribuição de supervisores
- ✅ Criada API `/api/contratos-supervisor`
- ✅ Atualizado app mobile com 2 abas
- ✅ Implementada sincronização automática
- ✅ Documentação completa criada

---

## 🌟 Principais Benefícios

1. **Controle Centralizado** - Logística gerencia tudo
2. **Visibilidade** - Supervisor vê apenas o relevante
3. **Teto de Gastos** - Controle financeiro por contrato
4. **Sincronização** - Mudanças instantâneas
5. **Auditoria** - Rastreamento completo de atribuições
6. **Flexibilidade** - Múltiplos supervisores por contrato

---

## 📖 Índice de Documentos

| Documento | Descrição | Quando Usar |
|-----------|-----------|-------------|
| [README_CONTRATOS_SUPERVISORES.md](./README_CONTRATOS_SUPERVISORES.md) | Este arquivo - Visão geral | Primeiro contato |
| [CHECKLIST_IMPLEMENTACAO.md](./CHECKLIST_IMPLEMENTACAO.md) | Checklist passo a passo | Durante deploy ⭐ |
| [IMPLEMENTACAO_CONTRATOS_SUPERVISORES.md](./IMPLEMENTACAO_CONTRATOS_SUPERVISORES.md) | Guia técnico completo | Detalhes técnicos |
| [RESUMO_ALTERACOES.md](./RESUMO_ALTERACOES.md) | Resumo executivo | Apresentação/treinamento |
| [ARQUITETURA_SISTEMA.md](./ARQUITETURA_SISTEMA.md) | Diagramas e arquitetura | Entender estrutura |
| [COMANDOS_UTEIS.md](./COMANDOS_UTEIS.md) | Queries SQL e comandos | Dia a dia / debug |

---

## 🚀 Deploy

### **Ordem de Execução:**

1. **Backup** do banco de dados
2. **Migração** (`database/contratos-supervisores-atribuicao.sql`)
3. **Verificação** (`scripts/verificar-implementacao.sql`)
4. **Deploy** do painel web
5. **Configuração** do mobile (.env)
6. **Testes** funcionais
7. **Treinamento** das equipes
8. **Go Live!** 🎉

---

## 💬 Feedback

Sistema implementado e funcionando? Deixe seu feedback:

- ⭐ O que funcionou bem?
- 🐛 Encontrou algum bug?
- 💡 Sugestões de melhoria?

---

**✅ SISTEMA PRONTO PARA USO!**

🎉 Parabéns! O sistema de gestão de contratos com supervisores está completo e documentado.

**Próximo passo:** Execute o [CHECKLIST_IMPLEMENTACAO.md](./CHECKLIST_IMPLEMENTACAO.md)

---

**Data:** 10 de Fevereiro de 2026  
**Versão:** 1.0  
**Status:** ✅ Pronto para Deploy

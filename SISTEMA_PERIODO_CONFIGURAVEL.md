# 🗓️ SISTEMA DE PERÍODO CONFIGURÁVEL PARA PEDIDOS

## 📋 VISÃO GERAL

Sistema que permite configurar **dinamicamente** quando os supervisores podem fazer pedidos através de uma interface amigável no painel web.

**Antes:** Período hardcoded (dia 15-23)  
**Agora:** Configurável pelo usuário logística! ✨

---

## 🎯 FUNCIONALIDADES

### 📅 Período do Mês
- Definir dia de início (1-31)
- Definir dia de fim (1-31)
- Ex: Dia 15 ao dia 23

### 📆 Dias da Semana
- Selecionar quais dias da semana são permitidos
- Ex: Apenas Segunda a Sexta
- Bloqueia fins de semana automaticamente

### 🕐 Horário Permitido
- Definir horário de início (HH:MM)
- Definir horário de fim (HH:MM)
- Ex: 08:00 às 18:00

### 🔢 Limites e Autorizações
- Máximo de pedidos por período
- Após X pedidos, requer autorização
- Ex: 1º pedido livre, 2º+ requer justificativa

### ⚙️ Opções Adicionais
- Permitir pedidos urgentes fora do período
- Mensagem customizada de bloqueio
- Ativar/desativar configurações

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `configuracoes_periodo_pedidos`

```sql
CREATE TABLE configuracoes_periodo_pedidos (
    id UUID PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    
    -- Período
    dia_inicio INTEGER (1-31),
    dia_fim INTEGER (1-31),
    dias_semana_permitidos JSONB, -- [0,1,2,3,4,5,6]
    
    -- Horários
    horario_inicio TIME,
    horario_fim TIME,
    
    -- Limites
    max_pedidos_por_periodo INTEGER,
    requer_autorizacao_apos INTEGER DEFAULT 1,
    
    -- Extras
    permitir_urgentes BOOLEAN,
    mensagem_bloqueio TEXT,
    
    -- Auditoria
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID
);
```

### Importante:
- ✅ Apenas **UMA configuração ativa** por vez
- ✅ Quando uma é ativada, outras são desativadas automaticamente
- ✅ Configuração padrão é criada na instalação

---

## 🚀 INSTALAÇÃO

### 1️⃣ Criar Tabela no Supabase

Execute o SQL:
```bash
# No Supabase SQL Editor
psql < database/configuracoes-periodo-pedidos.sql
```

Ou copie e cole o conteúdo de `database/configuracoes-periodo-pedidos.sql` no Supabase SQL Editor.

### 2️⃣ API já está criada

Arquivo: `src/app/api/configuracoes-periodo/route.ts`

**Endpoints:**
- `GET /api/configuracoes-periodo` - Buscar configuração ativa
- `POST /api/configuracoes-periodo` - Criar nova configuração
- `PUT /api/configuracoes-periodo` - Atualizar configuração
- `DELETE /api/configuracoes-periodo?id=xxx` - Deletar configuração

### 3️⃣ Página Web já está criada

Arquivo: `src/app/dashboard/configuracoes-periodo/page.tsx`

Acesso: **Dashboard > Configurações de Período** (adicionar no menu)

### 4️⃣ App Mobile atualizado

Arquivo: `mobile-supervisor/services/periodo-pedidos-service.ts`

- ✅ Busca configuração do banco automaticamente
- ✅ Cache de 5 minutos
- ✅ Fallback para configuração padrão

---

## 🖥️ COMO USAR NO PAINEL WEB

### Passo 1: Acessar Configurações

1. Login no painel como **logística**
2. Menu lateral > **Configurações de Período** (ou acesse direto: `/dashboard/configuracoes-periodo`)

### Passo 2: Configurar Período

**Campos obrigatórios:**
- ✅ Nome da configuração
- ✅ Status (Ativa/Inativa)

**Período do Mês:**
```
Dia de Início: 15
Dia de Fim: 23
```
Supervisores só podem fazer pedidos do dia 15 ao 23.

**Dias da Semana:**
```
☑️ Segunda
☑️ Terça
☑️ Quarta
☑️ Quinta
☑️ Sexta
☐ Sábado
☐ Domingo
```
Pedidos bloqueados nos fins de semana.

**Horário:**
```
Início: 08:00
Fim: 18:00
```
Fora deste horário, pedidos são bloqueados.

**Limites:**
```
Máximo de pedidos: [vazio = ilimitado]
Requer autorização após: 1
```
1º pedido livre, 2º+ requer justificativa.

**Mensagem de Bloqueio:**
```
"O período de pedidos é do dia 15 ao dia 23 de cada mês. 
Por favor, aguarde a próxima janela."
```
Esta mensagem aparece no app quando bloqueado.

### Passo 3: Salvar

Clique em **"Salvar Configuração"** ✅

**Efeito imediato:**
- App mobile busca nova configuração automaticamente
- Supervisores veem as novas regras

---

## 📱 COMO FUNCIONA NO APP MOBILE

### Fluxo Automático:

1. **Supervisor abre o app**
2. App busca configuração ativa do banco
3. Verifica se está no período permitido
4. Mostra banner informativo:
   - ✅ Verde: "Período aberto até dia 23 (5 dias restantes)"
   - 🔒 Vermelho: "Período encerrado. Próximo: dia 15"
   - ⚠️ Amarelo: "Restam 2 dias para fazer pedidos!"

### Validações Aplicadas:

```javascript
// 1. Dia do mês
if (diaAtual < 15 || diaAtual > 23) {
  // BLOQUEADO
}

// 2. Dia da semana
if (hoje === 'Sábado' || hoje === 'Domingo') {
  // BLOQUEADO
}

// 3. Horário
if (horaAtual < '08:00' || horaAtual > '18:00') {
  // BLOQUEADO
}

// 4. Autorização
if (pedidosNoMes >= 1) {
  // Requer justificativa e aguarda aprovação
}
```

---

## 🎨 INTERFACE DO PAINEL WEB

### Layout:

```
┌────────────────────────────────────────────────┐
│ Configurações de Período de Pedidos            │
├────────────────────────────────────────────────┤
│                                                 │
│ ⚠️ Como funciona                                │
│ As regras aqui serão aplicadas no app mobile   │
│                                                 │
├────────────────────────────────────────────────┤
│                                                 │
│ 📅 Regras de Período                            │
│                                                 │
│ Nome: [Período Padrão Mensal    ]               │
│ Ativa: [✓]                                      │
│                                                 │
│ Dia Início: [15] Dia Fim: [23]                  │
│                                                 │
│ Dias da Semana:                                 │
│ [Segunda][Terça][Quarta][Quinta][Sexta]         │
│                                                 │
│ Horário: [08:00] até [18:00]                    │
│                                                 │
│ Autorização após: [1] pedido(s)                 │
│                                                 │
│ Mensagem de Bloqueio:                           │
│ [Período de pedidos: dia 15 ao 23...]           │
│                                                 │
│ [💾 Salvar Configuração]                        │
│                                                 │
└────────────────────────────────────────────────┘
```

---

## ⚙️ CONFIGURAÇÕES DE EXEMPLO

### Exemplo 1: Período Mensal Básico
```json
{
  "nome": "Período Mensal Padrão",
  "dia_inicio": 15,
  "dia_fim": 23,
  "dias_semana_permitidos": [1,2,3,4,5],
  "horario_inicio": "08:00",
  "horario_fim": "18:00",
  "requer_autorizacao_apos": 1
}
```
**Resultado:** Pedidos do dia 15-23, seg-sex, 8h-18h, 2º pedido requer aprovação.

### Exemplo 2: Período Semanal
```json
{
  "nome": "Pedidos Semanais",
  "dias_semana_permitidos": [2,4],
  "horario_inicio": "09:00",
  "horario_fim": "17:00",
  "max_pedidos_por_periodo": 1,
  "requer_autorizacao_apos": 1
}
```
**Resultado:** Apenas terças e quintas, 9h-17h, máximo 1 pedido por período.

### Exemplo 3: Sempre Aberto (Sem Restrições)
```json
{
  "nome": "Período Aberto",
  "ativo": true
}
```
**Resultado:** Sem restrições de período, dia ou horário.

### Exemplo 4: Urgências Permitidas
```json
{
  "nome": "Com Urgências",
  "dia_inicio": 15,
  "dia_fim": 23,
  "permitir_urgentes": true
}
```
**Resultado:** Período normal 15-23, mas pedidos urgentes permitidos fora do período.

---

## 🔄 ATUALIZAÇÃO DINÂMICA

### Como o App Mobile Atualiza:

1. **Cache de 5 minutos:**
   - Primeira vez: busca do banco
   - Próximas vezes: usa cache local
   - Após 5 min: busca novamente

2. **Pull to Refresh:**
   - Supervisor puxa tela para baixo
   - Recarrega configuração imediatamente

3. **Realtime (futuro):**
   - Pode adicionar Supabase Realtime
   - Atualizações instantâneas

---

## 🛡️ SEGURANÇA E PERMISSÕES

### Quem Pode Configurar:
- ✅ Usuário **logística** (admin)
- ❌ Supervisores **não têm acesso**

### Políticas RLS (Supabase):
```sql
-- Supervisores podem apenas LER configuração ativa
CREATE POLICY "Supervisores leem config ativa"
ON configuracoes_periodo_pedidos
FOR SELECT
TO authenticated
USING (ativo = true);

-- Apenas service_role pode modificar
GRANT ALL ON configuracoes_periodo_pedidos TO service_role;
```

---

## 📊 MONITORAMENTO E LOGS

### Logs de Verificação (Opcional):

Criar tabela para auditoria:
```sql
CREATE TABLE log_periodo_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supervisor_id UUID REFERENCES auth.users(id),
    data_verificacao TIMESTAMP DEFAULT NOW(),
    dentro_periodo BOOLEAN,
    tentou_criar_pedido BOOLEAN,
    foi_bloqueado BOOLEAN
);
```

Útil para:
- 📊 Estatísticas de tentativas
- 🚫 Quantos foram bloqueados
- 📈 Picos de uso

---

## 🔧 TROUBLESHOOTING

### Problema: Configuração não atualiza no app

**Solução:**
1. Verificar se configuração está **ATIVA** ✅
2. Aguardar até 5 minutos (cache)
3. Pull to refresh no app
4. Verificar logs: `console.log` no app

### Problema: Múltiplas configurações ativas

**Solução:**
```sql
-- Desativar todas menos uma
UPDATE configuracoes_periodo_pedidos 
SET ativo = false 
WHERE id != 'ID_DA_CONFIG_DESEJADA';
```

### Problema: App não respeita período

**Solução:**
1. Verificar configuração no Supabase
2. Verificar tabela existe
3. Verificar permissions (RLS)
4. Limpar cache do app

---

## 📱 ADICIONAR NO MENU DO PAINEL WEB

Editar arquivo de navegação:

```tsx
// src/components/Sidebar.tsx ou similar
{
  title: 'Configurações',
  items: [
    {
      title: 'Período de Pedidos',
      href: '/dashboard/configuracoes-periodo',
      icon: Calendar,
    }
  ]
}
```

---

## 🎉 BENEFÍCIOS

### Para a Empresa:
- ✅ Controle total sobre quando pedidos são permitidos
- ✅ Flexibilidade para mudar regras rapidamente
- ✅ Reduz pedidos fora de hora
- ✅ Facilita gestão de estoque

### Para o Admin:
- ✅ Interface amigável
- ✅ Sem código/programação
- ✅ Mudanças em tempo real
- ✅ Histórico de configurações

### Para os Supervisores:
- ✅ Clareza sobre quando podem fazer pedidos
- ✅ Avisos antecipados
- ✅ Mensagens personalizadas
- ✅ Sem surpresas

---

## 🚀 PRÓXIMAS MELHORIAS (Futuro)

1. **Múltiplos Períodos:**
   - Configurar vários períodos diferentes
   - Ex: Período manhã + período tarde

2. **Exceções por Supervisor:**
   - Alguns supervisores têm regras especiais
   - Ex: Gerentes podem sempre fazer pedidos

3. **Datas Específicas de Exceção:**
   - Bloquear feriados específicos
   - Ex: 25/12 sempre bloqueado

4. **Notificações Push:**
   - Avisar supervisores quando período abrir
   - Lembrete quando estiver acabando

5. **Relatórios:**
   - Dashboard de tentativas de pedido
   - Gráficos de uso por período

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Executar SQL no Supabase
- [ ] Verificar API funcionando
- [ ] Adicionar link no menu do painel
- [ ] Testar criação de configuração
- [ ] Testar no app mobile (Expo Go)
- [ ] Testar bloqueio fora do período
- [ ] Testar diferentes horários
- [ ] Testar dias da semana
- [ ] Gerar APK e testar
- [ ] Treinar usuários logística
- [ ] Documentar para equipe

---

## 📞 SUPORTE

**Dúvidas sobre o sistema:**
- Documentação: Este arquivo
- Código: Ver comentários nos arquivos
- Testes: Use Expo Go para testar

---

**Criado em:** 26/12/2025  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para Uso


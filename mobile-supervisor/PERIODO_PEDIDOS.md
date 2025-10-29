# 📅 CONTROLE DE PERÍODO DE PEDIDOS

## 🎯 **REGRA PRINCIPAL**

**Supervisores só podem fazer pedidos entre os dias 15 e 23 de cada mês.**

- ✅ **Dia 15 a 23:** Período ABERTO
- ❌ **Dia 1 a 14:** Período FECHADO
- ❌ **Dia 24 a 31:** Período FECHADO

---

## 🔔 **NOTIFICAÇÕES AUTOMÁTICAS**

O app envia notificações automaticamente nos seguintes casos:

### **1. Dia 15 (Início do Período)**
```
🎉 Período de Pedidos Aberto!
O período de pedidos está aberto até o dia 23.
Faça seus pedidos agora!
```

### **2. Dia 21 (2 dias antes do fim)**
```
⚠️ Período de Pedidos Encerrando!
Restam apenas 2 dias para fazer seus pedidos.
Não perca o prazo!
```

### **3. Dia 22 (1 dia antes do fim)**
```
⚠️ Período de Pedidos Encerrando!
Restam apenas 1 dia para fazer seus pedidos.
Não perca o prazo!
```

### **4. Dia 23 (Último dia)**
```
🚨 ÚLTIMO DIA para Pedidos!
Hoje é o último dia do período de pedidos.
Faça seus pedidos até o final do dia!
```

---

## 📱 **INTERFACE NO APP**

### **Banner Visual**

O app mostra um banner colorido no topo da tela de pedidos:

#### **✅ Período Aberto (com folga)**
```
┌─────────────────────────────────────────┐
│ ✓  ✅ Período aberto. Você tem até o   │
│    dia 23 para fazer pedidos (5 dias    │
│    restantes)                            │
│    Período: dia 15 a 23 de cada mês     │
└─────────────────────────────────────────┘
Cor: Verde
```

#### **⚠️ Período Aberto (alerta - faltam 2 dias ou menos)**
```
┌─────────────────────────────────────────┐
│ ⏰  ⚠️ ATENÇÃO: Restam apenas 2 dias    │
│    para fazer pedidos!                   │
│    Período: dia 15 a 23 de cada mês     │
└─────────────────────────────────────────┘
Cor: Amarelo
```

#### **❌ Período Fechado (antes do dia 15)**
```
┌─────────────────────────────────────────┐
│ 🔒  ⏳ Período de pedidos abre em 3     │
│    dias (dia 15)                         │
└─────────────────────────────────────────┘
Cor: Vermelho
```

#### **❌ Período Fechado (depois do dia 23)**
```
┌─────────────────────────────────────────┐
│ 🔒  🔒 Período de pedidos encerrado.    │
│    Próximo período: dia 15 do próximo   │
│    mês                                   │
└─────────────────────────────────────────┘
Cor: Vermelho
```

---

## 🚫 **BLOQUEIO DE CRIAÇÃO**

Se o supervisor tentar criar um pedido fora do período:

```
❌ ERRO

🔒 Período de pedidos encerrado.
Próximo período: dia 15 do próximo mês

[OK]
```

O pedido **NÃO SERÁ CRIADO**.

---

## 📊 **AUDITORIA E RELATÓRIOS**

### **Tabela de Log**

Todas as tentativas de criar pedidos são registradas na tabela `log_periodo_pedidos`:

```sql
SELECT * FROM public.log_periodo_pedidos;
```

**Colunas:**
- `supervisor_id`: Quem tentou
- `data_verificacao`: Quando tentou
- `dia_verificacao`: Que dia do mês era
- `dentro_periodo`: Se estava dentro do período (true/false)
- `tentou_criar_pedido`: Se tentou criar pedido (true/false)
- `foi_bloqueado`: Se foi bloqueado (true/false)

### **Relatório Mensal**

```sql
-- Relatório do mês atual
SELECT * FROM public.relatorio_periodo_pedidos();

-- Relatório de outubro/2024
SELECT * FROM public.relatorio_periodo_pedidos(10, 2024);
```

**Retorna:**
- `supervisor_id`: ID do supervisor
- `supervisor_nome`: Nome do supervisor
- `total_verificacoes`: Quantas vezes acessou
- `tentativas_pedido`: Quantas vezes tentou criar pedido
- `tentativas_bloqueadas`: Quantas vezes foi bloqueado
- `ultimo_acesso`: Última vez que tentou

---

## ⚙️ **CONFIGURAÇÃO TÉCNICA**

### **Arquivo: `periodo-pedidos-service.ts`**

```typescript
export const PERIODO_CONFIG = {
  DIA_INICIO: 15,      // Dia de abertura
  DIA_FIM: 23,         // Dia de fechamento
  DIAS_ALERTA: 2,      // Avisar X dias antes do fim
}
```

**Para mudar o período:**
1. Edite os valores acima
2. Reinicie o app

### **Funções Principais**

```typescript
// Verificar se está no período
verificarPeriodoPedidos(): StatusPeriodo

// Validar ou retornar erro
validarPeriodoOuErro(): { ok: boolean; erro?: string }

// Configurar notificações
configurarNotificacoes(): Promise<boolean>

// Verificar e enviar notificação automática
verificarEEnviarNotificacao(): Promise<void>

// Registrar log para auditoria
registrarVerificacaoPeriodo(
  supervisorId: string,
  tentouCriarPedido: boolean,
  foiBloqueado: boolean
): Promise<void>
```

---

## 🧪 **TESTANDO**

### **Teste 1: Verificar Período Atual**

```typescript
import { verificarPeriodoPedidos } from './periodo-pedidos-service'

const status = verificarPeriodoPedidos()
console.log(status)
```

**Resultado:**
```json
{
  "dentrooPeriodo": true,
  "diaAtual": 18,
  "mesAtual": 10,
  "anoAtual": 2024,
  "diasRestantes": 5,
  "mensagem": "✅ Período aberto. Você tem até o dia 23 para fazer pedidos (5 dias restantes)",
  "alertaProximo": false
}
```

### **Teste 2: Tentar Criar Pedido Fora do Período**

1. Mude a data do sistema para um dia fora do período (ex: dia 10)
2. Tente criar um pedido no app
3. Deve aparecer erro de bloqueio

### **Teste 3: Simular Notificação**

1. Mude a data do sistema para dia 21, 22 ou 23
2. Abra o app
3. Deve receber notificação de alerta

---

## 🗂️ **ARQUIVOS CRIADOS**

```
mobile-supervisor/
├── services/
│   └── periodo-pedidos-service.ts    ← Lógica principal
└── app/(tabs)/
    └── pedidos.tsx                   ← UI atualizada

scripts/
├── setup-periodo-pedidos.sql         ← SQL da tabela de log
└── apply_periodo_pedidos.js          ← Script para aplicar SQL
```

---

## 🚀 **SETUP INICIAL**

### **1. Aplicar SQL no Supabase**

```bash
cd scripts
node apply_periodo_pedidos.js "postgresql://postgres:senha@db.projeto.supabase.co:5432/postgres"
```

### **2. Reiniciar o App Mobile**

```bash
cd mobile-supervisor
npx expo start -c
```

### **3. Testar Notificações**

1. Abra o app
2. Vá para Configurações do sistema
3. Permita notificações do Pegasus Supervisor
4. O app verificará automaticamente o período

---

## 📈 **FLUXO COMPLETO**

```
1. Supervisor abre o app
   ↓
2. App verifica período (verificarPeriodoPedidos)
   ↓
3. App mostra banner visual
   ├─ Verde: Período aberto com folga
   ├─ Amarelo: Período aberto mas acabando
   └─ Vermelho: Período fechado
   ↓
4. App verifica se deve notificar
   ├─ Dia 15: "Período aberto!"
   ├─ Dia 21-22: "Restam X dias!"
   └─ Dia 23: "Último dia!"
   ↓
5. Supervisor tenta criar pedido
   ├─ Dentro do período: ✅ Cria pedido
   └─ Fora do período: ❌ Bloqueia e mostra erro
   ↓
6. Ação é registrada no log (auditoria)
```

---

## ❓ **FAQ**

### **P: Como mudar o período de 15-23 para outro?**
R: Edite `PERIODO_CONFIG` em `periodo-pedidos-service.ts`

### **P: Como desativar as notificações?**
R: Remova a chamada `verificarEEnviarNotificacao()` em `pedidos.tsx`

### **P: O bloqueio funciona no backend também?**
R: Sim! A validação é feita em `criarPedido()` antes de inserir no banco.

### **P: Supervisores podem ver tentativas bloqueadas?**
R: Sim, no relatório de auditoria (se tiver acesso admin).

### **P: E se o supervisor forçar a criação direto no banco?**
R: O RLS do Supabase e o trigger SQL impedem isso.

---

## ✅ **CHECKLIST DE IMPLEMENTAÇÃO**

- [x] Serviço de período criado
- [x] Validação em `criarPedido()`
- [x] Banner visual no app
- [x] Notificações automáticas
- [x] Tabela de log (auditoria)
- [x] Função de relatório
- [x] RLS configurado
- [x] Documentação completa

---

## 🎉 **PRONTO!**

O sistema de controle de período está 100% funcional e profissional.

**Supervisor não pode mais fazer pedidos fora do período especificado!** 🔒✅


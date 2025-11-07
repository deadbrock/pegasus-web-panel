# 🧪 COMO TESTAR O MÓDULO DE AUDITORIA

## ✅ PASSO 1: Verificar Instalação

Execute o script `scripts/verificar-auditoria.sql` no Supabase SQL Editor.

**Resultado esperado:**
- ✅ 2 tabelas criadas (auditoria_logs, auditoria_tasks)
- ✅ 10 colunas em auditoria_logs
- ✅ 12 colunas em auditoria_tasks
- ✅ 8 índices criados
- ✅ 6 políticas RLS ativas
- ✅ RLS habilitado em ambas tabelas
- ✅ 1 log de teste criado

## ✅ PASSO 2: Acessar o Módulo

1. Acesse o painel web: `https://seu-dominio/dashboard/auditoria`
2. Faça login se necessário

**O que você deve ver:**

### 📊 KPI Cards (inicialmente zerados ou com 1 log de teste):
- **Total de Logs:** 1 (do log de teste)
- **Sucesso:** 1 (100%)
- **Falhas:** 0 (0%)
- **Módulos Ativos:** 1

### 📝 Lista de Logs:
Se executou o script de verificação, deve ver:
- 1 log com badge "SYSTEM_CHECK"
- Módulo: "Auditoria"
- Status: ✅ Sucesso
- Usuário: sistema@pegasus.com
- Data/hora da execução

## ✅ PASSO 3: Testar Busca

1. Digite "sistema" na barra de busca
2. O log de teste deve aparecer

3. Digite "auditoria" na barra de busca
4. O log de teste deve aparecer

5. Digite "xyz" (algo que não existe)
6. Deve mostrar "Nenhum log encontrado"

## ✅ PASSO 4: Criar Nova Auditoria

1. Clique no botão **"Nova Auditoria"**
2. Preencha o formulário:

   **Informações Básicas:**
   - Título: "Teste de Auditoria"
   - Tipo: Financeiro
   - Data Início: Hoje
   - Data Fim: Daqui a 30 dias
   - Prioridade: Alta

   **Escopo:**
   - Selecione alguns módulos (ex: Financeiro, Pedidos, Motoristas)
   - Descrição: "Auditoria de teste do sistema"

   **Configurações:**
   - Auditoria Automática: ✅ Ativado
   - Notificação por Email: ✅ Ativado

3. Clique em **"Criar Auditoria"**

**Resultado esperado:**
- ✅ Toast de sucesso: "Auditoria criada!"
- ✅ Dialog fecha automaticamente
- ✅ (Futuramente) A tarefa aparecerá na lista de auditorias

## ✅ PASSO 5: Testar Realtime

### Método 1: Via SQL Editor

1. Deixe a página de auditoria aberta
2. No Supabase SQL Editor, execute:

```sql
INSERT INTO auditoria_logs (
  timestamp,
  usuario,
  acao,
  modulo,
  descricao,
  ip,
  status
) VALUES (
  NOW(),
  'teste@pegasus.com',
  'CREATE',
  'Pedidos',
  'Criou novo pedido #12345',
  '192.168.1.100',
  'sucesso'
);
```

3. **Volte para a página de auditoria**
4. O novo log deve aparecer **automaticamente** (sem refresh)
5. O contador de "Total de Logs" deve aumentar

### Método 2: Via Console do Navegador

1. Abra o Console do navegador (F12)
2. Execute este código:

```javascript
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'SUA_URL_DO_SUPABASE',
  'SUA_KEY_DO_SUPABASE'
)

await supabase.from('auditoria_logs').insert({
  timestamp: new Date().toISOString(),
  usuario: 'console@teste.com',
  acao: 'UPDATE',
  modulo: 'Veículos',
  descricao: 'Atualizou veículo ABC-1234',
  ip: '127.0.0.1',
  status: 'sucesso'
})
```

3. O log deve aparecer automaticamente na página

## ✅ PASSO 6: Testar Estados Vazios

1. No SQL Editor, delete todos os logs:

```sql
DELETE FROM auditoria_logs;
```

2. A página deve mostrar:
   - 📂 Ícone de pasta vazia
   - Mensagem: "Nenhum log encontrado"
   - Texto: "Os logs de auditoria aparecerão aqui conforme as atividades ocorrem"

3. Os KPIs devem mostrar todos zerados

## ✅ PASSO 7: Testar Filtros (Opcional - Requer Múltiplos Logs)

Crie vários logs diferentes:

```sql
-- Log de sucesso
INSERT INTO auditoria_logs (timestamp, usuario, acao, modulo, descricao, ip, status)
VALUES (NOW(), 'admin@pegasus.com', 'CREATE', 'Motoristas', 'Criou motorista', '192.168.1.1', 'sucesso');

-- Log de falha
INSERT INTO auditoria_logs (timestamp, usuario, acao, modulo, descricao, ip, status)
VALUES (NOW(), 'admin@pegasus.com', 'DELETE', 'Veículos', 'Tentou deletar veículo', '192.168.1.1', 'falha');

-- Log de outro usuário
INSERT INTO auditoria_logs (timestamp, usuario, acao, modulo, descricao, ip, status)
VALUES (NOW(), 'operador@pegasus.com', 'UPDATE', 'Pedidos', 'Atualizou pedido', '192.168.1.2', 'sucesso');
```

Agora teste a busca:
- Digite "admin" → Deve mostrar 2 logs
- Digite "Motoristas" → Deve mostrar 1 log
- Digite "falha" → Deve mostrar 1 log

## 🎨 PASSO 8: Verificar Visual

Verifique se os badges estão com as cores corretas:

**Ações:**
- CREATE → 🔵 Azul
- UPDATE → 🟡 Amarelo
- DELETE → 🔴 Vermelho
- READ → 🟢 Verde
- LOGIN → 🟣 Roxo
- IMPORT → 🔷 Índigo
- EXPORT → 🟩 Esmeralda

**Status:**
- Sucesso → ✅ Verde com "Sucesso"
- Falha → ❌ Vermelho com "Falha"

## 📱 PASSO 9: Testar Responsividade

1. Redimensione a janela do navegador
2. Teste em modo mobile (F12 → Toggle device toolbar)
3. Verifique se:
   - KPI cards se adaptam (1 coluna em mobile, 4 em desktop)
   - Lista de logs fica legível
   - Botões ficam acessíveis
   - Dialog de nova auditoria rola corretamente

## 🔍 PASSO 10: Verificar Console

1. Abra o Console do navegador (F12)
2. Verifique se há:
   - ✅ Log: `[Auditoria] Novo log detectado, recarregando...` (quando inserir novo log)
   - ❌ NENHUM erro vermelho
   - ❌ NENHUM warning crítico

## ✅ CHECKLIST FINAL

- [ ] Script SQL executado com sucesso
- [ ] Página de auditoria carrega sem erros
- [ ] KPI cards mostram dados corretos
- [ ] Lista de logs exibe registros
- [ ] Busca funciona corretamente
- [ ] Dialog de nova auditoria abre e fecha
- [ ] Possível criar nova tarefa de auditoria
- [ ] Realtime funciona (novos logs aparecem automaticamente)
- [ ] Estado vazio funciona (mensagem quando não há logs)
- [ ] Badges com cores corretas
- [ ] Responsivo em mobile
- [ ] Sem erros no console

## 🐛 SE ALGO NÃO FUNCIONAR

### Erro: "Failed to load"
**Causa:** Tabelas não foram criadas
**Solução:** Execute novamente `scripts/criar-tabelas-auditoria.sql`

### Erro: "Permission denied"
**Causa:** RLS bloqueando acesso
**Solução:** Verifique se está autenticado no sistema

### Logs não aparecem automaticamente
**Causa:** Realtime não configurado
**Solução:** Execute esta query no SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.auditoria_logs;
```

### KPIs mostram valores errados
**Causa:** Dados inconsistentes
**Solução:** Execute `scripts/verificar-auditoria.sql` e verifique contagem

## 📞 LOGS ÚTEIS

Se precisar debugar, adicione este código no Console:

```javascript
// Ver todos os logs do Supabase
localStorage.setItem('supabase.debug', 'true')

// Recarregar página
location.reload()
```

## ✅ PRÓXIMO PASSO

Se todos os testes passarem, o módulo está **100% funcional**! 🎉

Para popular automaticamente os logs, você precisará integrar `createAuditoriaLog()` nas ações do sistema (criar pedido, atualizar motorista, etc).

Exemplo de integração:

```typescript
import { createAuditoriaLog } from '@/lib/services/auditoria-service'

// Ao criar um pedido:
await createAuditoriaLog({
  timestamp: new Date().toISOString(),
  usuario: session.user.email,
  acao: 'CREATE',
  modulo: 'Pedidos',
  descricao: `Criou pedido #${pedido.numero}`,
  ip: req.ip || 'unknown',
  status: 'sucesso',
  detalhes: { pedido_id: pedido.id, valor: pedido.valor }
})
```


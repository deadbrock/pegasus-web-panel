# ✅ TESTE DE INTEGRAÇÃO COMPLETO - PAINEL ↔ APP MOBILE

## 🎯 OBJETIVO

Verificar que as configurações de período definidas no **painel web** são **sincronizadas automaticamente** com o **app mobile dos supervisores**.

---

## 📋 PRÉ-REQUISITOS

### ✅ Checklist Inicial:

- [ ] SQL executado no Supabase (`configuracoes-periodo-pedidos.sql`)
- [ ] Painel web deploy concluído no Vercel
- [ ] App mobile com código atualizado (commit e19b34a)
- [ ] App mobile rodando no celular/emulador

---

## 🧪 TESTE 1: VERIFICAR TABELA NO SUPABASE

### Passo 1.1: Verificar se tabela existe

**No Supabase SQL Editor:**

```sql
-- Deve retornar 1 linha
SELECT COUNT(*) as existe 
FROM information_schema.tables 
WHERE table_name = 'configuracoes_periodo_pedidos';
```

**Resultado esperado:** `existe = 1`

---

### Passo 1.2: Ver configuração ativa

```sql
SELECT 
  id,
  nome,
  ativo,
  dia_inicio,
  dia_fim,
  dias_semana_permitidos,
  horario_inicio,
  horario_fim,
  limite_pedidos_mes,
  mensagem_bloqueio,
  created_at
FROM configuracoes_periodo_pedidos
WHERE ativo = true;
```

**Resultado esperado:**
- **1 linha** com `ativo = true`
- **Valores configurados** aparecem corretamente

**Se retornar 0 linhas:**
- ❌ Nenhuma configuração ativa
- ➡️ Criar uma no painel web

---

## 🧪 TESTE 2: CRIAR CONFIGURAÇÃO NO PAINEL WEB

### Passo 2.1: Acessar módulo

1. Login no painel como `logistica`
2. Menu lateral > **ADMINISTRAÇÃO**
3. Clicar em **"Período de Pedidos"**

---

### Passo 2.2: Criar configuração de teste

**Preencher formulário:**

```
Nome: "Teste de Integração"
Ativo: ✅ (marcado)

PERÍODO DO MÊS:
  Dia início: 1
  Dia fim: 31

DIAS DA SEMANA:
  ☑️ Segunda
  ☑️ Terça  
  ☑️ Quarta
  ☑️ Quinta
  ☑️ Sexta
  ☑️ Sábado
  ☐ Domingo

HORÁRIO:
  Início: 00:00
  Fim: 23:59

LIMITE DE PEDIDOS:
  Máximo por mês: 0 (ilimitado)
  Requer autorização: A partir do 2º pedido

MENSAGEM DE BLOQUEIO:
  "Período de pedidos encerrado. Aguarde o próximo período."
```

Clicar em **"Salvar Configuração"**

---

### Passo 2.3: Confirmar salvamento

**Ver mensagem:** `✅ Configuração salva com sucesso!`

**No Supabase, verificar:**

```sql
SELECT * FROM configuracoes_periodo_pedidos 
WHERE nome = 'Teste de Integração';
```

**Deve aparecer:** 1 linha com os dados configurados

---

## 🧪 TESTE 3: VERIFICAR NO APP MOBILE

### Passo 3.1: Recarregar app

**Se usando Expo Go:**
```bash
# Limpar cache
cd mobile-supervisor
npx expo start --clear
```

**No celular:**
- Fechar app completamente
- Abrir novamente

---

### Passo 3.2: Ver banner de período

1. **Login como supervisor**
2. **Ir na aba "Pedidos"**
3. **Ver banner no topo:**

```
✅ Período aberto até dia 31 (XX dias restantes)
```

**Se aparecer:** ✅ **INTEGRAÇÃO FUNCIONANDO!**

**Se NÃO aparecer:** ❌ Ver seção de troubleshooting

---

### Passo 3.3: Ver logs no terminal

**No terminal onde roda Expo, procurar:**

```
✅ Configuração de período carregada: Teste de Integração
```

**Ou:**

```
ℹ️ Nenhuma configuração de período ativa
```

---

## 🧪 TESTE 4: TESTAR BLOQUEIO

### Passo 4.1: Configurar período passado

**No painel web:**

Editar a configuração "Teste de Integração":
- **Dia fim:** (dia de ontem)
- Exemplo: Se hoje é dia 26, colocar **25**
- Salvar

---

### Passo 4.2: Atualizar app mobile

**No app:**
- Na tela de Pedidos
- **Puxar para baixo** (Pull to Refresh)

---

### Passo 4.3: Ver bloqueio

**Banner deve mudar para:**

```
🔒 Período de pedidos encerrado. Aguarde o próximo período.
```

**Tentar criar pedido:**
- Clicar no botão **"+"**
- Deve mostrar mensagem de bloqueio

**Se funcionar:** ✅ **BLOQUEIO FUNCIONANDO!**

---

## 🧪 TESTE 5: TESTAR MÚLTIPLAS CONFIGURAÇÕES

### Passo 5.1: Desativar configuração anterior

**No painel web:**
- Desmarcar checkbox **"Ativa"** da configuração "Teste de Integração"
- Salvar

---

### Passo 5.2: Criar nova configuração

```
Nome: "Período Limitado"
Ativo: ✅

Dia início: 10
Dia fim: 15
Horário: 08:00 - 18:00
Mensagem: "Pedidos permitidos apenas entre dia 10 e 15"
```

Salvar

---

### Passo 5.3: Verificar no Supabase

```sql
-- Deve ter 1 configuração ativa
SELECT COUNT(*) as ativas 
FROM configuracoes_periodo_pedidos 
WHERE ativo = true;
```

**Resultado esperado:** `ativas = 1` (a nova)

---

### Passo 5.4: Verificar no app

**Pull to refresh na tela de Pedidos**

**Banner deve mostrar:**
- Se hoje está entre dia 10-15: `✅ Período aberto até dia 15`
- Se hoje está fora do período: `🔒 Pedidos permitidos apenas entre dia 10 e 15`

---

## 🧪 TESTE 6: TESTAR CACHE (5 MINUTOS)

### Passo 6.1: Criar cronômetro

**Início do teste:** [Anotar horário]

---

### Passo 6.2: Mudar configuração no painel

**No painel web:**
- Mudar **Dia fim** para um valor diferente
- Salvar

---

### Passo 6.3: Verificar cache

**No app mobile:**
- **NÃO fazer** pull to refresh
- Apenas observar o banner

**Nos primeiros 5 minutos:**
- Banner mantém valor antigo (cache ativo)

**Após 5 minutos:**
- App busca automaticamente
- Banner atualiza sozinho

**Ou forçar atualização:**
- Pull to refresh
- Banner atualiza imediatamente

---

## 🧪 TESTE 7: TESTAR VALIDAÇÃO HORÁRIO

### Passo 7.1: Configurar horário restrito

**No painel web:**

```
Nome: "Horário Comercial"
Ativo: ✅
Dia início: 1
Dia fim: 31
Horário início: 08:00
Horário fim: 18:00
```

Salvar

---

### Passo 7.2: Testar fora do horário

**Se agora for antes das 08:00 ou depois das 18:00:**

**No app:**
- Pull to refresh
- Banner deve mostrar: `🕐 Pedidos permitidos entre 08:00 e 18:00`
- Botão de criar pedido deve estar bloqueado

---

### Passo 7.3: Testar dentro do horário

**Entre 08:00 e 18:00:**

**No app:**
- Pull to refresh  
- Banner deve mostrar: `✅ Período aberto até dia 31`
- Botão de criar pedido habilitado

---

## 🧪 TESTE 8: TESTAR DIAS DA SEMANA

### Passo 8.1: Permitir apenas dias úteis

**No painel web:**

```
Nome: "Apenas Dias Úteis"
Ativo: ✅
Dias permitidos: ☑️ Seg, Ter, Qua, Qui, Sex
                 ☐ Sáb, Dom
```

Salvar

---

### Passo 8.2: Testar no fim de semana

**Se hoje for sábado ou domingo:**

**No app:**
- Pull to refresh
- Banner: `🚫 Pedidos não permitidos aos [Sábados/Domingos]`
- Criar pedido bloqueado

---

### Passo 8.3: Testar em dia útil

**Se hoje for segunda a sexta:**

**No app:**
- Banner: `✅ Período aberto até dia 31`
- Criar pedido permitido

---

## ✅ RESULTADO FINAL

### Todos os testes passaram?

- [ ] Teste 1: Tabela existe no Supabase
- [ ] Teste 2: Configuração salva no painel
- [ ] Teste 3: Banner aparece no app
- [ ] Teste 4: Bloqueio funciona
- [ ] Teste 5: Múltiplas configurações funcionam
- [ ] Teste 6: Cache de 5 minutos funciona
- [ ] Teste 7: Validação de horário funciona
- [ ] Teste 8: Validação de dia da semana funciona

---

## 🐛 TROUBLESHOOTING

### ❌ Banner não aparece no app

**Possíveis causas:**

1. **SQL não foi executado**
   - ➡️ Executar `configuracoes-periodo-pedidos.sql` no Supabase

2. **Nenhuma configuração ativa**
   - ➡️ Verificar no Supabase: `WHERE ativo = true`
   - ➡️ Marcar uma configuração como ativa no painel

3. **App não atualizado**
   - ➡️ `npx expo start --clear`
   - ➡️ Fechar e reabrir app

4. **Cache de 5 minutos**
   - ➡️ Aguardar 5 min ou fazer pull to refresh

---

### ❌ Banner mostra valores errados

**Verificar:**

```sql
-- Ver qual configuração está ativa
SELECT * FROM configuracoes_periodo_pedidos WHERE ativo = true;
```

**Garantir que:**
- Apenas **1 configuração** está ativa
- Valores estão corretos
- Pull to refresh no app

---

### ❌ Mudanças no painel não aparecem no app

**Verificar:**

1. **Configuração marcada como ativa?**
   ```sql
   SELECT ativo FROM configuracoes_periodo_pedidos WHERE nome = 'Sua Config';
   ```

2. **Cache de 5 minutos?**
   - Aguardar ou forçar refresh

3. **App conectado ao mesmo Supabase?**
   - Verificar `.env` do mobile:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   ```
   - Deve ser o MESMO do painel web

---

### ❌ Erro "PGRST116" nos logs

**Significa:** Nenhuma configuração encontrada

**Solução:**
1. Criar configuração no painel web
2. Marcar como **"Ativa" ✅**
3. Salvar
4. Refresh no app

---

## 📞 QUERIES DE DEBUG

### Ver todas as configurações:

```sql
SELECT id, nome, ativo, dia_inicio, dia_fim, created_at
FROM configuracoes_periodo_pedidos
ORDER BY created_at DESC;
```

---

### Ver apenas configuração ativa:

```sql
SELECT * FROM configuracoes_periodo_pedidos 
WHERE ativo = true;
```

---

### Desativar todas:

```sql
UPDATE configuracoes_periodo_pedidos 
SET ativo = false;
```

---

### Ativar uma específica:

```sql
UPDATE configuracoes_periodo_pedidos 
SET ativo = true 
WHERE nome = 'Nome da Configuração';
```

---

### Ver histórico de logs (se implementado):

```sql
SELECT * FROM log_periodo_pedidos 
ORDER BY data_verificacao DESC 
LIMIT 20;
```

---

## 🎉 SUCESSO!

Se todos os testes passaram, a integração está funcionando perfeitamente:

✅ **Painel Web configura** ➡️ **App Mobile sincroniza**  
✅ **Bloqueios automáticos** funcionam  
✅ **Cache otimizado** (5 minutos)  
✅ **Pull to refresh** atualiza imediatamente  
✅ **Múltiplas validações** (dia, hora, semana)

---

**Criado em:** 26/12/2025  
**Última atualização:** 26/12/2025  
**Status:** Documentação de teste completa


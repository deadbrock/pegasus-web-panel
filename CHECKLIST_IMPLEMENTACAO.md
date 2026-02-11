# ✅ CHECKLIST DE IMPLEMENTAÇÃO
## Sistema de Contratos com Supervisores

---

## 📋 PRÉ-REQUISITOS

- [ ] Acesso ao banco de dados (Supabase Dashboard ou psql)
- [ ] Painel web funcionando (Next.js)
- [ ] App mobile funcionando (React Native/Expo)
- [ ] Backup do banco de dados feito

---

## 🗄️ FASE 1: BANCO DE DADOS

### **1.1 Executar Migração**
- [ ] Abrir arquivo `database/contratos-supervisores-atribuicao.sql`
- [ ] Copiar todo o conteúdo
- [ ] Acessar Supabase SQL Editor
- [ ] Colar e executar o script
- [ ] Aguardar mensagem de sucesso

### **1.2 Verificar Migração**
- [ ] Executar script `scripts/verificar-implementacao.sql`
- [ ] Verificar que todas as linhas mostram ✅
- [ ] Confirmar que não há erros ❌

**Checklist de Verificação:**
- [ ] Coluna `valor_mensal_material` existe em `contratos`
- [ ] Tabela `contratos_supervisores_atribuicao` existe
- [ ] Função `get_contratos_supervisor` existe
- [ ] View `contratos_com_supervisores` existe

---

## 🌐 FASE 2: PAINEL WEB

### **2.1 Atualizar Dependências**
```bash
cd pegasus-web-panel
npm install
```
- [ ] Comando executado sem erros

### **2.2 Iniciar Servidor de Desenvolvimento**
```bash
npm run dev
```
- [ ] Servidor iniciou na porta 3000
- [ ] Sem erros no console

### **2.3 Testar Interface**
- [ ] Acessar: http://localhost:3000/dashboard/contratos
- [ ] Clicar em "Novo Contrato"
- [ ] Verificar que o formulário abre
- [ ] Verificar campo "💰 Teto Mensal de Material" está visível
- [ ] Verificar seção "Supervisores Responsáveis" está visível
- [ ] Verificar lista de supervisores carrega

---

## 📱 FASE 3: APLICATIVO MOBILE

### **3.1 Configurar Variáveis de Ambiente**

**Criar arquivo `.env`:**
```bash
cd mobile-supervisor
cp .env.example .env
```
- [ ] Arquivo `.env` criado

**Editar `.env`:**
- [ ] Definir `EXPO_PUBLIC_API_URL` com o IP correto
  - Para Android Emulator: `http://10.0.2.2:3000`
  - Para iOS Simulator: `http://localhost:3000`
  - Para dispositivo físico: `http://SEU_IP_LOCAL:3000`
- [ ] Definir variáveis do Supabase (se necessário)

### **3.2 Instalar Dependências**
```bash
cd mobile-supervisor
npm install
```
- [ ] Dependências instaladas sem erros

### **3.3 Iniciar Expo**
```bash
npx expo start
```
- [ ] Expo iniciou sem erros
- [ ] QR Code apareceu
- [ ] Sem mensagens de erro no console

### **3.4 Abrir no Dispositivo**
- [ ] App abriu no dispositivo/emulador
- [ ] Fazer login como supervisor
- [ ] App carregou sem crashes

---

## 🧪 FASE 4: TESTES FUNCIONAIS

### **4.1 Teste: Criar Contrato com Supervisores**

**No Painel Web:**
1. [ ] Ir em `/dashboard/contratos`
2. [ ] Clicar em "Novo Contrato"
3. [ ] Preencher campos obrigatórios:
   - [ ] Número do contrato: `TESTE-001`
   - [ ] Cliente: `Cliente Teste`
   - [ ] Data início: (hoje)
   - [ ] Data fim: (daqui 1 ano)
4. [ ] Preencher "💰 Teto Mensal de Material": `5000.00`
5. [ ] Selecionar ao menos 1 supervisor na seção "Supervisores Responsáveis"
6. [ ] Clicar em "Salvar Contrato"
7. [ ] Verificar mensagem de sucesso: "✅ Contrato criado!"
8. [ ] Verificar mensagem: "✅ Supervisores atribuídos!"

**Verificar no Banco:**
```sql
SELECT * FROM contratos WHERE numero_contrato = 'TESTE-001';
SELECT * FROM contratos_supervisores_atribuicao WHERE contrato_id = 'UUID_DO_CONTRATO_TESTE';
```
- [ ] Contrato encontrado
- [ ] Valor mensal de material = 5000.00
- [ ] Atribuição criada e ativa

### **4.2 Teste: Visualizar no Mobile**

**No App Mobile:**
1. [ ] Abrir app como o supervisor atribuído
2. [ ] Ir para aba "Contratos"
3. [ ] Verificar que existem 2 abas: "📋 Atribuídos" e "📝 Meus Cadastros"
4. [ ] Selecionar aba "📋 Atribuídos"
5. [ ] Fazer pull-to-refresh (arrastar para baixo)
6. [ ] Verificar que o contrato "TESTE-001" aparece
7. [ ] Verificar que mostra "💰 Teto Mensal: R$ 5.000,00"
8. [ ] Verificar badge "📌 Gerenciado pela logística"

**Se não aparecer:**
- [ ] Verificar console do mobile (Expo DevTools)
- [ ] Verificar se `EXPO_PUBLIC_API_URL` está correto
- [ ] Testar URL da API no navegador
- [ ] Verificar logs do servidor Next.js

### **4.3 Teste: Criar Pedido com Contrato**

**No App Mobile:**
1. [ ] Ir para "Novo Pedido"
2. [ ] Selecionar contrato "TESTE-001" na lista
3. [ ] Adicionar alguns produtos
4. [ ] Finalizar pedido
5. [ ] Verificar que pedido foi criado com sucesso

**Verificar no Banco:**
```sql
SELECT * FROM pedidos_supervisores 
WHERE contrato_id = 'UUID_DO_CONTRATO_TESTE';
```
- [ ] Pedido encontrado
- [ ] Campo `contrato_id` está preenchido

### **4.4 Teste: Período de Pedidos**

**No Painel Web:**
1. [ ] Ir em `/dashboard/configuracoes-periodo`
2. [ ] Configurar período (ex: dia 15 a 23)
3. [ ] Ativar configuração
4. [ ] Salvar

**No App Mobile:**
1. [ ] Fechar e reabrir o app
2. [ ] Verificar se banner de período aparece
3. [ ] Verificar mensagem está correta

**Testar bloqueio (se estiver fora do período):**
- [ ] Tentar criar pedido
- [ ] Verificar mensagem de bloqueio

### **4.5 Teste: Editar Contrato**

**No Painel Web:**
1. [ ] Ir em contratos
2. [ ] Clicar em "Editar" no contrato TESTE-001
3. [ ] Alterar teto mensal para `7500.00`
4. [ ] Adicionar mais um supervisor
5. [ ] Salvar

**No App Mobile:**
1. [ ] Fazer pull-to-refresh em "Contratos"
2. [ ] Verificar que teto atualizado aparece: "R$ 7.500,00"

**No outro supervisor:**
1. [ ] Fazer login com o novo supervisor
2. [ ] Ir em Contratos → Atribuídos
3. [ ] Verificar que contrato TESTE-001 aparece

### **4.6 Teste: Remover Supervisor**

**No Painel Web:**
1. [ ] Editar contrato TESTE-001
2. [ ] Remover um dos supervisores (clicar no X)
3. [ ] Salvar

**No App Mobile (supervisor removido):**
1. [ ] Fazer pull-to-refresh
2. [ ] Verificar que contrato TESTE-001 não aparece mais

---

## 🔍 FASE 5: VERIFICAÇÕES FINAIS

### **5.1 Verificar Logs**
- [ ] Console do Next.js não mostra erros críticos
- [ ] Console do Expo não mostra erros críticos
- [ ] Logs do Supabase não mostram erros de autenticação

### **5.2 Verificar Performance**
- [ ] Lista de contratos carrega rápido (< 2s)
- [ ] Sincronização no mobile é rápida (< 3s)
- [ ] Formulário de contrato abre instantaneamente

### **5.3 Verificar Dados**

**Executar queries de verificação:**
```sql
-- Total de contratos ativos
SELECT COUNT(*) FROM contratos WHERE status = 'Ativo';

-- Total de atribuições ativas
SELECT COUNT(*) FROM contratos_supervisores_atribuicao WHERE ativo = true;

-- Supervisores com contratos
SELECT COUNT(DISTINCT supervisor_id) 
FROM contratos_supervisores_atribuicao 
WHERE ativo = true;

-- Contratos sem supervisores
SELECT COUNT(*) FROM contratos c
LEFT JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id AND a.ativo = true
WHERE c.status = 'Ativo' AND a.id IS NULL;
```

- [ ] Números fazem sentido
- [ ] Não há contratos órfãos (sem supervisores) se todos foram atribuídos

---

## 🗑️ FASE 6: LIMPEZA (OPCIONAL)

### **6.1 Remover Dados de Teste**
```sql
-- CUIDADO: Isso deleta permanentemente!
DELETE FROM contratos WHERE numero_contrato = 'TESTE-001';
```
- [ ] Dados de teste removidos (se desejado)

---

## 📚 FASE 7: DOCUMENTAÇÃO E TREINAMENTO

### **7.1 Documentação**
- [ ] Ler `IMPLEMENTACAO_CONTRATOS_SUPERVISORES.md`
- [ ] Ler `RESUMO_ALTERACOES.md`
- [ ] Marcar `COMANDOS_UTEIS.md` como referência

### **7.2 Treinamento - Equipe de Logística**
- [ ] Mostrar onde cadastrar contratos
- [ ] Mostrar como definir teto mensal de material
- [ ] Mostrar como atribuir supervisores
- [ ] Explicar que mudanças refletem automaticamente no mobile

### **7.3 Treinamento - Supervisores**
- [ ] Mostrar aba "Atribuídos" vs "Meus Cadastros"
- [ ] Explicar o que é "Teto Mensal de Material"
- [ ] Mostrar como fazer pull-to-refresh para sincronizar
- [ ] Explicar período de pedidos (dia 15 a 23)

---

## ✅ CONCLUSÃO

### **Todas as fases concluídas?**
- [ ] ✅ Fase 1: Banco de Dados
- [ ] ✅ Fase 2: Painel Web
- [ ] ✅ Fase 3: App Mobile
- [ ] ✅ Fase 4: Testes Funcionais
- [ ] ✅ Fase 5: Verificações Finais
- [ ] ✅ Fase 6: Limpeza (opcional)
- [ ] ✅ Fase 7: Documentação e Treinamento

### **Sistema está pronto para produção?**
- [ ] Todos os testes passaram
- [ ] Não há erros nos logs
- [ ] Equipes foram treinadas
- [ ] Backup do banco foi feito

---

## 🚀 GO LIVE!

**Data de Go Live:** _______________

**Responsável:** _______________

**Observações:**
_______________________________________________
_______________________________________________
_______________________________________________

---

## 📞 SUPORTE PÓS-IMPLEMENTAÇÃO

**Em caso de problemas:**
1. Consultar `COMANDOS_UTEIS.md`
2. Verificar logs (Next.js, Expo, Supabase)
3. Executar `scripts/verificar-implementacao.sql`
4. Consultar documentação completa

**Contatos:**
- Desenvolvimento: _______________
- Suporte Técnico: _______________

---

**✅ TUDO PRONTO!**

Parabéns! O sistema de gestão de contratos com supervisores está implementado e funcionando! 🎉

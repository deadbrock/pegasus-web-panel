# 🚀 GUIA COMPLETO DE CONFIGURAÇÃO DO SISTEMA PEGASUS

## 📋 ÍNDICE
1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
3. [Configuração das Variáveis de Ambiente](#configuração-das-variáveis-de-ambiente)
4. [Criação de Usuários](#criação-de-usuários)
5. [Verificação dos Módulos](#verificação-dos-módulos)
6. [Dados Iniciais (Seed)](#dados-iniciais-seed)
7. [Testes](#testes)

---

## ✅ PRÉ-REQUISITOS

- ✅ Conta no Vercel (deploy do frontend)
- ✅ Conta no Supabase (banco de dados)
- ✅ Node.js 18+ instalado (desenvolvimento local)
- ✅ Git configurado

---

## 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS

### PASSO 1: Acessar Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `moswhtqcgjcpsideykzw`
3. Clique em **SQL Editor** no menu lateral

### PASSO 2: Executar Script de Criação

1. Abra o arquivo `scripts/create-all-tables.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Ctrl+Enter`)
5. Aguarde a mensagem de sucesso

✅ **Tabelas criadas:**
- `veiculos` (25 campos)
- `motoristas` (12 campos)
- `pedidos` (15 campos)
- `produtos` (13 campos)
- `custos` (11 campos)
- `manutencoes` (13 campos)
- `posicoes_veiculo` (7 campos)
- `alertas_rastreamento` (7 campos)
- `contratos` (9 campos)
- `documentos` (12 campos)
- `fornecedores` (10 campos)
- `notas_fiscais` (20 campos)
- `audit_findings` (9 campos)

### PASSO 3: Verificar Tabelas Criadas

No SQL Editor, execute:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Você deve ver TODAS as 13 tabelas listadas acima.

---

## 🔐 CONFIGURAÇÃO DAS VARIÁVEIS DE AMBIENTE

### No Vercel (Produção)

1. Acesse: https://vercel.com/dashboard
2. Projeto: `pegasus-web-panel`
3. **Settings** → **Environment Variables**
4. Adicione:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
SUPABASE_SERVICE_ROLE_KEY=<sua-chave-service-role>

# Opcional: Database URL para scripts Node.js
DATABASE_URL=postgresql://...
```

5. **Redeploy** após adicionar as variáveis

### Localmente (Desenvolvimento)

Crie arquivo `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://moswhtqcgjcpsideykzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-chave-anon>
SUPABASE_SERVICE_ROLE_KEY=<sua-chave-service-role>
DATABASE_URL=postgresql://...
```

---

## 👤 CRIAÇÃO DE USUÁRIOS

### Usuário Admin (Obrigatório)

1. Supabase Dashboard → **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:

```
Email: admin@pegasus.com
Password: Admin123!
✅ Auto Confirm User (marque!)
```

4. Clique em **Edit User** (após criar)
5. Em **Raw user meta data (JSON)**, adicione:

```json
{
  "role": "admin",
  "name": "Administrador"
}
```

6. **Save**

### Usuários Adicionais (Opcional)

Crie usuários com diferentes roles:

**Diretor:**
```
Email: diretor@pegasus.com
Password: Diretor123!
Role: diretor
```

**Gestor:**
```
Email: gestor@pegasus.com
Password: Gestor123!
Role: gestor
```

**Financeiro:**
```
Email: financeiro@pegasus.com
Password: Financeiro123!
Role: financeiro
```

---

## 🔍 VERIFICAÇÃO DOS MÓDULOS

### Status Atual dos Módulos

| Módulo | Status | Tabela | Observações |
|--------|--------|--------|-------------|
| 🚗 Veículos | ✅ Pronto | `veiculos` | CRUD implementado |
| 👤 Motoristas | ✅ Pronto | `motoristas` | CRUD implementado |
| 📦 Pedidos | ✅ Pronto | `pedidos` | CRUD implementado |
| 🏪 Estoque | ✅ Pronto | `produtos` | CRUD implementado |
| 💰 Custos | ✅ Pronto | `custos` | CRUD implementado |
| 🔧 Manutenção | ✅ Pronto | `manutencoes` | CRUD implementado |
| 📍 Rastreamento | ✅ Pronto | `posicoes_veiculo`, `alertas_rastreamento` | Pronto para dados |
| 📄 Contratos | ✅ Pronto | `contratos` | CRUD implementado |
| 📑 Documentos | ✅ Pronto | `documentos` | CRUD implementado |
| 🧾 Fiscal | ✅ Pronto | `fornecedores`, `notas_fiscais` | CRUD implementado |
| 🔍 Auditoria | ✅ Pronto | `audit_findings` | CRUD implementado |
| 📊 Dashboard | ⚠️ Dados Mock | - | Precisa conectar com tabelas |
| 📈 Analytics | ⚠️ Dados Mock | - | Aguardando dados reais |

---

## 🌱 DADOS INICIAIS (SEED)

Para testar o sistema com dados reais, execute estes comandos SQL no Supabase:

### Veículos (Exemplo)

```sql
INSERT INTO public.veiculos (placa, marca, modelo, tipo, ano, status) VALUES
('ABC-1234', 'Volkswagen', 'Delivery', 'Caminhão', 2022, 'Ativo'),
('DEF-5678', 'Mercedes-Benz', 'Sprinter', 'Van', 2023, 'Ativo'),
('GHI-9012', 'Ford', 'Cargo', 'Caminhão', 2021, 'Manutenção');
```

### Motoristas (Exemplo)

```sql
INSERT INTO public.motoristas (nome, cpf, cnh, categoria_cnh, validade_cnh, status) VALUES
('João Silva', '123.456.789-00', '12345678900', 'D', '2025-12-31', 'Ativo'),
('Maria Santos', '987.654.321-00', '98765432100', 'E', '2026-06-30', 'Ativo'),
('Pedro Costa', '456.789.123-00', '45678912300', 'C', '2025-03-15', 'Ativo');
```

### Produtos (Exemplo)

```sql
INSERT INTO public.produtos (codigo, nome, categoria, unidade, quantidade, estoque_minimo, valor_unitario) VALUES
('PROD-001', 'Pneu 275/80R22.5', 'Pneus', 'UN', 50, 10, 1200.00),
('PROD-002', 'Óleo Diesel S10', 'Combustível', 'L', 5000, 1000, 5.50),
('PROD-003', 'Filtro de Óleo', 'Peças', 'UN', 100, 20, 45.00);
```

### Custos (Exemplo)

```sql
INSERT INTO public.custos (data, categoria, descricao, valor, responsavel, status) VALUES
(CURRENT_DATE, 'Combustível', 'Abastecimento Frota', 2500.00, 'Admin', 'Pago'),
(CURRENT_DATE, 'Manutenção', 'Revisão Preventiva', 850.00, 'Admin', 'Pago'),
(CURRENT_DATE, 'Pedágio', 'Viagens Interstate', 340.00, 'Admin', 'Pago');
```

---

## ✅ TESTES

### 1. Teste de Login

1. Acesse: `https://seu-app.vercel.app/login`
2. Faça login com: `admin@pegasus.com` / `Admin123!`
3. Deve redirecionar para `/dashboard`

### 2. Teste de Módulos

Acesse cada módulo e verifique:

**Veículos:** `/dashboard/veiculos`
- ✅ Lista vazia ou com dados inseridos
- ✅ Botão "Novo Veículo" funciona
- ✅ Formulário abre e salva

**Motoristas:** `/dashboard/motoristas`
- ✅ Lista vazia ou com dados inseridos
- ✅ Botão "Novo Motorista" funciona
- ✅ Formulário abre e salva

**Pedidos:** `/dashboard/pedidos`
- ✅ Lista vazia ou com dados inseridos
- ✅ Botão "Novo Pedido" funciona

**Estoque:** `/dashboard/estoque`
- ✅ Lista vazia ou com dados inseridos
- ✅ Botão "Novo Produto" funciona

### 3. Teste de Permissões

Faça login com diferentes usuários e verifique se:
- ✅ Admin vê todos os módulos
- ✅ Gestor não vê módulos financeiros
- ✅ Financeiro não vê módulos operacionais

---

## 🐛 TROUBLESHOOTING

### Erro: "relation does not exist"
**Causa:** Tabela não foi criada
**Solução:** Execute o script SQL novamente

### Erro: "permission denied"
**Causa:** RLS ativo mas sem políticas
**Solução:** Verifique se as políticas foram criadas (estão no script)

### Módulo não carrega dados
**Causa:** Service não conectado ao Supabase
**Solução:** Verifique o arquivo em `src/services/[módulo]Service.ts`

### Erro ao salvar dados
**Causa:** Campo obrigatório faltando
**Solução:** Verifique a estrutura da tabela e os campos required

---

## 📞 SUPORTE

Se encontrar problemas:

1. Verifique os logs do Vercel: Dashboard → Deployments → Logs
2. Verifique os logs do Supabase: Dashboard → Logs
3. Abra o console do navegador (F12) para erros JavaScript
4. Verifique se as variáveis de ambiente estão configuradas

---

## 🎉 PRÓXIMOS PASSOS

Após configuração completa:

1. ✅ Inserir dados reais nos módulos
2. ✅ Testar cada funcionalidade
3. ✅ Configurar backup automático no Supabase
4. ✅ Configurar domínio customizado (opcional)
5. ✅ Habilitar autenticação 2FA (opcional)
6. ✅ Configurar alertas e notificações

---

**Sistema configurado e pronto para uso! 🚀**


# 🧾 Setup do Módulo Fiscal - Notas Fiscais

Este script configura completamente o módulo fiscal no Supabase, incluindo:
- Tabela de **Fornecedores**
- Tabela de **Notas Fiscais**
- Tabela de **Itens de Nota Fiscal**
- Políticas RLS (Row Level Security)
- Triggers de atualização automática
- Realtime habilitado

## 🚀 Como Executar

### Passo 1: Obter String de Conexão do Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** → **Database**
3. Procure por **Connection String** → **URI**
4. Copie a string que começa com `postgresql://postgres:[PASSWORD]@...`
5. **IMPORTANTE**: Substitua `[PASSWORD]` pela senha real do seu banco

Exemplo:
```
postgresql://postgres:SuaSenhaAqui@db.moswhtqcgjcpsideykzw.supabase.co:5432/postgres
```

### Passo 2: Executar o Script

No terminal, execute:

```bash
node scripts/apply_notas_fiscais_sql.js "postgresql://postgres:SUA_SENHA@db.moswhtqcgjcpsideykzw.supabase.co:5432/postgres"
```

**OU** defina a variável de ambiente:

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://postgres:SUA_SENHA@..."
node scripts/apply_notas_fiscais_sql.js

# Linux/Mac
export DATABASE_URL="postgresql://postgres:SUA_SENHA@..."
node scripts/apply_notas_fiscais_sql.js
```

## ✅ O que o Script Cria

### Tabelas

1. **fornecedores**
   - Armazena dados de fornecedores (razão social, CNPJ, contatos)
   - Com 3 fornecedores de exemplo

2. **notas_fiscais**
   - Armazena cabeçalho das notas fiscais
   - Campos: número, série, chave de acesso, valores, impostos, status
   - Suporta entrada/saída

3. **itens_nota_fiscal**
   - Armazena itens de cada nota
   - Campos: produto, quantidade, valores, impostos (ICMS, IPI, PIS, COFINS)

### Índices Criados

- `fornecedores_cpf_cnpj_key` (UNIQUE)
- `notas_fiscais_chave_acesso_key` (UNIQUE)
- `notas_fiscais_data_idx`
- `notas_fiscais_fornecedor_idx`
- `notas_fiscais_status_idx`
- `itens_nf_nf_idx`

### Políticas RLS

Todas as tabelas têm políticas completas para:
- SELECT (leitura)
- INSERT (inserção)
- UPDATE (atualização)
- DELETE (exclusão)

**Nota**: As políticas estão configuradas como `USING (true)` para permitir acesso irrestrito durante desenvolvimento. Em produção, você deve ajustar para usar `auth.uid()` e verificar permissões.

### Triggers

- `trg_fornecedores_updated_at`: Atualiza `updated_at` automaticamente
- `trg_notas_updated_at`: Atualiza `updated_at` automaticamente

### Realtime

As tabelas estão habilitadas para receber atualizações em tempo real via Supabase Realtime.

## 🧪 Verificação Pós-Instalação

Após executar o script, você verá algo como:

```
✅ Script executado com sucesso!

📊 Tabelas criadas:
   ✓ fornecedores
   ✓ itens_nota_fiscal
   ✓ notas_fiscais

🔒 Políticas RLS:
   ✓ fornecedores: 4 políticas
   ✓ itens_nota_fiscal: 4 políticas
   ✓ notas_fiscais: 4 políticas

🏢 Fornecedores de exemplo: 3

🎉 SETUP CONCLUÍDO COM SUCESSO!
```

## 🔍 Teste no Supabase Dashboard

1. Acesse **Table Editor** no Supabase
2. Verifique se as tabelas foram criadas:
   - `fornecedores`
   - `notas_fiscais`
   - `itens_nota_fiscal`
3. Clique em cada tabela e veja os fornecedores de exemplo

## 🎯 Teste no Painel Web

1. Acesse `http://localhost:3000/dashboard/fiscal`
2. Clique em **"Importar XML"**
3. Selecione um arquivo XML de NFe
4. Verifique se a nota foi importada com sucesso
5. Veja as estatísticas atualizarem em tempo real

## 🐛 Problemas Comuns

### Erro 404/406/400

Isso significa que as tabelas não existem ou as políticas RLS estão bloqueando. Execute este script!

### "relation notas_fiscais does not exist"

Execute o script novamente. A tabela não foi criada.

### "permission denied for table notas_fiscais"

As políticas RLS não foram aplicadas corretamente. Execute o script novamente.

### Erro de conexão

Verifique:
1. String de conexão está correta?
2. Senha do banco está correta?
3. Você substituiu `[PASSWORD]` pela senha real?
4. Seu IP tem acesso ao banco? (Supabase permite todos por padrão)

## 📦 Dependências

O script usa o pacote `pg` (PostgreSQL client). Certifique-se de ter instalado:

```bash
npm install pg
```

## 🔐 Segurança

**⚠️ IMPORTANTE**: Este script configura políticas RLS permissivas (`USING (true)`) para desenvolvimento.

Em **PRODUÇÃO**, você deve:

1. Modificar as políticas para usar `auth.uid()`
2. Adicionar verificação de roles (admin, gestor, etc)
3. Restringir acesso por empresa/organização

Exemplo de política mais segura:

```sql
CREATE POLICY "Usuários autenticados podem ler notas" 
ON public.notas_fiscais 
FOR SELECT 
USING (auth.role() = 'authenticated');
```

## 📚 Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- [NFe XML Documentation](http://www.nfe.fazenda.gov.br/)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do terminal
2. Acesse o Supabase Dashboard → SQL Editor
3. Execute manualmente queries para verificar as tabelas
4. Revise as políticas RLS em Settings → Database → Policies

---

**Criado para o Sistema Pegasus - Gestão Logística**


# Como Executar o Script de Auditoria

## Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o Supabase Dashboard: https://supabase.com
2. Vá para seu projeto
3. No menu lateral, clique em "SQL Editor"
4. Copie e cole o conteúdo do arquivo `scripts/criar-tabelas-auditoria.sql`
5. Clique em "Run" para executar

## Opção 2: Via Node.js (Linha de Comando)

Se você tiver acesso à DATABASE_URL do seu projeto Supabase:

```bash
# Execute o script passando a DATABASE_URL
node scripts/apply_auditoria_sql_simple.js "postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"
```

### Como obter a DATABASE_URL:

1. Acesse o Supabase Dashboard
2. Vá para Settings > Database
3. Em "Connection String", copie a "Connection String" no formato "URI"
4. Substitua `[YOUR-PASSWORD]` pela senha do seu banco de dados

## O que o script cria:

✅ Tabela `auditoria_logs` - Logs de todas as atividades do sistema
✅ Tabela `auditoria_tasks` - Tarefas de auditoria agendadas
✅ Índices para otimizar consultas
✅ Políticas RLS (Row Level Security) para segurança
✅ Realtime habilitado para atualizações em tempo real

## Após executar o script:

1. O módulo de Auditoria no painel web estará funcional
2. Você poderá ver logs de atividades do sistema
3. Poderá criar e gerenciar tarefas de auditoria
4. Os dados serão atualizados em tempo real

## Verificar se funcionou:

No SQL Editor do Supabase, execute:

```sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('auditoria_logs', 'auditoria_tasks')
ORDER BY table_name, ordinal_position;
```

Você deve ver as colunas das duas tabelas listadas.


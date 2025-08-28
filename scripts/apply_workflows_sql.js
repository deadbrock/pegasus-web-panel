/*
  Aplica o schema das tabelas de workflows e notificações no Supabase (idempotente)
  Requer: DATABASE_URL (postgres connection string com ssl=verify-full ou preferível) e NODE_TLS_REJECT_UNAUTHORIZED=0 para local se necessário
*/

const { Client } = require('pg')

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('DATABASE_URL não definida')
    process.exit(1)
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await client.connect()
  try {
    const sql = `
    create extension if not exists pgcrypto;

    create table if not exists public.workflows (
      id uuid primary key default gen_random_uuid(),
      module text not null,
      trigger text not null,
      condition jsonb not null default '{}',
      action jsonb not null default '{}',
      user_id uuid not null,
      active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists public.workflow_logs (
      id uuid primary key default gen_random_uuid(),
      workflow_id uuid not null references public.workflows(id) on delete cascade,
      user_id uuid not null,
      executed_at timestamptz not null default now(),
      status text not null,
      details jsonb not null default '{}'
    );

    create table if not exists public.user_notifications (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null,
      title text not null,
      message text not null,
      payload jsonb default '{}',
      created_at timestamptz not null default now()
    );

    -- gatilho updated_at
    create or replace function set_updated_at()
    returns trigger as $$
    begin
      new.updated_at = now();
      return new;
    end;
    $$ language plpgsql;

    drop trigger if exists set_updated_at_workflows on public.workflows;
    create trigger set_updated_at_workflows before update on public.workflows
      for each row execute procedure set_updated_at();

    -- Realtime
    alter publication supabase_realtime add table if not exists public.user_notifications;
    alter publication supabase_realtime add table if not exists public.workflows;
    alter publication supabase_realtime add table if not exists public.workflow_logs;

    -- RLS
    alter table public.workflows enable row level security;
    alter table public.workflow_logs enable row level security;
    alter table public.user_notifications enable row level security;

    drop policy if exists workflows_owner_select on public.workflows;
    create policy workflows_owner_select on public.workflows for select using (auth.uid() = user_id);
    drop policy if exists workflows_owner_write on public.workflows;
    create policy workflows_owner_write on public.workflows for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

    drop policy if exists logs_owner_select on public.workflow_logs;
    create policy logs_owner_select on public.workflow_logs for select using (auth.uid() = user_id);
    drop policy if exists logs_owner_insert on public.workflow_logs;
    create policy logs_owner_insert on public.workflow_logs for insert with check (auth.uid() = user_id);

    drop policy if exists notif_owner_select on public.user_notifications;
    create policy notif_owner_select on public.user_notifications for select using (auth.uid() = user_id);
    drop policy if exists notif_owner_insert on public.user_notifications;
    create policy notif_owner_insert on public.user_notifications for insert with check (auth.uid() = user_id);
    `
    await client.query(sql)
    console.log('Schema de workflows aplicado com sucesso')
  } finally {
    await client.end()
  }
}

run().catch((e) => { console.error(e); process.exit(1) })



// Node script: cria tabelas para Data Hub, Forecast e Radar (executado a partir do web panel)
const { Client } = require('pg')

function envOrArg(name) {
  const argUrl = process.argv[2]
  if (argUrl && argUrl.trim()) return argUrl.trim()
  const v = process.env[name]
  if (!v) throw new Error(`Missing env ${name} (or pass it as first CLI arg) `)
  return v.trim()
}

function buildClient() {
  let cs = envOrArg('DATABASE_URL')
  if (!cs.includes('sslmode')) cs += (cs.includes('?') ? '&' : '?') + 'sslmode=no-verify'
  return new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } })
}

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.datahub_events (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  occurred_at timestamptz not null,
  key text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_datahub_source on public.datahub_events(source);
create index if not exists idx_datahub_occurred_at on public.datahub_events(occurred_at);

create table if not exists public.forecasts (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  period timestamptz not null,
  value numeric not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_forecasts_scope_period on public.forecasts(scope, period);

create table if not exists public.ai_alerts (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  payload jsonb,
  user_id text,
  created_at timestamptz not null default now(),
  acknowledged boolean not null default false
);
create index if not exists idx_ai_alerts_created on public.ai_alerts(created_at);
`;

async function main() {
  const client = buildClient()
  await client.connect()
  try {
    await client.query('begin')
    await client.query(sql)
    await client.query('commit')
    console.log('AI modules SQL applied successfully')
  } catch (e) {
    await client.query('rollback')
    console.error('Failed to apply AI modules SQL:', e.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()



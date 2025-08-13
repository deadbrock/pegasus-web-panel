// Executa SQL idempotente no Supabase (Postgres) para o módulo Veículos
// Requer DATABASE_URL em process.env

const { Client, defaults } = require('pg')
defaults.ssl = { rejectUnauthorized: false }

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null unique,
  marca text not null,
  modelo text not null,
  tipo text null,
  ano int null,
  cor text null,
  combustivel text null,
  capacidade int null,
  km_atual numeric null,
  status text not null default 'Ativo' check (status in ('Ativo','Inativo','Manutenção')),
  chassi text null,
  renavam text null,
  observacoes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.veiculos
  add column if not exists tipo text,
  add column if not exists combustivel text,
  add column if not exists capacidade int,
  add column if not exists chassi text,
  add column if not exists renavam text,
  add column if not exists observacoes text,
  add column if not exists km_atual numeric,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create unique index if not exists veiculos_placa_unique on public.veiculos(placa);
create index if not exists veiculos_status_idx on public.veiculos(status);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_veiculos_updated_at on public.veiculos;
create trigger trg_veiculos_updated_at
before update on public.veiculos
for each row execute function public.set_updated_at();

alter table public.veiculos enable row level security;

drop policy if exists veiculos_select_all on public.veiculos;
create policy veiculos_select_all on public.veiculos
  for select using (true);

drop policy if exists veiculos_write_anon on public.veiculos;
create policy veiculos_write_anon on public.veiculos
  for all using (true) with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'veiculos'
  ) then
    execute 'alter publication supabase_realtime add table public.veiculos';
  end if;
end$$;
`;

async function main() {
  let connStr = process.env.DATABASE_URL || process.argv[2]
  if (!connStr) {
    console.error('DATABASE_URL não definido')
    process.exit(1)
  }
  // Evitar erro de certificado autoassinado
  connStr = connStr.replace('sslmode=require', 'sslmode=no-verify')
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query('set statement_timeout = 0;')
    await client.query(sql)
    console.log('SQL aplicado com sucesso (veiculos)')
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((e) => {
  console.error('Falha ao aplicar SQL:', e.message)
  process.exit(1)
})



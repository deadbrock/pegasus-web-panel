// Aplica SQL idempotente para tabela contracts: adiciona custo_material
const { Client, defaults } = require('pg')
defaults.ssl = { rejectUnauthorized: false }

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  cnpj text null,
  cidade text null,
  estado text null,
  endereco text null,
  inicio_vigencia timestamptz null,
  fim_vigencia timestamptz null,
  status text null,
  responsavel text null,
  custo_material numeric null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contracts
  add column if not exists custo_material numeric null,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_contracts_updated_at on public.contracts;
create trigger trg_contracts_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();

alter table public.contracts enable row level security;
drop policy if exists contracts_select_all on public.contracts;
create policy contracts_select_all on public.contracts for select using (true);
drop policy if exists contracts_write_anon on public.contracts;
create policy contracts_write_anon on public.contracts for all using (true) with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'contracts'
  ) then
    execute 'alter publication supabase_realtime add table public.contracts';
  end if;
end$$;
`;

async function main() {
  let connStr = process.env.DATABASE_URL || process.argv[2]
  if (!connStr) {
    console.error('DATABASE_URL não definido')
    process.exit(1)
  }
  connStr = connStr.replace('sslmode=require', 'sslmode=no-verify')
  const client = new Client({ connectionString: connStr, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query('set statement_timeout = 0;')
    await client.query(sql)
    console.log('SQL aplicado com sucesso (contracts)')
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((e) => {
  console.error('Falha ao aplicar SQL:', e.message)
  process.exit(1)
})



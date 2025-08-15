// Executa SQL idempotente no Supabase (Postgres) para o módulo Custos
// Requer DATABASE_URL em process.env ou como primeiro argumento (node scripts/apply_costs_sql.js <DATABASE_URL>)

const { Client, defaults } = require('pg')
defaults.ssl = { rejectUnauthorized: false }

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.custos (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  categoria text not null,
  descricao text not null,
  valor numeric not null,
  veiculo_id uuid null,
  responsavel text not null,
  observacoes text null,
  status text null check (status in ('Pago','Pendente','Vencido')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Acrescenta colunas que possam não existir (idempotente)
alter table public.custos
  add column if not exists veiculo_id uuid,
  add column if not exists observacoes text,
  add column if not exists status text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

-- Ajusta constraint de status se necessário
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.custos'::regclass and conname = 'custos_status_check'
  ) then
    begin
      alter table public.custos
      add constraint custos_status_check check (status in ('Pago','Pendente','Vencido'));
    exception when duplicate_object then
      null;
    end;
  end if;
end$$;

create index if not exists custos_data_idx on public.custos(data);
create index if not exists custos_categoria_idx on public.custos(categoria);
create index if not exists custos_status_idx on public.custos(status);
create index if not exists custos_veiculo_idx on public.custos(veiculo_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_custos_updated_at on public.custos;
create trigger trg_custos_updated_at
before update on public.custos
for each row execute function public.set_updated_at();

alter table public.custos enable row level security;

drop policy if exists custos_select_all on public.custos;
create policy custos_select_all on public.custos
  for select using (true);

drop policy if exists custos_write_anon on public.custos;
create policy custos_write_anon on public.custos
  for all using (true) with check (true);

-- Habilita realtime se ainda não estiver no publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'custos'
  ) then
    execute 'alter publication supabase_realtime add table public.custos';
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
    console.log('SQL aplicado com sucesso (custos)')
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((e) => {
  console.error('Falha ao aplicar SQL:', e.message)
  process.exit(1)
})



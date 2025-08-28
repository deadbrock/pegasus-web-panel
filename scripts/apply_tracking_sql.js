// Cria tabelas mínimas para rastreamento (posicoes, alertas) e habilita Realtime
const { Client, defaults } = require('pg')
defaults.ssl = { rejectUnauthorized: false }

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.posicoes_veiculo (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null,
  latitude double precision not null,
  longitude double precision not null,
  velocidade double precision null,
  direcao double precision null,
  timestamp timestamptz not null default now()
);

create index if not exists posicoes_veiculo_veiculo_idx on public.posicoes_veiculo(veiculo_id);
create index if not exists posicoes_veiculo_time_idx on public.posicoes_veiculo(timestamp);

create table if not exists public.alertas_rastreamento (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null,
  tipo text not null,
  descricao text,
  prioridade text check (prioridade in ('baixa','media','alta')) default 'media',
  status text check (status in ('ativo','resolvido')) default 'ativo',
  created_at timestamptz not null default now()
);

alter table public.posicoes_veiculo enable row level security;
alter table public.alertas_rastreamento enable row level security;

drop policy if exists posicoes_select on public.posicoes_veiculo;
create policy posicoes_select on public.posicoes_veiculo for select using (true);
drop policy if exists posicoes_write on public.posicoes_veiculo;
create policy posicoes_write on public.posicoes_veiculo for all using (true) with check (true);

drop policy if exists alertas_select on public.alertas_rastreamento;
create policy alertas_select on public.alertas_rastreamento for select using (true);
drop policy if exists alertas_write on public.alertas_rastreamento;
create policy alertas_write on public.alertas_rastreamento for all using (true) with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posicoes_veiculo'
  ) then
    execute 'alter publication supabase_realtime add table public.posicoes_veiculo';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'alertas_rastreamento'
  ) then
    execute 'alter publication supabase_realtime add table public.alertas_rastreamento';
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
    console.log('SQL aplicado com sucesso (rastreamento)')
  } finally {
    await client.end().catch(() => {})
  }
}

main().catch((e) => {
  console.error('Falha ao aplicar SQL:', e.message)
  process.exit(1)
})



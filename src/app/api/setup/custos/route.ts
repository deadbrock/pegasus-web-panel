import { NextResponse } from 'next/server'
import { Client } from 'pg'

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

alter table public.custos
  add column if not exists veiculo_id uuid,
  add column if not exists observacoes text,
  add column if not exists status text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

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

do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'custos'
  ) then
    execute 'alter publication supabase_realtime add table public.custos';
  end if;
end$$;
`

export async function POST(req: Request) {
  const key = req.headers.get('X-API-Key') || new URL(req.url).searchParams.get('key')
  if (!process.env.PEGASUS_API_KEY || key !== process.env.PEGASUS_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    return NextResponse.json({ error: 'DATABASE_URL não configurado' }, { status: 500 })
  }
  const conn = dbUrl.replace('sslmode=require', 'sslmode=no-verify')
  const client = new Client({ connectionString: conn, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    await client.query('set statement_timeout = 0;')
    await client.query(sql)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erro SQL' }, { status: 500 })
  } finally {
    try { await client.end() } catch {}
  }
}



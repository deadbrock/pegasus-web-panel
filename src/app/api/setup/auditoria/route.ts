import { NextResponse } from 'next/server'
import { Client } from 'pg'

const sql = `
create extension if not exists pgcrypto;

create table if not exists public.audit_findings (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  descricao text not null,
  severidade text not null check (severidade in ('Crítica','Alta','Média','Baixa')),
  status text not null check (status in ('Pendente','Em Análise','Resolvido')),
  data_criacao timestamptz not null default now(),
  data_ultima_ocorrencia timestamptz not null default now(),
  dados_referencia jsonb null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists audit_findings_area_idx on public.audit_findings(area);
create index if not exists audit_findings_status_idx on public.audit_findings(status);
create index if not exists audit_findings_severidade_idx on public.audit_findings(severidade);
create index if not exists audit_findings_data_idx on public.audit_findings(data_ultima_ocorrencia);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_audit_findings_updated_at on public.audit_findings;
create trigger trg_audit_findings_updated_at
before update on public.audit_findings
for each row execute function public.set_updated_at();

alter table public.audit_findings enable row level security;

drop policy if exists audit_findings_select on public.audit_findings;
create policy audit_findings_select on public.audit_findings for select using (true);

drop policy if exists audit_findings_write on public.audit_findings;
create policy audit_findings_write on public.audit_findings for all using (true) with check (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'audit_findings'
  ) then
    execute 'alter publication supabase_realtime add table public.audit_findings';
  end if;
end$$;
`

export async function POST(req: Request) {
  // Autenticação opcional - para uso interno apenas
  // Em produção, adicione autenticação adequada
  
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



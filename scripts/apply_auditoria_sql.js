const { Client, defaults } = require('pg')
defaults.ssl = { rejectUnauthorized: false }

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
    console.log('SQL aplicado com sucesso (audit_findings)')
  } finally {
    await client.end().catch(()=>{})
  }
}

main().catch((e) => { console.error('Falha ao aplicar SQL:', e.message); process.exit(1) })




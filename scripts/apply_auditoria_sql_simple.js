// Script simples para criar tabelas de auditoria
// Você deve executar este script fornecendo a DATABASE_URL como argumento

const { Client } = require('pg')

const sql = `
-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS auditoria_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario VARCHAR(255) NOT NULL,
  acao VARCHAR(100) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  ip VARCHAR(45),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sucesso', 'falha')),
  detalhes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas de auditoria
CREATE TABLE IF NOT EXISTS auditoria_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('financeiro', 'operacional', 'seguranca', 'compliance')),
  modulos TEXT[] NOT NULL DEFAULT '{}',
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  descricao TEXT,
  automatica BOOLEAN DEFAULT FALSE,
  notificar_email BOOLEAN DEFAULT TRUE,
  prioridade VARCHAR(20) NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  status VARCHAR(20) NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_timestamp ON auditoria_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_usuario ON auditoria_logs(usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_modulo ON auditoria_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_acao ON auditoria_logs(acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_status ON auditoria_logs(status);
CREATE INDEX IF NOT EXISTS idx_auditoria_tasks_tipo ON auditoria_tasks(tipo);
CREATE INDEX IF NOT EXISTS idx_auditoria_tasks_status ON auditoria_tasks(status);
CREATE INDEX IF NOT EXISTS idx_auditoria_tasks_created_at ON auditoria_tasks(created_at DESC);

-- RLS Policies
ALTER TABLE auditoria_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios podem ver logs" ON auditoria_logs;
CREATE POLICY "Usuarios podem ver logs" ON auditoria_logs FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Sistema pode criar logs" ON auditoria_logs;
CREATE POLICY "Sistema pode criar logs" ON auditoria_logs FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem ver tasks" ON auditoria_tasks;
CREATE POLICY "Usuarios podem ver tasks" ON auditoria_tasks FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Usuarios podem criar tasks" ON auditoria_tasks;
CREATE POLICY "Usuarios podem criar tasks" ON auditoria_tasks FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem atualizar tasks" ON auditoria_tasks;
CREATE POLICY "Usuarios podem atualizar tasks" ON auditoria_tasks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Usuarios podem deletar tasks" ON auditoria_tasks;
CREATE POLICY "Usuarios podem deletar tasks" ON auditoria_tasks FOR DELETE TO authenticated USING (true);
`

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.argv[2]
  
  if (!dbUrl) {
    console.log('\n❌ ERRO: DATABASE_URL não fornecido')
    console.log('\nUso:')
    console.log('  node scripts/apply_auditoria_sql_simple.js "postgresql://user:pass@host:port/db"')
    console.log('\nOu defina a variável de ambiente DATABASE_URL')
    process.exit(1)
  }

  console.log('🔄 Conectando ao banco de dados...')
  
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    console.log('✅ Conectado com sucesso!')
    
    console.log('🔄 Executando SQL...')
    await client.query(sql)
    console.log('✅ Tabelas de auditoria criadas com sucesso!')
    
    // Verificar
    const result = await client.query(`
      SELECT table_name, COUNT(*) as total_colunas
      FROM information_schema.columns
      WHERE table_name IN ('auditoria_logs', 'auditoria_tasks')
      GROUP BY table_name
    `)
    
    console.log('\n📊 ESTRUTURA:')
    result.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}: ${row.total_colunas} colunas`)
    })
    
  } catch (error) {
    console.error('\n❌ ERRO:', error.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()


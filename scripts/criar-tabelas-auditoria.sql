-- ============================================================================
-- TABELAS: auditoria_logs e auditoria_tasks
-- DESCRIÇÃO: Sistema de auditoria e logs de atividades do sistema
-- ============================================================================

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

-- Índices para auditoria_logs
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_timestamp ON auditoria_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_usuario ON auditoria_logs(usuario);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_modulo ON auditoria_logs(modulo);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_acao ON auditoria_logs(acao);
CREATE INDEX IF NOT EXISTS idx_auditoria_logs_status ON auditoria_logs(status);

-- Índices para auditoria_tasks
CREATE INDEX IF NOT EXISTS idx_auditoria_tasks_tipo ON auditoria_tasks(tipo);
CREATE INDEX IF NOT EXISTS idx_auditoria_tasks_status ON auditoria_tasks(status);
CREATE INDEX IF NOT EXISTS idx_auditoria_tasks_created_at ON auditoria_tasks(created_at DESC);

-- RLS Policies para auditoria_logs
ALTER TABLE auditoria_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios podem ver logs" ON auditoria_logs;
DROP POLICY IF EXISTS "Sistema pode criar logs" ON auditoria_logs;

CREATE POLICY "Usuarios podem ver logs"
ON auditoria_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Sistema pode criar logs"
ON auditoria_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policies para auditoria_tasks
ALTER TABLE auditoria_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios podem ver tasks" ON auditoria_tasks;
DROP POLICY IF EXISTS "Usuarios podem criar tasks" ON auditoria_tasks;
DROP POLICY IF EXISTS "Usuarios podem atualizar tasks" ON auditoria_tasks;
DROP POLICY IF EXISTS "Usuarios podem deletar tasks" ON auditoria_tasks;

CREATE POLICY "Usuarios podem ver tasks"
ON auditoria_tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuarios podem criar tasks"
ON auditoria_tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuarios podem atualizar tasks"
ON auditoria_tasks FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Usuarios podem deletar tasks"
ON auditoria_tasks FOR DELETE
TO authenticated
USING (true);

-- Verificar estrutura
SELECT 
  '✅ TABELA auditoria_logs' AS status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'auditoria_logs'
ORDER BY ordinal_position;

SELECT 
  '✅ TABELA auditoria_tasks' AS status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'auditoria_tasks'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  '✅ POLÍTICAS RLS auditoria_logs' AS info,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'auditoria_logs';

SELECT 
  '✅ POLÍTICAS RLS auditoria_tasks' AS info,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'auditoria_tasks';

SELECT '✅ SCRIPT CONCLUÍDO' AS status;


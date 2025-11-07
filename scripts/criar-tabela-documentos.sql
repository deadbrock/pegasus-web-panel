-- ============================================================================
-- TABELA: documentos
-- DESCRIÇÃO: Armazenar documentos de diferentes tipos (financeiro, fiscal, logística)
-- ============================================================================

-- Criar tabela de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('financeiro', 'fiscal', 'logistica', 'outro')),
  arquivo_url TEXT NOT NULL,
  usuario_id UUID, -- Opcional: referência ao usuário que fez upload
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_created_at ON documentos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documentos_usuario_id ON documentos(usuario_id);

-- RLS Policies
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se houver
DROP POLICY IF EXISTS "Usuarios podem ver documentos" ON documentos;
DROP POLICY IF EXISTS "Usuarios podem criar documentos" ON documentos;
DROP POLICY IF EXISTS "Usuarios podem atualizar documentos" ON documentos;
DROP POLICY IF EXISTS "Usuarios podem deletar documentos" ON documentos;

-- Policy: Permitir leitura para todos os usuários autenticados
CREATE POLICY "Usuarios podem ver documentos"
ON documentos FOR SELECT
TO authenticated
USING (true);

-- Policy: Permitir inserção para todos os usuários autenticados
CREATE POLICY "Usuarios podem criar documentos"
ON documentos FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Permitir atualização para todos os usuários autenticados
CREATE POLICY "Usuarios podem atualizar documentos"
ON documentos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Permitir exclusão para todos os usuários autenticados
CREATE POLICY "Usuarios podem deletar documentos"
ON documentos FOR DELETE
TO authenticated
USING (true);

-- Criar bucket de storage para documentos (se não existir)
-- Nota: Executar manualmente no Supabase Storage se necessário
-- insert into storage.buckets (id, name, public)
-- values ('documentos', 'documentos', true);

-- Verificar estrutura
SELECT 
  '✅ TABELA CRIADA' AS status,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'documentos'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
  '✅ POLÍTICAS RLS' AS info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'documentos';

SELECT '✅ SCRIPT CONCLUÍDO' AS status;


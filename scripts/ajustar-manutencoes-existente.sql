-- ============================================
-- SCRIPT PARA AJUSTAR TABELA MANUTENCOES EXISTENTE
-- ============================================
-- Este script adiciona/ajusta colunas que podem estar faltando
-- na tabela manutencoes já existente
-- ============================================

-- Adicionar colunas que podem estar faltando (se não existirem)
DO $$ 
BEGIN
  -- Adicionar veiculo_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='veiculo_id'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN veiculo_id UUID REFERENCES veiculos(id);
    RAISE NOTICE '✅ Coluna veiculo_id adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna veiculo_id já existe';
  END IF;

  -- Adicionar tipo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='tipo'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN tipo TEXT NOT NULL DEFAULT 'Preventiva';
    RAISE NOTICE '✅ Coluna tipo adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna tipo já existe';
  END IF;

  -- Adicionar descricao se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='descricao'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN descricao TEXT NOT NULL DEFAULT '';
    RAISE NOTICE '✅ Coluna descricao adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna descricao já existe';
  END IF;

  -- Adicionar data_agendada se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='data_agendada'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN data_agendada TIMESTAMP NOT NULL DEFAULT NOW();
    RAISE NOTICE '✅ Coluna data_agendada adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna data_agendada já existe';
  END IF;

  -- Adicionar data_inicio se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='data_inicio'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN data_inicio TIMESTAMP;
    RAISE NOTICE '✅ Coluna data_inicio adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna data_inicio já existe';
  END IF;

  -- Adicionar data_conclusao se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='data_conclusao'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN data_conclusao TIMESTAMP;
    RAISE NOTICE '✅ Coluna data_conclusao adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna data_conclusao já existe';
  END IF;

  -- Adicionar quilometragem se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='quilometragem'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN quilometragem INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE '✅ Coluna quilometragem adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna quilometragem já existe';
  END IF;

  -- Adicionar status se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='status'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN status TEXT NOT NULL DEFAULT 'Agendada';
    RAISE NOTICE '✅ Coluna status adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna status já existe';
  END IF;

  -- Adicionar custo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='custo'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN custo DECIMAL(10, 2);
    RAISE NOTICE '✅ Coluna custo adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna custo já existe';
  END IF;

  -- Adicionar responsavel se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='responsavel'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN responsavel TEXT;
    RAISE NOTICE '✅ Coluna responsavel adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna responsavel já existe';
  END IF;

  -- Adicionar oficina se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='oficina'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN oficina TEXT;
    RAISE NOTICE '✅ Coluna oficina adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna oficina já existe';
  END IF;

  -- Adicionar observacoes se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='observacoes'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN observacoes TEXT;
    RAISE NOTICE '✅ Coluna observacoes adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna observacoes já existe';
  END IF;

  -- Adicionar pecas_trocadas se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='pecas_trocadas'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN pecas_trocadas TEXT;
    RAISE NOTICE '✅ Coluna pecas_trocadas adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna pecas_trocadas já existe';
  END IF;

  -- Adicionar created_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='created_at'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE '✅ Coluna created_at adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna created_at já existe';
  END IF;

  -- Adicionar updated_at se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' AND column_name='updated_at'
  ) THEN
    ALTER TABLE manutencoes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    RAISE NOTICE '✅ Coluna updated_at adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna updated_at já existe';
  END IF;
END $$;

-- ============================================
-- CRIAR ÍNDICES (SE NÃO EXISTIREM)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_manutencoes_veiculo ON manutencoes(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_data_agendada ON manutencoes(data_agendada);
CREATE INDEX IF NOT EXISTS idx_manutencoes_status ON manutencoes(status);
CREATE INDEX IF NOT EXISTS idx_manutencoes_tipo ON manutencoes(tipo);

RAISE NOTICE '';
RAISE NOTICE '✅ Índices verificados/criados';

-- ============================================
-- HABILITAR RLS (SE NÃO ESTIVER HABILITADO)
-- ============================================
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;

RAISE NOTICE '✅ RLS habilitado';

-- ============================================
-- CRIAR POLÍTICAS RLS (SE NÃO EXISTIREM)
-- ============================================
DO $$ 
BEGIN
  -- Política de SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manutencoes' AND policyname = 'Todos podem ver manutenções'
  ) THEN
    CREATE POLICY "Todos podem ver manutenções"
      ON manutencoes FOR SELECT
      USING (true);
    RAISE NOTICE '✅ Política de SELECT criada';
  ELSE
    RAISE NOTICE 'ℹ️ Política de SELECT já existe';
  END IF;

  -- Política de INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manutencoes' AND policyname = 'Admins podem inserir manutenções'
  ) THEN
    CREATE POLICY "Admins podem inserir manutenções"
      ON manutencoes FOR INSERT
      WITH CHECK (true);
    RAISE NOTICE '✅ Política de INSERT criada';
  ELSE
    RAISE NOTICE 'ℹ️ Política de INSERT já existe';
  END IF;

  -- Política de UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manutencoes' AND policyname = 'Admins podem atualizar manutenções'
  ) THEN
    CREATE POLICY "Admins podem atualizar manutenções"
      ON manutencoes FOR UPDATE
      USING (true);
    RAISE NOTICE '✅ Política de UPDATE criada';
  ELSE
    RAISE NOTICE 'ℹ️ Política de UPDATE já existe';
  END IF;

  -- Política de DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'manutencoes' AND policyname = 'Admins podem deletar manutenções'
  ) THEN
    CREATE POLICY "Admins podem deletar manutenções"
      ON manutencoes FOR DELETE
      USING (true);
    RAISE NOTICE '✅ Política de DELETE criada';
  ELSE
    RAISE NOTICE 'ℹ️ Política de DELETE já existe';
  END IF;
END $$;

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ TABELA MANUTENCOES AJUSTADA!';
RAISE NOTICE '========================================';


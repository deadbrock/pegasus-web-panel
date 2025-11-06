-- ============================================
-- SCRIPT PARA CORRIGIR COLUNAS MANUTENCOES
-- ============================================
-- Problema: data_inicio e data_conclusao estão como NOT NULL
-- Solução: Alterar para permitir NULL (são campos opcionais)
-- ============================================

-- 1. Alterar data_inicio para permitir NULL
DO $$ 
BEGIN
  -- Verificar se a coluna existe e é NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='data_inicio' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN data_inicio DROP NOT NULL;
    RAISE NOTICE '✅ Coluna data_inicio agora permite NULL';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna data_inicio já permite NULL';
  END IF;
END $$;

-- 2. Alterar data_conclusao para permitir NULL
DO $$ 
BEGIN
  -- Verificar se a coluna existe e é NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='data_conclusao' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN data_conclusao DROP NOT NULL;
    RAISE NOTICE '✅ Coluna data_conclusao agora permite NULL';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna data_conclusao já permite NULL';
  END IF;
END $$;

-- 3. Verificar outras colunas que devem permitir NULL
DO $$ 
BEGIN
  -- custo (opcional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='custo' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN custo DROP NOT NULL;
    RAISE NOTICE '✅ Coluna custo agora permite NULL';
  END IF;

  -- responsavel (opcional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='responsavel' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN responsavel DROP NOT NULL;
    RAISE NOTICE '✅ Coluna responsavel agora permite NULL';
  END IF;

  -- oficina (opcional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='oficina' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN oficina DROP NOT NULL;
    RAISE NOTICE '✅ Coluna oficina agora permite NULL';
  END IF;

  -- observacoes (opcional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='observacoes' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN observacoes DROP NOT NULL;
    RAISE NOTICE '✅ Coluna observacoes agora permite NULL';
  END IF;

  -- pecas_trocadas (opcional)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='manutencoes' 
    AND column_name='pecas_trocadas' 
    AND is_nullable='NO'
  ) THEN
    ALTER TABLE manutencoes ALTER COLUMN pecas_trocadas DROP NOT NULL;
    RAISE NOTICE '✅ Coluna pecas_trocadas agora permite NULL';
  END IF;
END $$;

-- 4. Verificar estrutura final
SELECT 
  '📋 ESTRUTURA ATUALIZADA' as info,
  column_name,
  data_type,
  is_nullable,
  CASE 
    WHEN column_name IN ('id', 'veiculo_id', 'tipo', 'descricao', 'data_agendada', 
                         'quilometragem', 'status', 'created_at', 'updated_at') 
         AND is_nullable = 'NO'
    THEN '✅ Obrigatório (correto)'
    WHEN column_name IN ('data_inicio', 'data_conclusao', 'custo', 'responsavel', 
                         'oficina', 'observacoes', 'pecas_trocadas') 
         AND is_nullable = 'YES'
    THEN '✅ Opcional (correto)'
    WHEN is_nullable = 'NO'
    THEN '⚠️ NOT NULL'
    ELSE '✅ NULL OK'
  END as status_campo
FROM information_schema.columns
WHERE table_name = 'manutencoes'
ORDER BY ordinal_position;

-- 5. Resumo
SELECT 
  '✅ RESUMO' as info,
  COUNT(*) as total_colunas,
  SUM(CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END) as colunas_obrigatorias,
  SUM(CASE WHEN is_nullable = 'YES' THEN 1 ELSE 0 END) as colunas_opcionais
FROM information_schema.columns
WHERE table_name = 'manutencoes';

RAISE NOTICE '';
RAISE NOTICE '========================================';
RAISE NOTICE '✅ TABELA MANUTENCOES CORRIGIDA!';
RAISE NOTICE '========================================';
RAISE NOTICE 'Colunas obrigatórias:';
RAISE NOTICE '  - id, veiculo_id, tipo, descricao';
RAISE NOTICE '  - data_agendada, quilometragem, status';
RAISE NOTICE '  - created_at, updated_at';
RAISE NOTICE '';
RAISE NOTICE 'Colunas opcionais (permitem NULL):';
RAISE NOTICE '  - data_inicio, data_conclusao';
RAISE NOTICE '  - custo, responsavel, oficina';
RAISE NOTICE '  - observacoes, pecas_trocadas';
RAISE NOTICE '========================================';


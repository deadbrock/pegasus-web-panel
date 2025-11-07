-- ============================================================================
-- ADICIONAR CAMPOS DE DOCUMENTOS NA TABELA MOTORISTAS
-- ============================================================================

-- Verificar se as colunas já existem
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'motoristas'
  AND column_name IN ('validade_exame_medico', 'validade_certidao_antecedentes', 'validade_curso_defensiva')
ORDER BY column_name;

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
  -- Exame Médico
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'motoristas' AND column_name = 'validade_exame_medico'
  ) THEN
    ALTER TABLE motoristas ADD COLUMN validade_exame_medico DATE;
    RAISE NOTICE '✅ Coluna validade_exame_medico adicionada';
  ELSE
    RAISE NOTICE '⏭️  Coluna validade_exame_medico já existe';
  END IF;

  -- Certidão de Antecedentes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'motoristas' AND column_name = 'validade_certidao_antecedentes'
  ) THEN
    ALTER TABLE motoristas ADD COLUMN validade_certidao_antecedentes DATE;
    RAISE NOTICE '✅ Coluna validade_certidao_antecedentes adicionada';
  ELSE
    RAISE NOTICE '⏭️  Coluna validade_certidao_antecedentes já existe';
  END IF;

  -- Curso de Direção Defensiva
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'motoristas' AND column_name = 'validade_curso_defensiva'
  ) THEN
    ALTER TABLE motoristas ADD COLUMN validade_curso_defensiva DATE;
    RAISE NOTICE '✅ Coluna validade_curso_defensiva adicionada';
  ELSE
    RAISE NOTICE '⏭️  Coluna validade_curso_defensiva já existe';
  END IF;
END $$;

-- Verificar estrutura final
SELECT 
  '✅ RESUMO FINAL' AS info,
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'motoristas'
  AND column_name IN (
    'validade_cnh',
    'validade_exame_medico', 
    'validade_certidao_antecedentes', 
    'validade_curso_defensiva'
  )
ORDER BY column_name;

-- Exemplo de atualização (descomente para testar)
/*
UPDATE motoristas 
SET 
  validade_exame_medico = '2025-12-31',
  validade_certidao_antecedentes = '2025-06-30',
  validade_curso_defensiva = '2026-01-15'
WHERE id = 'UUID_DO_MOTORISTA';
*/

SELECT 
  '✅ SCRIPT CONCLUÍDO' AS status,
  'Campos de documentos adicionados com sucesso!' AS mensagem;


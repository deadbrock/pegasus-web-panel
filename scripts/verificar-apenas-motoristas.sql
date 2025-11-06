-- =====================================================
-- VERIFICAR APENAS MOTORISTAS
-- =====================================================

-- 1. VERIFICAR COLUNAS DA TABELA MOTORISTAS
SELECT 
  'ESTRUTURA: motoristas' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'motoristas'
ORDER BY ordinal_position;

-- 2. LISTAR MOTORISTAS
SELECT 
  'MOTORISTAS CADASTRADOS' as info,
  *
FROM public.motoristas
ORDER BY nome;


-- =====================================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- =====================================================

-- 1. VERIFICAR COLUNAS DA TABELA VEICULOS
SELECT 
  'ESTRUTURA: veiculos' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'veiculos'
ORDER BY ordinal_position;

-- 2. VERIFICAR COLUNAS DA TABELA MOTORISTAS
SELECT 
  'ESTRUTURA: motoristas' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'motoristas'
ORDER BY ordinal_position;

-- 3. LISTAR VEÍCULOS
SELECT 
  'VEÍCULOS CADASTRADOS' as info,
  *
FROM public.veiculos
ORDER BY placa;

-- 4. LISTAR MOTORISTAS
SELECT 
  'MOTORISTAS CADASTRADOS' as info,
  *
FROM public.motoristas
ORDER BY nome;


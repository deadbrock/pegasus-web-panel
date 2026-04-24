-- ============================================================
-- GESTÃO ADM — Multi-seleção de tipo de serviço
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. adm_contratos: substituir campo único por arrays
ALTER TABLE public.adm_contratos
  ADD COLUMN IF NOT EXISTS tipos_servico_ids   UUID[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tipos_servico_nomes TEXT[]   DEFAULT '{}';

-- 2. adm_contrato_aditivos: substituir campo único por arrays
ALTER TABLE public.adm_contrato_aditivos
  ADD COLUMN IF NOT EXISTS tipos_servico_ids   UUID[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tipos_servico_nomes TEXT[]   DEFAULT '{}';

-- Verificação
SELECT 'adm_contratos' AS tabela, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'adm_contratos'
  AND column_name IN ('tipos_servico_ids','tipos_servico_nomes')
UNION ALL
SELECT 'adm_contrato_aditivos', column_name, data_type
FROM information_schema.columns
WHERE table_name = 'adm_contrato_aditivos'
  AND column_name IN ('tipos_servico_ids','tipos_servico_nomes')
ORDER BY tabela, column_name;

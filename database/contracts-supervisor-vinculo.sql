-- =====================================================
-- MIGRAÇÃO: Vínculo de Contratos com Supervisores (contracts)
-- =====================================================
-- Descrição:
--   - Adiciona campo supervisor_id na tabela contracts
--   - Permite relacionar cada contrato a um supervisor (auth.users)
--   - Usado pelo módulo "Contratos" (Nome, CNPJ, Cidade...)
-- =====================================================

-- 1. Adicionar coluna supervisor_id na tabela contracts
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS supervisor_id uuid;

-- 2. Índice para buscas por supervisor
CREATE INDEX IF NOT EXISTS idx_contracts_supervisor_id ON contracts(supervisor_id);

-- 3. Verificação rápida
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'contracts'
  AND column_name = 'supervisor_id';

-- =====================================================
-- FIM
-- =====================================================


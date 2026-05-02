-- ============================================================
-- Controle de Materiais por Contrato
-- Execute no SQL Editor do Supabase
-- ============================================================
-- Vincula supervisores do portal a contratos ADM (adm_contratos).
-- Isso permite rastrear os gastos de pedidos de materiais
-- contra o orçamento mensal de cada contrato.
-- ============================================================

-- 1. Adicionar coluna de vínculo ao contrato ADM em portal_supervisores
ALTER TABLE public.portal_supervisores
  ADD COLUMN IF NOT EXISTS adm_contrato_id UUID
    REFERENCES public.adm_contratos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_portal_supervisores_adm_contrato
  ON public.portal_supervisores(adm_contrato_id);

-- 2. Verificação
SELECT
  ps.id,
  ps.nome,
  ps.adm_contrato_id,
  ac.nome AS contrato_nome
FROM public.portal_supervisores ps
LEFT JOIN public.adm_contratos ac ON ac.id = ps.adm_contrato_id
ORDER BY ps.nome;

-- ============================================================
-- pedidos_reprovacao.sql
-- Adiciona campos para reprovação estruturada de pedidos:
--   causa_reprovacao   — motivo principal
--   ajustes_necessarios — o que o solicitante deve corrigir
--   reprovado_por      — quem executou a reprovação
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TABLE public.pedidos_materiais
  ADD COLUMN IF NOT EXISTS causa_reprovacao   TEXT,
  ADD COLUMN IF NOT EXISTS ajustes_necessarios TEXT,
  ADD COLUMN IF NOT EXISTS reprovado_por      TEXT;

-- Migrar dados antigos de motivo_rejeicao para causa_reprovacao
UPDATE public.pedidos_materiais
   SET causa_reprovacao = motivo_rejeicao
 WHERE motivo_rejeicao IS NOT NULL
   AND causa_reprovacao IS NULL;

DO $$
BEGIN
  RAISE NOTICE 'pedidos_reprovacao.sql executado com sucesso!';
  RAISE NOTICE 'Campos adicionados: causa_reprovacao, ajustes_necessarios, reprovado_por';
END$$;

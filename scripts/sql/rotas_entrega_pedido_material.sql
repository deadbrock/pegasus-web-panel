-- ============================================================
-- rotas_entrega_pedido_material.sql
-- Permite criar rotas para pedidos_materiais (portal) E
-- para pedidos_supervisores (mobile) na mesma tabela.
-- Execute no SQL Editor do Supabase.
-- ============================================================

-- 1. Tornar pedido_id nullable
--    (pedido_id = pedidos_supervisores; pedido_material_id = pedidos_materiais)
ALTER TABLE public.rotas_entrega
  ALTER COLUMN pedido_id DROP NOT NULL;

-- 2. Adicionar coluna pedido_material_id
ALTER TABLE public.rotas_entrega
  ADD COLUMN IF NOT EXISTS pedido_material_id UUID
    REFERENCES public.pedidos_materiais(id) ON DELETE CASCADE;

-- 3. Índice para a nova coluna
CREATE INDEX IF NOT EXISTS idx_rotas_pedido_material_id
  ON public.rotas_entrega(pedido_material_id);

-- 4. Constraint: pelo menos um dos dois deve estar preenchido
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'rotas_entrega_has_pedido_chk'
  ) THEN
    ALTER TABLE public.rotas_entrega
      ADD CONSTRAINT rotas_entrega_has_pedido_chk
      CHECK (pedido_id IS NOT NULL OR pedido_material_id IS NOT NULL);
  END IF;
END$$;

-- Validação
DO $$
BEGIN
  RAISE NOTICE 'rotas_entrega_pedido_material.sql executado com sucesso!';
  RAISE NOTICE 'rotas_entrega agora suporta pedidos_supervisores (mobile) e pedidos_materiais (portal).';
END$$;

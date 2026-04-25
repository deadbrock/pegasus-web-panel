-- ============================================================
-- MÓDULO PEDIDOS DE MATERIAIS
-- ============================================================
-- Tabela principal de pedidos criados por encarregados e
-- aprovados por supervisores.
-- Execute no SQL Editor do Supabase após os demais scripts.
-- ============================================================

-- ── Função auxiliar (compartilhada) ─────────────────────────
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT LANGUAGE SQL STABLE AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    auth.jwt() ->> 'role'
  );
$$;

-- ── 1. Tabela pedidos_materiais ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.pedidos_materiais (
  id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido       TEXT        NOT NULL UNIQUE,

  -- Quem criou
  solicitante_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  solicitante_nome    TEXT        NOT NULL,
  solicitante_email   TEXT,
  solicitante_setor   TEXT,

  -- Aprovação / supervisão
  supervisor_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  supervisor_nome     TEXT,
  aprovado_por        TEXT,
  data_aprovacao      TIMESTAMPTZ,
  motivo_rejeicao     TEXT,

  -- Dados do pedido
  urgencia            TEXT        NOT NULL DEFAULT 'Baixa'
                        CHECK (urgencia IN ('Baixa','Média','Alta','Urgente')),
  status              TEXT        NOT NULL DEFAULT 'Pendente'
                        CHECK (status IN (
                          'Pendente',
                          'Em Análise',
                          'Aprovado',
                          'Rejeitado',
                          'Em Separação',
                          'Separado',
                          'Entregue',
                          'Cancelado'
                        )),
  observacoes         TEXT,

  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_status
  ON public.pedidos_materiais (status);
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_solicitante
  ON public.pedidos_materiais (solicitante_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_created
  ON public.pedidos_materiais (created_at DESC);

COMMENT ON TABLE public.pedidos_materiais IS
  'Pedidos de materiais do estoque criados por encarregados e aprovados por supervisores.';

-- ── 2. Tabela itens_pedido_material ─────────────────────────
CREATE TABLE IF NOT EXISTS public.itens_pedido_material (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id   UUID    NOT NULL REFERENCES public.pedidos_materiais(id) ON DELETE CASCADE,
  produto_id  UUID    REFERENCES public.produtos(id) ON DELETE SET NULL,
  produto_codigo TEXT NOT NULL,
  produto_nome   TEXT NOT NULL,
  unidade        TEXT NOT NULL,
  quantidade     NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
  observacoes    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itens_pedido_material_pedido
  ON public.itens_pedido_material (pedido_id);

COMMENT ON TABLE public.itens_pedido_material IS
  'Itens de cada pedido de material.';

-- ── 3. Trigger updated_at ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pedidos_materiais_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_materiais_updated_at ON public.pedidos_materiais;
CREATE TRIGGER trg_pedidos_materiais_updated_at
  BEFORE UPDATE ON public.pedidos_materiais
  FOR EACH ROW EXECUTE FUNCTION public.pedidos_materiais_touch_updated_at();

-- ── 4. RLS ───────────────────────────────────────────────────
ALTER TABLE public.pedidos_materiais    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido_material ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pm_select"  ON public.pedidos_materiais;
DROP POLICY IF EXISTS "pm_insert"  ON public.pedidos_materiais;
DROP POLICY IF EXISTS "pm_update"  ON public.pedidos_materiais;
DROP POLICY IF EXISTS "pm_delete"  ON public.pedidos_materiais;

-- Leitura: todos os perfis autenticados
CREATE POLICY "pm_select" ON public.pedidos_materiais
  FOR SELECT TO authenticated USING (true);

-- Criação: qualquer perfil autenticado pode criar
CREATE POLICY "pm_insert" ON public.pedidos_materiais
  FOR INSERT TO authenticated WITH CHECK (true);

-- Atualização: supervisor, gestor, admin, diretor podem aprovar/alterar
CREATE POLICY "pm_update" ON public.pedidos_materiais
  FOR UPDATE TO authenticated
  USING (
    public.current_user_role() IN ('admin','diretor','gestor','supervisor','logistica')
    OR solicitante_id = auth.uid()
  );

-- Exclusão: apenas admin/diretor
CREATE POLICY "pm_delete" ON public.pedidos_materiais
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin','diretor'));

-- Itens: seguem as permissões do pedido
DROP POLICY IF EXISTS "ipm_select" ON public.itens_pedido_material;
DROP POLICY IF EXISTS "ipm_insert" ON public.itens_pedido_material;
DROP POLICY IF EXISTS "ipm_update" ON public.itens_pedido_material;
DROP POLICY IF EXISTS "ipm_delete" ON public.itens_pedido_material;

CREATE POLICY "ipm_select" ON public.itens_pedido_material
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "ipm_insert" ON public.itens_pedido_material
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "ipm_update" ON public.itens_pedido_material
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "ipm_delete" ON public.itens_pedido_material
  FOR DELETE TO authenticated
  USING (public.current_user_role() IN ('admin','diretor','gestor','supervisor','logistica'));

-- ── 5. Grants ────────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos_materiais       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itens_pedido_material   TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ── 6. Semente: número de pedido (sequence-like via trigger) ─
-- O número é gerado pela aplicação (ex.: PM-2026-0001).

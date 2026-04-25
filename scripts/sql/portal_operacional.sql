-- ============================================================
-- PORTAL OPERACIONAL — Usuários Independentes
-- Execute no SQL Editor do Supabase
-- ============================================================
-- Este script cria as tabelas de supervisores e encarregados
-- do portal, independentes do Supabase Auth, e atualiza a
-- tabela de pedidos_materiais para suportar o novo fluxo.
-- ============================================================

-- ── 1. Supervisores do Portal (independente de auth) ─────────

CREATE TABLE IF NOT EXISTS public.portal_supervisores (
  id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome            TEXT        NOT NULL,
  telefone        TEXT,
  setor           TEXT,
  codigo_hash     TEXT        NOT NULL,  -- bcrypt hash do código de validação
  ativo           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.portal_supervisores_touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_supervisores_updated_at ON public.portal_supervisores;
CREATE TRIGGER trg_portal_supervisores_updated_at
  BEFORE UPDATE ON public.portal_supervisores
  FOR EACH ROW EXECUTE FUNCTION public.portal_supervisores_touch_updated_at();

-- RLS: apenas service_role acessa (sem políticas = acesso bloqueado para usuários autenticados normais)
ALTER TABLE public.portal_supervisores ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para usuários autenticados do sistema (para admin visualizar)
CREATE POLICY "ps_select_authenticated" ON public.portal_supervisores
  FOR SELECT TO authenticated USING (true);

-- ── 2. Encarregados do Portal ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.portal_encarregados (
  id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id   UUID        NOT NULL REFERENCES public.portal_supervisores(id) ON DELETE CASCADE,
  nome            TEXT        NOT NULL,
  telefone        TEXT,
  setor           TEXT,
  ativo           BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portal_encarregados_supervisor
  ON public.portal_encarregados(supervisor_id);

ALTER TABLE public.portal_encarregados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pe_select_authenticated" ON public.portal_encarregados
  FOR SELECT TO authenticated USING (true);

-- ── 3. Atualizar pedidos_materiais ────────────────────────────

-- Adicionar colunas de vínculo com o portal
ALTER TABLE public.pedidos_materiais
  ADD COLUMN IF NOT EXISTS portal_supervisor_id  UUID REFERENCES public.portal_supervisores(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS portal_encarregado_id UUID REFERENCES public.portal_encarregados(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_portal_supervisor
  ON public.pedidos_materiais(portal_supervisor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_materiais_portal_encarregado
  ON public.pedidos_materiais(portal_encarregado_id);

-- Atualizar o CHECK constraint de status para incluir 'Aguardando Validação'
ALTER TABLE public.pedidos_materiais
  DROP CONSTRAINT IF EXISTS pedidos_materiais_status_check;

ALTER TABLE public.pedidos_materiais
  ADD CONSTRAINT pedidos_materiais_status_check
  CHECK (status IN (
    'Aguardando Validação',
    'Pendente',
    'Em Análise',
    'Aprovado',
    'Rejeitado',
    'Em Separação',
    'Separado',
    'Entregue',
    'Cancelado'
  ));

-- ── 4. Grants ─────────────────────────────────────────────────
GRANT SELECT ON public.portal_supervisores  TO authenticated;
GRANT SELECT ON public.portal_encarregados  TO authenticated;

-- service_role já tem acesso total por padrão no Supabase

-- ── Validação ─────────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE 'portal_operacional.sql executado com sucesso!';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Acesse o módulo Supervisores no sistema para criar supervisores do portal';
  RAISE NOTICE '2. Cada supervisor recebe um código único de validação';
  RAISE NOTICE '3. Encarregados são cadastrados vinculados ao supervisor';
END$$;

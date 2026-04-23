-- ============================================================
-- GESTÃO ADM — Aditivos de Contratos
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de aditivos
CREATE TABLE IF NOT EXISTS public.adm_contrato_aditivos (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id       UUID        NOT NULL REFERENCES public.adm_contratos(id) ON DELETE CASCADE,

  -- Identificação
  numero_aditivo    INTEGER     NOT NULL,                         -- 1º, 2º, 3º…
  tipo              TEXT        NOT NULL                          -- ver CHECK abaixo
    CHECK (tipo IN ('valor', 'prazo', 'escopo', 'rescisao', 'outros')),

  -- Datas
  data_assinatura   DATE        NOT NULL,
  data_vigencia     DATE,                                        -- quando entra em vigor

  -- Alteração de valor (tipo = 'valor')
  valor_anterior    NUMERIC(12,2),
  valor_novo        NUMERIC(12,2),

  -- Alteração de prazo (tipo = 'prazo')
  data_fim_anterior DATE,
  data_fim_nova     DATE,

  -- Conteúdo
  objeto            TEXT        NOT NULL,                        -- objeto/finalidade do aditivo
  descricao         TEXT,                                        -- detalhamento livre

  -- Aprovação
  aprovado_por      TEXT,

  -- Status
  status            TEXT        NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'cancelado')),

  -- Metadados
  created_by        UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Garantir sequência única por contrato
  UNIQUE (contrato_id, numero_aditivo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_aditivos_contrato_id
  ON public.adm_contrato_aditivos (contrato_id);

CREATE INDEX IF NOT EXISTS idx_aditivos_data_assinatura
  ON public.adm_contrato_aditivos (data_assinatura DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_adm_aditivos_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_adm_aditivos_updated_at ON public.adm_contrato_aditivos;
CREATE TRIGGER trg_adm_aditivos_updated_at
  BEFORE UPDATE ON public.adm_contrato_aditivos
  FOR EACH ROW EXECUTE FUNCTION public.set_adm_aditivos_updated_at();

-- 2. RLS
ALTER TABLE public.adm_contrato_aditivos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "aditivos_select" ON public.adm_contrato_aditivos;
DROP POLICY IF EXISTS "aditivos_insert" ON public.adm_contrato_aditivos;
DROP POLICY IF EXISTS "aditivos_update" ON public.adm_contrato_aditivos;
DROP POLICY IF EXISTS "aditivos_delete" ON public.adm_contrato_aditivos;

CREATE POLICY "aditivos_select" ON public.adm_contrato_aditivos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "aditivos_insert" ON public.adm_contrato_aditivos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "aditivos_update" ON public.adm_contrato_aditivos
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  )
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "aditivos_delete" ON public.adm_contrato_aditivos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor')
  );

-- 3. Grant
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_contrato_aditivos TO authenticated;

-- 4. Verificação
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'adm_contrato_aditivos'
ORDER BY ordinal_position;

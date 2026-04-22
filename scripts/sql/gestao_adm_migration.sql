-- =============================================================================
-- PEGASUS — Gestão ADM: Fase 1
-- Migration: criação das tabelas do módulo de contratos ADM
-- Data: 2026-04-22
-- =============================================================================
-- ATENÇÃO: Este script cria novas tabelas. Não altera tabelas existentes.
-- Tabelas existentes (contracts, contratos) não são afetadas.
-- =============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABELA: adm_contratos
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.adm_contratos (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo              TEXT          NOT NULL,
  nome                TEXT          NOT NULL,
  cliente_nome        TEXT          NOT NULL,
  cliente_documento   TEXT,
  responsavel         TEXT,
  valor_mensal        NUMERIC(15,2),
  data_inicio         DATE,
  data_fim            DATE,
  status              TEXT          NOT NULL DEFAULT 'ativo'
                        CHECK (status IN ('ativo', 'suspenso', 'encerrado', 'em_negociacao')),
  observacoes         TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_adm_contratos_codigo ON public.adm_contratos (codigo);
CREATE INDEX IF NOT EXISTS idx_adm_contratos_status      ON public.adm_contratos (status);
CREATE INDEX IF NOT EXISTS idx_adm_contratos_cliente     ON public.adm_contratos (cliente_nome);
CREATE INDEX IF NOT EXISTS idx_adm_contratos_created     ON public.adm_contratos (created_at DESC);

-- Comentários
COMMENT ON TABLE  public.adm_contratos               IS 'Contratos do módulo Gestão ADM (Fase 1)';
COMMENT ON COLUMN public.adm_contratos.codigo        IS 'Código único do contrato. Ex: CTR-2025-001';
COMMENT ON COLUMN public.adm_contratos.status        IS 'ativo | suspenso | encerrado | em_negociacao';
COMMENT ON COLUMN public.adm_contratos.valor_mensal  IS 'Valor mensal contratado em reais';

-- =============================================================================
-- 2. TABELA: adm_contrato_financeiro
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.adm_contrato_financeiro (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id         UUID          NOT NULL
                        REFERENCES public.adm_contratos (id) ON DELETE CASCADE,
  periodo_referencia  TEXT          NOT NULL,  -- formato: 'YYYY-MM'
  receita             NUMERIC(15,2) NOT NULL DEFAULT 0,
  custo               NUMERIC(15,2) NOT NULL DEFAULT 0,
  lucro               NUMERIC(15,2) GENERATED ALWAYS AS (receita - custo) STORED,
  margem_percentual   NUMERIC(6,2)  GENERATED ALWAYS AS (
                        CASE WHEN receita > 0
                          THEN ROUND(((receita - custo) / receita) * 100, 2)
                          ELSE 0
                        END
                      ) STORED,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_adm_financeiro_contrato_periodo UNIQUE (contrato_id, periodo_referencia)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_adm_financeiro_contrato  ON public.adm_contrato_financeiro (contrato_id);
CREATE INDEX IF NOT EXISTS idx_adm_financeiro_periodo   ON public.adm_contrato_financeiro (periodo_referencia DESC);

-- Comentários
COMMENT ON TABLE  public.adm_contrato_financeiro                IS 'Dados financeiros mensais por contrato ADM';
COMMENT ON COLUMN public.adm_contrato_financeiro.periodo_referencia IS 'Mês de referência no formato YYYY-MM';
COMMENT ON COLUMN public.adm_contrato_financeiro.lucro          IS 'Calculado automaticamente: receita - custo';
COMMENT ON COLUMN public.adm_contrato_financeiro.margem_percentual IS 'Calculado automaticamente: (lucro / receita) * 100';

-- =============================================================================
-- 3. TABELA: adm_user_contracts
-- Controla quais contratos um usuário adm_contratos pode visualizar
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.adm_user_contracts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,  -- auth.users(id)
  contrato_id UUID        NOT NULL
                REFERENCES public.adm_contratos (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_adm_user_contracts UNIQUE (user_id, contrato_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_adm_user_contracts_user     ON public.adm_user_contracts (user_id);
CREATE INDEX IF NOT EXISTS idx_adm_user_contracts_contrato ON public.adm_user_contracts (contrato_id);

COMMENT ON TABLE public.adm_user_contracts IS 'Vínculo entre usuários adm_contratos e contratos permitidos';

-- =============================================================================
-- 4. TRIGGER: atualiza updated_at automaticamente
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  -- adm_contratos
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_adm_contratos_updated_at'
  ) THEN
    CREATE TRIGGER trg_adm_contratos_updated_at
      BEFORE UPDATE ON public.adm_contratos
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  -- adm_contrato_financeiro
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_adm_financeiro_updated_at'
  ) THEN
    CREATE TRIGGER trg_adm_financeiro_updated_at
      BEFORE UPDATE ON public.adm_contrato_financeiro
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS
ALTER TABLE public.adm_contratos           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adm_contrato_financeiro ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adm_user_contracts      ENABLE ROW LEVEL SECURITY;

-- Dropar policies existentes (idempotente)
DROP POLICY IF EXISTS "adm_contratos_select"     ON public.adm_contratos;
DROP POLICY IF EXISTS "adm_contratos_insert"     ON public.adm_contratos;
DROP POLICY IF EXISTS "adm_contratos_update"     ON public.adm_contratos;
DROP POLICY IF EXISTS "adm_contratos_delete"     ON public.adm_contratos;
DROP POLICY IF EXISTS "adm_financeiro_select"    ON public.adm_contrato_financeiro;
DROP POLICY IF EXISTS "adm_financeiro_insert"    ON public.adm_contrato_financeiro;
DROP POLICY IF EXISTS "adm_financeiro_update"    ON public.adm_contrato_financeiro;
DROP POLICY IF EXISTS "adm_financeiro_delete"    ON public.adm_contrato_financeiro;
DROP POLICY IF EXISTS "adm_user_contracts_select" ON public.adm_user_contracts;

-- ─── adm_contratos: políticas ────────────────────────────────────────────────

-- admin e diretor veem todos os contratos
CREATE POLICY "adm_contratos_select" ON public.adm_contratos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor')
    OR
    -- adm_contratos vê apenas contratos vinculados em adm_user_contracts
    (
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'adm_contratos'
      AND (
        -- Se não há vínculos configurados, vê todos (simplificação para Fase 1)
        NOT EXISTS (
          SELECT 1 FROM public.adm_user_contracts uc WHERE uc.user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM public.adm_user_contracts uc
          WHERE uc.user_id = auth.uid() AND uc.contrato_id = id
        )
      )
    )
  );

CREATE POLICY "adm_contratos_insert" ON public.adm_contratos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_contratos_update" ON public.adm_contratos
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_contratos_delete" ON public.adm_contratos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor')
  );

-- ─── adm_contrato_financeiro: políticas ──────────────────────────────────────

CREATE POLICY "adm_financeiro_select" ON public.adm_contrato_financeiro
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.adm_contratos c
      WHERE c.id = contrato_id
    )
    AND (
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor', 'adm_contratos')
    )
  );

CREATE POLICY "adm_financeiro_insert" ON public.adm_contrato_financeiro
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_financeiro_update" ON public.adm_contrato_financeiro
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_financeiro_delete" ON public.adm_contrato_financeiro
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor', 'adm_contratos')
  );

-- ─── adm_user_contracts: políticas ───────────────────────────────────────────

CREATE POLICY "adm_user_contracts_select" ON public.adm_user_contracts
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor')
    OR user_id = auth.uid()
  );

-- =============================================================================
-- 6. GRANTS
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_contratos           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_contrato_financeiro TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_user_contracts      TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =============================================================================
-- FIM DA MIGRATION
-- Para aplicar: execute este script no SQL Editor do Supabase ou via psql.
-- Para criar um usuário adm_contratos no Supabase:
--   UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "adm_contratos"}'
--   WHERE email = 'email_do_usuario@empresa.com';
-- =============================================================================

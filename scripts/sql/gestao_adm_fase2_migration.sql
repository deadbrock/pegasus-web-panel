-- =============================================================================
-- PEGASUS — Gestão ADM: Fase 2
-- Migration: reajustes, histórico e manutenção de contratos
-- Data: 2026-04-22
-- Dependência: gestao_adm_migration.sql (Fase 1) deve ter sido executado antes
-- =============================================================================

-- =============================================================================
-- 1. TABELA: adm_reajustes
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.adm_reajustes (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id         UUID          NOT NULL
                        REFERENCES public.adm_contratos (id) ON DELETE CASCADE,
  tipo_reajuste       TEXT          NOT NULL DEFAULT 'manual'
                        CHECK (tipo_reajuste IN ('manual', 'indice', 'anual', 'extraordinario')),
  indice_referencia   TEXT,
  percentual          NUMERIC(7,4)  NOT NULL,
  valor_anterior      NUMERIC(15,2) NOT NULL,
  valor_novo          NUMERIC(15,2) NOT NULL,
  data_aplicacao      DATE          NOT NULL,
  observacoes         TEXT,
  created_by          UUID,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adm_reajustes_contrato  ON public.adm_reajustes (contrato_id);
CREATE INDEX IF NOT EXISTS idx_adm_reajustes_data      ON public.adm_reajustes (data_aplicacao DESC);

COMMENT ON TABLE  public.adm_reajustes                  IS 'Histórico de reajustes aplicados a contratos ADM';
COMMENT ON COLUMN public.adm_reajustes.percentual       IS 'Percentual aplicado. Negativo = redução';
COMMENT ON COLUMN public.adm_reajustes.valor_anterior   IS 'Valor mensal antes do reajuste';
COMMENT ON COLUMN public.adm_reajustes.valor_novo       IS 'Valor mensal após o reajuste';

-- =============================================================================
-- 2. TABELA: adm_historico_contrato
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.adm_historico_contrato (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id     UUID        NOT NULL
                    REFERENCES public.adm_contratos (id) ON DELETE CASCADE,
  tipo_evento     TEXT        NOT NULL
                    CHECK (tipo_evento IN (
                      'contrato_criado', 'contrato_editado', 'status_alterado',
                      'reajuste_aplicado', 'financeiro_atualizado',
                      'manutencao_criada', 'manutencao_concluida', 'manutencao_editada'
                    )),
  titulo          TEXT        NOT NULL,
  descricao       TEXT,
  metadata_json   JSONB,
  usuario_id      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adm_historico_contrato  ON public.adm_historico_contrato (contrato_id);
CREATE INDEX IF NOT EXISTS idx_adm_historico_created   ON public.adm_historico_contrato (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_adm_historico_tipo      ON public.adm_historico_contrato (tipo_evento);

COMMENT ON TABLE public.adm_historico_contrato IS 'Timeline de eventos e auditoria do contrato ADM';

-- =============================================================================
-- 3. TABELA: adm_manutencao_contrato
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.adm_manutencao_contrato (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id     UUID        NOT NULL
                    REFERENCES public.adm_contratos (id) ON DELETE CASCADE,
  tipo            TEXT        NOT NULL DEFAULT 'ocorrencia'
                    CHECK (tipo IN ('ocorrencia', 'manutencao', 'revisao', 'reclamacao', 'solicitacao')),
  titulo          TEXT        NOT NULL,
  descricao       TEXT,
  prioridade      TEXT        NOT NULL DEFAULT 'media'
                    CHECK (prioridade IN ('baixa', 'media', 'alta', 'critica')),
  status          TEXT        NOT NULL DEFAULT 'aberta'
                    CHECK (status IN ('aberta', 'em_andamento', 'concluida', 'cancelada')),
  data_registro   DATE        NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao  DATE,
  responsavel     TEXT,
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_data_conclusao CHECK (
    data_conclusao IS NULL OR data_conclusao >= data_registro
  )
);

CREATE INDEX IF NOT EXISTS idx_adm_manutencao_contrato   ON public.adm_manutencao_contrato (contrato_id);
CREATE INDEX IF NOT EXISTS idx_adm_manutencao_status     ON public.adm_manutencao_contrato (status);
CREATE INDEX IF NOT EXISTS idx_adm_manutencao_prioridade ON public.adm_manutencao_contrato (prioridade);
CREATE INDEX IF NOT EXISTS idx_adm_manutencao_created    ON public.adm_manutencao_contrato (created_at DESC);

COMMENT ON TABLE public.adm_manutencao_contrato IS 'Ocorrências e manutenções administrativas vinculadas a contratos';

-- =============================================================================
-- 4. TRIGGERS: updated_at automático
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_adm_reajustes_updated_at') THEN
    CREATE TRIGGER trg_adm_reajustes_updated_at
      BEFORE UPDATE ON public.adm_reajustes
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_adm_manutencao_updated_at') THEN
    CREATE TRIGGER trg_adm_manutencao_updated_at
      BEFORE UPDATE ON public.adm_manutencao_contrato
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;

-- =============================================================================
-- 5. ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE public.adm_reajustes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adm_historico_contrato  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adm_manutencao_contrato ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas (idempotente)
DROP POLICY IF EXISTS "adm_reajustes_select"      ON public.adm_reajustes;
DROP POLICY IF EXISTS "adm_reajustes_insert"      ON public.adm_reajustes;
DROP POLICY IF EXISTS "adm_reajustes_update"      ON public.adm_reajustes;
DROP POLICY IF EXISTS "adm_reajustes_delete"      ON public.adm_reajustes;
DROP POLICY IF EXISTS "adm_historico_select"      ON public.adm_historico_contrato;
DROP POLICY IF EXISTS "adm_historico_insert"      ON public.adm_historico_contrato;
DROP POLICY IF EXISTS "adm_historico_delete"      ON public.adm_historico_contrato;
DROP POLICY IF EXISTS "adm_manutencao_select"     ON public.adm_manutencao_contrato;
DROP POLICY IF EXISTS "adm_manutencao_insert"     ON public.adm_manutencao_contrato;
DROP POLICY IF EXISTS "adm_manutencao_update"     ON public.adm_manutencao_contrato;
DROP POLICY IF EXISTS "adm_manutencao_delete"     ON public.adm_manutencao_contrato;

-- ─── adm_reajustes ───────────────────────────────────────────────────────────
CREATE POLICY "adm_reajustes_select" ON public.adm_reajustes
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_reajustes_insert" ON public.adm_reajustes
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_reajustes_update" ON public.adm_reajustes
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_reajustes_delete" ON public.adm_reajustes
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor')
  );

-- ─── adm_historico_contrato ─────────────────────────────────────────────────
-- Histórico: todos os roles ADM podem ler; qualquer autenticado pode inserir;
-- apenas admin/diretor podem deletar (integridade do log)
CREATE POLICY "adm_historico_select" ON public.adm_historico_contrato
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_historico_insert" ON public.adm_historico_contrato
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_historico_delete" ON public.adm_historico_contrato
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor')
  );

-- ─── adm_manutencao_contrato ─────────────────────────────────────────────────
CREATE POLICY "adm_manutencao_select" ON public.adm_manutencao_contrato
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_manutencao_insert" ON public.adm_manutencao_contrato
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_manutencao_update" ON public.adm_manutencao_contrato
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "adm_manutencao_delete" ON public.adm_manutencao_contrato
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

-- =============================================================================
-- 6. GRANTS
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_reajustes           TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_historico_contrato  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_manutencao_contrato TO authenticated;

-- =============================================================================
-- FIM DA MIGRATION FASE 2
-- Execute este script APÓS gestao_adm_migration.sql (Fase 1).
-- =============================================================================

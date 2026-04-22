-- ============================================================
-- Gestão ADM — FASE 3: Migration SQL (Estrutural/Opcional)
-- ============================================================
-- Os alertas e insights da Fase 3 são gerados client-side por
-- regras determinísticas (sem persistência). Este script cria
-- uma tabela opcional para persistir snapshots de alertas
-- gerados, caso seja necessário para relatórios, auditoria ou
-- evolução futura com IA.
--
-- EXECUTE APENAS SE quiser persistir alertas no banco.
-- Não é obrigatório para o funcionamento da Fase 3.
-- ============================================================

-- ── Tabela: alertas_contrato ──────────────────────────────────────────────────
-- Armazena snapshots de alertas gerados, com suporte a resolução manual.

CREATE TABLE IF NOT EXISTS alertas_contrato (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id   UUID NOT NULL REFERENCES adm_contratos(id) ON DELETE CASCADE,
  tipo_alerta   TEXT NOT NULL,        -- ex: 'vencimento_proximo', 'margem_baixa'
  severidade    TEXT NOT NULL         -- 'info' | 'media' | 'alta' | 'critica'
    CHECK (severidade IN ('info', 'media', 'alta', 'critica')),
  titulo        TEXT NOT NULL,
  descricao     TEXT,
  acao          TEXT,                 -- sugestão de ação para o gestor
  status        TEXT NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'resolvido', 'ignorado')),
  resolved_at   TIMESTAMPTZ,
  resolved_by   UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE alertas_contrato IS
  'Fase 3: Snapshots de alertas gerados para contratos. Opcional — os alertas também são calculados client-side em tempo real.';

COMMENT ON COLUMN alertas_contrato.tipo_alerta IS
  'Tipo do alerta: vencimento_critico, vencimento_proximo, contrato_vencido, prejuizo, margem_baixa, custo_crescente, sem_dados_financeiros, sem_movimentacao, alta_incidencia_ocorrencias, reajuste_pendente';

COMMENT ON COLUMN alertas_contrato.severidade IS
  'Severidade: info, media, alta, critica';

COMMENT ON COLUMN alertas_contrato.status IS
  'Status do alerta: ativo, resolvido, ignorado';

-- ── Tabela: saude_contrato_snapshot ──────────────────────────────────────────
-- Armazena snapshots do score de saúde por data, permitindo análise histórica
-- da evolução da saúde dos contratos.

CREATE TABLE IF NOT EXISTS saude_contrato_snapshot (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id   UUID NOT NULL REFERENCES adm_contratos(id) ON DELETE CASCADE,
  score         INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  status_saude  TEXT NOT NULL
    CHECK (status_saude IN ('saudavel', 'atencao', 'critico')),
  total_alertas       INTEGER NOT NULL DEFAULT 0,
  alertas_criticos    INTEGER NOT NULL DEFAULT 0,
  alertas_altos       INTEGER NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE saude_contrato_snapshot IS
  'Fase 3: Histórico de scores de saúde por contrato. Útil para dashboards executivos e tendências.';

CREATE UNIQUE INDEX IF NOT EXISTS saude_snapshot_contrato_data
  ON saude_contrato_snapshot(contrato_id, snapshot_date);

-- ── Índices ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_alertas_contrato_contrato_id
  ON alertas_contrato(contrato_id);

CREATE INDEX IF NOT EXISTS idx_alertas_contrato_status
  ON alertas_contrato(status);

CREATE INDEX IF NOT EXISTS idx_alertas_contrato_severidade
  ON alertas_contrato(severidade);

CREATE INDEX IF NOT EXISTS idx_alertas_contrato_created_at
  ON alertas_contrato(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saude_snapshot_contrato_id
  ON saude_contrato_snapshot(contrato_id);

-- ── Trigger: updated_at ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_alertas_contrato_updated_at ON alertas_contrato;
CREATE TRIGGER trg_alertas_contrato_updated_at
  BEFORE UPDATE ON alertas_contrato
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── RLS: alertas_contrato ─────────────────────────────────────────────────────

ALTER TABLE alertas_contrato ENABLE ROW LEVEL SECURITY;

-- Admin e diretor: acesso total
CREATE POLICY "alertas_select_admin" ON alertas_contrato
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'diretor')
  );

CREATE POLICY "alertas_insert_admin" ON alertas_contrato
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'diretor')
  );

CREATE POLICY "alertas_update_admin" ON alertas_contrato
  FOR UPDATE USING (
    auth.jwt() ->> 'role' IN ('admin', 'diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'diretor')
  );

-- adm_contratos: leitura dos alertas dos seus contratos
CREATE POLICY "alertas_select_adm_contratos" ON alertas_contrato
  FOR SELECT USING (
    (auth.jwt() ->> 'role' = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts
      WHERE user_id = auth.uid()
    )
  );

-- ── RLS: saude_contrato_snapshot ──────────────────────────────────────────────

ALTER TABLE saude_contrato_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saude_snapshot_select_admin" ON saude_contrato_snapshot
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'diretor')
  );

CREATE POLICY "saude_snapshot_insert_admin" ON saude_contrato_snapshot
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'diretor')
  );

CREATE POLICY "saude_snapshot_select_adm" ON saude_contrato_snapshot
  FOR SELECT USING (
    (auth.jwt() ->> 'role' = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts
      WHERE user_id = auth.uid()
    )
  );

-- ── Exemplo: View de alertas ativos por contrato ──────────────────────────────
-- View opcional para uso em relatórios futuros ou dashboards externos.

CREATE OR REPLACE VIEW vw_alertas_ativos AS
SELECT
  a.*,
  c.nome       AS contrato_nome,
  c.codigo     AS contrato_codigo,
  c.cliente_nome,
  c.status     AS contrato_status
FROM alertas_contrato a
JOIN adm_contratos c ON c.id = a.contrato_id
WHERE a.status = 'ativo'
ORDER BY
  CASE a.severidade
    WHEN 'critica' THEN 1
    WHEN 'alta'    THEN 2
    WHEN 'media'   THEN 3
    ELSE 4
  END,
  a.created_at DESC;

COMMENT ON VIEW vw_alertas_ativos IS
  'Fase 3: View consolidada de alertas ativos com dados do contrato.';

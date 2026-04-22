-- ============================================================
-- Gestão ADM — FASE 4: Cadastro Detalhado de Contratos
-- ============================================================
-- 1. Novas colunas em adm_contratos (cliente, endereço, aprovação)
-- 2. Tabela adm_contrato_custos  (estrutura de custos do contrato)
-- 3. Tabela adm_contrato_anexos  (documentos anexados ao contrato)
-- ============================================================

-- ─── 1. Novas colunas em adm_contratos ───────────────────────────────────────

ALTER TABLE adm_contratos
  ADD COLUMN IF NOT EXISTS cliente_email       TEXT,
  ADD COLUMN IF NOT EXISTS cliente_telefone    TEXT,
  ADD COLUMN IF NOT EXISTS cliente_contato     TEXT,   -- nome do contato/interlocutor
  ADD COLUMN IF NOT EXISTS aprovado_por        TEXT,
  ADD COLUMN IF NOT EXISTS data_aprovacao      DATE,
  ADD COLUMN IF NOT EXISTS cliente_cep         TEXT,
  ADD COLUMN IF NOT EXISTS cliente_endereco    TEXT,
  ADD COLUMN IF NOT EXISTS cliente_numero      TEXT,
  ADD COLUMN IF NOT EXISTS cliente_complemento TEXT,
  ADD COLUMN IF NOT EXISTS cliente_bairro      TEXT,
  ADD COLUMN IF NOT EXISTS cliente_cidade      TEXT,
  ADD COLUMN IF NOT EXISTS cliente_uf          CHAR(2);

COMMENT ON COLUMN adm_contratos.cliente_email       IS 'E-mail do cliente';
COMMENT ON COLUMN adm_contratos.cliente_telefone    IS 'Telefone/WhatsApp do cliente';
COMMENT ON COLUMN adm_contratos.cliente_contato     IS 'Nome do interlocutor/contato no cliente';
COMMENT ON COLUMN adm_contratos.aprovado_por        IS 'Nome de quem aprovou o contrato internamente';
COMMENT ON COLUMN adm_contratos.data_aprovacao      IS 'Data em que o contrato foi aprovado';
COMMENT ON COLUMN adm_contratos.cliente_cep         IS 'CEP do endereço do cliente';
COMMENT ON COLUMN adm_contratos.cliente_endereco    IS 'Logradouro do cliente';
COMMENT ON COLUMN adm_contratos.cliente_numero      IS 'Número do endereço';
COMMENT ON COLUMN adm_contratos.cliente_complemento IS 'Complemento do endereço';
COMMENT ON COLUMN adm_contratos.cliente_bairro      IS 'Bairro do cliente';
COMMENT ON COLUMN adm_contratos.cliente_cidade      IS 'Cidade do cliente';
COMMENT ON COLUMN adm_contratos.cliente_uf          IS 'UF (sigla) do estado do cliente';

-- ─── 2. Tabela: adm_contrato_custos ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS adm_contrato_custos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id     UUID NOT NULL REFERENCES adm_contratos(id) ON DELETE CASCADE,

  tipo_custo      TEXT NOT NULL
    CHECK (tipo_custo IN (
      'mao_de_obra','materiais','terceiros','equipamentos',
      'administrativo','tecnologia','licencas','logistica','outro'
    )),

  descricao       TEXT NOT NULL,
  valor           NUMERIC(12,2) NOT NULL CHECK (valor >= 0),

  periodicidade   TEXT NOT NULL DEFAULT 'mensal'
    CHECK (periodicidade IN ('mensal','trimestral','semestral','anual','unico')),

  observacoes     TEXT,
  ativo           BOOLEAN NOT NULL DEFAULT TRUE,

  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE adm_contrato_custos IS
  'Fase 4: Estrutura de custos para manter um contrato (mão de obra, materiais, terceiros, etc.)';
COMMENT ON COLUMN adm_contrato_custos.periodicidade IS
  'Frequência do custo: mensal, trimestral, semestral, anual ou único';
COMMENT ON COLUMN adm_contrato_custos.ativo IS
  'Custo ativo/inativo — permite desativar sem excluir';

CREATE INDEX IF NOT EXISTS idx_contrato_custos_contrato_id
  ON adm_contrato_custos(contrato_id);

CREATE INDEX IF NOT EXISTS idx_contrato_custos_tipo
  ON adm_contrato_custos(tipo_custo);

-- Trigger updated_at
DROP TRIGGER IF EXISTS trg_contrato_custos_updated_at ON adm_contrato_custos;
CREATE TRIGGER trg_contrato_custos_updated_at
  BEFORE UPDATE ON adm_contrato_custos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 3. Tabela: adm_contrato_anexos ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS adm_contrato_anexos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id     UUID NOT NULL REFERENCES adm_contratos(id) ON DELETE CASCADE,

  nome_arquivo    TEXT NOT NULL,
  tipo_arquivo    TEXT,                  -- MIME type (ex: 'application/pdf')
  tamanho_bytes   BIGINT,
  storage_path    TEXT NOT NULL,         -- path dentro do bucket Supabase Storage
  url_publica     TEXT,                  -- URL pública ou assinada para download

  descricao       TEXT,                  -- descrição/categoria do documento
  created_by      UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE adm_contrato_anexos IS
  'Fase 4: Documentos e arquivos anexados a contratos (PDFs, contratos digitalizados, etc.)';
COMMENT ON COLUMN adm_contrato_anexos.storage_path IS
  'Caminho do arquivo no bucket Supabase Storage: contratos-anexos/{contrato_id}/{uuid}-{nome}';

CREATE INDEX IF NOT EXISTS idx_contrato_anexos_contrato_id
  ON adm_contrato_anexos(contrato_id);

-- ─── RLS: adm_contrato_custos ─────────────────────────────────────────────────

ALTER TABLE adm_contrato_custos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custos_select_admin" ON adm_contrato_custos
  FOR SELECT USING (
    (auth.jwt() ->> 'role') IN ('admin','diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','diretor')
  );
CREATE POLICY "custos_all_admin" ON adm_contrato_custos
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin','diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','diretor')
  );
CREATE POLICY "custos_select_adm" ON adm_contrato_custos
  FOR SELECT USING (
    ((auth.jwt() ->> 'role') = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "custos_write_adm" ON adm_contrato_custos
  FOR ALL USING (
    ((auth.jwt() ->> 'role') = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts WHERE user_id = auth.uid()
    )
  );

-- ─── RLS: adm_contrato_anexos ────────────────────────────────────────────────

ALTER TABLE adm_contrato_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anexos_all_admin" ON adm_contrato_anexos
  FOR ALL USING (
    (auth.jwt() ->> 'role') IN ('admin','diretor')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','diretor')
  );
CREATE POLICY "anexos_select_adm" ON adm_contrato_anexos
  FOR SELECT USING (
    ((auth.jwt() ->> 'role') = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "anexos_write_adm" ON adm_contrato_anexos
  FOR INSERT WITH CHECK (
    ((auth.jwt() ->> 'role') = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts WHERE user_id = auth.uid()
    )
  );
CREATE POLICY "anexos_delete_adm" ON adm_contrato_anexos
  FOR DELETE USING (
    ((auth.jwt() ->> 'role') = 'adm_contratos'
     OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'adm_contratos')
    AND contrato_id IN (
      SELECT contrato_id FROM adm_user_contracts WHERE user_id = auth.uid()
    )
  );

-- ─── Supabase Storage: bucket contratos-anexos ───────────────────────────────
-- Execute este bloco separadamente no painel Supabase Storage OU via API:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('contratos-anexos', 'contratos-anexos', false);
--
-- CREATE POLICY "upload_adm" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'contratos-anexos'
--     AND auth.role() IN ('authenticated'));
--
-- CREATE POLICY "read_adm" ON storage.objects FOR SELECT
--   USING (bucket_id = 'contratos-anexos'
--     AND auth.role() IN ('authenticated'));
--
-- CREATE POLICY "delete_adm" ON storage.objects FOR DELETE
--   USING (bucket_id = 'contratos-anexos'
--     AND auth.role() IN ('authenticated'));

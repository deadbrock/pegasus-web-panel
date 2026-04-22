-- ============================================================
-- CORREÇÃO RLS — Fase 4 (adm_contrato_custos + adm_contrato_anexos)
-- ============================================================
-- Execute este script APÓS gestao_adm_fase4_migration.sql
-- Ele remove as políticas com padrão incorreto e recria com
-- o mesmo padrão das tabelas que já funcionam (Fase 1).
-- ============================================================

-- ─── Remover políticas antigas (padrão incorreto) ─────────────────────────────

DROP POLICY IF EXISTS "custos_select_admin"  ON adm_contrato_custos;
DROP POLICY IF EXISTS "custos_all_admin"     ON adm_contrato_custos;
DROP POLICY IF EXISTS "custos_select_adm"    ON adm_contrato_custos;
DROP POLICY IF EXISTS "custos_write_adm"     ON adm_contrato_custos;

DROP POLICY IF EXISTS "anexos_all_admin"     ON adm_contrato_anexos;
DROP POLICY IF EXISTS "anexos_select_adm"    ON adm_contrato_anexos;
DROP POLICY IF EXISTS "anexos_write_adm"     ON adm_contrato_anexos;
DROP POLICY IF EXISTS "anexos_delete_adm"    ON adm_contrato_anexos;

-- ─── adm_contrato_custos: políticas corretas ──────────────────────────────────

CREATE POLICY "custos_select" ON adm_contrato_custos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "custos_insert" ON adm_contrato_custos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "custos_update" ON adm_contrato_custos
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "custos_delete" ON adm_contrato_custos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

-- ─── adm_contrato_anexos: políticas corretas ──────────────────────────────────

CREATE POLICY "anexos_select" ON adm_contrato_anexos
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "anexos_insert" ON adm_contrato_anexos
  FOR INSERT TO authenticated
  WITH CHECK (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "anexos_update" ON adm_contrato_anexos
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

CREATE POLICY "anexos_delete" ON adm_contrato_anexos
  FOR DELETE TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
      IN ('admin', 'diretor', 'adm_contratos')
  );

-- ─── Grants ───────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON adm_contrato_custos  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON adm_contrato_anexos  TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ─── Verificação ──────────────────────────────────────────────────────────────
-- Após executar, valide com:
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies
-- WHERE tablename IN ('adm_contrato_custos', 'adm_contrato_anexos')
-- ORDER BY tablename, cmd;

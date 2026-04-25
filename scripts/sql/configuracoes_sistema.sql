-- ============================================================
-- MÓDULO CONFIGURAÇÕES — Configurações globais e permissões
-- ============================================================
-- Execute este script no SQL Editor do Supabase.
-- Todos os perfis autenticados podem ler configurações.
-- Apenas admin pode alterar permissões globais de exclusão.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.app_settings_touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.app_settings_touch_updated_at();

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role',
    auth.jwt() ->> 'role'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_delete_data()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.current_user_role() = 'admin'
    OR EXISTS (
      SELECT 1
      FROM public.app_settings s,
           jsonb_array_elements_text(COALESCE(s.value -> 'allowed_roles', '[]'::jsonb)) AS role_name
      WHERE s.key = 'delete_permissions'
        AND role_name = public.current_user_role()
    );
$$;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_settings_select" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_insert_admin" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_update_admin" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_delete_admin" ON public.app_settings;

CREATE POLICY "app_settings_select" ON public.app_settings
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "app_settings_insert_admin" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "app_settings_update_admin" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (public.current_user_role() = 'admin')
  WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY "app_settings_delete_admin" ON public.app_settings
  FOR DELETE TO authenticated
  USING (public.current_user_role() = 'admin');

INSERT INTO public.app_settings (key, value, description)
VALUES (
  'delete_permissions',
  '{"allowed_roles":["admin"]}'::jsonb,
  'Perfis autorizados a excluir dados no sistema.'
)
ON CONFLICT (key) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_delete_data() TO authenticated;

-- ============================================================
-- Políticas de exclusão do módulo Gestão ADM
-- ============================================================
-- Estas políticas passam a consultar public.can_delete_data().
-- Se você permitir "adm_contratos" na tela de configurações, por
-- exemplo, esse perfil também poderá excluir nestas tabelas.
-- ============================================================

DO $$
BEGIN
  IF to_regclass('public.adm_contratos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "adm_contratos_delete" ON public.adm_contratos;
    CREATE POLICY "adm_contratos_delete" ON public.adm_contratos
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_contrato_financeiro') IS NOT NULL THEN
    DROP POLICY IF EXISTS "adm_financeiro_delete" ON public.adm_contrato_financeiro;
    CREATE POLICY "adm_financeiro_delete" ON public.adm_contrato_financeiro
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_reajustes') IS NOT NULL THEN
    DROP POLICY IF EXISTS "adm_reajustes_delete" ON public.adm_reajustes;
    CREATE POLICY "adm_reajustes_delete" ON public.adm_reajustes
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_historico_contrato') IS NOT NULL THEN
    DROP POLICY IF EXISTS "adm_historico_delete" ON public.adm_historico_contrato;
    CREATE POLICY "adm_historico_delete" ON public.adm_historico_contrato
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_manutencao_contrato') IS NOT NULL THEN
    DROP POLICY IF EXISTS "adm_manutencao_delete" ON public.adm_manutencao_contrato;
    CREATE POLICY "adm_manutencao_delete" ON public.adm_manutencao_contrato
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_contrato_custos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "custos_delete" ON public.adm_contrato_custos;
    CREATE POLICY "custos_delete" ON public.adm_contrato_custos
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_contrato_anexos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "anexos_delete" ON public.adm_contrato_anexos;
    CREATE POLICY "anexos_delete" ON public.adm_contrato_anexos
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_contrato_aditivos') IS NOT NULL THEN
    DROP POLICY IF EXISTS "aditivos_delete" ON public.adm_contrato_aditivos;
    CREATE POLICY "aditivos_delete" ON public.adm_contrato_aditivos
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;

  IF to_regclass('public.adm_tipos_servico') IS NOT NULL THEN
    DROP POLICY IF EXISTS "tipos_servico_delete" ON public.adm_tipos_servico;
    CREATE POLICY "tipos_servico_delete" ON public.adm_tipos_servico
      FOR DELETE TO authenticated
      USING (public.can_delete_data());
  END IF;
END $$;

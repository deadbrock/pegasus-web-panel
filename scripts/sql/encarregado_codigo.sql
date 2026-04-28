-- ============================================================
-- encarregado_codigo.sql
-- Adiciona autenticação por código ao encarregado do portal,
-- seguindo a mesma lógica do supervisor (bcrypt hash).
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TABLE public.portal_encarregados
  ADD COLUMN IF NOT EXISTS codigo_hash TEXT;

DO $$
BEGIN
  RAISE NOTICE 'encarregado_codigo.sql executado com sucesso!';
  RAISE NOTICE 'Coluna codigo_hash adicionada em portal_encarregados.';
  RAISE NOTICE 'Regenere o código de cada encarregado no módulo Supervisores para ativá-los.';
END$$;

-- ============================================================
-- GESTÃO ADM — Tipos de Serviço + Escopo do Aditivo
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Tabela de tipos de serviço (personalizável)
CREATE TABLE IF NOT EXISTS public.adm_tipos_servico (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT        NOT NULL,
  descricao   TEXT,
  ativo       BOOLEAN     NOT NULL DEFAULT true,
  created_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (nome)
);

-- Tipos padrão
INSERT INTO public.adm_tipos_servico (nome, descricao) VALUES
  ('ASG',        'Auxiliar de Serviços Gerais — limpeza e conservação'),
  ('Copeiragem', 'Serviços de Copeiragem — copa e recepção'),
  ('VIGIA',      'Serviço de Vigilância — portaria e segurança patrimonial')
ON CONFLICT (nome) DO NOTHING;

-- RLS
ALTER TABLE public.adm_tipos_servico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tipos_servico_select" ON public.adm_tipos_servico;
DROP POLICY IF EXISTS "tipos_servico_insert" ON public.adm_tipos_servico;
DROP POLICY IF EXISTS "tipos_servico_update" ON public.adm_tipos_servico;
DROP POLICY IF EXISTS "tipos_servico_delete" ON public.adm_tipos_servico;

CREATE POLICY "tipos_servico_select" ON public.adm_tipos_servico
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin','diretor','adm_contratos'));

CREATE POLICY "tipos_servico_insert" ON public.adm_tipos_servico
  FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin','diretor','adm_contratos'));

CREATE POLICY "tipos_servico_update" ON public.adm_tipos_servico
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin','diretor'))
  WITH CHECK ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin','diretor'));

CREATE POLICY "tipos_servico_delete" ON public.adm_tipos_servico
  FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin','diretor'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.adm_tipos_servico TO authenticated;

-- ============================================================
-- 2. Expandir adm_contrato_aditivos com campos de escopo
-- ============================================================

ALTER TABLE public.adm_contrato_aditivos
  ADD COLUMN IF NOT EXISTS tipo_servico_id    UUID        REFERENCES public.adm_tipos_servico(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tipo_servico_nome  TEXT,                      -- cache do nome (caso o tipo seja excluído)
  ADD COLUMN IF NOT EXISTS escopo_descricao   TEXT,                      -- descrição detalhada do escopo
  ADD COLUMN IF NOT EXISTS valor_materiais    NUMERIC(12,2),             -- custo de materiais/insumos
  ADD COLUMN IF NOT EXISTS per_capita         NUMERIC(10,2),             -- custo per capita por funcionário
  ADD COLUMN IF NOT EXISTS valor_mensal_total NUMERIC(12,2),             -- valor mensal total deste aditivo
  ADD COLUMN IF NOT EXISTS quadro_funcionarios JSONB DEFAULT '[]'::jsonb; -- [{funcao, quantidade, valor_unitario, turno}]

-- Índice para busca por tipo de serviço
CREATE INDEX IF NOT EXISTS idx_aditivos_tipo_servico
  ON public.adm_contrato_aditivos (tipo_servico_id);

-- ============================================================
-- Verificação
-- ============================================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'adm_contrato_aditivos'
ORDER BY ordinal_position;

SELECT id, nome, descricao FROM public.adm_tipos_servico ORDER BY nome;

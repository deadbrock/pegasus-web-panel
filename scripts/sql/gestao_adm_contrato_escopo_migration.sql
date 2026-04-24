-- ============================================================
-- GESTÃO ADM — Escopo inicial do contrato
-- Adiciona campos de escopo/serviço diretamente em adm_contratos
-- Execute no SQL Editor do Supabase
-- ============================================================

ALTER TABLE public.adm_contratos
  ADD COLUMN IF NOT EXISTS tipo_servico_id      UUID        REFERENCES public.adm_tipos_servico(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tipo_servico_nome     TEXT,
  ADD COLUMN IF NOT EXISTS escopo_descricao      TEXT,
  ADD COLUMN IF NOT EXISTS valor_materiais       NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS per_capita            NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS valor_mensal_escopo   NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS quadro_funcionarios   JSONB DEFAULT '[]'::jsonb;

-- Índice para busca por tipo de serviço
CREATE INDEX IF NOT EXISTS idx_contratos_tipo_servico
  ON public.adm_contratos (tipo_servico_id);

-- Verificação
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'adm_contratos'
  AND column_name IN (
    'tipo_servico_id','tipo_servico_nome','escopo_descricao',
    'valor_materiais','per_capita','valor_mensal_escopo','quadro_funcionarios'
  )
ORDER BY ordinal_position;

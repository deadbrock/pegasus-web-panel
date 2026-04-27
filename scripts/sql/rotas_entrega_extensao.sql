-- ============================================================
-- ROTAS DE ENTREGA — Extensão completa
-- Execute no SQL Editor do Supabase
-- ============================================================
-- Cria a tabela se não existir e adiciona todos os campos
-- necessários para o fluxo de criação de rotas vinculadas
-- a pedidos de supervisores.
-- ============================================================

-- ── 1. Criar tabela base (se ainda não existir) ───────────

CREATE TABLE IF NOT EXISTS public.rotas_entrega (
  id                     UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id              UUID        NOT NULL REFERENCES public.pedidos_supervisores(id) ON DELETE CASCADE,
  numero_rota            TEXT        NOT NULL,
  data_criacao           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_prevista_entrega  TIMESTAMPTZ,

  -- Endereço de entrega (destino)
  endereco_completo      TEXT        NOT NULL DEFAULT '',
  endereco_numero        TEXT,
  endereco_complemento   TEXT,
  endereco_bairro        TEXT,
  endereco_cidade        TEXT        NOT NULL DEFAULT '',
  endereco_estado        TEXT        NOT NULL DEFAULT '',
  endereco_cep           TEXT,
  latitude               NUMERIC(10,7),
  longitude              NUMERIC(10,7),

  -- Atribuição
  motorista_id           UUID        REFERENCES public.motoristas(id)  ON DELETE SET NULL,
  veiculo_id             UUID        REFERENCES public.veiculos(id)     ON DELETE SET NULL,
  data_atribuicao        TIMESTAMPTZ,
  atribuido_por          TEXT,

  -- Status e timeline
  status                 TEXT        NOT NULL DEFAULT 'Aguardando Atribuição'
    CHECK (status IN (
      'Aguardando Atribuição','Atribuída','Em Rota','Entregue','Cancelada','Atrasada'
    )),
  data_inicio_rota       TIMESTAMPTZ,
  data_entrega           TIMESTAMPTZ,

  prioridade             TEXT        NOT NULL DEFAULT 'Normal'
    CHECK (prioridade IN ('Baixa','Normal','Alta','Urgente')),
  observacoes            TEXT,

  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Adicionar colunas novas (ignora se já existirem) ───

ALTER TABLE public.rotas_entrega
  ADD COLUMN IF NOT EXISTS ponto_partida       TEXT,
  ADD COLUMN IF NOT EXISTS paradas             JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS destinatario_nome   TEXT,
  ADD COLUMN IF NOT EXISTS destinatario_tel    TEXT,
  ADD COLUMN IF NOT EXISTS destinatario_doc    TEXT,
  ADD COLUMN IF NOT EXISTS distancia_est_km    NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS tempo_est_min       INTEGER;

-- ── 3. Índices ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_rotas_pedido_id   ON public.rotas_entrega(pedido_id);
CREATE INDEX IF NOT EXISTS idx_rotas_status      ON public.rotas_entrega(status);
CREATE INDEX IF NOT EXISTS idx_rotas_motorista   ON public.rotas_entrega(motorista_id);
CREATE INDEX IF NOT EXISTS idx_rotas_veiculo     ON public.rotas_entrega(veiculo_id);

-- ── 4. RLS ─────────────────────────────────────────────────

ALTER TABLE public.rotas_entrega ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rotas_entrega' AND policyname = 're_select'
  ) THEN
    CREATE POLICY "re_select" ON public.rotas_entrega
      FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rotas_entrega' AND policyname = 're_insert'
  ) THEN
    CREATE POLICY "re_insert" ON public.rotas_entrega
      FOR INSERT TO authenticated WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rotas_entrega' AND policyname = 're_update'
  ) THEN
    CREATE POLICY "re_update" ON public.rotas_entrega
      FOR UPDATE TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'rotas_entrega' AND policyname = 're_delete'
  ) THEN
    CREATE POLICY "re_delete" ON public.rotas_entrega
      FOR DELETE TO authenticated USING (true);
  END IF;
END$$;

-- ── 5. Trigger updated_at ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.rotas_entrega_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rotas_entrega_updated_at ON public.rotas_entrega;
CREATE TRIGGER trg_rotas_entrega_updated_at
  BEFORE UPDATE ON public.rotas_entrega
  FOR EACH ROW EXECUTE FUNCTION public.rotas_entrega_updated_at();

-- ── Validação ──────────────────────────────────────────────
DO $$
BEGIN
  RAISE NOTICE 'rotas_entrega_extensao.sql executado com sucesso!';
  RAISE NOTICE 'Tabela rotas_entrega pronta com: ponto_partida, paradas, destinatario, distancia.';
END$$;

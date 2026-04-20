-- ============================================================
-- TELEMETRIA: Jornadas GPS + Abastecimentos
-- Execute este script no Supabase SQL Editor
-- ============================================================

-- Tabela de jornadas (viagens registradas pelo GPS do motorista)
CREATE TABLE IF NOT EXISTS viagens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID,                         -- ID do usuário autenticado (motorista/supervisor)
  veiculo_id    UUID,                         -- FK opcional para veiculos
  veiculo_info  TEXT,                         -- Placa/modelo em texto livre (fallback)
  motorista_nome TEXT,                        -- Nome para exibição
  data_inicio   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_fim      TIMESTAMPTZ,
  km_percorrido NUMERIC(10, 2) DEFAULT 0,     -- Calculado via Haversine no app
  status        TEXT NOT NULL DEFAULT 'ativa'
                  CHECK (status IN ('ativa', 'finalizada', 'cancelada')),
  observacoes   TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de abastecimentos (inserção manual)
CREATE TABLE IF NOT EXISTS abastecimentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id   UUID,
  veiculo_id      UUID,
  veiculo_info    TEXT,                       -- Placa/modelo em texto livre
  motorista_nome  TEXT,
  data            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  litros          NUMERIC(10, 3) NOT NULL,
  valor_total     NUMERIC(10, 2),
  valor_litro     NUMERIC(10, 4)
    GENERATED ALWAYS AS (
      CASE WHEN litros > 0 AND valor_total IS NOT NULL
           THEN ROUND(valor_total / litros, 4)
           ELSE NULL END
    ) STORED,
  km_atual        NUMERIC(10, 0),             -- Hodômetro no momento do abastecimento
  tipo_combustivel TEXT DEFAULT 'Diesel'
                    CHECK (tipo_combustivel IN ('Diesel', 'Gasolina', 'Etanol', 'GNV', 'Flex')),
  posto           TEXT,
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_viagens_supervisor  ON viagens (supervisor_id);
CREATE INDEX IF NOT EXISTS idx_viagens_veiculo     ON viagens (veiculo_id);
CREATE INDEX IF NOT EXISTS idx_viagens_status      ON viagens (status);
CREATE INDEX IF NOT EXISTS idx_viagens_data_inicio ON viagens (data_inicio DESC);

CREATE INDEX IF NOT EXISTS idx_abastec_supervisor ON abastecimentos (supervisor_id);
CREATE INDEX IF NOT EXISTS idx_abastec_veiculo    ON abastecimentos (veiculo_id);
CREATE INDEX IF NOT EXISTS idx_abastec_data       ON abastecimentos (data DESC);

-- RLS: habilitar e permitir acesso a usuários autenticados
ALTER TABLE viagens       ENABLE ROW LEVEL SECURITY;
ALTER TABLE abastecimentos ENABLE ROW LEVEL SECURITY;

-- Policies: cada usuário vê e edita apenas seus próprios registros
-- (ajuste para admins conforme necessário)
DROP POLICY IF EXISTS viagens_own ON viagens;
CREATE POLICY viagens_own ON viagens
  USING (supervisor_id = auth.uid())
  WITH CHECK (supervisor_id = auth.uid());

DROP POLICY IF EXISTS abastec_own ON abastecimentos;
CREATE POLICY abastec_own ON abastecimentos
  USING (supervisor_id = auth.uid())
  WITH CHECK (supervisor_id = auth.uid());

-- Policy adicional para admins (role service_role já tem acesso total)
-- Se quiser que o painel web (com service role) leia tudo, não precisa de policy extra.
-- Para que o painel web com anon/user key leia tudo, adicione:
DROP POLICY IF EXISTS viagens_read_all ON viagens;
CREATE POLICY viagens_read_all ON viagens FOR SELECT USING (true);

DROP POLICY IF EXISTS abastec_read_all ON abastecimentos;
CREATE POLICY abastec_read_all ON abastecimentos FOR SELECT USING (true);

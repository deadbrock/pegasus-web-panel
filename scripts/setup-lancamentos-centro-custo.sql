-- Lançamentos por Centro de Custo
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS lancamentos_centro_custo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  centro_custo_id UUID REFERENCES centros_custo(id) ON DELETE CASCADE,
  centro_custo_codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL CHECK (valor > 0),
  data DATE NOT NULL,
  categoria TEXT,
  forma_pagamento TEXT DEFAULT 'PIX',
  status_pagamento TEXT DEFAULT 'Pago',
  fornecedor TEXT,
  numero_documento TEXT,
  observacoes TEXT,
  criado_por TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_lancamentos_centro_custo_id ON lancamentos_centro_custo(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_data ON lancamentos_centro_custo(data);
CREATE INDEX IF NOT EXISTS idx_lancamentos_codigo ON lancamentos_centro_custo(centro_custo_codigo);

-- RLS
ALTER TABLE lancamentos_centro_custo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total para autenticados" ON lancamentos_centro_custo;
CREATE POLICY "Acesso total para autenticados"
  ON lancamentos_centro_custo FOR ALL
  USING (auth.role() = 'authenticated');

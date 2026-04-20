-- Tabela de Centros de Custo
-- Execute este script no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS centros_custo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'personalizado', -- 'predefinido' | 'personalizado'
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  cor_hex TEXT DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_centros_custo_updated_at ON centros_custo;
CREATE TRIGGER update_centros_custo_updated_at
  BEFORE UPDATE ON centros_custo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE centros_custo ENABLE ROW LEVEL SECURITY;

-- Políticas: acesso total para usuários autenticados
DROP POLICY IF EXISTS "Acesso total para autenticados" ON centros_custo;
CREATE POLICY "Acesso total para autenticados"
  ON centros_custo FOR ALL
  USING (auth.role() = 'authenticated');

-- Inserir centros de custo padrão
INSERT INTO centros_custo (nome, tipo, codigo, descricao, cor_hex) VALUES
  ('Sede', 'predefinido', 'SEDE', 'Custos administrativos da sede', '#3B82F6'),
  ('Veículos', 'predefinido', 'VEICULOS', 'Combustível, manutenção e seguro veicular', '#EF4444'),
  ('Filiais', 'predefinido', 'FILIAL', 'Custos das filiais', '#10B981'),
  ('Diárias', 'predefinido', 'DIARIAS', 'Pagamento de diárias para funcionários', '#F59E0B'),
  ('Máquinas e Equipamentos', 'predefinido', 'MAQUINAS', 'Manutenção e aquisição de máquinas', '#8B5CF6'),
  ('Contratos', 'predefinido', 'CONTRATOS', 'Pagamentos de contratos diversos', '#EC4899'),
  ('Seguros', 'predefinido', 'SEGUROS', 'Seguros diversos da empresa', '#14B8A6'),
  ('Telefonia', 'predefinido', 'TELEFONIA', 'Telefonia móvel e fixa', '#F97316'),
  ('Internet', 'predefinido', 'INTERNET', 'Links de internet e conectividade', '#06B6D4')
ON CONFLICT (codigo) DO NOTHING;

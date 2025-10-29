-- =====================================================
-- CONTRATOS DOS SUPERVISORES
-- Cada supervisor gerencia múltiplos contratos/clientes
-- Os pedidos são vinculados a um contrato específico
-- =====================================================

-- 1. Criar tabela de contratos dos supervisores
CREATE TABLE IF NOT EXISTS public.contratos_supervisores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID NOT NULL,
  nome_contrato TEXT NOT NULL,
  endereco_completo TEXT NOT NULL,
  endereco_numero TEXT,
  endereco_complemento TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT,
  endereco_estado TEXT,
  endereco_cep TEXT,
  encarregado_nome TEXT,
  encarregado_telefone TEXT,
  encarregado_email TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS contratos_supervisores_supervisor_idx 
  ON public.contratos_supervisores(supervisor_id);

CREATE INDEX IF NOT EXISTS contratos_supervisores_ativo_idx 
  ON public.contratos_supervisores(ativo) WHERE ativo = true;

-- 3. Adicionar campos de contrato na tabela de pedidos
ALTER TABLE public.pedidos_supervisores
  ADD COLUMN IF NOT EXISTS contrato_id UUID REFERENCES public.contratos_supervisores(id),
  ADD COLUMN IF NOT EXISTS contrato_nome TEXT,
  ADD COLUMN IF NOT EXISTS contrato_endereco TEXT;

-- 4. Criar índice para os novos campos
CREATE INDEX IF NOT EXISTS pedidos_supervisores_contrato_idx 
  ON public.pedidos_supervisores(contrato_id);

-- 5. Habilitar RLS (Row Level Security)
ALTER TABLE public.contratos_supervisores ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para contratos_supervisores
-- Permitir que supervisores vejam apenas seus próprios contratos
DROP POLICY IF EXISTS "Supervisores podem ver seus contratos" ON public.contratos_supervisores;
CREATE POLICY "Supervisores podem ver seus contratos"
  ON public.contratos_supervisores
  FOR SELECT
  TO authenticated
  USING (supervisor_id = auth.uid());

-- Permitir que supervisores criem seus próprios contratos
DROP POLICY IF EXISTS "Supervisores podem criar contratos" ON public.contratos_supervisores;
CREATE POLICY "Supervisores podem criar contratos"
  ON public.contratos_supervisores
  FOR INSERT
  TO authenticated
  WITH CHECK (supervisor_id = auth.uid());

-- Permitir que supervisores atualizem seus próprios contratos
DROP POLICY IF EXISTS "Supervisores podem atualizar seus contratos" ON public.contratos_supervisores;
CREATE POLICY "Supervisores podem atualizar seus contratos"
  ON public.contratos_supervisores
  FOR UPDATE
  TO authenticated
  USING (supervisor_id = auth.uid())
  WITH CHECK (supervisor_id = auth.uid());

-- Permitir que supervisores deletem (desativem) seus próprios contratos
DROP POLICY IF EXISTS "Supervisores podem deletar seus contratos" ON public.contratos_supervisores;
CREATE POLICY "Supervisores podem deletar seus contratos"
  ON public.contratos_supervisores
  FOR DELETE
  TO authenticated
  USING (supervisor_id = auth.uid());

-- 7. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_contratos_supervisores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_contratos_supervisores_updated_at 
  ON public.contratos_supervisores;

CREATE TRIGGER update_contratos_supervisores_updated_at
  BEFORE UPDATE ON public.contratos_supervisores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contratos_supervisores_updated_at();

-- 8. Comentários para documentação
COMMENT ON TABLE public.contratos_supervisores IS 
  'Contratos/clientes gerenciados por cada supervisor. Cada pedido é vinculado a um contrato.';

COMMENT ON COLUMN public.contratos_supervisores.supervisor_id IS 
  'ID do supervisor responsável pelo contrato';

COMMENT ON COLUMN public.contratos_supervisores.nome_contrato IS 
  'Nome do cliente/contrato (ex: Obra Centro, Cliente XYZ)';

COMMENT ON COLUMN public.contratos_supervisores.endereco_completo IS 
  'Endereço completo formatado do contrato';

COMMENT ON COLUMN public.contratos_supervisores.encarregado_nome IS 
  'Nome da pessoa responsável no cliente';

COMMENT ON COLUMN public.contratos_supervisores.ativo IS 
  'Se false, o contrato está desativado e não aparece para seleção';

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - REMOVER EM PRODUÇÃO)
-- =====================================================

-- Inserir contrato de exemplo para o supervisor criado anteriormente
-- Descomente se quiser testar
/*
INSERT INTO public.contratos_supervisores (
  supervisor_id,
  nome_contrato,
  endereco_completo,
  endereco_numero,
  endereco_bairro,
  endereco_cidade,
  endereco_estado,
  endereco_cep,
  encarregado_nome,
  encarregado_telefone,
  encarregado_email,
  observacoes
) VALUES (
  '27b407ca-179c-4bdb-805c-0e2bd84b542a', -- ID do supervisor teste
  'Obra Centro - Edifício Comercial',
  'Av. Paulista, 1000',
  '1000',
  'Bela Vista',
  'São Paulo',
  'SP',
  '01310-100',
  'João Silva',
  '(11) 98765-4321',
  'joao.silva@obra.com',
  'Obra de grande porte, entregas pela manhã'
);
*/

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar estrutura criada
SELECT 
  'Tabela contratos_supervisores criada' AS status,
  COUNT(*) AS total_contratos
FROM public.contratos_supervisores;

-- Verificar campos adicionados em pedidos_supervisores
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'pedidos_supervisores' 
  AND column_name IN ('contrato_id', 'contrato_nome', 'contrato_endereco');


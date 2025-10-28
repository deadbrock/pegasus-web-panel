-- ============================================
-- SETUP COMPLETO MÓDULO FISCAL
-- Notas Fiscais, Itens e Fornecedores
-- ============================================

-- Extensão necessária
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- 1. TABELA DE FORNECEDORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NULL,
  cpf_cnpj TEXT NOT NULL,
  rg_ie TEXT NULL,
  endereco TEXT NULL,
  telefone TEXT NULL,
  email TEXT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS fornecedores_cpf_cnpj_key ON public.fornecedores(cpf_cnpj);

-- ============================================
-- 2. TABELA DE NOTAS FISCAIS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  serie TEXT NOT NULL,
  chave_acesso TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  fornecedor_id UUID NULL REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  data_emissao DATE NOT NULL,
  data_entrada TIMESTAMPTZ NULL,
  valor_total NUMERIC NOT NULL,
  base_icms NUMERIC NULL,
  valor_icms NUMERIC NULL,
  valor_ipi NUMERIC NULL,
  valor_pis NUMERIC NULL,
  valor_cofins NUMERIC NULL,
  tipo_operacao TEXT NOT NULL CHECK (tipo_operacao IN ('entrada','saida')),
  cliente_id UUID NULL,
  pedido_id UUID NULL,
  observacoes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Processada','Cancelada','Rejeitada','Ativa')),
  xml_path TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS notas_fiscais_chave_acesso_key ON public.notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS notas_fiscais_data_idx ON public.notas_fiscais(data_emissao DESC);
CREATE INDEX IF NOT EXISTS notas_fiscais_fornecedor_idx ON public.notas_fiscais(fornecedor_id);
CREATE INDEX IF NOT EXISTS notas_fiscais_status_idx ON public.notas_fiscais(status);

-- ============================================
-- 3. TABELA DE ITENS DE NOTA FISCAL
-- ============================================
CREATE TABLE IF NOT EXISTS public.itens_nota_fiscal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nota_fiscal_id UUID NOT NULL REFERENCES public.notas_fiscais(id) ON DELETE CASCADE,
  produto_codigo TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  valor_unitario NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  cfop TEXT NULL,
  ncm TEXT NULL,
  cst_icms TEXT NULL,
  cst_ipi TEXT NULL,
  cst_pis TEXT NULL,
  cst_cofins TEXT NULL,
  processado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS itens_nf_nf_idx ON public.itens_nota_fiscal(nota_fiscal_id);

-- ============================================
-- 4. TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_fornecedores_updated_at ON public.fornecedores;
CREATE TRIGGER trg_fornecedores_updated_at 
BEFORE UPDATE ON public.fornecedores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_notas_updated_at ON public.notas_fiscais;
CREATE TRIGGER trg_notas_updated_at 
BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- 5. HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_nota_fiscal ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. POLÍTICAS RLS - FORNECEDORES
-- ============================================
DROP POLICY IF EXISTS "Permitir leitura de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir leitura de fornecedores" 
ON public.fornecedores 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir inserção de fornecedores" 
ON public.fornecedores 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir atualização de fornecedores" 
ON public.fornecedores 
FOR UPDATE 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de fornecedores" ON public.fornecedores;
CREATE POLICY "Permitir exclusão de fornecedores" 
ON public.fornecedores 
FOR DELETE 
USING (true);

-- ============================================
-- 7. POLÍTICAS RLS - NOTAS FISCAIS
-- ============================================
DROP POLICY IF EXISTS "Permitir leitura de notas fiscais" ON public.notas_fiscais;
CREATE POLICY "Permitir leitura de notas fiscais" 
ON public.notas_fiscais 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção de notas fiscais" ON public.notas_fiscais;
CREATE POLICY "Permitir inserção de notas fiscais" 
ON public.notas_fiscais 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de notas fiscais" ON public.notas_fiscais;
CREATE POLICY "Permitir atualização de notas fiscais" 
ON public.notas_fiscais 
FOR UPDATE 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de notas fiscais" ON public.notas_fiscais;
CREATE POLICY "Permitir exclusão de notas fiscais" 
ON public.notas_fiscais 
FOR DELETE 
USING (true);

-- ============================================
-- 8. POLÍTICAS RLS - ITENS DE NOTA FISCAL
-- ============================================
DROP POLICY IF EXISTS "Permitir leitura de itens" ON public.itens_nota_fiscal;
CREATE POLICY "Permitir leitura de itens" 
ON public.itens_nota_fiscal 
FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Permitir inserção de itens" ON public.itens_nota_fiscal;
CREATE POLICY "Permitir inserção de itens" 
ON public.itens_nota_fiscal 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir atualização de itens" ON public.itens_nota_fiscal;
CREATE POLICY "Permitir atualização de itens" 
ON public.itens_nota_fiscal 
FOR UPDATE 
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir exclusão de itens" ON public.itens_nota_fiscal;
CREATE POLICY "Permitir exclusão de itens" 
ON public.itens_nota_fiscal 
FOR DELETE 
USING (true);

-- ============================================
-- 9. HABILITAR REALTIME
-- ============================================
DO $$
BEGIN
  BEGIN 
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notas_fiscais'; 
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Publication supabase_realtime não existe, pulando...';
  END;
  
  BEGIN 
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_nota_fiscal'; 
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Publication supabase_realtime não existe, pulando...';
  END;
  
  BEGIN 
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.fornecedores'; 
  EXCEPTION 
    WHEN duplicate_object THEN 
      NULL;
    WHEN undefined_object THEN
      RAISE NOTICE 'Publication supabase_realtime não existe, pulando...';
  END;
END$$;

-- ============================================
-- 10. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- ============================================
-- Inserir alguns fornecedores de exemplo
INSERT INTO public.fornecedores (razao_social, nome_fantasia, cpf_cnpj, telefone, email, ativo)
VALUES 
  ('Transportadora ABC Ltda', 'ABC Transporte', '12.345.678/0001-90', '(11) 3456-7890', 'contato@abctransporte.com.br', true),
  ('Posto de Combustível Norte', 'Posto Norte', '98.765.432/0001-10', '(11) 3456-7891', 'contato@postonorte.com.br', true),
  ('Oficina Mecânica Silva', 'Oficina Silva', '11.222.333/0001-44', '(11) 3456-7892', 'contato@oficinasilva.com.br', true)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
  v_count INT;
BEGIN
  -- Verificar tabelas criadas
  SELECT COUNT(*) INTO v_count FROM information_schema.tables 
  WHERE table_schema = 'public' AND table_name IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SETUP MÓDULO FISCAL CONCLUÍDO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabelas criadas: % de 3', v_count;
  
  -- Verificar políticas RLS
  SELECT COUNT(*) INTO v_count FROM pg_policies 
  WHERE schemaname = 'public' AND tablename IN ('fornecedores', 'notas_fiscais', 'itens_nota_fiscal');
  
  RAISE NOTICE 'Políticas RLS criadas: %', v_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Testar importação de XML no painel web';
  RAISE NOTICE '2. Criar notas fiscais manualmente';
  RAISE NOTICE '3. Verificar estatísticas no dashboard';
  RAISE NOTICE '========================================';
END$$;


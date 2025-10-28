-- ============================================
-- ADICIONAR COLUNA produto_descricao EM itens_nota_fiscal
-- Necessário para exibir nome correto do produto no estoque
-- ============================================

-- Adicionar coluna produto_descricao
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'itens_nota_fiscal' 
      AND column_name = 'produto_descricao'
  ) THEN
    ALTER TABLE public.itens_nota_fiscal 
    ADD COLUMN produto_descricao TEXT NULL;
    
    RAISE NOTICE '✅ Coluna produto_descricao adicionada à tabela itens_nota_fiscal';
  ELSE
    RAISE NOTICE '⚠️  Coluna produto_descricao já existe na tabela itens_nota_fiscal';
  END IF;
END $$;

-- Criar índice para melhorar buscas por descrição
CREATE INDEX IF NOT EXISTS idx_itens_nf_descricao ON public.itens_nota_fiscal(produto_descricao);

-- Verificação final
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.itens_nota_fiscal;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COLUNA produto_descricao CONFIGURADA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total de itens: %', v_count;
  RAISE NOTICE '';
  RAISE NOTICE 'PRÓXIMO PASSO:';
  RAISE NOTICE '1. Reimporte as notas fiscais (elas virão com descrição)';
  RAISE NOTICE '2. Ou atualize manualmente as descrições';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END$$;


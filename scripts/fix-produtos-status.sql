-- ============================================
-- ADICIONAR COLUNA STATUS NA TABELA PRODUTOS
-- ============================================

-- Adicionar coluna status se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'produtos' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.produtos 
    ADD COLUMN status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Descontinuado'));
    
    RAISE NOTICE '✅ Coluna status adicionada à tabela produtos';
  ELSE
    RAISE NOTICE '⚠️  Coluna status já existe na tabela produtos';
  END IF;
END $$;

-- Atualizar produtos existentes para ter status 'Ativo' se for NULL
UPDATE public.produtos 
SET status = 'Ativo' 
WHERE status IS NULL;

-- Adicionar constraint NOT NULL após preencher valores
ALTER TABLE public.produtos 
ALTER COLUMN status SET NOT NULL;

-- Criar índice para melhorar performance nas consultas por status
CREATE INDEX IF NOT EXISTS idx_produtos_status ON public.produtos(status);

-- Verificação final
DO $$
DECLARE
  v_count_total INT;
  v_count_ativos INT;
  v_count_inativos INT;
BEGIN
  SELECT COUNT(*) INTO v_count_total FROM public.produtos;
  SELECT COUNT(*) INTO v_count_ativos FROM public.produtos WHERE status = 'Ativo';
  SELECT COUNT(*) INTO v_count_inativos FROM public.produtos WHERE status = 'Inativo';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COLUNA STATUS CONFIGURADA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total de produtos: %', v_count_total;
  RAISE NOTICE 'Produtos ativos: %', v_count_ativos;
  RAISE NOTICE 'Produtos inativos: %', v_count_inativos;
  RAISE NOTICE '';
  RAISE NOTICE 'Valores possíveis:';
  RAISE NOTICE '  - Ativo (padrão)';
  RAISE NOTICE '  - Inativo';
  RAISE NOTICE '  - Descontinuado';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END$$;


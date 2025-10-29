-- =====================================================
-- FIX: Adicionar campos de data em pedidos_supervisores
-- =====================================================

-- Verificar se os campos existem
DO $$ 
BEGIN
    -- Adicionar data_solicitacao se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_supervisores' 
          AND column_name = 'data_solicitacao'
    ) THEN
        ALTER TABLE public.pedidos_supervisores 
        ADD COLUMN data_solicitacao TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Campo data_solicitacao adicionado';
    ELSE
        RAISE NOTICE 'Campo data_solicitacao já existe';
    END IF;

    -- Adicionar data_atualizacao se não existir
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_supervisores' 
          AND column_name = 'data_atualizacao'
    ) THEN
        ALTER TABLE public.pedidos_supervisores 
        ADD COLUMN data_atualizacao TIMESTAMPTZ DEFAULT NOW();
        
        RAISE NOTICE 'Campo data_atualizacao adicionado';
    ELSE
        RAISE NOTICE 'Campo data_atualizacao já existe';
    END IF;
END $$;

-- Atualizar registros existentes que tenham data_solicitacao NULL
UPDATE public.pedidos_supervisores
SET data_solicitacao = created_at
WHERE data_solicitacao IS NULL;

-- Atualizar registros existentes que tenham data_atualizacao NULL
UPDATE public.pedidos_supervisores
SET data_atualizacao = updated_at
WHERE data_atualizacao IS NULL;

-- Criar trigger para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_pedidos_supervisores_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_pedidos_supervisores_data_atualizacao 
  ON public.pedidos_supervisores;

CREATE TRIGGER trg_update_pedidos_supervisores_data_atualizacao
    BEFORE UPDATE ON public.pedidos_supervisores
    FOR EACH ROW
    EXECUTE FUNCTION update_pedidos_supervisores_data_atualizacao();

-- Verificação final
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos_supervisores'
  AND column_name IN ('data_solicitacao', 'data_atualizacao', 'created_at', 'updated_at')
ORDER BY column_name;

SELECT 
    'Total de pedidos sem data_solicitacao:' as info,
    COUNT(*) as total
FROM public.pedidos_supervisores
WHERE data_solicitacao IS NULL
UNION ALL
SELECT 
    'Total de pedidos sem data_atualizacao:' as info,
    COUNT(*) as total
FROM public.pedidos_supervisores
WHERE data_atualizacao IS NULL;

-- Mensagem de sucesso
DO $$ 
BEGIN
    RAISE NOTICE 'FIX concluído com sucesso!';
END $$;


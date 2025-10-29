-- =====================================================
-- FIX: Adicionar campos de autorização em pedidos_supervisores
-- =====================================================

-- Verificar estrutura atual
SELECT 
    'Campos atuais relacionados a autorização:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos_supervisores'
  AND column_name LIKE '%autoriza%'
ORDER BY column_name;

-- Adicionar campos se não existirem
DO $$ 
BEGIN
    -- Campo: autorizado_por
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_supervisores' 
          AND column_name = 'autorizado_por'
    ) THEN
        ALTER TABLE public.pedidos_supervisores 
        ADD COLUMN autorizado_por TEXT;
        
        RAISE NOTICE 'Campo autorizado_por adicionado';
    ELSE
        RAISE NOTICE 'Campo autorizado_por já existe';
    END IF;

    -- Campo: autorizacao_status
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_supervisores' 
          AND column_name = 'autorizacao_status'
    ) THEN
        ALTER TABLE public.pedidos_supervisores 
        ADD COLUMN autorizacao_status TEXT CHECK (autorizacao_status IN ('Pendente', 'Aprovada', 'Rejeitada'));
        
        RAISE NOTICE 'Campo autorizacao_status adicionado';
    ELSE
        RAISE NOTICE 'Campo autorizacao_status já existe';
    END IF;

    -- Campo: autorizacao_justificativa
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_supervisores' 
          AND column_name = 'autorizacao_justificativa'
    ) THEN
        ALTER TABLE public.pedidos_supervisores 
        ADD COLUMN autorizacao_justificativa TEXT;
        
        RAISE NOTICE 'Campo autorizacao_justificativa adicionado';
    ELSE
        RAISE NOTICE 'Campo autorizacao_justificativa já existe';
    END IF;

    -- Campo: requer_autorizacao
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pedidos_supervisores' 
          AND column_name = 'requer_autorizacao'
    ) THEN
        ALTER TABLE public.pedidos_supervisores 
        ADD COLUMN requer_autorizacao BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Campo requer_autorizacao adicionado';
    ELSE
        RAISE NOTICE 'Campo requer_autorizacao já existe';
    END IF;
END $$;

-- Adicionar política RLS para UPDATE
DROP POLICY IF EXISTS "Admin pode atualizar pedidos" ON public.pedidos_supervisores;

CREATE POLICY "Admin pode atualizar pedidos"
ON public.pedidos_supervisores
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verificação final
SELECT 
    '=' as divisor,
    'Estrutura final dos campos de autorização:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pedidos_supervisores'
  AND column_name IN (
    'requer_autorizacao',
    'autorizacao_status',
    'autorizacao_justificativa',
    'autorizado_por'
  )
ORDER BY column_name;

-- Verificar políticas RLS de UPDATE
SELECT 
    '=' as divisor,
    'Políticas RLS de UPDATE:' as info;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'pedidos_supervisores'
  AND cmd IN ('UPDATE', 'ALL');

-- Testar atualização
SELECT 
    '=' as divisor,
    'Teste de atualização:' as info;

-- Pegar o ID de um pedido para testar
DO $$ 
DECLARE
    test_id UUID;
BEGIN
    SELECT id INTO test_id
    FROM public.pedidos_supervisores
    LIMIT 1;

    IF test_id IS NOT NULL THEN
        -- Simular uma aprovação
        UPDATE public.pedidos_supervisores
        SET 
            status = 'Aprovado',
            autorizacao_status = 'Aprovada',
            autorizado_por = 'Admin (Teste)',
            data_atualizacao = NOW()
        WHERE id = test_id;
        
        RAISE NOTICE 'Teste de atualização bem-sucedido no pedido: %', test_id;
        
        -- Reverter para não afetar dados reais
        ROLLBACK;
    ELSE
        RAISE NOTICE 'Nenhum pedido encontrado para testar';
    END IF;
END $$;

-- Mensagem final
DO $$ 
BEGIN
    RAISE NOTICE 'FIX de campos de autorização concluído!';
    RAISE NOTICE 'Campos adicionados: autorizado_por, autorizacao_status, autorizacao_justificativa, requer_autorizacao';
    RAISE NOTICE 'Política RLS de UPDATE criada';
END $$;


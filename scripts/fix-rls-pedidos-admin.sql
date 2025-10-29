-- =====================================================
-- FIX: Políticas RLS para o Painel Admin acessar pedidos
-- =====================================================

-- O problema pode ser que as políticas RLS estão impedindo 
-- o painel admin de ver os pedidos dos supervisores

-- 1. Verificar políticas atuais
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'pedidos_supervisores';

-- 2. Adicionar política para permitir que usuários autenticados 
--    (incluindo admin) vejam todos os pedidos

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Admin pode ver todos os pedidos" ON public.pedidos_supervisores;

-- Criar nova política para admin/web panel
CREATE POLICY "Admin pode ver todos os pedidos"
ON public.pedidos_supervisores
FOR SELECT
TO authenticated
USING (true);  -- Permite ver todos os pedidos

-- 3. Verificar se a política foi criada
SELECT 
    'Políticas após o fix:' as info;

SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'pedidos_supervisores'
ORDER BY policyname;

-- 4. Testar query que o painel admin usa
SELECT 
    '=' as divisor,
    'TESTE DE QUERY DO PAINEL ADMIN' as secao;

SELECT 
    numero_pedido,
    supervisor_nome,
    contrato_nome,
    contrato_endereco,
    status,
    urgencia,
    data_solicitacao
FROM public.pedidos_supervisores
ORDER BY data_solicitacao DESC
LIMIT 5;

-- Mensagem final
DO $$ 
BEGIN
    RAISE NOTICE 'FIX de RLS concluído! Políticas de acesso atualizadas.';
END $$;


-- =====================================================
-- VERIFICAR ESTRUTURA DA TABELA PEDIDOS_SUPERVISORES
-- =====================================================

-- Listar todas as colunas da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pedidos_supervisores'
ORDER BY ordinal_position;

-- Verificar se existem pedidos
SELECT 
    COUNT(*) as total_pedidos,
    COUNT(DISTINCT supervisor_id) as total_supervisores
FROM public.pedidos_supervisores;

-- Listar primeiros 3 pedidos
SELECT 
    id,
    numero_pedido,
    supervisor_id,
    supervisor_nome,
    status,
    data_solicitacao,
    created_at
FROM public.pedidos_supervisores
ORDER BY created_at DESC
LIMIT 3;


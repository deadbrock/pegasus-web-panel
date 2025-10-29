-- =====================================================
-- DIAGNÓSTICO DETALHADO DE PEDIDOS MOBILE
-- =====================================================

-- 1. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    'ESTRUTURA DA TABELA' as secao,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos_supervisores'
  AND column_name IN (
    'id', 'numero_pedido', 'supervisor_nome', 'supervisor_email',
    'contrato_id', 'contrato_nome', 'contrato_endereco',
    'status', 'urgencia', 'data_solicitacao', 'data_atualizacao'
  )
ORDER BY column_name;

-- 2. LISTAR TODOS OS PEDIDOS MOBILE
SELECT 
    '=' as divisor,
    'LISTA DE PEDIDOS' as secao;

SELECT 
    numero_pedido,
    supervisor_nome,
    contrato_nome,
    contrato_endereco,
    status,
    urgencia,
    data_solicitacao,
    created_at
FROM public.pedidos_supervisores
ORDER BY created_at DESC;

-- 3. CONTAR PEDIDOS POR STATUS
SELECT 
    '=' as divisor,
    'PEDIDOS POR STATUS' as secao;

SELECT 
    status,
    COUNT(*) as total
FROM public.pedidos_supervisores
GROUP BY status
ORDER BY total DESC;

-- 4. VERIFICAR SE HÁ ITENS
SELECT 
    '=' as divisor,
    'ITENS DOS PEDIDOS' as secao;

SELECT 
    p.numero_pedido,
    COUNT(i.id) as total_itens,
    STRING_AGG(i.produto_nome || ' (' || i.quantidade || ' ' || i.unidade || ')', ', ') as produtos
FROM public.pedidos_supervisores p
LEFT JOIN public.itens_pedido_supervisor i ON i.pedido_id = p.id
GROUP BY p.numero_pedido, p.created_at
ORDER BY p.created_at DESC;

-- 5. VERIFICAR CONTRATOS VINCULADOS
SELECT 
    '=' as divisor,
    'CONTRATOS VINCULADOS' as secao;

SELECT 
    p.numero_pedido,
    p.contrato_id,
    p.contrato_nome,
    p.contrato_endereco,
    c.nome_contrato as contrato_tabela_nome,
    c.ativo as contrato_ativo
FROM public.pedidos_supervisores p
LEFT JOIN public.contratos_supervisores c ON c.id = p.contrato_id
ORDER BY p.created_at DESC;

-- 6. VERIFICAR RLS (Row Level Security)
SELECT 
    '=' as divisor,
    'POLÍTICAS RLS' as secao;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'pedidos_supervisores';

-- 7. DADOS COMPLETOS DO ÚLTIMO PEDIDO
SELECT 
    '=' as divisor,
    'ÚLTIMO PEDIDO COMPLETO' as secao;

SELECT *
FROM public.pedidos_supervisores
ORDER BY created_at DESC
LIMIT 1;


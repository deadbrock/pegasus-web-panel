-- =====================================================
-- VERIFICAR SE ROTAS FORAM CRIADAS
-- =====================================================

-- 1. Verificar se o trigger existe
SELECT 
  'Status do Trigger' as info,
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_criar_rota_ao_separar';

-- 2. Listar pedidos com status "Separado"
SELECT 
  'Pedidos Separados' as info,
  id,
  numero_pedido,
  supervisor_nome,
  status,
  urgencia,
  created_at
FROM public.pedidos_supervisores
WHERE status = 'Separado'
ORDER BY created_at DESC;

-- 3. Listar todas as rotas
SELECT 
  'Todas as Rotas' as info,
  id,
  numero_rota,
  pedido_id,
  status,
  prioridade,
  observacoes,
  created_at
FROM public.rotas_entrega
ORDER BY created_at DESC;

-- 4. Verificar relação entre pedidos separados e rotas
SELECT 
  'Pedidos SEM Rota' as problema,
  p.id as pedido_id,
  p.numero_pedido,
  p.status,
  'Rota não foi criada!' as observacao
FROM public.pedidos_supervisores p
LEFT JOIN public.rotas_entrega r ON r.pedido_id = p.id
WHERE p.status = 'Separado' 
  AND r.id IS NULL;


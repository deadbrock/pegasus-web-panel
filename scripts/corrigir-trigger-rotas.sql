-- =====================================================
-- CORRIGIR TRIGGER: Remover campo pedido_numero inexistente
-- =====================================================

-- 1. REMOVER TRIGGER E FUNÇÃO ANTIGOS
DROP TRIGGER IF EXISTS trigger_criar_rota_ao_separar ON public.pedidos_supervisores;
DROP FUNCTION IF EXISTS criar_rota_ao_separar();

-- 2. CRIAR FUNÇÃO CORRIGIDA (SEM pedido_numero)
CREATE OR REPLACE FUNCTION criar_rota_ao_separar()
RETURNS TRIGGER AS $$
DECLARE
  novo_numero_rota TEXT;
  contador INT;
  endereco_rota TEXT;
BEGIN
  -- Verificar se mudou para "Separado"
  IF NEW.status = 'Separado' AND (OLD.status IS NULL OR OLD.status != 'Separado') THEN
    
    -- Gerar número da rota
    SELECT COUNT(*) + 1 INTO contador
    FROM public.rotas_entrega
    WHERE DATE_TRUNC('day', created_at) = DATE_TRUNC('day', NOW());
    
    novo_numero_rota := 'ROTA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(contador::TEXT, 4, '0');
    
    -- Preparar endereço completo
    endereco_rota := COALESCE(NEW.contrato_endereco, 'Endereço não informado');
    
    -- Criar rota automaticamente
    INSERT INTO public.rotas_entrega (
      numero_rota,
      pedido_id,
      endereco_completo,
      endereco_cidade,
      endereco_estado,
      status,
      prioridade,
      observacoes,
      created_at,
      updated_at
    ) VALUES (
      novo_numero_rota,
      NEW.id,
      endereco_rota,
      'A definir',  -- Será extraído do endereço posteriormente
      'SP',         -- Estado padrão
      'Aguardando Atribuição',
      CASE NEW.urgencia
        WHEN 'Urgente' THEN 'Urgente'
        WHEN 'Alta' THEN 'Alta'
        WHEN 'Média' THEN 'Normal'
        ELSE 'Baixa'
      END,
      'Rota criada automaticamente. Pedido: ' || NEW.numero_pedido || ' - Supervisor: ' || NEW.supervisor_nome,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Rota % criada para pedido %', novo_numero_rota, NEW.numero_pedido;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR TRIGGER
CREATE TRIGGER trigger_criar_rota_ao_separar
AFTER UPDATE OF status ON public.pedidos_supervisores
FOR EACH ROW
EXECUTE FUNCTION criar_rota_ao_separar();

-- 4. VERIFICAR SE FOI CRIADO
SELECT 
  'Trigger corrigido' as status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_criar_rota_ao_separar';

-- 5. TESTE MANUAL (OPCIONAL - Comentar/Descomentar para testar)
-- UPDATE pedidos_supervisores 
-- SET status = 'Separado' 
-- WHERE id = (SELECT id FROM pedidos_supervisores WHERE status = 'Em Separação' LIMIT 1);

-- Verificar se a rota foi criada
SELECT 
  'Rotas criadas hoje' as info,
  numero_rota,
  status,
  prioridade,
  observacoes,
  created_at
FROM public.rotas_entrega
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;


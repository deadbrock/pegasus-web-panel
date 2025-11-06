-- =====================================================
-- ADICIONAR STATUS "Separado" E CRIAR TRIGGER PARA ROTAS
-- =====================================================

-- 1. REMOVER CONSTRAINT ANTIGO
ALTER TABLE public.pedidos_supervisores
DROP CONSTRAINT IF EXISTS pedidos_supervisores_status_check;

-- 2. ADICIONAR CONSTRAINT COM NOVO STATUS "Separado"
ALTER TABLE public.pedidos_supervisores
ADD CONSTRAINT pedidos_supervisores_status_check 
CHECK (status IN (
  'Pendente',
  'Aprovado',
  'Em Separação',
  'Separado',           -- NOVO STATUS
  'Saiu para Entrega',
  'Entregue',
  'Cancelado',
  'Rejeitado'
));

-- 3. CRIAR OU SUBSTITUIR FUNÇÃO DE TRIGGER
CREATE OR REPLACE FUNCTION criar_rota_ao_separar()
RETURNS TRIGGER AS $$
DECLARE
  novo_numero_rota TEXT;
  contador INT;
BEGIN
  -- Verificar se mudou para "Separado"
  IF NEW.status = 'Separado' AND (OLD.status IS NULL OR OLD.status != 'Separado') THEN
    
    -- Gerar número da rota
    SELECT COUNT(*) + 1 INTO contador
    FROM public.rotas_entrega
    WHERE DATE_TRUNC('day', created_at) = DATE_TRUNC('day', NOW());
    
    novo_numero_rota := 'ROTA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(contador::TEXT, 4, '0');
    
    -- Criar rota automaticamente
    INSERT INTO public.rotas_entrega (
      numero_rota,
      pedido_id,
      pedido_numero,
      supervisor_nome,
      contrato_nome,
      contrato_endereco,
      total_itens,
      status,
      prioridade,
      observacoes,
      created_at,
      updated_at
    ) VALUES (
      novo_numero_rota,
      NEW.id,
      NEW.numero_pedido,
      NEW.supervisor_nome,
      NEW.contrato_nome,
      NEW.contrato_endereco,
      (SELECT COUNT(*) FROM itens_pedido_supervisor WHERE pedido_id = NEW.id),
      'Aguardando Atribuição',
      CASE NEW.urgencia
        WHEN 'Urgente' THEN 'Alta'
        WHEN 'Alta' THEN 'Alta'
        WHEN 'Média' THEN 'Média'
        ELSE 'Baixa'
      END,
      'Rota criada automaticamente após separação do pedido ' || NEW.numero_pedido,
      NOW(),
      NOW()
    );
    
    RAISE NOTICE 'Rota % criada para pedido %', novo_numero_rota, NEW.numero_pedido;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR TRIGGER
DROP TRIGGER IF EXISTS trigger_criar_rota_ao_separar ON public.pedidos_supervisores;

CREATE TRIGGER trigger_criar_rota_ao_separar
AFTER UPDATE OF status ON public.pedidos_supervisores
FOR EACH ROW
EXECUTE FUNCTION criar_rota_ao_separar();

-- 5. VERIFICAR SE FOI CRIADO
SELECT 
  'Constraint atualizado' as status,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'pedidos_supervisores_status_check';

SELECT 
  'Trigger criado' as status,
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'trigger_criar_rota_ao_separar';

-- 6. TESTE: Listar status válidos
SELECT 
  'Status válidos' as info,
  unnest(string_to_array(
    regexp_replace(
      regexp_replace(check_clause, '.*\(status\)::\w+ = ANY \(ARRAY\[', ''),
      '\]\)\)', ''
    ),
    ', '
  )) as status_valido
FROM information_schema.check_constraints
WHERE constraint_name = 'pedidos_supervisores_status_check';


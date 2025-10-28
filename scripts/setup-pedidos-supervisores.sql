-- ============================================
-- SETUP COMPLETO: PEDIDOS DE SUPERVISORES
-- Tabela de pedidos e funções de validação
-- ============================================

-- ============================================
-- 1. TABELA DE PEDIDOS DOS SUPERVISORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.pedidos_supervisores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido TEXT NOT NULL UNIQUE,
  supervisor_id UUID NOT NULL,
  supervisor_nome TEXT NOT NULL,
  supervisor_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovado','Em Separação','Saiu para Entrega','Entregue','Cancelado','Rejeitado')),
  urgencia TEXT NOT NULL DEFAULT 'Média' CHECK (urgencia IN ('Baixa','Média','Alta','Urgente')),
  requer_autorizacao BOOLEAN NOT NULL DEFAULT false,
  autorizacao_status TEXT NULL CHECK (autorizacao_status IN ('Pendente','Aprovada','Rejeitada')),
  autorizacao_justificativa TEXT NULL,
  observacoes TEXT NULL,
  data_solicitacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pedidos_sup_supervisor ON public.pedidos_supervisores(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_sup_status ON public.pedidos_supervisores(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_sup_data ON public.pedidos_supervisores(data_solicitacao DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_sup_numero ON public.pedidos_supervisores(numero_pedido);

-- ============================================
-- 2. TABELA DE ITENS DOS PEDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.itens_pedido_supervisor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos_supervisores(id) ON DELETE CASCADE,
  produto_id UUID NULL,
  produto_codigo TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  quantidade NUMERIC NOT NULL CHECK (quantidade > 0),
  unidade TEXT NOT NULL DEFAULT 'UN',
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para buscar itens por pedido
CREATE INDEX IF NOT EXISTS idx_itens_ped_sup_pedido ON public.itens_pedido_supervisor(pedido_id);

-- ============================================
-- 3. FUNÇÃO: Verificar se pode fazer pedido no mês
-- ============================================
CREATE OR REPLACE FUNCTION public.pode_fazer_pedido_no_mes(
  p_supervisor_id UUID,
  p_ano INTEGER DEFAULT NULL,
  p_mes INTEGER DEFAULT NULL
)
RETURNS TABLE (
  pode_fazer BOOLEAN,
  total_pedidos_mes INTEGER,
  requer_autorizacao BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_ano INTEGER;
  v_mes INTEGER;
  v_count INTEGER;
BEGIN
  -- Usar data atual se não fornecido
  v_ano := COALESCE(p_ano, EXTRACT(YEAR FROM NOW())::INTEGER);
  v_mes := COALESCE(p_mes, EXTRACT(MONTH FROM NOW())::INTEGER);
  
  -- Contar pedidos do supervisor no mês especificado
  SELECT COUNT(*)
  INTO v_count
  FROM public.pedidos_supervisores
  WHERE supervisor_id = p_supervisor_id
    AND EXTRACT(YEAR FROM data_solicitacao) = v_ano
    AND EXTRACT(MONTH FROM data_solicitacao) = v_mes
    AND status NOT IN ('Cancelado', 'Rejeitado');
  
  -- Regra: 1 pedido por mês sem autorização, mais de 1 requer autorização
  IF v_count = 0 THEN
    -- Primeiro pedido do mês: pode fazer sem autorização
    RETURN QUERY SELECT true, v_count, false;
  ELSIF v_count >= 1 THEN
    -- Já tem pedido(s) no mês: pode fazer mas requer autorização
    RETURN QUERY SELECT true, v_count, true;
  END IF;
END;
$$;

-- ============================================
-- 4. TRIGGER PARA ATUALIZAR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.atualizar_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedidos_sup_updated_at ON public.pedidos_supervisores;
CREATE TRIGGER trg_pedidos_sup_updated_at
BEFORE UPDATE ON public.pedidos_supervisores
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_updated_at();

-- ============================================
-- 5. HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE public.pedidos_supervisores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido_supervisor ENABLE ROW LEVEL SECURITY;

-- Políticas: Acesso público (ajustar depois conforme necessário)
DROP POLICY IF EXISTS "pedidos_sup_select" ON public.pedidos_supervisores;
CREATE POLICY "pedidos_sup_select" ON public.pedidos_supervisores FOR SELECT USING (true);

DROP POLICY IF EXISTS "pedidos_sup_insert" ON public.pedidos_supervisores;
CREATE POLICY "pedidos_sup_insert" ON public.pedidos_supervisores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "pedidos_sup_update" ON public.pedidos_supervisores;
CREATE POLICY "pedidos_sup_update" ON public.pedidos_supervisores FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "itens_ped_sup_select" ON public.itens_pedido_supervisor;
CREATE POLICY "itens_ped_sup_select" ON public.itens_pedido_supervisor FOR SELECT USING (true);

DROP POLICY IF EXISTS "itens_ped_sup_insert" ON public.itens_pedido_supervisor;
CREATE POLICY "itens_ped_sup_insert" ON public.itens_pedido_supervisor FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. HABILITAR REALTIME
-- ============================================
DO $$
BEGIN
  BEGIN 
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_supervisores'; 
  EXCEPTION 
    WHEN OTHERS THEN NULL; 
  END;
  
  BEGIN 
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.itens_pedido_supervisor'; 
  EXCEPTION 
    WHEN OTHERS THEN NULL; 
  END;
END$$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
DO $$
DECLARE
  v_pedidos_count INTEGER;
  v_itens_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_pedidos_count FROM public.pedidos_supervisores;
  SELECT COUNT(*) INTO v_itens_count FROM public.itens_pedido_supervisor;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PEDIDOS DE SUPERVISORES CONFIGURADO!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'TABELAS CRIADAS:';
  RAISE NOTICE '  ✓ pedidos_supervisores (%s pedidos)', v_pedidos_count;
  RAISE NOTICE '  ✓ itens_pedido_supervisor (%s itens)', v_itens_count;
  RAISE NOTICE '';
  RAISE NOTICE 'FUNÇÕES CRIADAS:';
  RAISE NOTICE '  ✓ pode_fazer_pedido_no_mes()';
  RAISE NOTICE '  ✓ atualizar_updated_at()';
  RAISE NOTICE '';
  RAISE NOTICE 'STATUS PERMITIDOS:';
  RAISE NOTICE '  • Pendente, Aprovado, Em Separação';
  RAISE NOTICE '  • Saiu para Entrega, Entregue';
  RAISE NOTICE '  • Cancelado, Rejeitado';
  RAISE NOTICE '';
  RAISE NOTICE 'REGRA DE NEGÓCIO:';
  RAISE NOTICE '  • 1º pedido do mês: Sem autorização';
  RAISE NOTICE '  • 2º+ pedidos do mês: Requer autorização';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END$$;


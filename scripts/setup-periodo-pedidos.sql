-- =====================================================
-- SETUP: CONTROLE DE PERÍODO DE PEDIDOS
-- =====================================================
-- Regra: Supervisores só podem fazer pedidos entre os dias 15 e 23 de cada mês
-- Este script cria a tabela de log para auditoria (opcional)

-- Tabela de log de verificações de período (para auditoria e relatórios)
CREATE TABLE IF NOT EXISTS public.log_periodo_pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data_verificacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  dia_verificacao INTEGER NOT NULL,
  mes_verificacao INTEGER NOT NULL,
  ano_verificacao INTEGER NOT NULL,
  dentro_periodo BOOLEAN NOT NULL,
  dias_restantes INTEGER NOT NULL,
  tentou_criar_pedido BOOLEAN NOT NULL DEFAULT false,
  foi_bloqueado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_log_periodo_supervisor 
ON public.log_periodo_pedidos(supervisor_id);

CREATE INDEX IF NOT EXISTS idx_log_periodo_data 
ON public.log_periodo_pedidos(data_verificacao DESC);

CREATE INDEX IF NOT EXISTS idx_log_periodo_mes_ano 
ON public.log_periodo_pedidos(ano_verificacao, mes_verificacao);

-- Comentários
COMMENT ON TABLE public.log_periodo_pedidos IS 'Log de verificações de período de pedidos para auditoria';
COMMENT ON COLUMN public.log_periodo_pedidos.supervisor_id IS 'ID do supervisor que tentou fazer pedido';
COMMENT ON COLUMN public.log_periodo_pedidos.dia_verificacao IS 'Dia do mês em que foi feita a verificação (1-31)';
COMMENT ON COLUMN public.log_periodo_pedidos.dentro_periodo IS 'Se estava dentro do período permitido (dia 15-23)';
COMMENT ON COLUMN public.log_periodo_pedidos.tentou_criar_pedido IS 'Se o supervisor tentou criar um pedido';
COMMENT ON COLUMN public.log_periodo_pedidos.foi_bloqueado IS 'Se o pedido foi bloqueado por estar fora do período';

-- RLS Policies
ALTER TABLE public.log_periodo_pedidos ENABLE ROW LEVEL SECURITY;

-- Supervisores podem ver apenas seus próprios logs
DROP POLICY IF EXISTS "Supervisores veem seus logs" ON public.log_periodo_pedidos;
CREATE POLICY "Supervisores veem seus logs"
ON public.log_periodo_pedidos
FOR SELECT
TO authenticated
USING (auth.uid() = supervisor_id);

-- Sistema pode inserir logs
DROP POLICY IF EXISTS "Sistema pode inserir logs" ON public.log_periodo_pedidos;
CREATE POLICY "Sistema pode inserir logs"
ON public.log_periodo_pedidos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin pode ver tudo
DROP POLICY IF EXISTS "Admin vê todos os logs" ON public.log_periodo_pedidos;
CREATE POLICY "Admin vê todos os logs"
ON public.log_periodo_pedidos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  )
);

-- =====================================================
-- FUNÇÃO PARA GERAR RELATÓRIO DE PERÍODO
-- =====================================================

CREATE OR REPLACE FUNCTION public.relatorio_periodo_pedidos(
  p_mes INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  p_ano INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (
  supervisor_id UUID,
  supervisor_nome TEXT,
  total_verificacoes BIGINT,
  tentativas_pedido BIGINT,
  tentativas_bloqueadas BIGINT,
  ultimo_acesso TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.supervisor_id,
    u.raw_user_meta_data->>'name' AS supervisor_nome,
    COUNT(*) AS total_verificacoes,
    COUNT(*) FILTER (WHERE l.tentou_criar_pedido) AS tentativas_pedido,
    COUNT(*) FILTER (WHERE l.foi_bloqueado) AS tentativas_bloqueadas,
    MAX(l.data_verificacao) AS ultimo_acesso
  FROM public.log_periodo_pedidos l
  JOIN auth.users u ON u.id = l.supervisor_id
  WHERE l.mes_verificacao = p_mes
    AND l.ano_verificacao = p_ano
  GROUP BY l.supervisor_id, u.raw_user_meta_data->>'name'
  ORDER BY ultimo_acesso DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MENSAGENS FINAIS
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ Tabela log_periodo_pedidos criada';
  RAISE NOTICE '✅ Índices criados para performance';
  RAISE NOTICE '✅ RLS configurado (supervisores veem apenas seus logs, admin vê tudo)';
  RAISE NOTICE '✅ Função relatorio_periodo_pedidos() criada';
  RAISE NOTICE '';
  RAISE NOTICE '📋 CONFIGURAÇÃO DO APP MOBILE:';
  RAISE NOTICE '   - Período de pedidos: dia 15 a 23 de cada mês';
  RAISE NOTICE '   - Notificações: enviadas 2 dias antes do fim (dia 21)';
  RAISE NOTICE '   - Validação automática ao criar pedido';
  RAISE NOTICE '';
  RAISE NOTICE '📊 PARA VER RELATÓRIO:';
  RAISE NOTICE '   SELECT * FROM public.relatorio_periodo_pedidos();';
  RAISE NOTICE '   SELECT * FROM public.relatorio_periodo_pedidos(10, 2024); -- mês e ano específicos';
END $$;


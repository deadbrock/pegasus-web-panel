-- ========================================
-- TABELAS PARA SISTEMA DE PEDIDOS MOBILE
-- ========================================

-- 1. PEDIDOS DOS SUPERVISORES
CREATE TABLE IF NOT EXISTS public.pedidos_supervisores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_pedido TEXT NOT NULL UNIQUE,
  supervisor_id UUID NOT NULL REFERENCES auth.users(id),
  supervisor_nome TEXT NOT NULL,
  supervisor_email TEXT NOT NULL,
  
  -- Produto
  produto_id UUID REFERENCES public.produtos(id),
  produto_nome TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'UN',
  
  -- Urgência e observações
  urgencia TEXT NOT NULL DEFAULT 'Média' CHECK (urgencia IN ('Baixa','Média','Alta','Urgente')),
  observacoes TEXT NULL,
  
  -- Status do pedido
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Aprovado','Em Separação','Saiu para Entrega','Entregue','Cancelado','Rejeitado')),
  
  -- Controle mensal
  mes_solicitacao INTEGER NOT NULL, -- 1-12
  ano_solicitacao INTEGER NOT NULL, -- 2025, 2026...
  
  -- Autorização (para segundo pedido no mês)
  requer_autorizacao BOOLEAN DEFAULT FALSE,
  autorizacao_status TEXT NULL CHECK (autorizacao_status IN ('Pendente','Aprovada','Rejeitada')),
  autorizacao_solicitada_em TIMESTAMPTZ NULL,
  autorizacao_respondida_em TIMESTAMPTZ NULL,
  autorizacao_respondida_por UUID NULL REFERENCES auth.users(id),
  autorizacao_justificativa TEXT NULL,
  autorizacao_motivo_rejeicao TEXT NULL,
  
  -- Datas
  data_solicitacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_aprovacao TIMESTAMPTZ NULL,
  data_separacao TIMESTAMPTZ NULL,
  data_envio TIMESTAMPTZ NULL,
  data_entrega TIMESTAMPTZ NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX pedidos_supervisores_supervisor_idx ON public.pedidos_supervisores(supervisor_id);
CREATE INDEX pedidos_supervisores_status_idx ON public.pedidos_supervisores(status);
CREATE INDEX pedidos_supervisores_mes_ano_idx ON public.pedidos_supervisores(mes_solicitacao, ano_solicitacao);
CREATE INDEX pedidos_supervisores_autorizacao_idx ON public.pedidos_supervisores(autorizacao_status) WHERE requer_autorizacao = TRUE;

-- RLS
ALTER TABLE public.pedidos_supervisores ENABLE ROW LEVEL SECURITY;

-- Supervisores podem ver apenas seus próprios pedidos
CREATE POLICY pedidos_supervisores_select_own ON public.pedidos_supervisores
FOR SELECT USING (
  auth.uid() = supervisor_id
);

-- Supervisores podem criar pedidos
CREATE POLICY pedidos_supervisores_insert_own ON public.pedidos_supervisores
FOR INSERT WITH CHECK (
  auth.uid() = supervisor_id
);

-- Admins e gestores podem ver e atualizar todos os pedidos
CREATE POLICY pedidos_supervisores_admin_all ON public.pedidos_supervisores
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND (user_metadata->>'role' IN ('admin', 'diretor', 'gestor'))
  )
);

-- Trigger updated_at
CREATE TRIGGER trg_pedidos_supervisores_updated_at 
BEFORE UPDATE ON public.pedidos_supervisores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Publicar no Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_supervisores;

-- ========================================
-- FUNÇÃO: Verificar se supervisor pode fazer pedido no mês
-- ========================================

CREATE OR REPLACE FUNCTION public.pode_fazer_pedido_no_mes(
  p_supervisor_id UUID,
  p_mes INTEGER,
  p_ano INTEGER
)
RETURNS TABLE (
  pode_fazer BOOLEAN,
  total_pedidos_mes INTEGER,
  requer_autorizacao BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN TRUE  -- Pode fazer (primeiro pedido do mês)
      WHEN COUNT(*) >= 1 THEN FALSE -- Já fez pedido este mês
      ELSE FALSE
    END AS pode_fazer,
    COUNT(*)::INTEGER AS total_pedidos_mes,
    CASE 
      WHEN COUNT(*) >= 1 THEN TRUE  -- Precisa de autorização
      ELSE FALSE
    END AS requer_autorizacao
  FROM public.pedidos_supervisores
  WHERE supervisor_id = p_supervisor_id
    AND mes_solicitacao = p_mes
    AND ano_solicitacao = p_ano
    AND status NOT IN ('Cancelado', 'Rejeitado');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- COMENTÁRIOS
-- ========================================

COMMENT ON TABLE public.pedidos_supervisores IS 'Pedidos de material feitos pelos supervisores via app mobile';
COMMENT ON COLUMN public.pedidos_supervisores.requer_autorizacao IS 'TRUE se é o segundo pedido do mês (precisa autorização)';
COMMENT ON COLUMN public.pedidos_supervisores.autorizacao_status IS 'Status da solicitação de autorização';
COMMENT ON FUNCTION public.pode_fazer_pedido_no_mes IS 'Verifica se supervisor pode fazer pedido no mês atual (máx 1 por mês)';


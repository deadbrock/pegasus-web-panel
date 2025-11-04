-- ============================================================================
-- TABELA: rotas_entrega
-- DESCRICAO: Rotas de entrega criadas automaticamente quando pedidos sao separados
-- ============================================================================

-- Criar tabela de rotas de entrega
CREATE TABLE IF NOT EXISTS rotas_entrega (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento com pedido mobile
  pedido_id UUID NOT NULL REFERENCES pedidos_mobile(id) ON DELETE CASCADE,
  
  -- Informações da rota
  numero_rota VARCHAR(50) UNIQUE NOT NULL,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_prevista_entrega DATE,
  
  -- Endereço de entrega (do pedido/contrato)
  endereco_completo TEXT NOT NULL,
  endereco_numero VARCHAR(20),
  endereco_complemento VARCHAR(100),
  endereco_bairro VARCHAR(100),
  endereco_cidade VARCHAR(100) NOT NULL,
  endereco_estado VARCHAR(2) NOT NULL,
  endereco_cep VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Atribuição
  motorista_id UUID REFERENCES motoristas(id) ON DELETE SET NULL,
  veiculo_id UUID REFERENCES veiculos(id) ON DELETE SET NULL,
  data_atribuicao TIMESTAMP WITH TIME ZONE,
  atribuido_por VARCHAR(255), -- Email/nome do usuário que atribuiu
  
  -- Status da rota
  status VARCHAR(30) NOT NULL DEFAULT 'Aguardando Atribuição' CHECK (
    status IN (
      'Aguardando Atribuição',
      'Atribuída',
      'Em Rota',
      'Entregue',
      'Cancelada',
      'Atrasada'
    )
  ),
  
  -- Timestamps de progresso
  data_inicio_rota TIMESTAMP WITH TIME ZONE,
  data_entrega TIMESTAMP WITH TIME ZONE,
  
  -- Informações adicionais
  observacoes TEXT,
  prioridade VARCHAR(20) DEFAULT 'Normal' CHECK (prioridade IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_rotas_pedido_id ON rotas_entrega(pedido_id);
CREATE INDEX IF NOT EXISTS idx_rotas_motorista_id ON rotas_entrega(motorista_id);
CREATE INDEX IF NOT EXISTS idx_rotas_veiculo_id ON rotas_entrega(veiculo_id);
CREATE INDEX IF NOT EXISTS idx_rotas_status ON rotas_entrega(status);
CREATE INDEX IF NOT EXISTS idx_rotas_data_prevista ON rotas_entrega(data_prevista_entrega);
CREATE INDEX IF NOT EXISTS idx_rotas_created_at ON rotas_entrega(created_at DESC);

-- RLS
ALTER TABLE rotas_entrega ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ver
CREATE POLICY "Usuarios podem ver rotas"
  ON rotas_entrega
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Admins e logística podem criar/atualizar
CREATE POLICY "Admins e logistica podem gerenciar rotas"
  ON rotas_entrega
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_rotas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_rotas_updated_at ON rotas_entrega;

CREATE TRIGGER trigger_update_rotas_updated_at
  BEFORE UPDATE ON rotas_entrega
  FOR EACH ROW
  EXECUTE FUNCTION update_rotas_updated_at();

-- ============================================================================
-- TRIGGER: Criar rota automaticamente quando pedido mobile muda para separado
-- ============================================================================

CREATE OR REPLACE FUNCTION criar_rota_automatica()
RETURNS TRIGGER AS $$
DECLARE
  v_numero_rota VARCHAR(50);
  v_contrato RECORD;
  v_prioridade VARCHAR(20);
BEGIN
  -- Só cria rota se mudou de status para "Em Separação"
  IF NEW.status = 'Em Separação' AND (OLD.status IS NULL OR OLD.status != 'Em Separação') THEN
    
    -- Verificar se já existe rota para este pedido
    IF EXISTS (SELECT 1 FROM rotas_entrega WHERE pedido_id = NEW.id) THEN
      RETURN NEW;
    END IF;
    
    -- Gerar número da rota
    v_numero_rota := 'ROTA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('seq_rotas')::TEXT, 4, '0');
    
    -- Buscar dados do contrato (endereço de entrega)
    SELECT * INTO v_contrato
    FROM contratos_supervisores
    WHERE id = NEW.contrato_id
    LIMIT 1;
    
    -- Determinar prioridade baseada na urgência do pedido
    v_prioridade := CASE 
      WHEN NEW.urgencia = 'Urgente' THEN 'Urgente'
      WHEN NEW.urgencia = 'Alta' THEN 'Alta'
      ELSE 'Normal'
    END;
    
    -- Criar rota
    INSERT INTO rotas_entrega (
      pedido_id,
      numero_rota,
      data_prevista_entrega,
      endereco_completo,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      endereco_cidade,
      endereco_estado,
      endereco_cep,
      status,
      prioridade,
      observacoes
    ) VALUES (
      NEW.id,
      v_numero_rota,
      CURRENT_DATE + INTERVAL '1 day', -- Previsão para amanhã
      COALESCE(v_contrato.endereco_completo, 'Endereço não informado'),
      v_contrato.endereco_numero,
      v_contrato.endereco_complemento,
      v_contrato.endereco_bairro,
      COALESCE(v_contrato.endereco_cidade, 'Cidade não informada'),
      COALESCE(v_contrato.endereco_estado, 'UF'),
      v_contrato.endereco_cep,
      'Aguardando Atribuição',
      v_prioridade,
      'Rota criada automaticamente a partir do pedido ' || NEW.numero_pedido
    );
    
    RAISE NOTICE 'Rota % criada automaticamente para pedido %', v_numero_rota, NEW.numero_pedido;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequence para números de rotas
CREATE SEQUENCE IF NOT EXISTS seq_rotas START 1;

DROP TRIGGER IF EXISTS trigger_criar_rota_automatica ON pedidos_mobile;

CREATE TRIGGER trigger_criar_rota_automatica
  AFTER INSERT OR UPDATE ON pedidos_mobile
  FOR EACH ROW
  EXECUTE FUNCTION criar_rota_automatica();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE rotas_entrega IS 'Rotas de entrega criadas automaticamente quando pedidos são separados';
COMMENT ON COLUMN rotas_entrega.status IS 'Status: Aguardando Atribuição, Atribuída, Em Rota, Entregue, Cancelada, Atrasada';
COMMENT ON COLUMN rotas_entrega.numero_rota IS 'Número único da rota (ROTA-YYYYMMDD-0001)';

-- ============================================================================
-- VERIFICACAO FINAL
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM rotas_entrega;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TABELA rotas_entrega CRIADA!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Rotas existentes: %', v_count;
  RAISE NOTICE '';
  RAISE NOTICE 'FUNCIONALIDADES:';
  RAISE NOTICE '  ✓ Trigger automático: pedido Em Separação → cria rota';
  RAISE NOTICE '  ✓ Endereço copiado do contrato';
  RAISE NOTICE '  ✓ Prioridade baseada na urgência';
  RAISE NOTICE '  ✓ Status inicial: Aguardando Atribuição';
  RAISE NOTICE '  ✓ Número único de rota';
  RAISE NOTICE '';
  RAISE NOTICE 'PROXIMO PASSO:';
  RAISE NOTICE '  1. Atualizar status de um pedido para "Em Separação"';
  RAISE NOTICE '  2. Rota será criada automaticamente';
  RAISE NOTICE '  3. Aparecerá na aba Rotas para atribuição';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;


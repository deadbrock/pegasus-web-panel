-- =====================================================
-- MIGRAÇÃO: Sistema de Atribuição de Contratos a Supervisores
-- =====================================================
-- Descrição: 
--   - Adiciona campo valor_mensal_material na tabela contratos
--   - Cria tabela para atribuir supervisores responsáveis por contratos
--   - Permite controle de teto de gastos por contrato
-- =====================================================

-- 1. Adicionar campo valor_mensal_material na tabela contratos
ALTER TABLE contratos 
ADD COLUMN IF NOT EXISTS valor_mensal_material DECIMAL(15,2) DEFAULT 0;

COMMENT ON COLUMN contratos.valor_mensal_material IS 'Teto de gastos mensal para material de consumo deste contrato';

-- 2. Criar tabela de atribuição de supervisores a contratos
CREATE TABLE IF NOT EXISTS contratos_supervisores_atribuicao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  supervisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Campos de controle
  ativo BOOLEAN DEFAULT true,
  data_atribuicao TIMESTAMP DEFAULT NOW(),
  atribuido_por UUID REFERENCES users(id), -- Usuário logística que fez a atribuição
  
  -- Campos de auditoria
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Garantir que um supervisor não seja atribuído múltiplas vezes ao mesmo contrato
  UNIQUE(contrato_id, supervisor_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_atribuicao_contrato ON contratos_supervisores_atribuicao(contrato_id);
CREATE INDEX IF NOT EXISTS idx_atribuicao_supervisor ON contratos_supervisores_atribuicao(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_atribuicao_ativo ON contratos_supervisores_atribuicao(ativo) WHERE ativo = true;

-- Comentários
COMMENT ON TABLE contratos_supervisores_atribuicao IS 'Relaciona contratos com supervisores responsáveis';
COMMENT ON COLUMN contratos_supervisores_atribuicao.contrato_id IS 'ID do contrato';
COMMENT ON COLUMN contratos_supervisores_atribuicao.supervisor_id IS 'ID do supervisor responsável';
COMMENT ON COLUMN contratos_supervisores_atribuicao.ativo IS 'Se a atribuição está ativa';
COMMENT ON COLUMN contratos_supervisores_atribuicao.atribuido_por IS 'ID do usuário logística que fez a atribuição';

-- 3. View para facilitar consultas de contratos com supervisores
CREATE OR REPLACE VIEW contratos_com_supervisores AS
SELECT 
  c.*,
  array_agg(
    json_build_object(
      'supervisor_id', a.supervisor_id,
      'supervisor_nome', u.nome,
      'supervisor_email', u.email,
      'data_atribuicao', a.data_atribuicao
    )
  ) FILTER (WHERE a.ativo = true) as supervisores_responsaveis,
  count(a.id) FILTER (WHERE a.ativo = true) as total_supervisores
FROM contratos c
LEFT JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id AND a.ativo = true
LEFT JOIN users u ON a.supervisor_id = u.id
GROUP BY c.id;

COMMENT ON VIEW contratos_com_supervisores IS 'View que mostra contratos com lista de supervisores responsáveis';

-- 4. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION atualizar_updated_at_atribuicao()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_updated_at_atribuicao
BEFORE UPDATE ON contratos_supervisores_atribuicao
FOR EACH ROW
EXECUTE FUNCTION atualizar_updated_at_atribuicao();

-- 5. Função para buscar contratos de um supervisor (para usar no mobile)
CREATE OR REPLACE FUNCTION get_contratos_supervisor(supervisor_uuid UUID)
RETURNS TABLE (
  id UUID,
  numero_contrato VARCHAR,
  cliente VARCHAR,
  tipo VARCHAR,
  descricao TEXT,
  valor_total DECIMAL,
  valor_mensal DECIMAL,
  valor_mensal_material DECIMAL,
  data_inicio DATE,
  data_fim DATE,
  status VARCHAR,
  responsavel VARCHAR,
  email_contato VARCHAR,
  telefone_contato VARCHAR,
  observacoes TEXT,
  data_atribuicao TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.numero_contrato,
    c.cliente,
    c.tipo,
    c.descricao,
    c.valor_total,
    c.valor_mensal,
    c.valor_mensal_material,
    c.data_inicio,
    c.data_fim,
    c.status,
    c.responsavel,
    c.email_contato,
    c.telefone_contato,
    c.observacoes,
    a.data_atribuicao
  FROM contratos c
  INNER JOIN contratos_supervisores_atribuicao a ON c.id = a.contrato_id
  WHERE a.supervisor_id = supervisor_uuid
    AND a.ativo = true
    AND c.status = 'Ativo'
  ORDER BY c.cliente ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_contratos_supervisor IS 'Retorna contratos atribuídos a um supervisor específico';

-- 6. View para dashboard de gastos por contrato
CREATE OR REPLACE VIEW gastos_por_contrato_mes AS
SELECT 
  c.id as contrato_id,
  c.cliente as contrato_nome,
  c.valor_mensal_material as teto_mensal,
  DATE_TRUNC('month', ps.data_solicitacao) as mes_referencia,
  COUNT(ps.id) as total_pedidos,
  SUM(
    (SELECT SUM(quantidade) FROM itens_pedido_supervisor WHERE pedido_id = ps.id)
  ) as total_itens_solicitados,
  -- Para calcular valor real, precisaríamos do preço dos produtos
  -- Por enquanto, apenas contabilizamos quantidade de pedidos
  CASE 
    WHEN COUNT(ps.id) > 0 THEN true
    ELSE false
  END as teve_movimentacao
FROM contratos c
LEFT JOIN pedidos_supervisores ps ON ps.contrato_id = c.id
WHERE ps.status NOT IN ('Cancelado', 'Rejeitado')
GROUP BY c.id, c.cliente, c.valor_mensal_material, DATE_TRUNC('month', ps.data_solicitacao);

COMMENT ON VIEW gastos_por_contrato_mes IS 'Resumo de gastos/pedidos por contrato por mês';

-- =====================================================
-- DADOS DE EXEMPLO (opcional - comentar se não quiser)
-- =====================================================

-- Exemplo: Atribuir contratos a supervisores
-- Descomente as linhas abaixo se quiser criar dados de exemplo
/*
INSERT INTO contratos_supervisores_atribuicao (contrato_id, supervisor_id, atribuido_por, ativo)
SELECT 
  c.id as contrato_id,
  u.id as supervisor_id,
  (SELECT id FROM users WHERE role = 'logistica' LIMIT 1) as atribuido_por,
  true as ativo
FROM contratos c
CROSS JOIN users u
WHERE u.role = 'supervisor'
  AND c.status = 'Ativo'
LIMIT 5; -- Limitar para não criar muitos registros
*/

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se a coluna foi adicionada
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'contratos' 
  AND column_name = 'valor_mensal_material';

-- Verificar se a tabela foi criada
SELECT 
  table_name, 
  table_type
FROM information_schema.tables
WHERE table_name = 'contratos_supervisores_atribuicao';

-- Mostrar estatísticas
SELECT 
  'Contratos cadastrados' as metrica,
  COUNT(*) as total
FROM contratos
UNION ALL
SELECT 
  'Atribuições ativas' as metrica,
  COUNT(*) as total
FROM contratos_supervisores_atribuicao
WHERE ativo = true;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================

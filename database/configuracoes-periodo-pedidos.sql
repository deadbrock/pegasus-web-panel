-- =====================================================
-- TABELA DE CONFIGURAÇÕES DE PERÍODO DE PEDIDOS
-- =====================================================
-- Permite configurar quando supervisores podem fazer pedidos

CREATE TABLE IF NOT EXISTS configuracoes_periodo_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    
    -- Período do mês (dias)
    dia_inicio INTEGER CHECK (dia_inicio >= 1 AND dia_inicio <= 31),
    dia_fim INTEGER CHECK (dia_fim >= 1 AND dia_fim <= 31),
    
    -- Dias da semana permitidos (JSON array)
    -- [0,1,2,3,4,5,6] onde 0=Domingo, 1=Segunda, etc
    dias_semana_permitidos JSONB DEFAULT '[]',
    
    -- Horários permitidos
    horario_inicio TIME,
    horario_fim TIME,
    
    -- Limites
    max_pedidos_por_periodo INTEGER,
    requer_autorizacao_apos INTEGER DEFAULT 1, -- Após X pedidos, requer autorização
    
    -- Configurações adicionais
    permitir_urgentes BOOLEAN DEFAULT false, -- Permite pedidos urgentes fora do período
    mensagem_bloqueio TEXT DEFAULT 'Período de pedidos encerrado. Aguarde a próxima janela.',
    
    -- Datas específicas de exceção
    datas_excecao JSONB DEFAULT '[]', -- Datas específicas que NÃO permitem pedidos
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_config_periodo_ativo ON configuracoes_periodo_pedidos(ativo);
CREATE INDEX idx_config_periodo_dias ON configuracoes_periodo_pedidos(dia_inicio, dia_fim);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_configuracoes_periodo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_configuracoes_periodo_timestamp
    BEFORE UPDATE ON configuracoes_periodo_pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_configuracoes_periodo_timestamp();

-- =====================================================
-- INSERIR CONFIGURAÇÃO PADRÃO
-- =====================================================
INSERT INTO configuracoes_periodo_pedidos (
    nome,
    descricao,
    ativo,
    dia_inicio,
    dia_fim,
    dias_semana_permitidos,
    horario_inicio,
    horario_fim,
    max_pedidos_por_periodo,
    requer_autorizacao_apos,
    permitir_urgentes,
    mensagem_bloqueio
) VALUES (
    'Período Padrão Mensal',
    'Período padrão para pedidos mensais - do dia 15 ao dia 23',
    true,
    15,
    23,
    '[1,2,3,4,5]', -- Segunda a Sexta
    '08:00:00',
    '18:00:00',
    null, -- Sem limite
    1, -- Primeiro pedido livre, segundo requer autorização
    false,
    'O período de pedidos é do dia 15 ao dia 23 de cada mês. Por favor, aguarde a próxima janela.'
);

-- =====================================================
-- VIEWS E FUNÇÕES ÚTEIS
-- =====================================================

-- View para ver configuração ativa
CREATE OR REPLACE VIEW configuracao_periodo_ativa AS
SELECT * FROM configuracoes_periodo_pedidos
WHERE ativo = true
ORDER BY created_at DESC
LIMIT 1;

-- Função para verificar se está no período permitido
CREATE OR REPLACE FUNCTION verificar_periodo_permitido()
RETURNS TABLE (
    permitido BOOLEAN,
    mensagem TEXT,
    config_id UUID
) AS $$
DECLARE
    config RECORD;
    dia_atual INTEGER;
    dia_semana_atual INTEGER;
    hora_atual TIME;
BEGIN
    -- Buscar configuração ativa
    SELECT * INTO config FROM configuracao_periodo_ativa;
    
    IF config IS NULL THEN
        RETURN QUERY SELECT true, 'Nenhuma restrição configurada'::TEXT, NULL::UUID;
        RETURN;
    END IF;
    
    -- Dia do mês atual
    dia_atual := EXTRACT(DAY FROM CURRENT_DATE);
    
    -- Dia da semana atual (0=Domingo, 1=Segunda, etc)
    dia_semana_atual := EXTRACT(DOW FROM CURRENT_DATE);
    
    -- Hora atual
    hora_atual := CURRENT_TIME;
    
    -- Verificar dia do mês
    IF config.dia_inicio IS NOT NULL AND config.dia_fim IS NOT NULL THEN
        IF dia_atual < config.dia_inicio OR dia_atual > config.dia_fim THEN
            RETURN QUERY SELECT 
                false, 
                config.mensagem_bloqueio,
                config.id;
            RETURN;
        END IF;
    END IF;
    
    -- Verificar dia da semana
    IF config.dias_semana_permitidos IS NOT NULL AND 
       jsonb_array_length(config.dias_semana_permitidos) > 0 THEN
        IF NOT (config.dias_semana_permitidos @> to_jsonb(dia_semana_atual)) THEN
            RETURN QUERY SELECT 
                false, 
                'Pedidos não são permitidos neste dia da semana.'::TEXT,
                config.id;
            RETURN;
        END IF;
    END IF;
    
    -- Verificar horário
    IF config.horario_inicio IS NOT NULL AND config.horario_fim IS NOT NULL THEN
        IF hora_atual < config.horario_inicio OR hora_atual > config.horario_fim THEN
            RETURN QUERY SELECT 
                false, 
                format('Pedidos permitidos apenas entre %s e %s.', 
                       config.horario_inicio, config.horario_fim)::TEXT,
                config.id;
            RETURN;
        END IF;
    END IF;
    
    -- Se chegou aqui, está permitido
    RETURN QUERY SELECT true, 'Período permitido para pedidos'::TEXT, config.id;
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE configuracoes_periodo_pedidos IS 'Configurações de período permitido para pedidos';
COMMENT ON COLUMN configuracoes_periodo_pedidos.dia_inicio IS 'Dia do mês de início (1-31)';
COMMENT ON COLUMN configuracoes_periodo_pedidos.dia_fim IS 'Dia do mês de fim (1-31)';
COMMENT ON COLUMN configuracoes_periodo_pedidos.dias_semana_permitidos IS 'Array JSON dos dias da semana permitidos (0=Dom, 1=Seg, ..., 6=Sab)';
COMMENT ON COLUMN configuracoes_periodo_pedidos.requer_autorizacao_apos IS 'Após X pedidos no período, requer autorização do gestor';

-- Grants (ajustar conforme suas policies)
GRANT SELECT ON configuracoes_periodo_pedidos TO authenticated;
GRANT ALL ON configuracoes_periodo_pedidos TO service_role;


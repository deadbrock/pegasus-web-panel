-- ============================================
-- PEGASUS - RECRIAR TODAS AS TABELAS
-- ============================================
-- ATENÇÃO: Este script DELETA e RECRIA todas as tabelas
-- Use apenas se quiser começar do zero!
-- ============================================

-- PASSO 1: DELETAR TABELAS EXISTENTES (na ordem correta para evitar FK issues)
-- ============================================

-- Deletar tabelas dependentes primeiro
DROP TABLE IF EXISTS public.posicoes_veiculo CASCADE;
DROP TABLE IF EXISTS public.alertas_rastreamento CASCADE;
DROP TABLE IF EXISTS public.manutencoes CASCADE;
DROP TABLE IF EXISTS public.custos CASCADE;
DROP TABLE IF EXISTS public.documentos CASCADE;
DROP TABLE IF EXISTS public.notas_fiscais CASCADE;
DROP TABLE IF EXISTS public.audit_findings CASCADE;
DROP TABLE IF EXISTS public.pedidos CASCADE;

-- Deletar tabelas base
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.fornecedores CASCADE;
DROP TABLE IF EXISTS public.contratos CASCADE;
DROP TABLE IF EXISTS public.motoristas CASCADE;
DROP TABLE IF EXISTS public.veiculos CASCADE;

-- PASSO 2: CRIAR EXTENSÕES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- PASSO 3: CRIAR TABELAS
-- ============================================

-- 1. VEÍCULOS
CREATE TABLE public.veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  tipo TEXT NULL,
  ano INTEGER NULL,
  cor TEXT NULL,
  combustivel TEXT NULL,
  capacidade INTEGER NULL,
  km_atual NUMERIC NULL,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Inativo','Manutenção')),
  chassi TEXT NULL,
  renavam TEXT NULL,
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX veiculos_placa_idx ON public.veiculos(placa);
CREATE INDEX veiculos_status_idx ON public.veiculos(status);

-- 2. MOTORISTAS
CREATE TABLE public.motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE NULL,
  telefone TEXT NULL,
  email TEXT NULL,
  endereco TEXT NULL,
  cnh TEXT NOT NULL,
  categoria_cnh TEXT NOT NULL,
  validade_cnh DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Inativo','Férias','Afastado')),
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX motoristas_cpf_idx ON public.motoristas(cpf);
CREATE INDEX motoristas_cnh_idx ON public.motoristas(cnh);
CREATE INDEX motoristas_status_idx ON public.motoristas(status);

-- 3. PEDIDOS
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente_nome TEXT NOT NULL,
  cliente_cpf_cnpj TEXT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  data_pedido TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_entrega_prevista DATE NULL,
  data_entrega_realizada TIMESTAMPTZ NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Em Trânsito','Entregue','Cancelado')),
  motorista_id UUID NULL REFERENCES public.motoristas(id),
  veiculo_id UUID NULL REFERENCES public.veiculos(id),
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX pedidos_numero_idx ON public.pedidos(numero);
CREATE INDEX pedidos_status_idx ON public.pedidos(status);
CREATE INDEX pedidos_motorista_idx ON public.pedidos(motorista_id);
CREATE INDEX pedidos_veiculo_idx ON public.pedidos(veiculo_id);

-- 4. PRODUTOS
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT NULL,
  categoria TEXT NOT NULL,
  unidade TEXT NOT NULL,
  quantidade NUMERIC NOT NULL DEFAULT 0,
  estoque_minimo NUMERIC NOT NULL DEFAULT 0,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  localizacao TEXT NULL,
  fornecedor TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX produtos_codigo_idx ON public.produtos(codigo);
CREATE INDEX produtos_categoria_idx ON public.produtos(categoria);

-- 5. CUSTOS
CREATE TABLE public.custos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  veiculo_id UUID NULL REFERENCES public.veiculos(id),
  responsavel TEXT NOT NULL,
  observacoes TEXT NULL,
  status TEXT NULL CHECK (status IN ('Pago','Pendente','Vencido')),
  centro_custo TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX custos_data_idx ON public.custos(data);
CREATE INDEX custos_categoria_idx ON public.custos(categoria);
CREATE INDEX custos_status_idx ON public.custos(status);
CREATE INDEX custos_veiculo_idx ON public.custos(veiculo_id);

-- 6. MANUTENÇÕES
CREATE TABLE public.manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('Preventiva','Corretiva','Revisão')),
  descricao TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NULL,
  km_atual NUMERIC NULL,
  custo NUMERIC NOT NULL DEFAULT 0,
  oficina TEXT NULL,
  responsavel TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Agendada' CHECK (status IN ('Agendada','Em Andamento','Concluída','Cancelada')),
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX manutencoes_veiculo_idx ON public.manutencoes(veiculo_id);
CREATE INDEX manutencoes_status_idx ON public.manutencoes(status);
CREATE INDEX manutencoes_data_idx ON public.manutencoes(data_inicio);

-- 7. RASTREAMENTO - POSIÇÕES
CREATE TABLE public.posicoes_veiculo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  velocidade DOUBLE PRECISION NULL,
  direcao DOUBLE PRECISION NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX posicoes_veiculo_veiculo_idx ON public.posicoes_veiculo(veiculo_id);
CREATE INDEX posicoes_veiculo_timestamp_idx ON public.posicoes_veiculo(timestamp);

-- 8. RASTREAMENTO - ALERTAS
CREATE TABLE public.alertas_rastreamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id),
  tipo TEXT NOT NULL,
  descricao TEXT NULL,
  prioridade TEXT CHECK (prioridade IN ('Baixa','Média','Alta')) DEFAULT 'Média',
  status TEXT CHECK (status IN ('Ativo','Resolvido')) DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX alertas_veiculo_idx ON public.alertas_rastreamento(veiculo_id);
CREATE INDEX alertas_status_idx ON public.alertas_rastreamento(status);

-- 9. CONTRATOS
CREATE TABLE public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente TEXT NOT NULL,
  tipo TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo','Suspenso','Encerrado','Vencido')),
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX contratos_numero_idx ON public.contratos(numero);
CREATE INDEX contratos_status_idx ON public.contratos(status);

-- 10. DOCUMENTOS
CREATE TABLE public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  numero TEXT NOT NULL,
  descricao TEXT NULL,
  entidade_tipo TEXT NOT NULL CHECK (entidade_tipo IN ('Veículo','Motorista','Empresa','Contrato')),
  entidade_id UUID NULL,
  data_emissao DATE NOT NULL,
  data_validade DATE NULL,
  status TEXT NOT NULL DEFAULT 'Válido' CHECK (status IN ('Válido','Vencido','Pendente','Em Renovação')),
  arquivo_url TEXT NULL,
  observacoes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX documentos_tipo_idx ON public.documentos(tipo);
CREATE INDEX documentos_entidade_idx ON public.documentos(entidade_tipo, entidade_id);
CREATE INDEX documentos_status_idx ON public.documentos(status);

-- 11. FORNECEDORES
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT NOT NULL,
  nome_fantasia TEXT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  rg_ie TEXT NULL,
  endereco TEXT NULL,
  telefone TEXT NULL,
  email TEXT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX fornecedores_cpf_cnpj_idx ON public.fornecedores(cpf_cnpj);

-- 12. NOTAS FISCAIS
CREATE TABLE public.notas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  serie TEXT NOT NULL,
  chave_acesso TEXT NOT NULL UNIQUE,
  cnpj TEXT NOT NULL,
  razao_social TEXT NOT NULL,
  fornecedor_id UUID NULL REFERENCES public.fornecedores(id),
  data_emissao DATE NOT NULL,
  data_entrada TIMESTAMPTZ NULL,
  valor_total NUMERIC NOT NULL,
  base_icms NUMERIC NULL,
  valor_icms NUMERIC NULL,
  valor_ipi NUMERIC NULL,
  valor_pis NUMERIC NULL,
  valor_cofins NUMERIC NULL,
  tipo_operacao TEXT NOT NULL CHECK (tipo_operacao IN ('Entrada','Saída')),
  cliente_id UUID NULL,
  pedido_id UUID NULL REFERENCES public.pedidos(id),
  observacoes TEXT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente','Processada','Cancelada','Rejeitada','Ativa')),
  xml_path TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notas_fiscais_chave_idx ON public.notas_fiscais(chave_acesso);
CREATE INDEX notas_fiscais_data_idx ON public.notas_fiscais(data_emissao);
CREATE INDEX notas_fiscais_fornecedor_idx ON public.notas_fiscais(fornecedor_id);

-- 13. AUDITORIA
CREATE TABLE public.audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  descricao TEXT NOT NULL,
  severidade TEXT NOT NULL CHECK (severidade IN ('Crítica','Alta','Média','Baixa')),
  status TEXT NOT NULL CHECK (status IN ('Pendente','Em Análise','Resolvido')),
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_ultima_ocorrencia TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dados_referencia JSONB NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX audit_findings_area_idx ON public.audit_findings(area);
CREATE INDEX audit_findings_status_idx ON public.audit_findings(status);

-- PASSO 4: TRIGGERS UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

CREATE TRIGGER trg_veiculos_updated_at BEFORE UPDATE ON public.veiculos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_motoristas_updated_at BEFORE UPDATE ON public.motoristas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_produtos_updated_at BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_custos_updated_at BEFORE UPDATE ON public.custos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_manutencoes_updated_at BEFORE UPDATE ON public.manutencoes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_contratos_updated_at BEFORE UPDATE ON public.contratos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_documentos_updated_at BEFORE UPDATE ON public.documentos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_notas_fiscais_updated_at BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_audit_findings_updated_at BEFORE UPDATE ON public.audit_findings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PASSO 5: ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posicoes_veiculo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_rastreamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (todos podem ler e escrever)
CREATE POLICY veiculos_all ON public.veiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY motoristas_all ON public.motoristas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY pedidos_all ON public.pedidos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY produtos_all ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY custos_all ON public.custos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY manutencoes_all ON public.manutencoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY posicoes_all ON public.posicoes_veiculo FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY alertas_all ON public.alertas_rastreamento FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY contratos_all ON public.contratos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY documentos_all ON public.documentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY fornecedores_all ON public.fornecedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY notas_fiscais_all ON public.notas_fiscais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY audit_findings_all ON public.audit_findings FOR ALL USING (true) WITH CHECK (true);

-- 14. METAS FINANCEIRAS (PLANEJAMENTO)
CREATE TABLE public.metas_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  meta_anual NUMERIC NOT NULL,
  realizado_atual NUMERIC DEFAULT 0,
  periodo TEXT NOT NULL,
  ano TEXT NOT NULL,
  descricao TEXT NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento','no_prazo','atrasado','concluido','cancelado')),
  progresso NUMERIC DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX metas_financeiras_ano_idx ON public.metas_financeiras(ano);
CREATE INDEX metas_financeiras_status_idx ON public.metas_financeiras(status);
CREATE INDEX metas_financeiras_categoria_idx ON public.metas_financeiras(categoria);

ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;
CREATE POLICY metas_financeiras_all ON public.metas_financeiras FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER trg_metas_financeiras_updated_at BEFORE UPDATE ON public.metas_financeiras
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- PRONTO! TODAS AS TABELAS FORAM CRIADAS
-- ============================================
-- Execute: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- Para verificar
-- ============================================


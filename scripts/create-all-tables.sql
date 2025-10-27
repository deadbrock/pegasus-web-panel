-- ============================================
-- PEGASUS - CRIAÇÃO COMPLETA DE TABELAS
-- ============================================
-- Este script cria TODAS as tabelas necessárias
-- para o Sistema Pegasus funcionar completamente
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. VEÍCULOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.veiculos (
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

CREATE INDEX IF NOT EXISTS veiculos_placa_idx ON public.veiculos(placa);
CREATE INDEX IF NOT EXISTS veiculos_status_idx ON public.veiculos(status);

-- ============================================
-- 2. MOTORISTAS
-- ============================================
CREATE TABLE IF NOT EXISTS public.motoristas (
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

CREATE INDEX IF NOT EXISTS motoristas_cpf_idx ON public.motoristas(cpf);
CREATE INDEX IF NOT EXISTS motoristas_cnh_idx ON public.motoristas(cnh);
CREATE INDEX IF NOT EXISTS motoristas_status_idx ON public.motoristas(status);

-- ============================================
-- 3. PEDIDOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.pedidos (
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

CREATE INDEX IF NOT EXISTS pedidos_numero_idx ON public.pedidos(numero);
CREATE INDEX IF NOT EXISTS pedidos_status_idx ON public.pedidos(status);
CREATE INDEX IF NOT EXISTS pedidos_motorista_idx ON public.pedidos(motorista_id);
CREATE INDEX IF NOT EXISTS pedidos_veiculo_idx ON public.pedidos(veiculo_id);

-- ============================================
-- 4. ESTOQUE - PRODUTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.produtos (
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

CREATE INDEX IF NOT EXISTS produtos_codigo_idx ON public.produtos(codigo);
CREATE INDEX IF NOT EXISTS produtos_categoria_idx ON public.produtos(categoria);

-- ============================================
-- 5. CUSTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.custos (
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

CREATE INDEX IF NOT EXISTS custos_data_idx ON public.custos(data);
CREATE INDEX IF NOT EXISTS custos_categoria_idx ON public.custos(categoria);
CREATE INDEX IF NOT EXISTS custos_status_idx ON public.custos(status);
CREATE INDEX IF NOT EXISTS custos_veiculo_idx ON public.custos(veiculo_id);

-- ============================================
-- 6. MANUTENÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS public.manutencoes (
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

CREATE INDEX IF NOT EXISTS manutencoes_veiculo_idx ON public.manutencoes(veiculo_id);
CREATE INDEX IF NOT EXISTS manutencoes_status_idx ON public.manutencoes(status);
CREATE INDEX IF NOT EXISTS manutencoes_data_idx ON public.manutencoes(data_inicio);

-- ============================================
-- 7. RASTREAMENTO
-- ============================================
CREATE TABLE IF NOT EXISTS public.posicoes_veiculo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  velocidade DOUBLE PRECISION NULL,
  direcao DOUBLE PRECISION NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS posicoes_veiculo_veiculo_idx ON public.posicoes_veiculo(veiculo_id);
CREATE INDEX IF NOT EXISTS posicoes_veiculo_timestamp_idx ON public.posicoes_veiculo(timestamp);

CREATE TABLE IF NOT EXISTS public.alertas_rastreamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID NOT NULL REFERENCES public.veiculos(id),
  tipo TEXT NOT NULL,
  descricao TEXT NULL,
  prioridade TEXT CHECK (prioridade IN ('Baixa','Média','Alta')) DEFAULT 'Média',
  status TEXT CHECK (status IN ('Ativo','Resolvido')) DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alertas_veiculo_idx ON public.alertas_rastreamento(veiculo_id);
CREATE INDEX IF NOT EXISTS alertas_status_idx ON public.alertas_rastreamento(status);

-- ============================================
-- 8. CONTRATOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.contratos (
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

CREATE INDEX IF NOT EXISTS contratos_numero_idx ON public.contratos(numero);
CREATE INDEX IF NOT EXISTS contratos_status_idx ON public.contratos(status);

-- ============================================
-- 9. DOCUMENTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.documentos (
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

CREATE INDEX IF NOT EXISTS documentos_tipo_idx ON public.documentos(tipo);
CREATE INDEX IF NOT EXISTS documentos_entidade_idx ON public.documentos(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS documentos_status_idx ON public.documentos(status);

-- ============================================
-- 10. FISCAL - FORNECEDORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.fornecedores (
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

CREATE INDEX IF NOT EXISTS fornecedores_cpf_cnpj_idx ON public.fornecedores(cpf_cnpj);

-- ============================================
-- 11. FISCAL - NOTAS FISCAIS
-- ============================================
CREATE TABLE IF NOT EXISTS public.notas_fiscais (
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

CREATE INDEX IF NOT EXISTS notas_fiscais_chave_idx ON public.notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS notas_fiscais_data_idx ON public.notas_fiscais(data_emissao);
CREATE INDEX IF NOT EXISTS notas_fiscais_fornecedor_idx ON public.notas_fiscais(fornecedor_id);

-- ============================================
-- 12. AUDITORIA
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_findings (
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

CREATE INDEX IF NOT EXISTS audit_findings_area_idx ON public.audit_findings(area);
CREATE INDEX IF NOT EXISTS audit_findings_status_idx ON public.audit_findings(status);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END$$;

-- Aplicar trigger em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS trg_veiculos_updated_at ON public.veiculos;
CREATE TRIGGER trg_veiculos_updated_at BEFORE UPDATE ON public.veiculos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_motoristas_updated_at ON public.motoristas;
CREATE TRIGGER trg_motoristas_updated_at BEFORE UPDATE ON public.motoristas
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pedidos_updated_at ON public.pedidos;
CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON public.pedidos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_produtos_updated_at ON public.produtos;
CREATE TRIGGER trg_produtos_updated_at BEFORE UPDATE ON public.produtos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_custos_updated_at ON public.custos;
CREATE TRIGGER trg_custos_updated_at BEFORE UPDATE ON public.custos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_manutencoes_updated_at ON public.manutencoes;
CREATE TRIGGER trg_manutencoes_updated_at BEFORE UPDATE ON public.manutencoes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_contratos_updated_at ON public.contratos;
CREATE TRIGGER trg_contratos_updated_at BEFORE UPDATE ON public.contratos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_documentos_updated_at ON public.documentos;
CREATE TRIGGER trg_documentos_updated_at BEFORE UPDATE ON public.documentos
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_fornecedores_updated_at ON public.fornecedores;
CREATE TRIGGER trg_fornecedores_updated_at BEFORE UPDATE ON public.fornecedores
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_notas_fiscais_updated_at ON public.notas_fiscais;
CREATE TRIGGER trg_notas_fiscais_updated_at BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_audit_findings_updated_at ON public.audit_findings;
CREATE TRIGGER trg_audit_findings_updated_at BEFORE UPDATE ON public.audit_findings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS em todas as tabelas
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

-- Políticas permissivas (ajustar conforme necessário)
-- VEÍCULOS
DROP POLICY IF EXISTS veiculos_select_all ON public.veiculos;
CREATE POLICY veiculos_select_all ON public.veiculos FOR SELECT USING (true);
DROP POLICY IF EXISTS veiculos_write_all ON public.veiculos;
CREATE POLICY veiculos_write_all ON public.veiculos FOR ALL USING (true) WITH CHECK (true);

-- MOTORISTAS
DROP POLICY IF EXISTS motoristas_select_all ON public.motoristas;
CREATE POLICY motoristas_select_all ON public.motoristas FOR SELECT USING (true);
DROP POLICY IF EXISTS motoristas_write_all ON public.motoristas;
CREATE POLICY motoristas_write_all ON public.motoristas FOR ALL USING (true) WITH CHECK (true);

-- PEDIDOS
DROP POLICY IF EXISTS pedidos_select_all ON public.pedidos;
CREATE POLICY pedidos_select_all ON public.pedidos FOR SELECT USING (true);
DROP POLICY IF EXISTS pedidos_write_all ON public.pedidos;
CREATE POLICY pedidos_write_all ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

-- PRODUTOS
DROP POLICY IF EXISTS produtos_select_all ON public.produtos;
CREATE POLICY produtos_select_all ON public.produtos FOR SELECT USING (true);
DROP POLICY IF EXISTS produtos_write_all ON public.produtos;
CREATE POLICY produtos_write_all ON public.produtos FOR ALL USING (true) WITH CHECK (true);

-- CUSTOS
DROP POLICY IF EXISTS custos_select_all ON public.custos;
CREATE POLICY custos_select_all ON public.custos FOR SELECT USING (true);
DROP POLICY IF EXISTS custos_write_all ON public.custos;
CREATE POLICY custos_write_all ON public.custos FOR ALL USING (true) WITH CHECK (true);

-- MANUTENÇÕES
DROP POLICY IF EXISTS manutencoes_select_all ON public.manutencoes;
CREATE POLICY manutencoes_select_all ON public.manutencoes FOR SELECT USING (true);
DROP POLICY IF EXISTS manutencoes_write_all ON public.manutencoes;
CREATE POLICY manutencoes_write_all ON public.manutencoes FOR ALL USING (true) WITH CHECK (true);

-- POSIÇÕES VEÍCULO
DROP POLICY IF EXISTS posicoes_select_all ON public.posicoes_veiculo;
CREATE POLICY posicoes_select_all ON public.posicoes_veiculo FOR SELECT USING (true);
DROP POLICY IF EXISTS posicoes_write_all ON public.posicoes_veiculo;
CREATE POLICY posicoes_write_all ON public.posicoes_veiculo FOR ALL USING (true) WITH CHECK (true);

-- ALERTAS
DROP POLICY IF EXISTS alertas_select_all ON public.alertas_rastreamento;
CREATE POLICY alertas_select_all ON public.alertas_rastreamento FOR SELECT USING (true);
DROP POLICY IF EXISTS alertas_write_all ON public.alertas_rastreamento;
CREATE POLICY alertas_write_all ON public.alertas_rastreamento FOR ALL USING (true) WITH CHECK (true);

-- CONTRATOS
DROP POLICY IF EXISTS contratos_select_all ON public.contratos;
CREATE POLICY contratos_select_all ON public.contratos FOR SELECT USING (true);
DROP POLICY IF EXISTS contratos_write_all ON public.contratos;
CREATE POLICY contratos_write_all ON public.contratos FOR ALL USING (true) WITH CHECK (true);

-- DOCUMENTOS
DROP POLICY IF EXISTS documentos_select_all ON public.documentos;
CREATE POLICY documentos_select_all ON public.documentos FOR SELECT USING (true);
DROP POLICY IF EXISTS documentos_write_all ON public.documentos;
CREATE POLICY documentos_write_all ON public.documentos FOR ALL USING (true) WITH CHECK (true);

-- FORNECEDORES
DROP POLICY IF EXISTS fornecedores_select_all ON public.fornecedores;
CREATE POLICY fornecedores_select_all ON public.fornecedores FOR SELECT USING (true);
DROP POLICY IF EXISTS fornecedores_write_all ON public.fornecedores;
CREATE POLICY fornecedores_write_all ON public.fornecedores FOR ALL USING (true) WITH CHECK (true);

-- NOTAS FISCAIS
DROP POLICY IF EXISTS notas_fiscais_select_all ON public.notas_fiscais;
CREATE POLICY notas_fiscais_select_all ON public.notas_fiscais FOR SELECT USING (true);
DROP POLICY IF EXISTS notas_fiscais_write_all ON public.notas_fiscais;
CREATE POLICY notas_fiscais_write_all ON public.notas_fiscais FOR ALL USING (true) WITH CHECK (true);

-- AUDIT FINDINGS
DROP POLICY IF EXISTS audit_findings_select_all ON public.audit_findings;
CREATE POLICY audit_findings_select_all ON public.audit_findings FOR SELECT USING (true);
DROP POLICY IF EXISTS audit_findings_write_all ON public.audit_findings;
CREATE POLICY audit_findings_write_all ON public.audit_findings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FIM DO SCRIPT
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- para criar todas as tabelas do sistema
-- ============================================


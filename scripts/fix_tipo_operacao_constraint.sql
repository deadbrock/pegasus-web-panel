-- ============================================
-- CORREÇÃO DO CONSTRAINT DE TIPO_OPERACAO
-- Aceita tanto maiúscula quanto minúscula
-- ============================================

-- Remover constraint antigo
ALTER TABLE public.notas_fiscais 
DROP CONSTRAINT IF EXISTS notas_fiscais_tipo_operacao_check;

-- Criar novo constraint que aceita ambos os formatos
ALTER TABLE public.notas_fiscais
ADD CONSTRAINT notas_fiscais_tipo_operacao_check 
CHECK (tipo_operacao IN ('entrada', 'saida', 'Entrada', 'Saída'));

-- Teste
DO $$
BEGIN
  RAISE NOTICE '✅ Constraint corrigido!';
  RAISE NOTICE 'Agora aceita: entrada, saida, Entrada, Saída';
END$$;


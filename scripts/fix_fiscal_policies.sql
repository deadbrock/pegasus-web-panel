-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS - MÓDULO FISCAL
-- Remove políticas duplicadas e garante acesso
-- ============================================

-- NOTAS FISCAIS - Limpar e recriar
DROP POLICY IF EXISTS "notas_fiscais_all" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Permitir leitura de notas fiscais" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Permitir inserção de notas fiscais" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Permitir atualização de notas fiscais" ON public.notas_fiscais;
DROP POLICY IF EXISTS "Permitir exclusão de notas fiscais" ON public.notas_fiscais;
DROP POLICY IF EXISTS "nf_select_all" ON public.notas_fiscais;
DROP POLICY IF EXISTS "nf_write_all" ON public.notas_fiscais;

CREATE POLICY "public_notas_select" ON public.notas_fiscais FOR SELECT USING (true);
CREATE POLICY "public_notas_insert" ON public.notas_fiscais FOR INSERT WITH CHECK (true);
CREATE POLICY "public_notas_update" ON public.notas_fiscais FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_notas_delete" ON public.notas_fiscais FOR DELETE USING (true);

-- FORNECEDORES - Limpar e recriar
DROP POLICY IF EXISTS "fornecedores_all" ON public.fornecedores;
DROP POLICY IF EXISTS "Permitir leitura de fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Permitir inserção de fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Permitir atualização de fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "Permitir exclusão de fornecedores" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_select_all" ON public.fornecedores;
DROP POLICY IF EXISTS "fornecedores_write_all" ON public.fornecedores;

CREATE POLICY "public_fornecedores_select" ON public.fornecedores FOR SELECT USING (true);
CREATE POLICY "public_fornecedores_insert" ON public.fornecedores FOR INSERT WITH CHECK (true);
CREATE POLICY "public_fornecedores_update" ON public.fornecedores FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_fornecedores_delete" ON public.fornecedores FOR DELETE USING (true);

-- ITENS NOTA FISCAL - Limpar e recriar
DROP POLICY IF EXISTS "itens_write_all" ON public.itens_nota_fiscal;
DROP POLICY IF EXISTS "Permitir leitura de itens" ON public.itens_nota_fiscal;
DROP POLICY IF EXISTS "Permitir inserção de itens" ON public.itens_nota_fiscal;
DROP POLICY IF EXISTS "Permitir atualização de itens" ON public.itens_nota_fiscal;
DROP POLICY IF EXISTS "Permitir exclusão de itens" ON public.itens_nota_fiscal;
DROP POLICY IF EXISTS "itens_select_all" ON public.itens_nota_fiscal;
DROP POLICY IF EXISTS "itens_write_all" ON public.itens_nota_fiscal;

CREATE POLICY "public_itens_select" ON public.itens_nota_fiscal FOR SELECT USING (true);
CREATE POLICY "public_itens_insert" ON public.itens_nota_fiscal FOR INSERT WITH CHECK (true);
CREATE POLICY "public_itens_update" ON public.itens_nota_fiscal FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_itens_delete" ON public.itens_nota_fiscal FOR DELETE USING (true);

-- Verificação final
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS corrigidas!';
  RAISE NOTICE 'Agora você tem 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)';
END$$;


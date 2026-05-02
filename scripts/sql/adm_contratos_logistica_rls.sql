-- ============================================================
-- RLS — Acesso logistica à tabela adm_contratos (somente leitura)
-- ============================================================
-- Execute este script no Editor SQL do Supabase.
-- Permite que o perfil "logistica" leia todos os contratos ADM.
-- Escrita (insert/update/delete) continua restrita a admin/diretor/adm_contratos.
-- ============================================================

-- 1. Remove a política SELECT atual para recriar com logistica incluída
DROP POLICY IF EXISTS "adm_contratos_select" ON public.adm_contratos;

-- 2. Recria a política SELECT incluindo logistica
CREATE POLICY "adm_contratos_select" ON public.adm_contratos
  FOR SELECT TO authenticated
  USING (
    -- admin e diretor veem tudo
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' IN ('admin', 'diretor')
    OR
    -- logistica vê todos os contratos (apenas leitura, restrição financeira é feita no front)
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'logistica'
    OR
    -- adm_contratos vê contratos vinculados (ou todos, se não há vínculos)
    (
      (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'adm_contratos'
      AND (
        NOT EXISTS (
          SELECT 1 FROM public.adm_user_contracts uc WHERE uc.user_id = auth.uid()
        )
        OR
        EXISTS (
          SELECT 1 FROM public.adm_user_contracts uc
          WHERE uc.user_id = auth.uid() AND uc.contrato_id = id
        )
      )
    )
  );

-- 3. Verificação — deve retornar a política recriada
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'adm_contratos' AND policyname = 'adm_contratos_select';

-- ============================================================
-- GESTÃO ADM — Criação do bucket de Storage para anexos
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- 1. Criar o bucket (privado — acesso via signed URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'contratos-anexos',
  'contratos-anexos',
  false,                          -- privado: não listável publicamente
  52428800,                       -- 50 MB por arquivo
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Políticas de acesso ao Storage
-- ============================================================

-- SELECT (download/read) — apenas roles autorizadas
CREATE POLICY "storage_contratos_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'contratos-anexos'
    AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
          IN ('admin', 'diretor', 'adm_contratos')
  );

-- INSERT (upload) — apenas roles autorizadas
CREATE POLICY "storage_contratos_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'contratos-anexos'
    AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
          IN ('admin', 'diretor', 'adm_contratos')
  );

-- DELETE (remover arquivo) — apenas roles autorizadas
CREATE POLICY "storage_contratos_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'contratos-anexos'
    AND (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
          IN ('admin', 'diretor', 'adm_contratos')
  );

-- ============================================================
-- Verificação — deve retornar 1 linha com id = 'contratos-anexos'
-- ============================================================
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id = 'contratos-anexos';

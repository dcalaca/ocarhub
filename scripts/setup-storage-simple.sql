-- Configurar políticas RLS para o bucket vehicle-photos
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Habilitar RLS no storage.objects (se não estiver habilitado)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Public read access for vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own vehicle photos" ON storage.objects;

-- 3. Política para permitir leitura pública de imagens
CREATE POLICY "Public read access for vehicle photos" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-photos');

-- 4. Política para permitir upload de imagens por usuários autenticados
CREATE POLICY "Authenticated users can upload vehicle photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- 5. Política para permitir atualização de imagens por usuários autenticados
CREATE POLICY "Users can update vehicle photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- 6. Política para permitir exclusão de imagens por usuários autenticados
CREATE POLICY "Users can delete vehicle photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- 7. Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

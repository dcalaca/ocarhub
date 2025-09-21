-- Configurar políticas RLS para o bucket vehicle-photos
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 2. Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Public read access for vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete vehicle photos" ON storage.objects;

-- 3. Criar política para leitura pública
CREATE POLICY "Public read access for vehicle photos" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-photos');

-- 4. Criar política para upload por usuários autenticados
CREATE POLICY "Authenticated users can upload vehicle photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- 5. Criar política para atualização por usuários autenticados
CREATE POLICY "Users can update vehicle photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- 6. Criar política para exclusão por usuários autenticados
CREATE POLICY "Users can delete vehicle photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- 7. Verificar políticas criadas
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

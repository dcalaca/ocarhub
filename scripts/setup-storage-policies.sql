-- Configurar políticas RLS para o bucket vehicle-photos
-- Execute este SQL no Supabase Dashboard após criar o bucket

-- 1. Criar o bucket (se não existir)
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'vehicle-photos',
--   'vehicle-photos',
--   true,
--   5242880, -- 5MB
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
-- );

-- 2. Política para permitir leitura pública de imagens
CREATE POLICY "Public read access for vehicle photos" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-photos');

-- 3. Política para permitir upload de imagens por usuários autenticados
CREATE POLICY "Authenticated users can upload vehicle photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Política para permitir atualização de imagens pelo dono
CREATE POLICY "Users can update their own vehicle photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 5. Política para permitir exclusão de imagens pelo dono
CREATE POLICY "Users can delete their own vehicle photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 6. Habilitar RLS no storage.objects (se não estiver habilitado)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

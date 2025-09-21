-- Políticas RLS simples para vehicle-photos
-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Política 1: Leitura pública
CREATE POLICY "Public read access for vehicle photos" ON storage.objects
FOR SELECT USING (bucket_id = 'vehicle-photos');

-- Política 2: Upload por usuários autenticados
CREATE POLICY "Authenticated users can upload vehicle photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- Política 3: Atualização por usuários autenticados
CREATE POLICY "Users can update vehicle photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

-- Política 4: Exclusão por usuários autenticados
CREATE POLICY "Users can delete vehicle photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'vehicle-photos' 
  AND auth.role() = 'authenticated'
);

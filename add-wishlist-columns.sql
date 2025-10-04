-- Adicionar colunas que faltam na tabela ocar_wishlist_veiculos
-- Execute este SQL no painel do Supabase

-- Adicionar colunas que faltam
ALTER TABLE ocar_wishlist_veiculos 
ADD COLUMN IF NOT EXISTS unico_dono BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS km_min INTEGER,
ADD COLUMN IF NOT EXISTS km_max INTEGER,
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_estado ON ocar_wishlist_veiculos(estado);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_unico_dono ON ocar_wishlist_veiculos(unico_dono);

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_wishlist_veiculos' 
ORDER BY ordinal_position;

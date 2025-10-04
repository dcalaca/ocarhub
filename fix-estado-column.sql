-- Corrigir campo estado para aceitar nomes completos
-- Execute este SQL no painel do Supabase

-- Alterar o campo estado para aceitar nomes completos
ALTER TABLE ocar_wishlist_veiculos 
ALTER COLUMN estado TYPE VARCHAR(50);

-- Verificar se a alteração foi aplicada
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'ocar_wishlist_veiculos' 
AND column_name = 'estado';

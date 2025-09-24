-- Corrigir constraint da tabela ocar_vehicles para aceitar 'premium'
-- Execute este SQL no Supabase SQL Editor

-- Remover a constraint antiga
ALTER TABLE ocar_vehicles DROP CONSTRAINT IF EXISTS ocar_vehicles_plano_check;

-- Adicionar nova constraint que aceita os 3 tipos de plano
ALTER TABLE ocar_vehicles ADD CONSTRAINT ocar_vehicles_plano_check 
CHECK (plano IN ('gratuito', 'destaque', 'premium'));

-- Verificar se a constraint foi aplicada corretamente
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'ocar_vehicles'::regclass 
AND conname = 'ocar_vehicles_plano_check';

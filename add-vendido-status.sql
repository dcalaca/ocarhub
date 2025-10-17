-- Adicionar status "vendido" à constraint da tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, remover a constraint atual
ALTER TABLE ocar_vehicles DROP CONSTRAINT IF EXISTS ocar_vehicles_status_check;

-- Adicionar nova constraint com o status "vendido"
ALTER TABLE ocar_vehicles ADD CONSTRAINT ocar_vehicles_status_check 
CHECK (status IN ('ativo', 'pausado', 'expirado', 'vendido'));

-- Verificar se a constraint foi aplicada corretamente
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'ocar_vehicles'::regclass 
AND conname = 'ocar_vehicles_status_check';

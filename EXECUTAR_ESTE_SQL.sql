-- EXECUTE ESTE SQL NO SUPABASE SQL EDITOR
-- URL: https://supabase.com/dashboard/project/kfsteismyqpekbaqwuez/sql

-- Adicionar status "vendido" à constraint da tabela ocar_vehicles
ALTER TABLE ocar_vehicles DROP CONSTRAINT IF EXISTS ocar_vehicles_status_check;

ALTER TABLE ocar_vehicles ADD CONSTRAINT ocar_vehicles_status_check 
CHECK (status IN ('ativo', 'pausado', 'expirado', 'vendido'));

-- Verificar se funcionou
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'ocar_vehicles'::regclass 
AND conname = 'ocar_vehicles_status_check';

-- Desabilitar Row Level Security para a tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

ALTER TABLE ocar_vehicles DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ocar_vehicles';

-- Desabilitar Row Level Security para todas as tabelas do Ocar
-- Execute este SQL no Supabase SQL Editor

-- Desabilitar RLS para ocar_usuarios
ALTER TABLE ocar_usuarios DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS para ocar_vehicles
ALTER TABLE ocar_vehicles DISABLE ROW LEVEL SECURITY;

-- Verificar status do RLS em todas as tabelas
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'SIM' 
        ELSE 'NÃO' 
    END as status_rls
FROM pg_tables 
WHERE tablename LIKE 'ocar_%'
ORDER BY tablename;

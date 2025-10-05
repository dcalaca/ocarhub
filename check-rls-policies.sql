-- Verificar políticas RLS na tabela ocar_planos
-- Execute este SQL no Supabase SQL Editor

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ocar_planos';

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ocar_planos';

-- Se necessário, desabilitar RLS temporariamente para admin
-- ALTER TABLE ocar_planos DISABLE ROW LEVEL SECURITY;

-- Ou criar política permissiva para admin
-- CREATE POLICY "Admin pode gerenciar planos" ON ocar_planos
-- FOR ALL TO authenticated
-- USING (auth.jwt() ->> 'email' = 'dcalaca@gmail.com')
-- WITH CHECK (auth.jwt() ->> 'email' = 'dcalaca@gmail.com');

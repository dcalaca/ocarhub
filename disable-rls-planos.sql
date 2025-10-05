-- Desabilitar RLS na tabela ocar_planos para permitir acesso admin
-- Execute este SQL no Supabase SQL Editor

-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ocar_planos';

-- Desabilitar RLS temporariamente
ALTER TABLE ocar_planos DISABLE ROW LEVEL SECURITY;

-- Verificar se foi desabilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ocar_planos';

-- Comentário: Se preferir manter RLS ativo, pode criar uma política específica:
-- CREATE POLICY "Admin pode gerenciar planos" ON ocar_planos
-- FOR ALL TO authenticated
-- USING (auth.jwt() ->> 'email' = 'dcalaca@gmail.com')
-- WITH CHECK (auth.jwt() ->> 'email' = 'dcalaca@gmail.com');

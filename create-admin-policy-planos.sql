-- Criar política RLS para admin gerenciar planos
-- Execute este SQL no Supabase SQL Editor

-- Política para permitir que o admin (dcalaca@gmail.com) gerencie todos os planos
CREATE POLICY "Admin pode gerenciar planos" ON ocar_planos
FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'dcalaca@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'dcalaca@gmail.com');

-- Verificar se a política foi criada
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ocar_planos'
ORDER BY policyname;

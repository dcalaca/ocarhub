-- Atualizar usuários existentes com saldo padrão
-- Execute este SQL no Supabase SQL Editor

UPDATE ocar_usuarios 
SET saldo = 1000.00 
WHERE email = 'teste@ocar.com';

UPDATE ocar_usuarios 
SET saldo = 2000.00 
WHERE email = 'vendedor@ocar.com';

UPDATE ocar_usuarios 
SET saldo = 500.00 
WHERE email = 'maria@ocar.com';

-- Para outros usuários que possam existir
UPDATE ocar_usuarios 
SET saldo = 0.00 
WHERE saldo IS NULL;

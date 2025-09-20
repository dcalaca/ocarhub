-- SQL para limpar completamente a tabela ocar_transbordo
-- Execute este SQL no Supabase SQL Editor

-- 1. Limpar todos os registros da tabela
DELETE FROM ocar_transbordo;

-- 2. Verificar se a tabela está vazia
SELECT COUNT(*) as total_registros FROM ocar_transbordo;

-- 3. (Opcional) Resetar a sequência do ID se necessário
-- ALTER SEQUENCE ocar_transbordo_id_seq RESTART WITH 1;

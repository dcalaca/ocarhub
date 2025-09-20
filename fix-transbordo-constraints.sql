-- Script para corrigir constraints da tabela ocar_transbordo
-- Execute no Supabase SQL Editor

-- 1. Verificar constraints existentes
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ocar_transbordo'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- 2. Criar constraint única para evitar duplicidades
-- Baseado em: marca, modelo, ano, codigo_fipe
ALTER TABLE ocar_transbordo 
ADD CONSTRAINT unique_vehicle_data 
UNIQUE (marca, modelo, ano, codigo_fipe);

-- 3. Verificar se a constraint foi criada
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ocar_transbordo'
    AND tc.constraint_type = 'UNIQUE'
ORDER BY tc.constraint_name, kcu.ordinal_position;

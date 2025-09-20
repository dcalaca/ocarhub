-- Verificar estrutura das tabelas
-- Execute no Supabase SQL Editor

-- 1. Verificar estrutura da tabela ocar_fipe_brands
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_fipe_brands' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela ocar_fipe_brands
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ocar_fipe_brands' 
AND tc.table_schema = 'public';

-- 3. Verificar estrutura da tabela ocar_fipe_models
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_fipe_models' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar constraints da tabela ocar_fipe_models
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ocar_fipe_models' 
AND tc.table_schema = 'public';

-- 5. Verificar estrutura da tabela ocar_fipe_prices
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_fipe_prices' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar constraints da tabela ocar_fipe_prices
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ocar_fipe_prices' 
AND tc.table_schema = 'public';

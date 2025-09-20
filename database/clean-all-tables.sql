-- Limpar completamente todas as tabelas
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 2. Limpar todas as tabelas
DELETE FROM public.ocar_fipe_prices;
DELETE FROM public.ocar_fipe_models;
DELETE FROM public.ocar_fipe_brands;

-- 3. Resetar sequências (se houver)
-- ALTER SEQUENCE IF EXISTS ocar_fipe_brands_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS ocar_fipe_models_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS ocar_fipe_prices_id_seq RESTART WITH 1;

-- 4. Verificar se estão vazias
SELECT 
  'ocar_fipe_brands' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 
  'ocar_fipe_models' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 
  'ocar_fipe_prices' as tabela, COUNT(*) as total FROM ocar_fipe_prices;

-- 5. Verificar se ocar_transbordo tem dados
SELECT 
  'ocar_transbordo' as tabela, COUNT(*) as total FROM ocar_transbordo;

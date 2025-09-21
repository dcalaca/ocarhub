-- Ultra limpeza das tabelas - forçar remoção completa
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 2. Deletar todos os registros com CASCADE
DELETE FROM public.ocar_fipe_prices;
DELETE FROM public.ocar_fipe_models;
DELETE FROM public.ocar_fipe_brands;

-- 3. Verificar se estão vazias
SELECT 
  'ocar_fipe_brands' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 
  'ocar_fipe_models' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 
  'ocar_fipe_prices' as tabela, COUNT(*) as total FROM ocar_fipe_prices;

-- 4. Verificar se ocar_transbordo tem dados
SELECT 
  'ocar_transbordo' as tabela, COUNT(*) as total FROM ocar_transbordo;

-- 5. Se ocar_transbordo estiver vazia, vamos verificar se há dados em outras tabelas
SELECT 
  'Verificando outras tabelas...' as status;

-- 6. Verificar se há dados em tabelas relacionadas
SELECT 
  'Tabelas do sistema:' as tipo,
  COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ocar_%';

-- Desabilitar RLS temporariamente para migração
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS nas tabelas
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_prices DISABLE ROW LEVEL SECURITY;

-- 2. Verificar status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_prices')
AND schemaname = 'public';

-- 3. Comentário
COMMENT ON TABLE public.ocar_fipe_brands IS 'RLS desabilitado temporariamente para migração';
COMMENT ON TABLE public.ocar_fipe_models IS 'RLS desabilitado temporariamente para migração';
COMMENT ON TABLE public.ocar_fipe_prices IS 'RLS desabilitado temporariamente para migração';

-- Inserir APENAS marcas novas (que não existem no sistema)
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ========================================

ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. INSERIR APENAS MARCAS NOVAS
-- ========================================

-- 2.1. Inserir marcas que NÃO existem no sistema
INSERT INTO ocar_fipe_brands(name, code)
SELECT DISTINCT 
  t.marca as name,
  LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10) as code
FROM (
  SELECT DISTINCT marca 
  FROM ocar_transbordo 
  WHERE COALESCE(marca,'') <> ''
) t
LEFT JOIN ocar_fipe_brands b ON b.code = LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10)
WHERE b.code IS NULL
ORDER BY t.marca;

-- ========================================
-- 3. VERIFICAR RESULTADO
-- ========================================

-- 3.1. Contar marcas inseridas
SELECT 'MARCAS INSERIDAS' as status, COUNT(*) as total FROM ocar_fipe_brands;

-- 3.2. Listar todas as marcas (existentes + novas)
SELECT 'TODAS AS MARCAS' as info, name, code FROM ocar_fipe_brands ORDER BY name;

-- 3.3. Verificar se ainda há marcas novas no transbordo
SELECT 'MARCAS AINDA FALTANDO' as status, COUNT(*) as total
FROM (
  SELECT DISTINCT marca 
  FROM ocar_transbordo 
  WHERE COALESCE(marca,'') <> ''
) t
LEFT JOIN ocar_fipe_brands b ON b.code = LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10)
WHERE b.code IS NULL;

-- ========================================
-- 4. REABILITAR RLS
-- ========================================

ALTER TABLE public.ocar_fipe_brands ENABLE ROW LEVEL SECURITY;

-- Limpar e inserir TODAS as marcas únicas
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. DESABILITAR RLS E LIMPAR TUDO
-- ========================================

-- 1.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 1.2. Limpar TODA a tabela de marcas
DELETE FROM public.ocar_fipe_brands;

-- ========================================
-- 2. INSERIR TODAS AS MARCAS ÚNICAS
-- ========================================

-- 2.1. Inserir TODAS as marcas únicas do transbordo
INSERT INTO ocar_fipe_brands(name, code)
SELECT DISTINCT 
  marca as name,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as code
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> ''
ORDER BY marca;

-- ========================================
-- 3. VERIFICAR RESULTADO
-- ========================================

-- 3.1. Contar marcas inseridas
SELECT 'TOTAL DE MARCAS' as status, COUNT(*) as total FROM ocar_fipe_brands;

-- 3.2. Listar todas as marcas
SELECT 'TODAS AS MARCAS' as info, name, code FROM ocar_fipe_brands ORDER BY name;

-- 3.3. Verificar se há duplicatas
SELECT 'VERIFICAR DUPLICATAS' as info, code, COUNT(*) as total
FROM ocar_fipe_brands
GROUP BY code
HAVING COUNT(*) > 1;

-- ========================================
-- 4. REABILITAR RLS
-- ========================================

ALTER TABLE public.ocar_fipe_brands ENABLE ROW LEVEL SECURITY;

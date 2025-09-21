-- Resolver duplicatas e inserir marcas de forma definitiva
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. DESABILITAR RLS E LIMPAR TUDO
-- ========================================

-- 1.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 1.2. Limpar TODA a tabela de marcas
DELETE FROM public.ocar_fipe_brands;

-- ========================================
-- 2. VERIFICAR DUPLICATAS NO TRANSBORDO
-- ========================================

-- 2.1. Verificar marcas que geram o mesmo código
SELECT 'MARCAS COM CÓDIGO DUPLICADO' as info, 
       marca, 
       LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as codigo_gerado,
       COUNT(*) as total
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> ''
GROUP BY marca, LEFT(LOWER(REPLACE(marca, ' ', '-')), 10)
HAVING COUNT(*) > 1
ORDER BY codigo_gerado;

-- ========================================
-- 3. INSERIR MARCAS COM TRATAMENTO DE DUPLICATAS
-- ========================================

-- 3.1. Inserir marcas únicas, tratando duplicatas de código
INSERT INTO ocar_fipe_brands(name, code)
SELECT DISTINCT 
  marca as name,
  CASE 
    WHEN COUNT(*) OVER (PARTITION BY LEFT(LOWER(REPLACE(marca, ' ', '-')), 10)) > 1 
    THEN LEFT(LOWER(REPLACE(marca, ' ', '-')), 8) || ROW_NUMBER() OVER (PARTITION BY LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) ORDER BY marca)
    ELSE LEFT(LOWER(REPLACE(marca, ' ', '-')), 10)
  END as code
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> ''
ORDER BY marca;

-- ========================================
-- 4. VERIFICAR RESULTADO
-- ========================================

-- 4.1. Contar marcas inseridas
SELECT 'TOTAL DE MARCAS' as status, COUNT(*) as total FROM ocar_fipe_brands;

-- 4.2. Listar todas as marcas
SELECT 'TODAS AS MARCAS' as info, name, code FROM ocar_fipe_brands ORDER BY name;

-- 4.3. Verificar se ainda há duplicatas de código
SELECT 'VERIFICAR DUPLICATAS DE CÓDIGO' as info, code, COUNT(*) as total
FROM ocar_fipe_brands
GROUP BY code
HAVING COUNT(*) > 1;

-- ========================================
-- 5. REABILITAR RLS
-- ========================================

ALTER TABLE public.ocar_fipe_brands ENABLE ROW LEVEL SECURITY;

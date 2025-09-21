-- Debug e limpeza específica de modelos
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. DEBUG - VERIFICAR O QUE ESTÁ NA TABELA
-- ========================================

-- 1.1. Verificar quantos modelos existem
SELECT 'MODELOS EXISTENTES' as status, COUNT(*) as total FROM ocar_fipe_models;

-- 1.2. Verificar modelos problemáticos
SELECT 'MODELOS PROBLEMÁTICOS' as info, brand_code, code, name 
FROM ocar_fipe_models 
WHERE brand_code = 'honda' AND code LIKE 'honda-city%'
ORDER BY code;

-- 1.3. Verificar todos os modelos Honda
SELECT 'TODOS OS MODELOS HONDA' as info, brand_code, code, name 
FROM ocar_fipe_models 
WHERE brand_code = 'honda'
ORDER BY code;

-- ========================================
-- 2. LIMPEZA ESPECÍFICA
-- ========================================

-- 2.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;

-- 2.2. Limpar TODOS os modelos
TRUNCATE TABLE public.ocar_fipe_models CASCADE;

-- 2.3. Verificar se a tabela está vazia
SELECT 'APÓS TRUNCATE - ocar_fipe_models' as status, COUNT(*) as total FROM ocar_fipe_models;

-- ========================================
-- 3. MIGRAÇÃO SIMPLES DE MODELOS
-- ========================================

-- 3.1. Inserir modelos únicos (agrupados por marca)
INSERT INTO ocar_fipe_models(brand_code, name, code)
SELECT 
  b.code as brand_code,
  t.modelo as name,
  CONCAT(b.code, '-', LEFT(LOWER(REPLACE(t.modelo, ' ', '-')), 20)) as code
FROM (
  SELECT DISTINCT marca, modelo
  FROM ocar_transbordo
  WHERE COALESCE(marca,'') <> '' AND COALESCE(modelo,'') <> ''
) t
JOIN ocar_fipe_brands b ON b.name = t.marca
ORDER BY t.marca, t.modelo;

-- 3.2. Verificar modelos inseridos
SELECT 'MODELOS INSERIDOS' as status, COUNT(*) as total FROM ocar_fipe_models;
SELECT 'Amostra Modelos' as tipo, name, code, brand_code FROM ocar_fipe_models ORDER BY name LIMIT 20;

-- ========================================
-- 4. REABILITAR RLS
-- ========================================

-- 4.1. Reabilitar RLS
ALTER TABLE public.ocar_fipe_models ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. VERIFICAÇÃO FINAL
-- ========================================

-- 5.1. Contagem de modelos
SELECT 'Total de Modelos' as info, COUNT(*) as total FROM ocar_fipe_models;

-- 5.2. Lista completa de modelos
SELECT 'Lista Completa' as info, name, code, brand_code FROM ocar_fipe_models ORDER BY name;

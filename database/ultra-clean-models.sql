-- Limpeza ultra agressiva de modelos
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. LIMPEZA ULTRA AGRESSIVA
-- ========================================

-- 1.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;

-- 1.2. Limpeza ultra agressiva com CASCADE
DELETE FROM public.ocar_fipe_models CASCADE;

-- 1.3. Verificar se a tabela está vazia
SELECT 'APÓS LIMPEZA - ocar_fipe_models' as status, COUNT(*) as total FROM ocar_fipe_models;

-- ========================================
-- 2. MIGRAÇÃO SIMPLES DE MODELOS
-- ========================================

-- 2.1. Inserir modelos únicos (agrupados por marca)
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

-- 2.2. Verificar modelos inseridos
SELECT 'MODELOS INSERIDOS' as status, COUNT(*) as total FROM ocar_fipe_models;
SELECT 'Amostra Modelos' as tipo, name, code, brand_code FROM ocar_fipe_models ORDER BY name LIMIT 20;

-- ========================================
-- 3. REABILITAR RLS
-- ========================================

-- 3.1. Reabilitar RLS
ALTER TABLE public.ocar_fipe_models ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. VERIFICAÇÃO FINAL
-- ========================================

-- 4.1. Contagem de modelos
SELECT 'Total de Modelos' as info, COUNT(*) as total FROM ocar_fipe_models;

-- 4.2. Lista completa de modelos
SELECT 'Lista Completa' as info, name, code, brand_code FROM ocar_fipe_models ORDER BY name;

-- Migração simples de modelos - agrupa e sobe para models
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. MIGRAÇÃO SIMPLES DE MODELOS
-- ========================================

-- 1.1. Limpar tabela de modelos
DELETE FROM ocar_fipe_models;

-- 1.2. Inserir modelos únicos (agrupados por marca)
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

-- 1.3. Verificar modelos inseridos
SELECT 'MODELOS INSERIDOS' as status, COUNT(*) as total FROM ocar_fipe_models;
SELECT 'Amostra Modelos' as tipo, name, code, brand_code FROM ocar_fipe_models ORDER BY name LIMIT 20;

-- ========================================
-- 2. VERIFICAÇÃO FINAL
-- ========================================

-- 2.1. Contagem de modelos
SELECT 'Total de Modelos' as info, COUNT(*) as total FROM ocar_fipe_models;

-- 2.2. Lista completa de modelos
SELECT 'Lista Completa' as info, name, code, brand_code FROM ocar_fipe_models ORDER BY name;

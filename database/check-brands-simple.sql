-- Verificar marcas existentes no sistema
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. MARCAS EXISTENTES NO SISTEMA
-- ========================================

-- 1.1. Contar marcas existentes
SELECT 'TOTAL DE MARCAS' as info, COUNT(*) as total FROM ocar_fipe_brands;

-- 1.2. Listar todas as marcas existentes
SELECT 'MARCAS EXISTENTES' as tipo, name, code FROM ocar_fipe_brands ORDER BY name;

-- ========================================
-- 2. MARCAS ÚNICAS NA OCAR_TRANSBORDO
-- ========================================

-- 2.1. Contar marcas únicas no transbordo
SELECT 'MARCAS NO TRANSBORDO' as info, COUNT(DISTINCT marca) as total 
FROM ocar_transbordo 
WHERE COALESCE(marca,'') <> '';

-- 2.2. Listar marcas únicas do transbordo
SELECT 'MARCAS DO TRANSBORDO' as tipo, marca, LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as code
FROM (
  SELECT DISTINCT marca 
  FROM ocar_transbordo 
  WHERE COALESCE(marca,'') <> ''
) t
ORDER BY marca;

-- ========================================
-- 3. VERIFICAR CONFLITOS
-- ========================================

-- 3.1. Verificar se há conflitos de código
SELECT 'POSSÍVEIS CONFLITOS' as info, 
       t.marca as marca_transbordo,
       LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10) as code_gerado,
       b.name as marca_existente,
       b.code as code_existente
FROM (
  SELECT DISTINCT marca 
  FROM ocar_transbordo 
  WHERE COALESCE(marca,'') <> ''
) t
LEFT JOIN ocar_fipe_brands b ON b.code = LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10)
WHERE b.code IS NOT NULL
ORDER BY t.marca;

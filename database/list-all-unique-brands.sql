-- Listar TODAS as marcas únicas do transbordo
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. TODAS AS MARCAS ÚNICAS DO TRANSBORDO
-- ========================================

-- 1.1. Contar marcas únicas
SELECT 'TOTAL DE MARCAS ÚNICAS' as info, COUNT(DISTINCT marca) as total 
FROM ocar_transbordo 
WHERE COALESCE(marca,'') <> '';

-- 1.2. Listar TODAS as marcas únicas (sem duplicatas)
SELECT 
  ROW_NUMBER() OVER (ORDER BY marca) as numero,
  marca as nome_marca,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as codigo_gerado,
  COUNT(*) as total_registros
FROM ocar_transbordo 
WHERE COALESCE(marca,'') <> ''
GROUP BY marca
ORDER BY marca;

-- ========================================
-- 2. VERIFICAR QUAIS JÁ EXISTEM NO SISTEMA
-- ========================================

-- 2.1. Marcas que JÁ EXISTEM no sistema
SELECT 
  'MARCAS QUE JÁ EXISTEM' as status,
  t.marca as nome_marca,
  LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10) as codigo_gerado,
  b.name as marca_existente,
  b.code as codigo_existente
FROM (
  SELECT DISTINCT marca 
  FROM ocar_transbordo 
  WHERE COALESCE(marca,'') <> ''
) t
JOIN ocar_fipe_brands b ON b.code = LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10)
ORDER BY t.marca;

-- 2.2. Marcas que NÃO EXISTEM no sistema (novas)
SELECT 
  'MARCAS NOVAS (NÃO EXISTEM)' as status,
  t.marca as nome_marca,
  LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10) as codigo_gerado
FROM (
  SELECT DISTINCT marca 
  FROM ocar_transbordo 
  WHERE COALESCE(marca,'') <> ''
) t
LEFT JOIN ocar_fipe_brands b ON b.code = LEFT(LOWER(REPLACE(t.marca, ' ', '-')), 10)
WHERE b.code IS NULL
ORDER BY t.marca;

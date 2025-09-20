-- Script SQL corrigido para campos VARCHAR
-- Execute no Supabase SQL Editor

-- 1. Inserir marcas únicas (limitando tamanho do code)
INSERT INTO ocar_fipe_brands (name, code, active)
SELECT DISTINCT 
  marca as name,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 20) as code,
  true as active
FROM ocar_transbordo 
WHERE processado = false
AND marca NOT IN (SELECT name FROM ocar_fipe_brands);

-- 2. Inserir modelos únicos (limitando tamanho do code)
INSERT INTO ocar_fipe_models (brand_code, name, code, active)
SELECT DISTINCT 
  LEFT(b.code, 20) as brand_code,
  t.modelo as name,
  LEFT(CONCAT(b.code, '-', LOWER(REPLACE(t.modelo, ' ', '-'))), 50) as code,
  true as active
FROM ocar_transbordo t
JOIN ocar_fipe_brands b ON t.marca = b.name
WHERE t.processado = false
AND LEFT(CONCAT(b.code, '-', LOWER(REPLACE(t.modelo, ' ', '-'))), 50) NOT IN (SELECT code FROM ocar_fipe_models);

-- 3. Inserir preços (limitando tamanho dos campos)
INSERT INTO ocar_fipe_prices (model_id, version, year, fipe_code, reference_month, price)
SELECT 
  m.id as model_id,
  LEFT(t.modelo, 200) as version,
  t.ano as year,
  LEFT(t.codigo_fipe, 20) as fipe_code,
  LEFT(t.referencia_mes, 10) as reference_month,
  t.preco as price
FROM ocar_transbordo t
JOIN ocar_fipe_models m ON t.modelo = m.name
JOIN ocar_fipe_brands b ON m.brand_code = b.code AND t.marca = b.name
WHERE t.processado = false
AND NOT EXISTS (
  SELECT 1 FROM ocar_fipe_prices p 
  WHERE p.model_id = m.id 
  AND p.version = LEFT(t.modelo, 200)
  AND p.year = t.ano 
  AND p.reference_month = LEFT(t.referencia_mes, 10)
);

-- 4. Verificar contagem
SELECT 
  'Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 
  'Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 
  'Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices;

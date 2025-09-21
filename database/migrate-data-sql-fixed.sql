-- Script SQL corrigido para migrar dados para as tabelas normalizadas
-- Execute no Supabase SQL Editor

-- 1. Inserir marcas únicas (sem ON CONFLICT)
INSERT INTO ocar_fipe_brands (name, code, active)
SELECT DISTINCT 
  marca as name,
  LOWER(REPLACE(marca, ' ', '-')) as code,
  true as active
FROM ocar_transbordo 
WHERE processado = false
AND marca NOT IN (SELECT name FROM ocar_fipe_brands);

-- 2. Inserir modelos únicos (sem ON CONFLICT)
INSERT INTO ocar_fipe_models (brand_code, name, code, active)
SELECT DISTINCT 
  b.code as brand_code,
  t.modelo as name,
  CONCAT(b.code, '-', LOWER(REPLACE(t.modelo, ' ', '-'))) as code,
  true as active
FROM ocar_transbordo t
JOIN ocar_fipe_brands b ON t.marca = b.name
WHERE t.processado = false
AND CONCAT(b.code, '-', LOWER(REPLACE(t.modelo, ' ', '-'))) NOT IN (SELECT code FROM ocar_fipe_models);

-- 3. Inserir preços (sem ON CONFLICT)
INSERT INTO ocar_fipe_prices (model_id, version, year, fipe_code, reference_month, price)
SELECT 
  m.id as model_id,
  t.modelo as version,
  t.ano as year,
  t.codigo_fipe as fipe_code,
  t.referencia_mes as reference_month,
  t.preco as price
FROM ocar_transbordo t
JOIN ocar_fipe_models m ON t.modelo = m.name
JOIN ocar_fipe_brands b ON m.brand_code = b.code AND t.marca = b.name
WHERE t.processado = false
AND NOT EXISTS (
  SELECT 1 FROM ocar_fipe_prices p 
  WHERE p.model_id = m.id 
  AND p.version = t.modelo 
  AND p.year = t.ano 
  AND p.reference_month = t.referencia_mes
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

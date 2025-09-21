-- Script SQL para migrar dados para as tabelas normalizadas
-- Execute no Supabase SQL Editor

-- 1. Inserir marcas únicas
INSERT INTO ocar_fipe_brands (name, code, active)
SELECT DISTINCT 
  marca as name,
  LOWER(REPLACE(marca, ' ', '-')) as code,
  true as active
FROM ocar_transbordo 
WHERE processado = false
ON CONFLICT (name) DO NOTHING;

-- 2. Inserir modelos únicos
INSERT INTO ocar_fipe_models (brand_code, name, code, active)
SELECT DISTINCT 
  b.code as brand_code,
  t.modelo as name,
  CONCAT(b.code, '-', LOWER(REPLACE(t.modelo, ' ', '-'))) as code,
  true as active
FROM ocar_transbordo t
JOIN ocar_fipe_brands b ON t.marca = b.name
WHERE t.processado = false
ON CONFLICT (code) DO NOTHING;

-- 3. Inserir preços
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
ON CONFLICT (model_id, version, year, reference_month) DO NOTHING;

-- 4. Verificar contagem
SELECT 
  'Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 
  'Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 
  'Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices;

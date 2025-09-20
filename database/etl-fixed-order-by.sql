-- Sistema ETL corrigido - sem limpeza e sem ORDER BY problemático
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. MIGRAÇÃO SEM LIMPEZA (USANDO ON CONFLICT)
-- ========================================

-- 1.1. Migrar marcas (ignorando código FIPE, usando apenas nome)
INSERT INTO ocar_fipe_brands(name, code)
SELECT DISTINCT 
  marca as name,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as code
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> ''
ON CONFLICT (code) DO NOTHING;

-- 1.2. Verificar marcas inseridas
SELECT 'MARCAS INSERIDAS' as status, COUNT(*) as total FROM ocar_fipe_brands;
SELECT 'Amostra Marcas' as tipo, name, code FROM ocar_fipe_brands ORDER BY name LIMIT 10;

-- 1.3. Migrar modelos (sem ORDER BY problemático)
INSERT INTO ocar_fipe_models(brand_code, name, code)
SELECT DISTINCT 
  b.code as brand_code,
  t.modelo as name,
  CONCAT(b.code, '-', LEFT(LOWER(REPLACE(t.modelo, ' ', '-')), 20)) as code
FROM (
  SELECT DISTINCT marca, modelo 
  FROM ocar_transbordo
  WHERE COALESCE(marca,'') <> '' AND COALESCE(modelo,'') <> ''
) t
JOIN ocar_fipe_brands b ON b.name = t.marca
ON CONFLICT (brand_code, code) DO NOTHING;

-- 1.4. Verificar modelos inseridos
SELECT 'MODELOS INSERIDOS' as status, COUNT(*) as total FROM ocar_fipe_models;
SELECT 'Amostra Modelos' as tipo, name, code FROM ocar_fipe_models ORDER BY name LIMIT 10;

-- 1.5. Migrar preços (ignorando código FIPE duplicado)
INSERT INTO ocar_fipe_prices(model_id, version, year, reference_month, fipe_code, price)
SELECT 
  m.id as model_id,
  t.modelo as version,
  t.ano as year, 
  t.referencia_mes as reference_month,
  t.codigo_fipe as fipe_code,
  t.preco as price
FROM ocar_transbordo t
JOIN ocar_fipe_brands b ON b.name = t.marca
JOIN ocar_fipe_models m ON m.brand_code = b.code AND m.name = t.modelo
WHERE t.ano IS NOT NULL
  AND COALESCE(t.referencia_mes,'') <> ''
  AND COALESCE(t.codigo_fipe,'') <> ''
  AND t.preco IS NOT NULL
ON CONFLICT (model_id, version, year, reference_month) 
DO UPDATE SET 
  fipe_code = EXCLUDED.fipe_code,
  price = EXCLUDED.price;

-- 1.6. Verificar preços inseridos
SELECT 'PREÇOS INSERIDOS' as status, COUNT(*) as total FROM ocar_fipe_prices;

-- ========================================
-- 2. CRIAR FUNÇÕES AUXILIARES
-- ========================================

-- 2.1. Função para buscar preço FIPE
CREATE OR REPLACE FUNCTION get_fipe_price(
  p_marca TEXT,
  p_modelo TEXT,
  p_ano INT,
  p_referencia_mes TEXT DEFAULT NULL
)
RETURNS TABLE (
  marca TEXT,
  modelo TEXT,
  ano INT,
  fipe_code TEXT,
  reference_month TEXT,
  price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as marca,
    m.name as modelo,
    p.year as ano,
    p.fipe_code,
    p.reference_month,
    p.price
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.code = m.brand_code
  WHERE b.name = p_marca
    AND m.name = p_modelo
    AND p.year = p_ano
    AND (p_referencia_mes IS NULL OR p.reference_month = p_referencia_mes)
  ORDER BY p.reference_month DESC, p.price ASC;
END
$$;

-- 2.2. Função para listar marcas
CREATE OR REPLACE FUNCTION get_available_brands()
RETURNS TABLE (id BIGINT, name TEXT, code TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.name, b.code
  FROM ocar_fipe_brands b
  ORDER BY b.name;
END
$$;

-- 2.3. Função para listar modelos por marca
CREATE OR REPLACE FUNCTION get_models_by_brand(p_brand_name TEXT)
RETURNS TABLE (id BIGINT, name TEXT, code TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name, m.code
  FROM ocar_fipe_models m
  JOIN ocar_fipe_brands b ON b.code = m.brand_code
  WHERE b.name = p_brand_name
  ORDER BY m.name;
END
$$;

-- 2.4. Função para listar anos por modelo
CREATE OR REPLACE FUNCTION get_years_by_model(p_brand_name TEXT, p_model_name TEXT)
RETURNS TABLE (year INT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.year
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.code = m.brand_code
  WHERE b.name = p_brand_name
    AND m.name = p_model_name
  ORDER BY p.year DESC;
END
$$;

-- 2.5. Função para buscar preços por modelo (para filtros)
CREATE OR REPLACE FUNCTION get_prices_by_model(
  p_brand_name TEXT,
  p_model_name TEXT,
  p_year INT DEFAULT NULL
)
RETURNS TABLE (
  marca TEXT,
  modelo TEXT,
  version TEXT,
  ano INT,
  fipe_code TEXT,
  reference_month TEXT,
  price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as marca,
    m.name as modelo,
    p.version,
    p.year as ano,
    p.fipe_code,
    p.reference_month,
    p.price
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.code = m.brand_code
  WHERE b.name = p_brand_name
    AND m.name = p_model_name
    AND (p_year IS NULL OR p.year = p_year)
  ORDER BY p.year DESC, p.price ASC;
END
$$;

-- ========================================
-- 3. VERIFICAÇÃO FINAL DO SISTEMA
-- ========================================

-- 3.1. Contagem final de registros
SELECT 'FINAL - Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 'FINAL - Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 'FINAL - Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices
UNION ALL
SELECT 'FINAL - Transbordo' as tabela, COUNT(*) as total FROM ocar_transbordo;

-- 3.2. Amostra de dados finais
SELECT 'Amostra Marcas' as tipo, name as valor FROM ocar_fipe_brands ORDER BY name LIMIT 10;
SELECT 'Amostra Modelos' as tipo, name as valor FROM ocar_fipe_models ORDER BY name LIMIT 10;
SELECT 'Amostra Preços' as tipo, CONCAT(year, ' - R$ ', price) as valor FROM ocar_fipe_prices ORDER BY price LIMIT 10;

-- 3.3. Testar funções
SELECT 'Teste - Marcas Honda' as teste, name FROM get_available_brands() WHERE name LIKE 'Honda%' LIMIT 5;
SELECT 'Teste - Modelos Honda' as teste, name FROM get_models_by_brand('Honda') LIMIT 5;
SELECT 'Teste - Anos Honda Civic' as teste, year FROM get_years_by_model('Honda', 'Civic') LIMIT 5;

-- ========================================
-- 4. COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE ocar_fipe_brands IS 'Tabela de marcas FIPE - fonte única de marcas';
COMMENT ON TABLE ocar_fipe_models IS 'Tabela de modelos FIPE - único por marca+nome';
COMMENT ON TABLE ocar_fipe_prices IS 'Tabela de preços FIPE - único por modelo+ano+referência+código';

COMMENT ON FUNCTION get_fipe_price(TEXT, TEXT, INT, TEXT) IS 'Busca preço FIPE por marca, modelo, ano e referência';
COMMENT ON FUNCTION get_available_brands() IS 'Lista todas as marcas disponíveis';
COMMENT ON FUNCTION get_models_by_brand(TEXT) IS 'Lista modelos de uma marca específica';
COMMENT ON FUNCTION get_years_by_model(TEXT, TEXT) IS 'Lista anos disponíveis para um modelo específico';
COMMENT ON FUNCTION get_prices_by_model(TEXT, TEXT, INT) IS 'Lista preços por modelo com filtros opcionais';

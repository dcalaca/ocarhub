-- Sistema ETL - Apenas migração inicial dos dados existentes
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. DDL DAS 3 TABELAS NORMALIZADAS
-- ========================================

-- 1.1. Marcas (com chave única no nome)
CREATE TABLE IF NOT EXISTS ocar_fipe_brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2. Modelos (único por marca+nome)
CREATE TABLE IF NOT EXISTS ocar_fipe_models (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES ocar_fipe_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_fipe_model UNIQUE (brand_id, name)
);

-- 1.3. Preços (único por modelo+ano+referência+fipe_code)
CREATE TABLE IF NOT EXISTS ocar_fipe_prices (
  id BIGSERIAL PRIMARY KEY,
  model_id BIGINT NOT NULL REFERENCES ocar_fipe_models(id) ON DELETE CASCADE,
  year INT NOT NULL,
  reference_month TEXT NOT NULL,          -- ex: '2025-09'
  fipe_code TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_fipe_price UNIQUE (model_id, year, reference_month, fipe_code)
);

-- 1.4. Índices úteis para performance
CREATE INDEX IF NOT EXISTS idx_models_brand ON ocar_fipe_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_prices_model ON ocar_fipe_prices(model_id);
CREATE INDEX IF NOT EXISTS idx_prices_year ON ocar_fipe_prices(year);
CREATE INDEX IF NOT EXISTS idx_prices_reference ON ocar_fipe_prices(reference_month);

-- ========================================
-- 2. MIGRAÇÃO INICIAL DOS DADOS EXISTENTES
-- ========================================

-- 2.1. Limpar tabelas de destino (se existirem dados)
DELETE FROM ocar_fipe_prices;
DELETE FROM ocar_fipe_models;
DELETE FROM ocar_fipe_brands;

-- 2.2. Migrar marcas
INSERT INTO ocar_fipe_brands(name)
SELECT DISTINCT marca 
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> ''
ORDER BY marca;

-- 2.3. Migrar modelos
INSERT INTO ocar_fipe_models(brand_id, name)
SELECT DISTINCT b.id, t.modelo
FROM (
  SELECT DISTINCT marca, modelo 
  FROM ocar_transbordo
  WHERE COALESCE(marca,'') <> '' AND COALESCE(modelo,'') <> ''
) t
JOIN ocar_fipe_brands b ON b.name = t.marca
ORDER BY t.marca, t.modelo;

-- 2.4. Migrar preços
INSERT INTO ocar_fipe_prices(model_id, year, reference_month, fipe_code, price)
SELECT 
  m.id, 
  t.ano, 
  t.referencia_mes, 
  t.codigo_fipe, 
  t.preco
FROM ocar_transbordo t
JOIN ocar_fipe_brands b ON b.name = t.marca
JOIN ocar_fipe_models m ON m.brand_id = b.id AND m.name = t.modelo
WHERE t.ano IS NOT NULL
  AND COALESCE(t.referencia_mes,'') <> ''
  AND COALESCE(t.codigo_fipe,'') <> ''
  AND t.preco IS NOT NULL
ORDER BY t.marca, t.modelo, t.ano;

-- ========================================
-- 3. FUNÇÕES AUXILIARES PARA CONSULTA
-- ========================================

-- 3.1. Função para buscar preço FIPE por concatenação
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
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE b.name = p_marca
    AND m.name = p_modelo
    AND p.year = p_ano
    AND (p_referencia_mes IS NULL OR p.reference_month = p_referencia_mes)
  ORDER BY p.reference_month DESC, p.price ASC;
END
$$;

-- 3.2. Função para listar marcas disponíveis
CREATE OR REPLACE FUNCTION get_available_brands()
RETURNS TABLE (id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.name
  FROM ocar_fipe_brands b
  ORDER BY b.name;
END
$$;

-- 3.3. Função para listar modelos por marca
CREATE OR REPLACE FUNCTION get_models_by_brand(p_brand_name TEXT)
RETURNS TABLE (id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name
  FROM ocar_fipe_models m
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE b.name = p_brand_name
  ORDER BY m.name;
END
$$;

-- 3.4. Função para listar anos disponíveis por modelo
CREATE OR REPLACE FUNCTION get_years_by_model(p_brand_name TEXT, p_model_name TEXT)
RETURNS TABLE (year INT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.year
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE b.name = p_brand_name
    AND m.name = p_model_name
  ORDER BY p.year DESC;
END
$$;

-- ========================================
-- 4. VERIFICAÇÃO DO SISTEMA
-- ========================================

-- 4.1. Contagem de registros
SELECT 'Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 'Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 'Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices
UNION ALL
SELECT 'Transbordo' as tabela, COUNT(*) as total FROM ocar_transbordo;

-- 4.2. Amostra de dados
SELECT 'Amostra Marcas' as tipo, name as valor FROM ocar_fipe_brands ORDER BY name LIMIT 10;
SELECT 'Amostra Modelos' as tipo, name as valor FROM ocar_fipe_models ORDER BY name LIMIT 10;
SELECT 'Amostra Preços' as tipo, CONCAT(year, ' - R$ ', price) as valor FROM ocar_fipe_prices ORDER BY price LIMIT 10;

-- ========================================
-- 5. COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE ocar_fipe_brands IS 'Tabela de marcas FIPE - fonte única de marcas';
COMMENT ON TABLE ocar_fipe_models IS 'Tabela de modelos FIPE - único por marca+nome';
COMMENT ON TABLE ocar_fipe_prices IS 'Tabela de preços FIPE - único por modelo+ano+referência+código';

COMMENT ON FUNCTION get_fipe_price(TEXT, TEXT, INT, TEXT) IS 'Busca preço FIPE por marca, modelo, ano e referência';
COMMENT ON FUNCTION get_available_brands() IS 'Lista todas as marcas disponíveis';
COMMENT ON FUNCTION get_models_by_brand(TEXT) IS 'Lista modelos de uma marca específica';
COMMENT ON FUNCTION get_years_by_model(TEXT, TEXT) IS 'Lista anos disponíveis para um modelo específico';

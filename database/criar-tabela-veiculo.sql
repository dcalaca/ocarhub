-- =============================================
-- CRIAR TABELA OCAR_VEICULO
-- =============================================
-- Tabela para armazenar nomes únicos dos veículos
-- Execute no Supabase SQL Editor

-- =============================================
-- 1. CRIAR TABELA OCAR_VEICULO
-- =============================================

CREATE TABLE IF NOT EXISTS ocar_veiculo (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES ocar_fipe_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Nome único do veículo (ex: "Civic", "Accord")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_veiculo UNIQUE (brand_id, name)
);

-- =============================================
-- 2. CRIAR ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_veiculo_brand ON ocar_veiculo(brand_id);
CREATE INDEX IF NOT EXISTS idx_veiculo_name ON ocar_veiculo(name);

-- =============================================
-- 3. POPULAR TABELA COM DADOS EXISTENTES
-- =============================================

-- Extrair nomes únicos de veículos dos modelos existentes
INSERT INTO ocar_veiculo (brand_id, name)
SELECT DISTINCT 
  m.brand_id,
  -- Extrair apenas o nome principal do veículo (primeira palavra)
  SPLIT_PART(m.name, ' ', 1) as veiculo_name
FROM ocar_fipe_models m
WHERE SPLIT_PART(m.name, ' ', 1) IS NOT NULL 
  AND SPLIT_PART(m.name, ' ', 1) != ''
ON CONFLICT (brand_id, name) DO NOTHING;

-- =============================================
-- 4. FUNÇÕES PARA CONSULTAR VEÍCULOS
-- =============================================

-- 4.1. Listar veículos por marca
CREATE OR REPLACE FUNCTION listar_veiculos_por_marca(p_marca TEXT)
RETURNS TABLE (id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT v.id, v.name
  FROM ocar_veiculo v
  JOIN ocar_fipe_brands b ON b.id = v.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
  ORDER BY v.name;
END;
$$;

-- 4.2. Listar modelos por veículo
CREATE OR REPLACE FUNCTION listar_modelos_por_veiculo(p_marca TEXT, p_veiculo TEXT)
RETURNS TABLE (id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id, 
    -- Remover o nome do veículo do início do modelo
    CASE 
      WHEN m.name LIKE p_veiculo || '%' THEN 
        TRIM(SUBSTRING(m.name FROM LENGTH(p_veiculo) + 1))
      ELSE m.name
    END as name
  FROM ocar_fipe_models m
  JOIN ocar_veiculo v ON v.brand_id = m.brand_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(v.name) = LOWER(p_veiculo)
    AND m.name LIKE p_veiculo || '%'
  ORDER BY m.name;
END;
$$;

-- 4.3. Listar versões (códigos FIPE) por modelo
CREATE OR REPLACE FUNCTION listar_versoes_por_modelo(p_marca TEXT, p_veiculo TEXT, p_modelo TEXT)
RETURNS TABLE (id TEXT, name TEXT, fipe_code TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.fipe_code as id,
    CONCAT(p.fipe_code, ' - ', p.reference_month) as name,
    p.fipe_code
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_veiculo v ON v.brand_id = m.brand_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(v.name) = LOWER(p_veiculo)
    AND LOWER(m.name) = LOWER(p_modelo)
  ORDER BY p.fipe_code;
END;
$$;

-- 4.4. Listar anos por versão
CREATE OR REPLACE FUNCTION listar_anos_por_versao(p_marca TEXT, p_veiculo TEXT, p_modelo TEXT, p_versao TEXT)
RETURNS TABLE (ano INT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.year
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_veiculo v ON v.brand_id = m.brand_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(v.name) = LOWER(p_veiculo)
    AND LOWER(m.name) = LOWER(p_modelo)
    AND p.fipe_code = p_versao
  ORDER BY p.year DESC;
END;
$$;

-- 4.5. Consultar preço FIPE completo (priorizando ano mais recente)
CREATE OR REPLACE FUNCTION consultar_fipe_completo(
  p_marca TEXT,
  p_veiculo TEXT,
  p_modelo TEXT,
  p_versao TEXT,
  p_ano INT
)
RETURNS TABLE (
  marca TEXT,
  veiculo TEXT,
  modelo TEXT,
  versao TEXT,
  ano INT,
  fipe_code TEXT,
  reference_month TEXT,
  price NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as marca,
    v.name as veiculo,
    m.name as modelo,
    p.fipe_code as versao,
    p.year as ano,
    p.fipe_code,
    p.reference_month,
    p.price,
    'ATUAL' as status
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_veiculo v ON v.brand_id = m.brand_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(v.name) = LOWER(p_veiculo)
    AND LOWER(m.name) = LOWER(p_modelo)
    AND p.fipe_code = p_versao
    AND p.year = p_ano
  ORDER BY p.year DESC, p.reference_month DESC
  LIMIT 1;
END;
$$;

-- =============================================
-- 5. COMENTÁRIOS
-- =============================================

COMMENT ON TABLE ocar_veiculo IS 'Tabela de veículos únicos por marca (ex: Civic, Accord, Corolla)';
COMMENT ON FUNCTION listar_veiculos_por_marca(TEXT) IS 'Lista veículos de uma marca específica';
COMMENT ON FUNCTION listar_modelos_por_veiculo(TEXT, TEXT) IS 'Lista modelos de um veículo específico';
COMMENT ON FUNCTION listar_versoes_por_modelo(TEXT, TEXT, TEXT) IS 'Lista versões (códigos FIPE) de um modelo';
COMMENT ON FUNCTION listar_anos_por_versao(TEXT, TEXT, TEXT, TEXT) IS 'Lista anos de uma versão específica';
COMMENT ON FUNCTION consultar_fipe_completo(TEXT, TEXT, TEXT, TEXT, INT) IS 'Consulta preço FIPE completo';

-- =============================================
-- 6. VERIFICAÇÃO
-- =============================================

-- Verificar se a tabela foi criada
SELECT 
  'Tabela ocar_veiculo criada' as status,
  COUNT(*) as total_veiculos
FROM ocar_veiculo;

-- Mostrar alguns exemplos
SELECT 
  b.name as marca,
  v.name as veiculo,
  COUNT(*) as total_modelos
FROM ocar_veiculo v
JOIN ocar_fipe_brands b ON b.id = v.brand_id
GROUP BY b.name, v.name
ORDER BY b.name, v.name
LIMIT 10;

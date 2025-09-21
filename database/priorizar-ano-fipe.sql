-- =============================================
-- PRIORIZAR ANO EM TODAS AS CONSULTAS FIPE
-- =============================================
-- Execute no Supabase SQL Editor

-- 1. Atualizar função de anos para priorizar anos mais recentes
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
    AND p.year > 1990 -- Filtrar anos válidos
  ORDER BY p.year DESC; -- Priorizar anos mais recentes
END;
$$;

-- 2. Atualizar função de consulta FIPE completa
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
  ORDER BY p.year DESC, p.reference_month DESC -- Priorizar ano e mês mais recentes
  LIMIT 1;
END;
$$;

-- 3. Criar função para buscar preço FIPE mais atual (sem versão específica)
CREATE OR REPLACE FUNCTION consultar_fipe_mais_atual(
  p_marca TEXT,
  p_veiculo TEXT,
  p_modelo TEXT,
  p_ano INT
)
RETURNS TABLE (
  marca TEXT,
  veiculo TEXT,
  modelo TEXT,
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
    AND p.year = p_ano
  ORDER BY p.year DESC, p.reference_month DESC -- Priorizar ano e mês mais recentes
  LIMIT 1;
END;
$$;

-- 4. Testar as funções
SELECT 'Testando função de anos:' as teste;
SELECT * FROM listar_anos_por_versao('Honda', 'Civic', 'Civic 2.0', '009011-5') LIMIT 5;

SELECT 'Testando função de consulta completa:' as teste;
SELECT * FROM consultar_fipe_completo('Honda', 'Civic', 'Civic 2.0', '009011-5', 2020) LIMIT 1;

SELECT 'Testando função de consulta mais atual:' as teste;
SELECT * FROM consultar_fipe_mais_atual('Honda', 'Civic', 'Civic 2.0', 2020) LIMIT 1;

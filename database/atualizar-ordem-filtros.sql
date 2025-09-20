-- =============================================
-- ATUALIZAR ORDEM DOS FILTROS: MARCA > VEÍCULO > ANO > MODELO
-- =============================================
-- Execute no Supabase SQL Editor

-- 1. Atualizar função de consulta FIPE para nova ordem
CREATE OR REPLACE FUNCTION consultar_fipe_mais_atual(
  p_marca TEXT,
  p_veiculo TEXT,
  p_ano INT,
  p_modelo TEXT
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
    AND p.year = p_ano
    AND LOWER(m.name) = LOWER(p_modelo)
  ORDER BY p.year DESC, p.reference_month DESC -- Priorizar ano e mês mais recentes
  LIMIT 1;
END;
$$;

-- 2. Testar a função
SELECT 'Testando nova ordem de filtros:' as teste;
SELECT * FROM consultar_fipe_mais_atual('Honda', 'Civic', 2020, 'Civic 2.0') LIMIT 1;

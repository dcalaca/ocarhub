-- =============================================
-- ATUALIZAR FUNÇÃO PARA REMOVER NOME DO VEÍCULO
-- =============================================
-- Execute no Supabase SQL Editor

-- Atualizar função para remover o nome do veículo dos modelos
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

-- Testar a função
SELECT * FROM listar_modelos_por_veiculo('Honda', 'Civic') LIMIT 5;

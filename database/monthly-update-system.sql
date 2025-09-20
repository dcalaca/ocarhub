-- Sistema de atualização mensal baseado na regra de negócio
-- Execute no Supabase SQL Editor

-- 1. Função para atualizar marcas (novas marcas)
CREATE OR REPLACE FUNCTION update_fipe_brands()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir novas marcas que não existem
  INSERT INTO ocar_fipe_brands (name, code, active)
  SELECT DISTINCT 
    marca as name,
    LOWER(REPLACE(marca, ' ', '-')) as code,
    true as active
  FROM ocar_transbordo 
  WHERE processado = false
  AND marca NOT IN (SELECT name FROM ocar_fipe_brands);
  
  -- Atualizar timestamp
  UPDATE ocar_fipe_brands 
  SET updated_at = NOW()
  WHERE name IN (SELECT DISTINCT marca FROM ocar_transbordo WHERE processado = false);
END;
$$;

-- 2. Função para atualizar modelos (novos modelos base)
CREATE OR REPLACE FUNCTION update_fipe_models()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir novos modelos base que não existem
  INSERT INTO ocar_fipe_models (brand_code, name, code, active)
  SELECT DISTINCT 
    b.code as brand_code,
    CASE
      WHEN t.modelo ~ '^([A-Za-z]+)' THEN
        (REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1]
      ELSE t.modelo
    END as name,
    CONCAT(b.code, '-', 
      CASE
        WHEN t.modelo ~ '^([A-Za-z]+)' THEN
          LOWER((REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1])
        ELSE LOWER(t.modelo)
      END
    ) as code,
    true as active
  FROM ocar_transbordo t
  JOIN ocar_fipe_brands b ON t.marca = b.name
  WHERE t.processado = false
  AND CONCAT(b.code, '-', 
    CASE
      WHEN t.modelo ~ '^([A-Za-z]+)' THEN
        LOWER((REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1])
      ELSE LOWER(t.modelo)
    END
  ) NOT IN (SELECT code FROM ocar_fipe_models);
  
  -- Atualizar timestamp
  UPDATE ocar_fipe_models 
  SET updated_at = NOW()
  WHERE name IN (
    SELECT DISTINCT 
      CASE
        WHEN t.modelo ~ '^([A-Za-z]+)' THEN
          (REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1]
        ELSE t.modelo
      END
    FROM ocar_transbordo t
    WHERE t.processado = false
  );
END;
$$;

-- 3. Função para atualizar preços (novos preços e atualizações)
CREATE OR REPLACE FUNCTION update_fipe_prices()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Inserir novos preços que não existem
  INSERT INTO ocar_fipe_prices (model_id, version, year, fipe_code, reference_month, price)
  SELECT 
    m.id as model_id,
    t.modelo as version,
    t.ano as year,
    t.codigo_fipe as fipe_code,
    t.referencia_mes as reference_month,
    t.preco as price
  FROM ocar_transbordo t
  JOIN ocar_fipe_models m ON 
    CASE
      WHEN t.modelo ~ '^([A-Za-z]+)' THEN
        (REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1] = m.name
      ELSE t.modelo = m.name
    END
  JOIN ocar_fipe_brands b ON m.brand_code = b.code AND t.marca = b.name
  WHERE t.processado = false
  AND NOT EXISTS (
    SELECT 1 FROM ocar_fipe_prices p 
    WHERE p.model_id = m.id 
    AND p.version = t.modelo
    AND p.year = t.ano 
    AND p.reference_month = t.referencia_mes
  );
  
  -- Atualizar preços existentes (se mudaram)
  UPDATE ocar_fipe_prices 
  SET 
    price = t.preco,
    updated_at = NOW()
  FROM ocar_transbordo t
  JOIN ocar_fipe_models m ON 
    CASE
      WHEN t.modelo ~ '^([A-Za-z]+)' THEN
        (REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1] = m.name
      ELSE t.modelo = m.name
    END
  JOIN ocar_fipe_brands b ON m.brand_code = b.code AND t.marca = b.name
  WHERE ocar_fipe_prices.model_id = m.id 
  AND ocar_fipe_prices.version = t.modelo
  AND ocar_fipe_prices.year = t.ano 
  AND ocar_fipe_prices.reference_month = t.referencia_mes
  AND ocar_fipe_prices.price != t.preco
  AND t.processado = false;
END;
$$;

-- 4. Função principal para atualização mensal
CREATE OR REPLACE FUNCTION monthly_fipe_update()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  brands_count int;
  models_count int;
  prices_count int;
BEGIN
  -- Executar atualizações
  PERFORM update_fipe_brands();
  PERFORM update_fipe_models();
  PERFORM update_fipe_prices();
  
  -- Contar registros
  SELECT COUNT(*) INTO brands_count FROM ocar_fipe_brands;
  SELECT COUNT(*) INTO models_count FROM ocar_fipe_models;
  SELECT COUNT(*) INTO prices_count FROM ocar_fipe_prices;
  
  -- Marcar registros como processados
  UPDATE ocar_transbordo 
  SET processado = true, updated_at = NOW()
  WHERE processado = false;
  
  -- Retornar resultado
  result := jsonb_build_object(
    'status', 'success',
    'message', 'Atualização mensal concluída',
    'brands_count', brands_count,
    'models_count', models_count,
    'prices_count', prices_count,
    'updated_at', NOW()
  );
  
  RETURN result;
END;
$$;

-- 5. Comentários
COMMENT ON FUNCTION update_fipe_brands() IS 'Atualiza marcas FIPE com novos registros';
COMMENT ON FUNCTION update_fipe_models() IS 'Atualiza modelos FIPE com novos registros base';
COMMENT ON FUNCTION update_fipe_prices() IS 'Atualiza preços FIPE com novos registros e atualizações';
COMMENT ON FUNCTION monthly_fipe_update() IS 'Função principal para atualização mensal completa';

-- 6. Teste da função
SELECT monthly_fipe_update();

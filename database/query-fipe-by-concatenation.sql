-- Função para consultar FIPE por concatenação de marca + modelo + versão + ano
-- Execute no Supabase SQL Editor

-- 1. Função para buscar preço FIPE por concatenação
CREATE OR REPLACE FUNCTION get_fipe_price(
  p_marca text,
  p_modelo_base text,
  p_versao text,
  p_ano int
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  rec record;
BEGIN
  -- Buscar preço FIPE baseado na concatenação
  SELECT 
    p.fipe_code,
    p.reference_month,
    p.price,
    p.version,
    b.name as marca,
    m.name as modelo_base
  INTO rec
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON p.model_id = m.id
  JOIN ocar_fipe_brands b ON m.brand_code = b.code
  WHERE b.name = p_marca
    AND m.name = p_modelo_base
    AND p.version = p_versao
    AND p.year = p_ano
  ORDER BY p.price ASC
  LIMIT 1;

  IF rec IS NOT NULL THEN
    result := jsonb_build_object(
      'found', true,
      'fipe_code', rec.fipe_code,
      'reference_month', rec.reference_month,
      'price', rec.price,
      'version', rec.version,
      'marca', rec.marca,
      'modelo_base', rec.modelo_base,
      'ano', p_ano
    );
  ELSE
    result := jsonb_build_object(
      'found', false,
      'message', 'Nenhum preço FIPE encontrado para os parâmetros fornecidos'
    );
  END IF;

  RETURN result;
END;
$$;

-- 2. Função para buscar todos os preços de uma marca/modelo
CREATE OR REPLACE FUNCTION get_fipe_prices_by_model(
  p_marca text,
  p_modelo_base text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  prices_array jsonb[];
  rec record;
BEGIN
  prices_array := ARRAY[]::jsonb[];

  -- Buscar todos os preços para a marca/modelo
  FOR rec IN
    SELECT 
      p.fipe_code,
      p.reference_month,
      p.price,
      p.version,
      p.year,
      b.name as marca,
      m.name as modelo_base
    FROM ocar_fipe_prices p
    JOIN ocar_fipe_models m ON p.model_id = m.id
    JOIN ocar_fipe_brands b ON m.brand_code = b.code
    WHERE b.name = p_marca
      AND m.name = p_modelo_base
    ORDER BY p.year DESC, p.price ASC
  LOOP
    prices_array := array_append(prices_array,
      jsonb_build_object(
        'fipe_code', rec.fipe_code,
        'reference_month', rec.reference_month,
        'price', rec.price,
        'version', rec.version,
        'ano', rec.year
      )
    );
  END LOOP;

  result := jsonb_build_object(
    'found', array_length(prices_array, 1) > 0,
    'count', array_length(prices_array, 1),
    'prices', to_jsonb(prices_array)
  );

  RETURN result;
END;
$$;

-- 3. Função para buscar marcas disponíveis
CREATE OR REPLACE FUNCTION get_available_brands()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  brands_array text[];
  rec record;
BEGIN
  brands_array := ARRAY[]::text[];

  FOR rec IN
    SELECT DISTINCT name
    FROM ocar_fipe_brands
    WHERE active = true
    ORDER BY name
  LOOP
    brands_array := array_append(brands_array, rec.name);
  END LOOP;

  result := jsonb_build_object(
    'brands', to_jsonb(brands_array),
    'count', array_length(brands_array, 1)
  );

  RETURN result;
END;
$$;

-- 4. Função para buscar modelos de uma marca
CREATE OR REPLACE FUNCTION get_models_by_brand(p_marca text)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  models_array text[];
  rec record;
BEGIN
  models_array := ARRAY[]::text[];

  FOR rec IN
    SELECT DISTINCT m.name
    FROM ocar_fipe_models m
    JOIN ocar_fipe_brands b ON m.brand_code = b.code
    WHERE b.name = p_marca
      AND m.active = true
    ORDER BY m.name
  LOOP
    models_array := array_append(models_array, rec.name);
  END LOOP;

  result := jsonb_build_object(
    'marca', p_marca,
    'models', to_jsonb(models_array),
    'count', array_length(models_array, 1)
  );

  RETURN result;
END;
$$;

-- 5. Função para buscar versões de um modelo
CREATE OR REPLACE FUNCTION get_versions_by_model(
  p_marca text,
  p_modelo_base text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  versions_array text[];
  rec record;
BEGIN
  versions_array := ARRAY[]::text[];

  FOR rec IN
    SELECT DISTINCT p.version
    FROM ocar_fipe_prices p
    JOIN ocar_fipe_models m ON p.model_id = m.id
    JOIN ocar_fipe_brands b ON m.brand_code = b.code
    WHERE b.name = p_marca
      AND m.name = p_modelo_base
    ORDER BY p.version
  LOOP
    versions_array := array_append(versions_array, rec.version);
  END LOOP;

  result := jsonb_build_object(
    'marca', p_marca,
    'modelo_base', p_modelo_base,
    'versions', to_jsonb(versions_array),
    'count', array_length(versions_array, 1)
  );

  RETURN result;
END;
$$;

-- 6. Comentários
COMMENT ON FUNCTION get_fipe_price(text, text, text, int) IS 'Busca preço FIPE por concatenação de marca + modelo + versão + ano';
COMMENT ON FUNCTION get_fipe_prices_by_model(text, text) IS 'Busca todos os preços de uma marca/modelo';
COMMENT ON FUNCTION get_available_brands() IS 'Retorna todas as marcas disponíveis';
COMMENT ON FUNCTION get_models_by_brand(text) IS 'Retorna modelos de uma marca específica';
COMMENT ON FUNCTION get_versions_by_model(text, text) IS 'Retorna versões de um modelo específico';

-- 7. Teste das funções
SELECT 'Teste get_available_brands:' as teste, get_available_brands();
SELECT 'Teste get_models_by_brand:' as teste, get_models_by_brand('Honda');
SELECT 'Teste get_versions_by_model:' as teste, get_versions_by_model('Honda', 'Civic');

-- Função de filtros para tabelas normalizadas
-- Execute no Supabase SQL Editor

CREATE OR REPLACE FUNCTION ocar_filtros_normalized(
  p_marca text DEFAULT NULL,
  p_modelo text DEFAULT NULL,
  p_versao text DEFAULT NULL,
  p_ano int DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  result jsonb;
  marcas_array text[];
  modelos_array text[];
  versoes_array text[];
  anos_array int[];
  resultados_array jsonb[];
  rec record;
BEGIN
  -- Inicializar arrays
  marcas_array := ARRAY[]::text[];
  modelos_array := ARRAY[]::text[];
  versoes_array := ARRAY[]::text[];
  anos_array := ARRAY[]::int[];
  resultados_array := ARRAY[]::jsonb[];

  -- Buscar marcas (se não especificada)
  IF p_marca IS NULL THEN
    FOR rec IN EXECUTE '
      SELECT DISTINCT b.name
      FROM ocar_fipe_brands b
      WHERE b.active = true
      ORDER BY b.name' LOOP
      marcas_array := array_append(marcas_array, rec.name);
    END LOOP;
  END IF;

  -- Buscar modelos (se marca especificada mas modelo não)
  IF p_marca IS NOT NULL AND p_modelo IS NULL THEN
    FOR rec IN EXECUTE '
      SELECT DISTINCT m.name
      FROM ocar_fipe_models m
      JOIN ocar_fipe_brands b ON m.brand_id = b.id
      WHERE b.name = ''' || p_marca || ''' AND m.active = true
      ORDER BY m.name' LOOP
      modelos_array := array_append(modelos_array, rec.name);
    END LOOP;
  END IF;

  -- Buscar versões (se marca e modelo especificados mas versão não)
  IF p_marca IS NOT NULL AND p_modelo IS NOT NULL AND p_versao IS NULL THEN
    FOR rec IN EXECUTE '
      SELECT DISTINCT p.version
      FROM ocar_fipe_prices p
      JOIN ocar_fipe_models m ON p.model_id = m.id
      JOIN ocar_fipe_brands b ON m.brand_id = b.id
      WHERE b.name = ''' || p_marca || ''' 
        AND m.name = ''' || p_modelo || '''
      ORDER BY p.version' LOOP
      versoes_array := array_append(versoes_array, rec.version);
    END LOOP;
  END IF;

  -- Buscar anos (se marca, modelo e versão especificados mas ano não)
  IF p_marca IS NOT NULL AND p_modelo IS NOT NULL AND p_versao IS NOT NULL AND p_ano IS NULL THEN
    FOR rec IN EXECUTE '
      SELECT DISTINCT p.year
      FROM ocar_fipe_prices p
      JOIN ocar_fipe_models m ON p.model_id = m.id
      JOIN ocar_fipe_brands b ON m.brand_id = b.id
      WHERE b.name = ''' || p_marca || ''' 
        AND m.name = ''' || p_modelo || '''
        AND p.version = ''' || p_versao || '''
      ORDER BY p.year DESC' LOOP
      anos_array := array_append(anos_array, rec.year);
    END LOOP;
  END IF;

  -- Buscar resultados finais
  IF p_marca IS NOT NULL AND p_modelo IS NOT NULL AND p_versao IS NOT NULL AND p_ano IS NOT NULL THEN
    FOR rec IN EXECUTE '
      SELECT 
        b.name as marca,
        m.name as modelo,
        p.version as versao,
        p.year as ano,
        p.fipe_code,
        p.reference_month,
        p.price
      FROM ocar_fipe_prices p
      JOIN ocar_fipe_models m ON p.model_id = m.id
      JOIN ocar_fipe_brands b ON m.brand_id = b.id
      WHERE b.name = ''' || p_marca || ''' 
        AND m.name = ''' || p_modelo || '''
        AND p.version = ''' || p_versao || '''
        AND p.year = ' || p_ano || '
      ORDER BY p.price ASC, p.year DESC' LOOP
      resultados_array := array_append(resultados_array, 
        jsonb_build_object(
          'marca', rec.marca,
          'modelo_base', rec.modelo,
          'versao', rec.versao,
          'ano', rec.ano,
          'codigo_fipe', rec.fipe_code,
          'referencia_mes', rec.reference_month,
          'preco', rec.price
        )
      );
    END LOOP;
  END IF;

  -- Construir resultado final
  result := jsonb_build_object(
    'marcas', to_jsonb(marcas_array),
    'modelos', to_jsonb(modelos_array),
    'versoes', to_jsonb(versoes_array),
    'anos', to_jsonb(anos_array),
    'resultados', to_jsonb(resultados_array)
  );

  RETURN result;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION ocar_filtros_normalized(text, text, text, int) IS 
'Função de filtros para tabelas normalizadas. Retorna marcas, modelos, versões, anos e resultados.';

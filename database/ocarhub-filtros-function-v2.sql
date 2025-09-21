-- Função SQL melhorada para filtros encadeados estilo Webmotors
-- Execute no Supabase SQL Editor

CREATE OR REPLACE FUNCTION ocarhub_filtros_v2(
  p_marca text DEFAULT NULL,
  p_modelo_base text DEFAULT NULL,
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
  query_text text;
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
      SELECT DISTINCT marca
      FROM ocar_transbordo
      WHERE processado = false
      ORDER BY marca' LOOP
      marcas_array := array_append(marcas_array, rec.marca);
    END LOOP;
  END IF;

  -- Buscar modelos base (se marca especificada mas modelo não)
  IF p_marca IS NOT NULL AND p_modelo_base IS NULL THEN
    FOR rec IN EXECUTE '
      WITH parsed_models AS (
        SELECT 
          marca,
          -- Extrair apenas o primeiro nome do modelo (ex: "Civic" de "Civic Sedan 1.8")
          CASE 
            WHEN modelo ~ ''^([A-Za-z]+)'' THEN
              (REGEXP_MATCH(modelo, ''^([A-Za-z]+)''))[1]
            ELSE modelo
          END as modelo_base
        FROM ocar_transbordo
        WHERE processado = false AND marca = ''' || p_marca || '''
      )
      SELECT DISTINCT modelo_base
      FROM parsed_models
      WHERE modelo_base IS NOT NULL AND modelo_base != ''''
      ORDER BY modelo_base' LOOP
      modelos_array := array_append(modelos_array, rec.modelo_base);
    END LOOP;
  END IF;

  -- Buscar versões (se marca e modelo especificados mas versão não)
  IF p_marca IS NOT NULL AND p_modelo_base IS NOT NULL AND p_versao IS NULL THEN
    FOR rec IN EXECUTE '
      WITH parsed_models AS (
        SELECT 
          marca,
          modelo,
          -- Extrair versão (tudo após o primeiro nome do modelo)
          CASE 
            WHEN modelo ~ ''^' || p_modelo_base || '\s+(.+)$'' THEN
              TRIM((REGEXP_MATCH(modelo, ''^' || p_modelo_base || '\s+(.+)$''))[1])
            ELSE NULL
          END as versao
        FROM ocar_transbordo
        WHERE processado = false AND marca = ''' || p_marca || '''
      )
      SELECT DISTINCT versao
      FROM parsed_models
      WHERE versao IS NOT NULL AND versao != ''''
      ORDER BY versao' LOOP
      versoes_array := array_append(versoes_array, rec.versao);
    END LOOP;
  END IF;

  -- Buscar anos (se marca, modelo e versão especificados mas ano não)
  IF p_marca IS NOT NULL AND p_modelo_base IS NOT NULL AND p_versao IS NOT NULL AND p_ano IS NULL THEN
    FOR rec IN EXECUTE '
      WITH parsed_models AS (
        SELECT 
          marca,
          modelo,
          ano,
          -- Extrair versão para comparação
          CASE 
            WHEN modelo ~ ''^' || p_modelo_base || '\s+(.+)$'' THEN
              TRIM((REGEXP_MATCH(modelo, ''^' || p_modelo_base || '\s+(.+)$''))[1])
            ELSE NULL
          END as versao
        FROM ocar_transbordo
        WHERE processado = false AND marca = ''' || p_marca || '''
      )
      SELECT DISTINCT ano
      FROM parsed_models
      WHERE versao = ''' || p_versao || '''
      ORDER BY ano DESC' LOOP
      anos_array := array_append(anos_array, rec.ano);
    END LOOP;
  END IF;

  -- Buscar resultados finais
  IF p_marca IS NOT NULL AND p_modelo_base IS NOT NULL AND p_versao IS NOT NULL AND p_ano IS NOT NULL THEN
    FOR rec IN EXECUTE '
      WITH parsed_models AS (
        SELECT 
          marca,
          modelo,
          ano,
          codigo_fipe,
          referencia_mes,
          preco,
          -- Extrair versão para comparação
          CASE 
            WHEN modelo ~ ''^' || p_modelo_base || '\s+(.+)$'' THEN
              TRIM((REGEXP_MATCH(modelo, ''^' || p_modelo_base || '\s+(.+)$''))[1])
            ELSE NULL
          END as versao
        FROM ocar_transbordo
        WHERE processado = false 
          AND marca = ''' || p_marca || '''
          AND ano = ' || p_ano || '
      )
      SELECT 
        marca,
        modelo,
        ano,
        codigo_fipe,
        referencia_mes,
        preco,
        versao
      FROM parsed_models
      WHERE versao = ''' || p_versao || '''
      ORDER BY preco ASC, ano DESC' LOOP
      resultados_array := array_append(resultados_array, 
        jsonb_build_object(
          'marca', rec.marca,
          'modelo_base', p_modelo_base,
          'versao', rec.versao,
          'ano', rec.ano,
          'codigo_fipe', rec.codigo_fipe,
          'referencia_mes', rec.referencia_mes,
          'preco', rec.preco
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
COMMENT ON FUNCTION ocarhub_filtros_v2(text, text, text, int) IS 
'Função melhorada para filtros encadeados estilo Webmotors. Retorna apenas o primeiro nome do modelo (ex: Civic, Accord).';

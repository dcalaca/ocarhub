-- Função SQL para filtros encadeados estilo Webmotors
-- Execute no Supabase SQL Editor

CREATE OR REPLACE FUNCTION ocarhub_filtros(
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

  -- Construir query base com parsing de modelo/versão
  query_text := '
    WITH parsed_models AS (
      SELECT 
        marca,
        modelo,
        ano,
        codigo_fipe,
        referencia_mes,
        preco,
        -- Extrair modelo_base (tudo antes do primeiro número de motorização)
        CASE 
          WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
            REGEXP_REPLACE(modelo, ''\s\d+(?:\.\d+)?[^\s]*.*$'', '''')
          WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
            REGEXP_REPLACE(modelo, ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*$'', '''')
          ELSE modelo
        END as modelo_base,
        -- Extrair versão (parte que começa no número de motorização ou tokens de versão)
        CASE 
          WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
            TRIM(REGEXP_REPLACE(modelo, ''^(.*?)(\s\d+(?:\.\d+)?[^\s]*.*)$'', ''\2''))
          WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
            TRIM(REGEXP_REPLACE(modelo, ''^(.*?)(\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*)$'', ''\2''))
          ELSE NULL
        END as versao
      FROM ocar_transbordo
      WHERE processado = false
  )
  SELECT 
    marca,
    modelo_base,
    versao,
    ano,
    codigo_fipe,
    referencia_mes,
    preco
  FROM parsed_models
  WHERE 1=1';

  -- Aplicar filtros
  IF p_marca IS NOT NULL THEN
    query_text := query_text || ' AND marca = ''' || p_marca || '''';
  END IF;
  
  IF p_modelo_base IS NOT NULL THEN
    query_text := query_text || ' AND modelo_base = ''' || p_modelo_base || '''';
  END IF;
  
  IF p_versao IS NOT NULL THEN
    query_text := query_text || ' AND versao = ''' || p_versao || '''';
  END IF;
  
  IF p_ano IS NOT NULL THEN
    query_text := query_text || ' AND ano = ' || p_ano;
  END IF;

  -- Buscar marcas (se não especificada)
  IF p_marca IS NULL THEN
    FOR rec IN EXECUTE '
      WITH parsed_models AS (
        SELECT 
          marca,
          CASE 
            WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
              REGEXP_REPLACE(modelo, ''\s\d+(?:\.\d+)?[^\s]*.*$'', '''')
            WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
              REGEXP_REPLACE(modelo, ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*$'', '''')
            ELSE modelo
          END as modelo_base
        FROM ocar_transbordo
        WHERE processado = false
      )
      SELECT DISTINCT marca
      FROM parsed_models
      ORDER BY marca' LOOP
      marcas_array := array_append(marcas_array, rec.marca);
    END LOOP;
  END IF;

  -- Buscar modelos (se marca especificada mas modelo não)
  IF p_marca IS NOT NULL AND p_modelo_base IS NULL THEN
    FOR rec IN EXECUTE '
      WITH parsed_models AS (
        SELECT 
          marca,
          CASE 
            WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
              TRIM(REGEXP_REPLACE(modelo, ''\s\d+(?:\.\d+)?[^\s]*.*$'', ''''))
            WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
              TRIM(REGEXP_REPLACE(modelo, ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*$'', ''''))
            ELSE TRIM(modelo)
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
          CASE 
            WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
              REGEXP_REPLACE(modelo, ''\s\d+(?:\.\d+)?[^\s]*.*$'', '''')
            WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
              REGEXP_REPLACE(modelo, ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*$'', '''')
            ELSE modelo
          END as modelo_base,
          CASE 
            WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
              TRIM(REGEXP_REPLACE(modelo, ''^(.*?)(\s\d+(?:\.\d+)?[^\s]*.*)$'', ''\2''))
            WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
              TRIM(REGEXP_REPLACE(modelo, ''^(.*?)(\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*)$'', ''\2''))
            ELSE NULL
          END as versao
        FROM ocar_transbordo
        WHERE processado = false AND marca = ''' || p_marca || '''
      )
      SELECT DISTINCT versao
      FROM parsed_models
      WHERE modelo_base = ''' || p_modelo_base || ''' AND versao IS NOT NULL
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
          CASE 
            WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
              REGEXP_REPLACE(modelo, ''\s\d+(?:\.\d+)?[^\s]*.*$'', '''')
            WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
              REGEXP_REPLACE(modelo, ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*$'', '''')
            ELSE modelo
          END as modelo_base,
          CASE 
            WHEN modelo ~ ''\s\d+(?:\.\d+)?[^\s]*.*$'' THEN
              TRIM(REGEXP_REPLACE(modelo, ''^(.*?)(\s\d+(?:\.\d+)?[^\s]*.*)$'', ''\2''))
            WHEN modelo ~ ''\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT)\b'' THEN
              TRIM(REGEXP_REPLACE(modelo, ''^(.*?)(\s(16V|TDI|CDI|TSI|MPI|FLEX|FLEXPOWER|TURBO|SUPERCHARGED|HYBRID|CVT|AT|MT).*)$'', ''\2''))
            ELSE NULL
          END as versao,
          ano
        FROM ocar_transbordo
        WHERE processado = false AND marca = ''' || p_marca || '''
      )
      SELECT DISTINCT ano
      FROM parsed_models
      WHERE modelo_base = ''' || p_modelo_base || ''' AND versao = ''' || p_versao || '''
      ORDER BY ano DESC' LOOP
      anos_array := array_append(anos_array, rec.ano);
    END LOOP;
  END IF;

  -- Buscar resultados finais
  FOR rec IN EXECUTE query_text || ' ORDER BY preco ASC, ano DESC' LOOP
    resultados_array := array_append(resultados_array, 
      jsonb_build_object(
        'marca', rec.marca,
        'modelo_base', rec.modelo_base,
        'versao', rec.versao,
        'ano', rec.ano,
        'codigo_fipe', rec.codigo_fipe,
        'referencia_mes', rec.referencia_mes,
        'preco', rec.preco
      )
    );
  END LOOP;

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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ocar_transbordo_filtros 
ON ocar_transbordo (marca, ano, codigo_fipe) 
WHERE processado = false;

CREATE INDEX IF NOT EXISTS idx_ocar_transbordo_modelo 
ON ocar_transbordo (modelo) 
WHERE processado = false;

-- Comentário da função
COMMENT ON FUNCTION ocarhub_filtros(text, text, text, int) IS 
'Função para filtros encadeados estilo Webmotors. Retorna marcas, modelos, versões, anos e resultados baseados nos filtros aplicados.';

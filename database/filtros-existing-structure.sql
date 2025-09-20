    -- Função de filtros para estrutura existente
    -- Execute no Supabase SQL Editor

    CREATE OR REPLACE FUNCTION ocar_filtros_existing(
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

    -- Buscar modelos base (se marca especificada mas modelo não)
    IF p_marca IS NOT NULL AND p_modelo IS NULL THEN
        FOR rec IN EXECUTE '
        SELECT DISTINCT 
            CASE 
            WHEN m.name ~ ''^([A-Za-z]+)'' THEN
                (REGEXP_MATCH(m.name, ''^([A-Za-z]+)''))[1]
            ELSE m.name
            END as modelo_base
        FROM ocar_fipe_models m
        JOIN ocar_fipe_brands b ON m.brand_code = b.code
        WHERE b.name = ''' || p_marca || ''' AND m.active = true
        ORDER BY modelo_base' LOOP
        modelos_array := array_append(modelos_array, rec.modelo_base);
        END LOOP;
    END IF;

    -- Buscar versões (se marca e modelo especificados mas versão não)
    IF p_marca IS NOT NULL AND p_modelo IS NOT NULL AND p_versao IS NULL THEN
        FOR rec IN EXECUTE '
        SELECT DISTINCT 
            CASE 
            WHEN m.name ~ ''^' || p_modelo || '\s+(.+)$'' THEN
                TRIM((REGEXP_MATCH(m.name, ''^' || p_modelo || '\s+(.+)$''))[1])
            ELSE m.name
            END as versao
        FROM ocar_fipe_models m
        JOIN ocar_fipe_brands b ON m.brand_code = b.code
        WHERE b.name = ''' || p_marca || ''' 
            AND m.name ~ ''^' || p_modelo || '\s+''
        ORDER BY versao' LOOP
        IF rec.versao IS NOT NULL AND rec.versao != '' THEN
            versoes_array := array_append(versoes_array, rec.versao);
        END IF;
        END LOOP;
    END IF;

    -- Buscar anos (se marca, modelo e versão especificados mas ano não)
    IF p_marca IS NOT NULL AND p_modelo IS NOT NULL AND p_versao IS NOT NULL AND p_ano IS NULL THEN
        FOR rec IN EXECUTE '
        SELECT DISTINCT t.ano
        FROM ocar_transbordo t
        JOIN ocar_fipe_models m ON t.marca = ''' || p_marca || '''
        JOIN ocar_fipe_brands b ON m.brand_code = b.code
        WHERE b.name = ''' || p_marca || ''' 
            AND t.modelo ~ ''^' || p_modelo || '\s+''' || p_versao || '''
        ORDER BY t.ano DESC' LOOP
        anos_array := array_append(anos_array, rec.ano);
        END LOOP;
    END IF;

    -- Buscar resultados finais
    IF p_marca IS NOT NULL AND p_modelo IS NOT NULL AND p_versao IS NOT NULL AND p_ano IS NOT NULL THEN
        FOR rec IN EXECUTE '
        SELECT 
            t.marca,
            ''' || p_modelo || ''' as modelo_base,
            ''' || p_versao || ''' as versao,
            t.ano,
            t.codigo_fipe,
            t.referencia_mes,
            t.preco
        FROM ocar_transbordo t
        WHERE t.marca = ''' || p_marca || ''' 
            AND t.modelo ~ ''^' || p_modelo || '\s+''' || p_versao || '''
            AND t.ano = ' || p_ano || '
            AND t.processado = false
        ORDER BY t.preco ASC, t.ano DESC' LOOP
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
    COMMENT ON FUNCTION ocar_filtros_existing(text, text, text, int) IS 
    'Função de filtros para estrutura existente. Retorna marcas, modelos base, versões, anos e resultados.';

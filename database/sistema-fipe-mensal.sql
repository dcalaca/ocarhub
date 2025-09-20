-- =============================================
-- SISTEMA FIPE MENSAL - HISTÓRICO E CONSULTAS
-- =============================================
-- Sistema otimizado para atualizações mensais e consultas atuais
-- Execute no Supabase SQL Editor

-- =============================================
-- 1. FUNÇÃO PARA ATUALIZAÇÃO MENSAL AUTOMÁTICA
-- =============================================

CREATE OR REPLACE FUNCTION atualizar_fipe_mensal()
RETURNS TABLE (
  mes_referencia TEXT,
  registros_processados BIGINT,
  marcas_novas BIGINT,
  modelos_novos BIGINT,
  precos_atualizados BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mes_atual TEXT;
  v_registros BIGINT := 0;
  v_marcas BIGINT := 0;
  v_modelos BIGINT := 0;
  v_precos BIGINT := 0;
BEGIN
  -- Definir mês atual
  v_mes_atual := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- 1. Processar MARCAS (sem duplicidade)
  WITH marcas_inseridas AS (
    INSERT INTO ocar_fipe_brands(name)
    SELECT DISTINCT 
      TRIM(marca) as name
    FROM ocar_transbordo 
    WHERE marca IS NOT NULL 
      AND TRIM(marca) <> ''
      AND referencia_mes = v_mes_atual
    ON CONFLICT (name) DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*) INTO v_marcas FROM marcas_inseridas;

  -- 2. Processar MODELOS (único por marca)
  WITH modelos_inseridos AS (
    INSERT INTO ocar_fipe_models(brand_id, name)
    SELECT DISTINCT 
      b.id as brand_id,
      TRIM(t.modelo) as name
    FROM ocar_transbordo t
    JOIN ocar_fipe_brands b ON b.name = TRIM(t.marca)
    WHERE t.modelo IS NOT NULL 
      AND TRIM(t.modelo) <> ''
      AND t.marca IS NOT NULL
      AND TRIM(t.marca) <> ''
      AND t.referencia_mes = v_mes_atual
    ON CONFLICT (brand_id, name) DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*) INTO v_modelos FROM modelos_inseridos;

  -- 3. Processar PREÇOS FIPE (atualizar ou inserir)
  WITH precos_inseridos AS (
    INSERT INTO ocar_fipe_prices(model_id, year, reference_month, fipe_code, price)
    SELECT DISTINCT 
      m.id as model_id,
      t.ano as year,
      t.referencia_mes as reference_month,
      t.codigo_fipe,
      t.preco
    FROM ocar_transbordo t
    JOIN ocar_fipe_brands b ON b.name = TRIM(t.marca)
    JOIN ocar_fipe_models m ON m.brand_id = b.id AND m.name = TRIM(t.modelo)
    WHERE t.preco IS NOT NULL 
      AND t.codigo_fipe IS NOT NULL
      AND t.ano IS NOT NULL
      AND t.preco > 0
      AND t.referencia_mes = v_mes_atual
    ON CONFLICT (model_id, year, reference_month, fipe_code)
    DO UPDATE SET 
      price = EXCLUDED.price,
      updated_at = NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_precos FROM precos_inseridos;

  -- Contar registros processados
  SELECT COUNT(*) INTO v_registros
  FROM ocar_transbordo 
  WHERE referencia_mes = v_mes_atual;

  -- Retornar estatísticas
  RETURN QUERY SELECT v_mes_atual, v_registros, v_marcas, v_modelos, v_precos;
END;
$$;

-- =============================================
-- 2. FUNÇÃO PARA CONSULTAR FIPE ATUAL (MÊS VIGENTE)
-- =============================================

CREATE OR REPLACE FUNCTION consultar_fipe_atual(
  p_marca TEXT,
  p_modelo TEXT,
  p_ano INT
)
RETURNS TABLE (
  marca TEXT,
  modelo TEXT,
  ano INT,
  fipe_code TEXT,
  reference_month TEXT,
  price NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mes_atual TEXT;
BEGIN
  -- Definir mês atual
  v_mes_atual := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Buscar preço do mês atual
  RETURN QUERY
  SELECT 
    b.name as marca,
    m.name as modelo,
    p.year as ano,
    p.fipe_code,
    p.reference_month,
    p.price,
    CASE 
      WHEN p.reference_month = v_mes_atual THEN 'ATUAL'
      ELSE 'DESATUALIZADO'
    END as status
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(m.name) = LOWER(p_modelo)
    AND p.year = p_ano
    AND p.reference_month = v_mes_atual
  ORDER BY p.price ASC;
END;
$$;

-- =============================================
-- 3. FUNÇÃO PARA CONSULTAR HISTÓRICO FIPE
-- =============================================

CREATE OR REPLACE FUNCTION consultar_historico_fipe(
  p_marca TEXT,
  p_modelo TEXT,
  p_ano INT,
  p_meses_historico INT DEFAULT 12
)
RETURNS TABLE (
  marca TEXT,
  modelo TEXT,
  ano INT,
  fipe_code TEXT,
  reference_month TEXT,
  price NUMERIC,
  variacao_mensal NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mes_atual TEXT;
  v_mes_inicial TEXT;
BEGIN
  -- Definir período
  v_mes_atual := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  v_mes_inicial := TO_CHAR(CURRENT_DATE - INTERVAL '1 month' * p_meses_historico, 'YYYY-MM');
  
  -- Buscar histórico
  RETURN QUERY
  SELECT 
    b.name as marca,
    m.name as modelo,
    p.year as ano,
    p.fipe_code,
    p.reference_month,
    p.price,
    LAG(p.price) OVER (ORDER BY p.reference_month) - p.price as variacao_mensal,
    CASE 
      WHEN p.reference_month = v_mes_atual THEN 'ATUAL'
      ELSE 'HISTÓRICO'
    END as status
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(m.name) = LOWER(p_modelo)
    AND p.year = p_ano
    AND p.reference_month >= v_mes_inicial
  ORDER BY p.reference_month DESC;
END;
$$;

-- =============================================
-- 4. FUNÇÃO PARA VERIFICAR STATUS DA BASE
-- =============================================

CREATE OR REPLACE FUNCTION verificar_status_base()
RETURNS TABLE (
  mes_atual TEXT,
  ultima_atualizacao TEXT,
  total_marcas BIGINT,
  total_modelos BIGINT,
  total_precos BIGINT,
  precos_mes_atual BIGINT,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mes_atual TEXT;
  v_ultima_atualizacao TEXT;
  v_total_marcas BIGINT;
  v_total_modelos BIGINT;
  v_total_precos BIGINT;
  v_precos_mes_atual BIGINT;
BEGIN
  -- Definir mês atual
  v_mes_atual := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Buscar última atualização
  SELECT MAX(reference_month) INTO v_ultima_atualizacao
  FROM ocar_fipe_prices;
  
  -- Contar totais
  SELECT COUNT(*) INTO v_total_marcas FROM ocar_fipe_brands;
  SELECT COUNT(*) INTO v_total_modelos FROM ocar_fipe_models;
  SELECT COUNT(*) INTO v_total_precos FROM ocar_fipe_prices;
  
  -- Contar preços do mês atual
  SELECT COUNT(*) INTO v_precos_mes_atual
  FROM ocar_fipe_prices
  WHERE reference_month = v_mes_atual;
  
  -- Retornar status
  RETURN QUERY SELECT 
    v_mes_atual,
    v_ultima_atualizacao,
    v_total_marcas,
    v_total_modelos,
    v_total_precos,
    v_precos_mes_atual,
    CASE 
      WHEN v_ultima_atualizacao = v_mes_atual THEN 'ATUALIZADO'
      ELSE 'DESATUALIZADO'
    END as status;
END;
$$;

-- =============================================
-- 5. FUNÇÃO PARA LIMPAR DADOS ANTIGOS
-- =============================================

CREATE OR REPLACE FUNCTION limpar_dados_antigos(p_meses_manter INT DEFAULT 24)
RETURNS TABLE (
  registros_removidos BIGINT,
  meses_limpos TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mes_limite TEXT;
  v_registros BIGINT;
  v_meses TEXT;
BEGIN
  -- Definir mês limite
  v_mes_limite := TO_CHAR(CURRENT_DATE - INTERVAL '1 month' * p_meses_manter, 'YYYY-MM');
  
  -- Contar registros que serão removidos
  SELECT COUNT(*) INTO v_registros
  FROM ocar_fipe_prices
  WHERE reference_month < v_mes_limite;
  
  -- Remover dados antigos
  DELETE FROM ocar_fipe_prices
  WHERE reference_month < v_mes_limite;
  
  -- Listar meses removidos
  SELECT STRING_AGG(DISTINCT reference_month, ', ' ORDER BY reference_month) INTO v_meses
  FROM ocar_transbordo
  WHERE reference_month < v_mes_limite;
  
  -- Retornar resultado
  RETURN QUERY SELECT v_registros, v_meses;
END;
$$;

-- =============================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- =============================================

COMMENT ON FUNCTION atualizar_fipe_mensal() IS 'Atualiza dados FIPE do mês atual - execute mensalmente';
COMMENT ON FUNCTION consultar_fipe_atual(TEXT, TEXT, INT) IS 'Consulta preço FIPE do mês vigente';
COMMENT ON FUNCTION consultar_historico_fipe(TEXT, TEXT, INT, INT) IS 'Consulta histórico de preços FIPE';
COMMENT ON FUNCTION verificar_status_base() IS 'Verifica status da base de dados FIPE';
COMMENT ON FUNCTION limpar_dados_antigos(INT) IS 'Remove dados antigos para manter performance';

-- =============================================
-- 7. VERIFICAÇÃO INICIAL
-- =============================================

-- Verificar status atual
SELECT * FROM verificar_status_base();
